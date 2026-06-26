export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Ahora recibimos el "prompt" completo con toda la lectura planetaria
    const { prompt } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01' 
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Usamos el modelo oficial correcto
        max_tokens: 1500,
        messages: [
          { 
            role: 'user', 
            content: prompt // Le pasamos a la IA exactamente lo que tu HTML calculó
          }
        ]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
}
