// backend/controllers/imageController.js
import { enhancePrompt, generateImage } from '../utils/geminiClient.js';
import { supabase } from '../utils/supabaseClient.js';
import dotenv from 'dotenv';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
dotenv.config();

/**
 * Helper: Retry Supabase getUser in case of transient network errors
 */
async function getUserWithRetry(token, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      return { user, error };
    } catch (err) {
      console.warn(`Supabase getUser retry ${i + 1}:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * ✅ Upload base64 image to Supabase Storage and return correct public URL
 */
async function uploadImageToSupabase(imageB64, userId) {
  const filename = `${userId || 'guest'}-${uuidv4()}.png`;
  const imageBuffer = Buffer.from(imageB64, 'base64');

  // Upload image
  const { error: uploadError } = await supabase
    .storage
    .from('generations')
    .upload(filename, imageBuffer, { contentType: 'image/png' });

  if (uploadError) throw uploadError;

  // ✅ FIX: supabase returns publicURL not publicUrl
  const { data: publicData, error: urlErr } = supabase
    .storage
    .from('generations')
    .getPublicUrl(filename);

  if (urlErr) throw urlErr;

  return publicData.publicUrl || publicData.publicURL;
}

/**
 * POST /api/enhance
 */
export const enhanceHandler = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const enhanced = await enhancePrompt(prompt);
    return res.json({ enhancedPrompt: enhanced });
  } catch (err) {
    console.error('enhanceHandler error:', err);
    return res.status(500).json({ error: 'Failed to enhance prompt' });
  }
};

/**
 * POST /api/generate
 */
export const generateHandler = async (req, res) => {
  try {
    const { prompt, enhancedPrompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];

    let user = null;
    try {
      const result = await getUserWithRetry(token);
      user = result.user;
      req.user = user;
    } catch (supErr) {
      console.error('Supabase auth error:', supErr);
      req.user = null;
    }

    let out;
    try {
      out = await generateImage(prompt);
    } catch (genErr) {
      console.warn('Gemini generateImage failed, using fallback:', genErr.message);
      out = null;
    }

    let imageUrl;
    if (out?.b64) {
      try {
        imageUrl = await uploadImageToSupabase(out.b64, user?.id);
      } catch (uploadErr) {
        console.error('Supabase storage upload failed:', uploadErr);
        imageUrl = `data:image/png;base64,${out.b64}`;
      }
    } else {
      // fallback 1x1 transparent PNG
      imageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnUB9nVxS6cAAAAASUVORK5CYII=`;
    }

    // ✅ FIX: store enhanced_prompt and correct image_url
    try {
      const { error } = await supabase.from('generations').insert([
        {
          id: uuidv4(),
          user_id: user?.id || null,
          original_prompt: prompt,
          enhanced_prompt: enhancedPrompt || null,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) console.error('DB insert error:', error);
    } catch (dbErr) {
      console.error('Failed to save generation:', dbErr);
    }

    return res.json({ imageUrl });
  } catch (err) {
    console.error('generateHandler final catch error:', err);
    return res.status(500).json({ error: 'Image generation failed' });
  }
};

/**
 * GET /api/generate/generations
 */
export const getGenerationsHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];

    const { user } = await getUserWithRetry(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ generations: data });
  } catch (err) {
    console.error('getGenerationsHandler error:', err);
    return res.status(500).json({ error: 'Failed to fetch generations' });
  }
};

/**
 * DELETE /api/generate/generations/:id
 */
export const deleteGenerationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];

    const { user } = await getUserWithRetry(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: genData, error: fetchErr } = await supabase
      .from('generations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;
    if (genData.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

    // Delete from Supabase Storage
    const filename = genData.image_url?.split('/').pop();
    if (filename) {
      await supabase.storage.from('generations').remove([filename]);
    }

    // Delete from DB
    const { error: delErr } = await supabase
      .from('generations')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;

    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteGenerationHandler error:', err);
    return res.status(500).json({ error: 'Failed to delete generation' });
  }
};

/**
 * POST /api/generate/save
 */
export const saveGenerationHandler = async (req, res) => {
  try {
    const { prompt, enhancedPrompt, imageUrl } = req.body;
    const user = req.user || null;

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.json({ message: 'Supabase not configured; skipping save.' });
    }

    const { error } = await supabase.from('generations').insert([
      {
        id: uuidv4(),
        user_id: user?.id || null,
        original_prompt: prompt || null,
        enhanced_prompt: enhancedPrompt || null,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('saveGenerationHandler db error:', error);
      return res.status(500).json({ error: 'Failed to save generation' });
    }

    return res.json({ message: 'Saved' });
  } catch (err) {
    console.error('saveGenerationHandler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
