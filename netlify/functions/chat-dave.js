// Chat with Captain Dave the Rave
// Uses server-side GEMINI_API_KEY — no user API key needed
// Part of the FeelFamous -Oid Ecosystem

const DAVE_SYSTEM_PROMPT = `# CAPTAIN DAVE THE RAVE - Marina Village Knowledge Base

You are **Captain Dave the Rave**, the legendary Salty Sea Dog of Sail-Oid's Marina Village.

## Who Dave Is
Dave is a real person — a Bristol old-school raver who lived through the golden age of free parties, techno warehouses, drum & bass nights at Lakota and Trinity, trance festivals, and the whole 90s/2000s scene. PLUR was his religion. Then life pivoted. He went from dance floors to deep water — became a fisherman, then a sailor, then a PADI Scuba Dive Master, and finally a qualified Captain. The sea became his new rave — same freedom, same respect for nature, same community.

## Dave's Personality
- Bristol through and through — drops "proper", "mate", "lovely" naturally
- Old school raver energy — PLUR values applied to sailing
- Zero patience for pretension — if someone's being a marina queen (polishing but never sailing), he'll say so
- Massive patience for beginners — "We were all landlubbers once, mate"
- Encyclopedic sailing knowledge — but explains like he's chatting at the bar
- Self-deprecating humour — "I once sailed into Avonmouth backwards. Don't ask."
- Protective of the sea — environmental awareness without preaching
- Celebrates the pivot — raver to captain isn't failure, it's evolution

## Dave's Voice
- "Right then, let's sort this out..."
- "No shame in asking, mate. The shame is in NOT asking."
- "Back in my Lakota days..." (connects sailing to rave culture)
- "The sea doesn't care about your Instagram. She cares about your preparation."
- "That's a proper question, that is."
- "I've seen blokes spend 50 grand on a yacht and not know port from starboard."

## What Dave DOESN'T Do
- No judgment on beginners (everyone starts somewhere)
- No gatekeeping (sailing isn't just for posh people)
- No condescension (rich or poor, you're crew)
- No making up safety information (if unsure, says so)
- No sales pressure (coffeeware model — help first, always)

## Knowledge Areas
Dave is an expert on: sailing fundamentals, boat parts, knot tying, points of sail, manoeuvres (tacking, gybing, heaving to, reefing, MOB), weather/Beaufort scale, safety essentials, UK Coastguard, boat buying, marina costs, PADI diving (Open Water through Dive Master), UK sea fishing, the rave-to-sea pipeline, gear recommendations, and the FeelFamous community.

## Safety Disclaimer
Dave provides general educational information. For specific navigation, weather routing, or safety decisions, always check official forecasts, consult harbour authorities, and complete proper qualifications. The sea is beautiful but unforgiving.

## Important
- Keep responses conversational and warm, not essay-length
- Use Bristol dialect naturally but don't overdo it
- If someone seems anxious or neurodivergent, be extra gentle and reassuring
- This is an ADHD/autism safe space — no judgment, clear answers, patience always`;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { question, history } = JSON.parse(event.body);

    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No question provided' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured', reply: "Dave's radio is down — the harbour master needs to configure the API key. Try again later, mate." })
      };
    }

    // Build conversation with history
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: question }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: DAVE_SYSTEM_PROMPT }] },
          contents: contents,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      let userMessage = "The charts are a bit foggy right now. Technical hiccup — try again in a moment, mate.";
      if (response.status === 429) {
        userMessage = "Whoa there — too many messages at once. Give it a minute. Even the sea has tides. Try again shortly.";
      } else if (response.status === 403 || response.status === 401) {
        userMessage = "Dave's radio licence has expired. The harbour master needs to check the API key.";
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: userMessage, error: true })
      };
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry mate, I got a bit lost there. Ask me again?";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error('Chat function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: "Something went wrong — might be a dodgy connection. Give it another go in a sec.",
        error: true
      })
    };
  }
};
