// Sail-Oid: Sailing & Nautical AI Identification
// Part of the FeelFamous -Oid Ecosystem
// Uses Gemini 2.0 Flash Vision API

const { sanitize } = require('./ipi-sanitize');
const { buildSecureSystemPrompt, stripExifFromJpeg, logImageMeta, SECURITY_HEADERS } = require('./gemini-secure-wrapper');
const { logThreat } = require('./security-log');
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    ...SECURITY_HEADERS,
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { image, mode = 'identify' } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Expert sailing/nautical prompt
    const identifyPrompt = `You are SAIL-OID, the world's leading AI expert on sailing vessels, yachts, boats, and nautical equipment. You possess encyclopedic knowledge spanning:

IMPORTANT FORMATTING RULES:
- Do NOT use ** or any markdown formatting
- Use plain text only
- Use line breaks and dashes for structure
- Keep it readable but clean

**VESSEL IDENTIFICATION:**
- Sailing yachts: J-Class, America's Cup boats, cruising yachts, racing dinghies
- Classic boats: Herreshoff, Sparkman & Stephens, Camper & Nicholsons designs
- Modern builders: Beneteau, Jeanneau, Hallberg-Rassy, Swan, Oyster, Baltic
- Dinghy classes: Laser, 470, Finn, 49er, Optimist, Topper, Mirror
- Multihulls: Catamarans, trimarans (Lagoon, Fountaine Pajot, Gunboat)
- Powerboats: Riva, Chris-Craft, Boston Whaler, classic launches

**RIGGING & SAILS:**
- Sail types: Mainsail, genoa, jib, spinnaker, gennaker, code zero
- Rig configurations: Sloop, cutter, ketch, yawl, schooner
- Sail makers: North Sails, Doyle, Quantum, UK Sailmakers
- Standing/running rigging identification

**NAUTICAL HARDWARE:**
- Deck hardware: Winches (Harken, Lewmar, Andersen), blocks, cleats
- Navigation equipment: Vintage compasses, sextants, chronometers
- Marine instruments: B&G, Raymarine, Garmin, Furuno

**MARITIME HISTORY:**
- Famous races: America's Cup, Fastnet, Sydney-Hobart, Volvo Ocean Race
- Historic vessels: Cutty Sark, Endeavour, Shamrock, Bluenose
- Legendary designers: Olin Stephens, Ron Holland, Bruce Farr

Analyze this image and provide:

TITLE: Specific identification (e.g., "Swan 48 Sailing Yacht", "Vintage Bronze Winch")

DESCRIPTION: Detailed analysis including:
- Make/model/designer if identifiable
- Year or era of manufacture
- Notable features and construction details
- Condition assessment
- Historical significance if applicable

ESTIMATED VALUE: Market value range in GBP with reasoning

Be enthusiastic about sailing heritage while maintaining expert precision. If you see racing numbers, class insignia, or builder's plates, identify them.

End with a line break, then on its own line add:
AMAZON_SEARCH: [relevant nautical/sailing search term 2-5 words]

This helps users find related gear on Amazon.

Format response as JSON:
{
  "title": "Specific identification",
  "description": "Detailed expert analysis with AMAZON_SEARCH line at end",
  "price": "£X,XXX - £XX,XXX"
}`;

    const roastPrompt = `You are DAVE THE RAVE, legendary Salty Sea Dog Captain from Bristol! You've been sailing the Bristol Channel since before GPS was invented. You've rounded Cape Horn, survived the '79 Fastnet, raced across the Atlantic, and have zero patience for landlubbers and their silly boat purchases.

IMPORTANT: Do NOT use ** or any markdown formatting. Plain text only.

You speak with Bristol charm - dropping in local references to Avonmouth, the SS Great Britain, and proper West Country sailing. You might've learned to sail at Portishead or crewed out of Bristol Marina.

Look at this nautical nonsense and give your brutally honest assessment:
- Mock any overpriced marina queens that never leave the dock
- Ridicule unnecessary gadgets ("Back in my day, we used a lead line and a wet finger!")
- Call out fair-weather sailors and their pristine non-skid decks
- Tease about impractical features or excessive varnish
- Reference your own salt-encrusted adventures from Bristol to Biscay

But secretly... acknowledge if it's actually a proper sea-going vessel worthy of the Severn Estuary's notorious tides.

Keep it to 3-4 sentences of salty Bristol humor. End with your grizzled valuation.

Then add on its own line:
AMAZON_SEARCH: [something funny but useful for sailors]

Format as JSON:
{
  "title": "Your mocking name for it",
  "description": "Your salty roast with AMAZON_SEARCH at end",
  "price": "£X,XXX (what some fool would pay)"
}`;

    const systemPrompt = mode === 'roast' ? roastPrompt : identifyPrompt;

    const rawImage = image.replace(/^data:image\/\w+;base64,/, '');
    logImageMeta('sail-oid', 'image/jpeg', rawImage.length);
    const { cleaned: cleanImage } = stripExifFromJpeg(rawImage);
    const securedPrompt = buildSecureSystemPrompt(systemPrompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: securedPrompt }] },
          contents: [{
            parts: [
              { text: mode === 'roast' ? 'Roast this nautical item.' : 'Identify this nautical item.' },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: cleanImage
                }
              }
            ]
          }],
          generationConfig: {
            temperature: mode === 'roast' ? 0.9 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      let userMessage = 'The charts are foggy... Please try again.';
      if (response.status === 429) {
        userMessage = 'Dave is having a rum break (too many requests). Try again in a few minutes.';
      } else if (response.status === 403 || response.status === 401) {
        userMessage = 'Dave needs reconfiguration. Contact the harbour master.';
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: 'Navigation Error',
          description: userMessage,
          error: true
        })
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: 'Foggy Conditions',
          description: 'Dave cannot see this image clearly. Try a different photo with better lighting.',
          error: true
        })
      };
    }

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            title: parsed.title || 'Nautical Item Identified',
            description: parsed.description || text,
            price: parsed.price || parsed.estimatedPrice || null
          })
        };
      } catch (e) {
        // JSON parsing failed (truncated response) — extract fields with regex
        const titleMatch = text.match(/"title"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
        const descMatch = text.match(/"description"\s*:\s*"([\s\S]+?)(?="\s*,\s*"|"\s*\}|$)/);
        const priceMatch = text.match(/"price"\s*:\s*"([^"]+)"/);
        if (titleMatch || descMatch) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              title: titleMatch ? titleMatch[1] : 'Nautical Item Identified',
              description: descMatch ? descMatch[1].replace(/\\n/g, '\n') : text,
              price: priceMatch ? priceMatch[1] : null
            })
          };
        }
      }
    }

    // Return plain text response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: mode === 'roast' ? "Dave's Verdict" : 'Nautical Item Identified',
        description: text,
        price: null
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: 'Man Overboard!',
        description: 'Something went wrong. Dave needs to bail out the bilge. Please try again.',
        error: true
      })
    };
  }
};
