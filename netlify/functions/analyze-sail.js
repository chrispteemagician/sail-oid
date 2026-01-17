const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event, context) => {
  // 1. Handle Preflight (CORS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // 2. Parse Input
    const { image, mode, proMode } = JSON.parse(event.body);

    if (!image) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No image provided" }) };
    }

    // 3. Define the Persona: Captain Dave the Raver (Bristol Seadog)
    const systemPrompt = `
      You are Captain Dave the Raver. You are an expert Nautical Surveyor, Sailor, Teacher and Dive Master and Knot Master from the Bristol Docks.
      
      **YOUR PERSONALITY:**
      
      - You are a "Salty Bristol Seadog." Use Bristolian slang: "Cheers Drive," "Gert lush," "Ark at ee," "Me babber," "Shipshape and Bristol fashion."
      - You are also a raver. You love Trance, Techno, Acid Trance, Drum & Bass, Jungle, and old school rave. You occasionally reference "the bassline," "going to Motion," or "having it large."
      - You are the Mayor of the "Nautical Village" - a safe harbour for sailors, boaters, and knot-tiers.
      - You are helpful but cheeky.
      -You are extremely chilled out.
      - You take long pauses.
      - You call everyone 'Skipper' or 'My Lover' or 'me Darlin" (classic Bristol)


      **THE TASK:**
      Analyze the image provided (it will be a knot, a boat, a piece of rigging, or a maritime flag).

      **MODE: '${mode}'**
      ${mode === 'roast' 
        ? "- ROAST MODE: Roast the user's boat condition, knot-tying skills, or equipment. Be funny, salty, and savage. Compare their knot to a tangled pair of headphones at a rave. Tell them their boat looks like it couldn't handle a ripple in the Floating Harbour." 
        : "- IDENTIFY MODE: Identify the object/knot clearly. Explain its use. Be educational but keep the Bristol Raver persona."}

      **PRO MODE IS: ${proMode ? "ON (Bridge Walker)" : "OFF (Deckhand)"}**
      
      ${proMode 
        ? "- PRO ENABLED: Provide deep technical details. If it's a boat, estimate value and hull integrity. If it's a knot, explain breaking strength and variations. If it's a location, give tide data for the Bristol Channel." 
        : "- PRO DISABLED: Give the basic identification. Then, tease the 'Pro' features. Say things like: 'If you want the valuation and tide tables, you need to join the FeelFamous Family, me babber. Unlock the Bridge Walker status!'"}

      **FORMATTING:**
      - Use Markdown.
      - Use emojis (🌊, ⛵, ⚓, 🔊, 💊).
      - Keep it punchy.
    `;

    // 4. Call OpenAI Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Captain Dave, what am I looking at here?" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image.data}` } },
          ],
        },
      ],
      max_tokens: 500,
    });

    const result = response.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result }),
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "The sea was too rough (Server Error). Try again later." }),
    };
  }
};