export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Falta GEMINI_API_KEY.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        // Apagamos los filtros de seguridad que suelen bloquear temas esotéricos
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();

    // 1. Si Google devuelve un error interno (ej. llave inválida, cuota excedida)
    if (data.error) {
      return res.status(200).json({ 
        content: [{ text: `🚨 Error de Gemini: ${data.error.message}` }] 
      });
    }

    // 2. Si Google bloquea la respuesta por seguridad
    if (data.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
      return res.status(200).json({ 
        content: [{ text: '🚨 Gemini bloqueó la respuesta por sus filtros de seguridad. Intenta suavizar las palabras del prompt.' }] 
      });
    }

    // 3. Si la respuesta es exitosa
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ content: [{ text }] });
    } 

    // 4. Fallback final si la estructura es extraña
    return res.status(200).json({
      content: [{ text: 'Las estrellas están configurándose. Intenta de nuevo.' }]
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
