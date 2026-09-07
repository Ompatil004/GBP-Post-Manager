import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/ai/generate
router.post('/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { businessName, category, city, topic, postType, tone, language, cta } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Post topic is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here' || apiKey.trim() === '') {
      return res.status(503).json({
        error:
          'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your .env file in the backend to enable AI generation.',
        code: 'MISSING_API_KEY',
      });
    }

    const systemPrompt = `You are an expert digital marketing assistant specializing in Google Business Profile (GBP) posts.
Your goal is to write engaging, concise, high-converting Google Business Profile posts tailored for local business customers.
Rule 1: Content must be punchy, customer-oriented, and ready for publication.
Rule 2: Match the requested post type, tone, language, and CTA cleanly.
Rule 3: Keep the post under 150-200 words. Do NOT include markdown code blocks or meta notes.`;

    const userPrompt = `Write a Google Business Profile post with the following specifications:
- Business Name: ${businessName || 'Our Business'}
- Category: ${category || 'Local Business'}
- City/Location: ${city || 'Local Area'}
- Post Topic: ${topic}
- Post Type: ${postType || 'Update'}
- Tone: ${tone || 'Professional'}
- Language: ${language || 'English'}
- Call To Action (CTA): ${cta || 'Learn More'}

Please output only the final post content.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'GBP Post Manager',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 350,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error(`OpenRouter API error (${openRouterResponse.status}):`, errorText);

      if (openRouterResponse.status === 401) {
        return res.status(401).json({ error: 'Invalid OpenRouter API Key. Please check your credentials.' });
      }
      if (openRouterResponse.status === 429) {
        return res.status(429).json({ error: 'OpenRouter rate limit reached. Please try again in a few moments.' });
      }

      return res.status(502).json({ error: 'Failed to generate content via OpenRouter AI. Please try again.' });
    }

    const data = await openRouterResponse.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      return res.status(500).json({ error: 'AI returned an empty response. Please try again.' });
    }

    return res.status(200).json({ content: generatedContent });
  } catch (error: unknown) {
    console.error('AI Generation API error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(504).json({ error: 'AI request timed out. Please try again.' });
    }
    return res.status(500).json({ error: 'An error occurred while calling AI service.' });
  }
});

export default router;
