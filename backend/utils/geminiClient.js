// backend/utils/geminiClient.js
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠ WARNING: GEMINI_API_KEY missing. Using mock responses.");
}

// Helper to safely parse JSON
async function safeJson(resp) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

/**
 * Enhance Prompt with Gemini 2.5 Pro
 * Adds more details to prompt for better image results
 */
export async function enhancePrompt(originalPrompt) {
  if (!GEMINI_API_KEY) {
    return `${originalPrompt}, cinematic lighting, luxury ad, soft shadows`;
  }

  const enhancementInstruction = `You are an expert prompt-enhancer for an AI image generator.
A user has provided the following prompt for a beauty/cosmetic product ad: "${originalPrompt}"
Enhance this prompt to be more detailed, specific, and visually descriptive.
Add details about:
- Style (e.g., photorealistic, luxury advertisement, minimalist)
- Mood (e.g., elegant, fresh, bold)
- Composition (e.g., close-up shot, product in center, with props)
- Lighting (e.g., soft studio lighting, golden hour, bright and airy)
- Colors (e.g., pastel colors, bold reds, monochrome)
- Atmosphere (e.g., sophisticated, natural, vibrant)
Return ONLY the enhanced prompt, no other text.`;

  try {
    const body = {
      contents: [
        {
          parts: [{ text: enhancementInstruction }],
        },
      ],
      generationConfig: { temperature: 0.7 },
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Gemini enhance HTTP error:", resp.status, text);
      throw new Error("Gemini enhance failed");
    }

    const data = await safeJson(resp);
    const enhanced = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!enhanced) {
      console.error("Gemini did not return text:", data);
      throw new Error("Gemini did not return text");
    }

    return enhanced.trim();
  } catch (err) {
    console.error("❌ Gemini Enhance Error:", err);
    return `${originalPrompt}, cinematic luxury ad, glossy lighting, soft shadows`;
  }
}

/**
 * Generate Image with "Nano Banana" model (gemini-2.5-flash-image)
 * Returns base64 encoded PNG
 */
export async function generateImage(prompt) {
  if (!GEMINI_API_KEY) {
    const blankBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnUB9nVxS6cAAAAASUVORK5CYII=";
    return { b64: blankBase64 };
  }

  try {
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Gemini image HTTP error:", resp.status, text);
      throw new Error("Gemini image generation failed");
    }

    const data = await safeJson(resp);

    // Parse inlineData for base64
    const imageB64 = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

    if (!imageB64) {
      console.warn("No image returned from Gemini, using blank fallback", JSON.stringify(data, null, 2));
      const blankBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnUB9nVxS6cAAAAASUVORK5CYII=";
      return { b64: blankBase64 };
    }

    return { b64: imageB64 };
  } catch (err) {
    console.error("❌ Gemini Image Generation Error:", err);
    const blankBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnUB9nVxS6cAAAAASUVORK5CYII=";
    return { b64: blankBase64 };
  }
}
