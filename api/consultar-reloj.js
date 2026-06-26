export default async function handler(req, res) {
  // Asegurar que solo acepte peticiones POST desde tu frontend
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Recibir los datos de nacimiento enviados por el usuario
    const { fechaNacimiento } = req.body;

    // Hacer la llamada segura a Anthropic desde el servidor
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Tu clave estará protegida aquí
        'anthropic-version': '2023-06-01' 
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Modelo de la IA
        max_tokens: 2000,
        messages: [
          { 
            role: 'user', 
            content: `Actúa como un motor astrológico experto en el zodíaco de 13 signos. Calcula la firma natal y posición planetaria para alguien nacido el: ${fechaNacimiento}.` 
          }
        ]
      })
    });

    const data = await response.json();
    
    // Devolver la respuesta de la IA de vuelta a tu página web
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
}
