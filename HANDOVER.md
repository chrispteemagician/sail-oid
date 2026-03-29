# HANDOVER: Sail-Oid / Marina Village Integration

## What This Project Is

**Sail-Oid** is an AI-powered nautical identification portal, part of the FeelFamous "-Oid" ecosystem. It lets users upload photos of boats/nautical gear and get AI identification via Google Gemini. It also has a community layer (Supabase auth, kudos, leaderboard, QR referrals).

**The Marina Village** is the educational/community hub for Sail-Oid — Captain Dave the Rave's harbour. It has pontoon sections for learning sailing, Q&A, a Dave AI chatbot, and gear recommendations.

## What We Did (This Session)

**Merged two separate apps into one unified portal.** Previously:
- `sail-oid` = standalone AI identifier (light theme, minimal content, Supabase auth)
- `marina-files` = standalone education hub (dark navy theme, rich content, Dave chatbot)
- Marina linked OUT to sail-oid.co.uk for identification — they were separate sites

**Now:** One single `index.html` that IS the Marina Village with Sail-Oid identification built directly in. The Marina wraps Sail-Oid.

### Specific Changes

1. **`index.html`** — Full rewrite (101KB). Merged both apps:
   - Uses Marina's dark navy theme, wave animation, Outfit+Caveat fonts
   - Pontoon A now scrolls to inline identify/roast section (was an external link)
   - Identify/Roast tabs with camera/gallery upload boxes (dark theme adapted)
   - All Supabase functionality preserved: auth, kudos, leaderboard, QR codes, broadcast system
   - Age verification modal (from Sail-Oid)
   - User status bar with badge/kudos (from Sail-Oid)
   - Learn the Ropes section: boat parts, 5 knots, safety, Beaufort scale (from Marina)
   - Q&A accordion: 10 questions (from Marina)
   - Dave chatbot: Gemini 2.5 Flash, dave-knowledge.js as system prompt (from Marina)
   - Gear recommendations with Amazon affiliate links (from Marina)
   - Other Villages grid + The Family grid + footer (merged from both)
   - Quick Nav FAB (bottom-right) for leaderboard + QR when signed in
   - Section fade-in on scroll via IntersectionObserver

2. **`dave-knowledge.js`** — Copied from updated marina-g25-files (unchanged content, 17KB). Contains Dave's full personality, sailing knowledge base, Q&A response patterns, gear recommendations, FeelFamous integration details.

3. **`netlify/functions/analyze-image.js`** — Unchanged. Handles identify and roast modes via Gemini 2.0 Flash with expert prompts.

4. **`netlify.toml`** — Unchanged. Publishes root dir, functions from netlify/functions/.

## File Structure

```
sail-oid-FINAL/sail-oid/
├── index.html                          # THE merged portal (101KB)
├── dave-knowledge.js                   # Dave's AI knowledge base (17KB)
├── sail-oid.jpg                        # Logo
├── netlify.toml                        # Deploy config
├── README.md                           # Quick start
├── HANDOVER.md                         # This file
├── netlify/
│   └── functions/
│       └── analyze-image.js            # Serverless Gemini API function
└── .netlify/                           # Deploy artifacts (auto-generated)
```

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS, Tailwind CSS (CDN), no build process
- **Fonts:** Outfit (main) + Caveat (hand-written accents) via Google Fonts
- **Database/Auth:** Supabase (shared across all -Oid villages)
- **AI - Identification:** Gemini 2.0 Flash via Netlify serverless function (needs GEMINI_API_KEY env var)
- **AI - Chatbot:** Gemini 2.5 Flash via direct client-side call (user provides their own free API key)
- **QR Codes:** qrcode.js library (CDN)
- **Hosting:** Netlify (static + functions)

## Key Config Values

```javascript
CONFIG = {
    oidName: 'Sail-Oid',
    oidSlug: 'sailing',
    primaryColor: '#0284c7',
    supabaseUrl: 'https://pdnjeynugptnavkdbmxh.supabase.co',
    supabaseKey: 'eyJhbGci...' // Public anon key (safe for frontend)
};
```

## What Works

- ✅ Marina Village theme with all sections rendering
- ✅ Pontoon navigation (all anchor links work inline)
- ✅ Identify/Roast tabs with upload UI
- ✅ Image compression before API calls
- ✅ Result display with save/share/again buttons
- ✅ Amazon affiliate link parsing from AI responses
- ✅ Supabase magic link auth
- ✅ Kudos system (+10 per identification)
- ✅ Badge progression (Villager → Bridge Walker → Pollinator)
- ✅ Leaderboard (top 10 by kudos)
- ✅ QR code referral generation
- ✅ Dave chatbot with full knowledge base
- ✅ Q&A accordion (open/close, one at a time)
- ✅ Section fade-in on scroll
- ✅ Age verification modal
- ✅ Broadcast system (YouTube videos from Supabase)
- ✅ Recent activity feed
- ✅ Retry with exponential backoff for API errors
- ✅ Responsive design
- ✅ Accessibility (skip links, ARIA labels, reduced motion)

## What Needs Testing on Netlify

- Image identification (requires the serverless function + GEMINI_API_KEY env var)
- Supabase auth flow (magic link email delivery)
- Broadcast loading (needs active broadcast in Supabase)
- Share functionality (native share API on mobile)

## What's Next / Could Be Done

- **Pontoon F: Crew Finder** — currently "Coming Soon" placeholder
- **Pontoon G: Dealer Berths** — currently "Coming Soon" placeholder
- **Pontoon H: Below the Surface (Diving)** — currently "Coming Soon" placeholder
- **God Mode admin panel** — referenced in village-builder-skill but not yet in this build
- **The .skill file** — `marina-g25-files/feelfamous-village-builder.skill` is a binary/zip containing SKILL.md (the village builder template docs). Could be extracted and used for spawning more villages.
- **More -Oid villages** — village-builder-skill has specs for 12+ villages ready to generate (Vinyl-Oid, Guit-Oid, Coin-Oid, etc.)
- **SEO / Open Graph meta tags** — not yet added
- **PWA / offline support** — not yet added
- **Analytics** — no tracking currently

## Deployment

Drag the `sail-oid` folder into Netlify dashboard (app.netlify.com > Sites > drag & drop), or use `netlify deploy --prod`. Set environment variable: `GEMINI_API_KEY` in Site Settings > Environment Variables.

## Source Files Location

- Merged output: `C:\Users\comed\Desktop\a1\sail-oid-FINAL\sail-oid\`
- Original Marina (updated): `C:\Users\comed\Desktop\a1\marina-g25-files\`
- Original Sail-Oid: was at same path before merge (overwritten)
- Village Builder Skill: `C:\Users\comed\Desktop\a1\village-builder-skill\`

---
Built by Chris P Tee • Part of FeelFamous • World Domination Through Kindness ⛵
