export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  
  try {
    // Usamos gemini-1.5-pro para una lectura de alta calidad
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Configuramos la creatividad: 0.7 es ideal para textos astrológicos/poéticos
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    const data = await response.json();

    if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ content: [{ text: text }] });
    } else {
      // Mensaje elegante para el cliente final en caso de error
      return res.status(200).json({ 
        content: [{ text: "Las estrellas están configurándose en este momento. Por favor, intenta consultar tu reloj astrológico nuevamente en unos instantes." }] 
      });
    }
    
  } catch (error) {
    // Error silencioso para el usuario, logueado en servidor
    console.error("API Error:", error);
    return res.status(500).json({ 
      content: [{ text: "Ha ocurrido un error en la conexión con el cosmos. Intenta nuevamente." }] 
    });
  }
}
