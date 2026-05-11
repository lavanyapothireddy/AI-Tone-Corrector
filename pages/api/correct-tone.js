import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TONE_PROMPTS = {
  professional: 'Rewrite this text to sound professional, polished, and business-appropriate. Use clear, confident language suitable for a corporate or professional setting.',
  friendly: 'Rewrite this text to sound warm, approachable, and conversational. Use friendly language that feels genuine and inviting.',
  concise: 'Rewrite this text to be as concise and direct as possible. Eliminate all fluff and filler. Every word must earn its place.',
  formal: 'Rewrite this text in a formal, elevated register. Use sophisticated vocabulary, structured sentences, and an authoritative tone appropriate for academic or legal contexts.',
  casual: 'Rewrite this text to sound relaxed, natural, and casual — like texting a friend. Keep it light and conversational.',
  persuasive: 'Rewrite this text to be compelling and persuasive. Use rhetorical techniques, strong calls-to-action, and emotionally resonant language to motivate the reader.',
  empathetic: 'Rewrite this text to sound deeply caring, understanding, and emotionally supportive. Acknowledge feelings and show genuine compassion.',
  assertive: 'Rewrite this text to be bold, confident, and assertive. Use strong, decisive language that commands attention and projects authority.',
  witty: 'Rewrite this text to be clever and witty. Add a touch of humor and playfulness while keeping the core message intact.',
  diplomatic: 'Rewrite this text to be tactful, balanced, and diplomatic. Soften any sharp edges while preserving the essential meaning.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, tone } = req.body;

  if (!text || !tone) {
    return res.status(400).json({ error: 'Missing text or tone' });
  }

  if (!TONE_PROMPTS[tone]) {
    return res.status(400).json({ error: 'Invalid tone selected' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: `You are an expert writing assistant specializing in tone transformation. ${TONE_PROMPTS[tone]} 
          
Important rules:
- Preserve the core meaning and all key information
- Return ONLY the rewritten text — no preamble, no explanation, no quotes
- Do not add phrases like "Here is the rewritten text:" 
- Match the length approximately (concise tone may be shorter, others roughly similar)`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const result = completion.choices[0]?.message?.content || '';
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Groq API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to correct tone. Please try again.',
    });
  }
}
