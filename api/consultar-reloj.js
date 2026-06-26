// api/consultar-reloj.js
// Coloca este archivo en: /api/consultar-reloj.js (en tu proyecto Vercel)
// Variable de entorno requerida: ANTHROPIC_API_KEY

export default async function handler(req, res) {
  // Solo aceptamos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Leemos el prompt que viene del frontend
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt en el cuerpo de la solicitud.' });
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!API_KEY) {
    console.error('Falta ANTHROPIC_API_KEY en las variables de entorno.');
    return res.status(500).json({ error: 'Configuración del servidor incompleta.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Anthropic API:', errorData);
      return res.status(response.status).json({
        error: 'Error al consultar la API de Claude.',
        details: errorData,
      });
    }

    const data = await response.json();

    // Devolvemos exactamente lo que espera el frontend: { content: [{ text: "..." }] }
    return res.status(200).json({
      content: [
        {
          text: data.content?.[0]?.text ?? 'Las estrellas no respondieron esta vez. Intenta de nuevo.',
        },
      ],
    });
  } catch (error) {
    console.error('Error en el handler:', error);
    return res.status(500).json({
      error: 'Error interno del servidor.',
      details: error.message,
    });
  }
}
