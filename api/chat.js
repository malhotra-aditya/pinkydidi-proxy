export default async function handler(req, res) {

  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request — messages array required' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 600,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) return res.status(401).json({ error: 'Invalid API key' });
      if (response.status === 402) return res.status(402).json({ error: 'Insufficient credits' });
      return res.status(response.status).json({ error: data?.error?.message || 'API error' });
    }

    const content = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content });

  } catch (error) {
    return res.status(500).json({ error: 'Server error — please try again' });
  }
}
