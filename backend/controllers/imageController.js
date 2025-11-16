// backend/controllers/imageController.js
import { enhancePrompt, generateImage } from '../utils/geminiClient.js';
import { supabase } from '../utils/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

/**
 * Retry Supabase getUser for transient network errors
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
 * Upload base64 image to Supabase Storage and return public URL
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
  const schema = z.object({ prompt: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Prompt required' });

  const { prompt } = parsed.data;
  const enhanced = await enhancePrompt(prompt);
  res.json({ enhancedPrompt: enhanced });
};

/**
 * POST /api/generate
 */
export const generateHandler = async (req, res) => {
  const schema = z.object({ prompt: z.string().min(1), enhancedPrompt: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Prompt required' });

  const { prompt, enhancedPrompt } = parsed.data;

  // req.user may be set by optionalAuthMiddleware or be null
  const user = req.user || null;

  // Generate image
  const out = await generateImage(prompt);
  const imageUrl = out?.b64
    ? await uploadImageToSupabase(out.b64, user?.id)
    : `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnUB9nVxS6cAAAAASUVORK5CYII=`;

  // Save generation in DB (await, no fire-and-forget)
  const { error } = await supabase.from('generations').insert([{
    id: uuidv4(),
    user_id: user?.id || null,
    original_prompt: prompt,
    enhanced_prompt: enhancedPrompt || null,
    image_url: imageUrl,
    created_at: new Date().toISOString(),
  }]);
  if (error) {
    console.error('DB insert error:', error);
    // do not fail generation for user, but log and continue
  }

  res.json({ imageUrl });
};

/**
 * GET /api/generate/generations
 */
export const getGenerationsHandler = async (req, res) => {
  // req.user is set by authMiddleware
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json({ generations: data });
};

/**
 * DELETE /api/generate/generations/:id
 */
export const deleteGenerationHandler = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: genData, error: fetchErr } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr) throw fetchErr;
  if (genData.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

  // Delete image & DB entry
  await Promise.all([
    genData.image_url && supabase.storage.from('generations').remove([genData.image_url.split('/').pop()]),
    supabase.from('generations').delete().eq('id', id)
  ]);

  res.json({ message: 'Deleted' });
};

/**
 * POST /api/generate/save
 */
export const saveGenerationHandler = async (req, res) => {
  const { prompt, enhancedPrompt, imageUrl } = req.body;
  const user = req.user || null;

  if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return res.json({ message: 'Supabase not configured; skipping save.' });
  }

  try {
    const { error } = await supabase.from('generations').insert([{
      id: uuidv4(),
      user_id: user?.id || null,
      original_prompt: prompt || null,
      enhanced_prompt: enhancedPrompt || null,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    }]);

    if (error) throw error;
    res.json({ message: 'Saved' });
  } catch (err) {
    console.error('saveGenerationHandler error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
