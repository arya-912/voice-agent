# Razorcovery: client demo website

A client-facing marketing and demo site for the Razorcovery payment-recovery
voice agent. It lives in its own folder and doesn't touch the Python core in
the rest of this repo (`voice/`, `decision/`, `audit/`, `intake/`, `metrics/`,
`auth/`).

The site is honest about what is built. Every capability, agent, use case and
integration has one of three badges:

| Badge | Meaning |
|---|---|
| **Live** | Implemented in the core repo (each capability card names the module) |
| **Partially built** | Wired, but needs configuration or a later integration step |
| **Roadmap** | Not built. Shown only to illustrate where the same engine can go |

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page: hero, capabilities, agent showcase, use cases, how it works + guardrails, integrations, dashboard preview, trust/placeholders, CTA |
| `/demo` | Interactive call simulator. You play the customer and the agent follows the production call flow |
| `/contact` | Demo-request form with validation |

## Tech

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4. Design tokens are in `src/app/globals.css` (`@theme`)
- No UI, icon or animation libraries. Icons are inline SVG (`components/Icon.tsx`), and animation is CSS only
- npm (matches `package-lock.json`)

The core repo has no JavaScript frontend (its dashboard is server-rendered HTML
from FastAPI), so this is a separate app rather than an extension of an
existing one.

## Run it

```bash
cd client-demo
npm install
cp .env.example .env.local   # optional; everything works with it empty
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run lint
npm run build
npm run start
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | no | Base URL for a real demo-session backend (see below). Unused by the default simulator |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | no | URL that accepts the contact form as a JSON `POST`. When empty, the form validates and shows a "demo mode, nothing was sent" confirmation |

`NEXT_PUBLIC_*` values are bundled into the browser. **Never** put the core's
secrets (`GOOGLE_API_KEY`, `LIVEKIT_API_SECRET`, `DATABASE_URL`, SIP credentials)
in this app.

## How the demo works today

The core backend doesn't expose a browser-safe session API. Its JSON endpoints
(`/api/summary`, `/api/calls`, …) require a session-cookie login, and real
conversations run as LiveKit SIP phone calls through Gemini Live. So the demo
uses:

- **Interactive call:** an in-browser simulator (`src/lib/mockAgent.ts`)
  driven by scripted flows (`src/data/demoConversations.ts`). The script
  mirrors `voice/prompt.py` (identity check → explain → offer → consent or
  refusal → close → `end_call`) and fires the same tool names as
  `voice/flow.py`. Typed or spoken replies are matched by keyword. The page
  says clearly that this is a simulation.
- **Dashboard preview:** illustrative sample data (`src/data/analytics.ts`),
  labelled on screen as "not customer results". Its shape mirrors
  `GET /api/summary` and `GET /api/calls`.
- **Optional browser audio:** "Read agent lines aloud" uses the browser's
  speech synthesis. The mic button uses browser speech recognition where
  available. Neither is the production Gemini voice.

### Testing error states

The simulator can reproduce failure modes through a query parameter:

```
/demo?simulate=unavailable   # service down
/demo?simulate=timeout       # request exceeds the 10s client timeout
/demo?simulate=empty         # agent returns no content
/demo?simulate=expired       # session expired mid-call
```

Invalid input (an empty reply or more than 200 characters) is rejected in the UI
and by the provider. `?scenario=payment_retry|checkout_abandonment|mandate_failure`
preselects a scenario.

## Connecting the real backend

All data access goes through **`src/lib/api.ts`**. Components and the
`useAgentCall` hook never import the mock directly.

1. **Voice sessions.** Implement the `VoiceAgentProvider` interface:

   ```ts
   startAgentSession(scenarioId) => AgentSession   // { sessionId, scenario, agentName, firstTurn }
   sendMessage(sessionId, { replyId } | { text }) => AgentTurn
   endAgentSession(sessionId) => void
   getConversation(sessionId) => TranscriptEntry[]
   ```

   Use the exported `request()` helper. It applies `NEXT_PUBLIC_API_URL`,
   a timeout, and maps HTTP status to `ApiError` codes (`401/410` →
   `session_expired`, `400/422` → `invalid_input`, `5xx`/network →
   `unavailable`, abort → `timeout`, empty body → `empty`). Then return your
   provider from `provider()` in `api.ts`. The UI's error states work as-is.

   The core would need a new, unauthenticated-but-rate-limited demo endpoint
   that runs a text or WebRTC session against `voice/flow.py`'s
   `RecoveryAgent`. That endpoint is not built, and this site deliberately
   doesn't call endpoints that don't exist. For a real voice-in-browser demo,
   the backend would mint a short-lived LiveKit room token server-side, and
   the page would join that room. The LiveKit secret must never reach the
   browser.

2. **Analytics.** Replace the bodies of `getAnalyticsSummary()` /
   `getRecentCalls()` with `request("/api/summary")` /
   `request("/api/calls")`, and set `ANALYTICS_IS_SAMPLE = false`. Those
   routes currently require the FastAPI login cookie, so either serve the
   site same-origin behind the same auth, or expose a read-only token-gated
   summary endpoint.

3. **Content.** Everything editorial is data in `src/data/`: `agents.ts`,
   `capabilities.ts`, `useCases.ts`, `integrations.ts`, `howItWorks.ts`,
   `site.ts`. Edit those, not the components.

## Before showing this to clients

- `src/components/sections/Trust.tsx` has **placeholders** for logos,
  testimonials and metrics. Fill them only with real, permissioned material.
- `site.contactEmail` in `src/data/site.ts` is empty. Set
  `NEXT_PUBLIC_CONTACT_ENDPOINT` or wire the form to your CRM.
- All customer and merchant names in examples are fictional.

## Structure

```
client-demo/
├── public/                     images/ logos/ screenshots/ (empty, for real assets)
├── src/
│   ├── app/                    layout, /, /demo, /contact, 404, globals.css
│   ├── components/
│   │   ├── sections/           Hero, Capabilities, AgentShowcase, UseCases, HowItWorks,
│   │   │                       Integrations, AnalyticsPreview, Trust, CTA
│   │   ├── demo/               AgentDemo, Transcript, CallControls, ScenarioPicker, OutcomePanel
│   │   └── *.tsx               Navbar, Footer, HeroCallCard, VoiceVisualizer, FeatureCard,
│   │                           AgentCard, UseCaseCard, IntegrationCard, Stats, ResultBadge,
│   │                           ContactForm, Reveal, Icon, ui (Container, buttons, badges)
│   ├── data/                   all site content + demo scripts + sample analytics
│   ├── hooks/                  useAgentCall, useSpeech, useSpeechInput
│   ├── lib/                    api.ts (integration boundary), mockAgent.ts, errors.ts, format.ts
│   └── types/                  shared types (mirror the Python names)
├── .env.example
└── package.json
```
