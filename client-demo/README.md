# AI voice agents: client website

The client-facing website for our AI automation business. The flagship
offering is **AI voice calling agents for businesses**. Chatbots, websites,
custom software, dashboards and automation are presented as complementary
services. **Razorcovery**, the payment-recovery agent in this repo, is shown
as a featured case study: one real example of what we build, not the identity
of the site.

The site lives in its own folder. Its only link to the Python core in the rest
of this repo is the public live-demo API (`metrics/demo_api.py`), used when
`NEXT_PUBLIC_API_URL` is set. See "Live calls" below.

The site is honest about what is built. Capabilities carry one of these badges:

| Badge | Meaning |
|---|---|
| **Live** | Running in a real implementation today (Razorcovery). Case-study capability cards name the module |
| **Partially built** | Wired, but needs configuration or a later integration step |
| **Demo** | Shown in the website simulation only |
| **Custom build** | Built per client on the same engine, not an off-the-shelf feature |
| **Roadmap** | Not built. Shown only to illustrate where the same engine can go |

No clients, testimonials, metrics, certifications or partnerships are claimed.

## Pages

| Route | What it is |
|---|---|
| `/` | Hero (voice agents) → capability strip → why voice agents → what your agent can do → lead workflow → industries → industry example calls → demo preview → how it works → featured implementation (Razorcovery) → solutions (primary + secondary) → why us + safeguards → testimonials (hidden while empty) → CTA |
| `/demo` | Interactive call demo. Pick a scenario and play the customer. With a backend configured, the three payment-recovery scenarios are live voice calls to the real agent over the mic; everything else is a clearly labelled simulation |
| `/work/razorcovery` | Razorcovery case study: problem/solution, live capabilities, agents, recovery workflow + guardrails, integrations, sample dashboard |
| `/contact` | Consultation request form (name, company, work email, phone, industry, what to automate, message) |

## Tech

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4. Design tokens are in `src/app/globals.css` (`@theme`), with
  dark-mode overrides under `:root.dark` (follows the OS, toggle in the navbar)
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
| `NEXT_PUBLIC_API_URL` | no | Core backend URL (e.g. `http://localhost:8000`). Set: recovery scenarios are live calls. Empty: everything runs on the simulator |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | no | URL that accepts the contact form as a JSON `POST`. When empty, the form validates and shows a "demo mode, nothing was sent" confirmation |

`NEXT_PUBLIC_*` values are bundled into the browser. **Never** put the core's
secrets (`GOOGLE_API_KEY`, `LIVEKIT_API_SECRET`, `DATABASE_URL`, SIP credentials)
in this app.

## How the demo works

### Live calls (payment-recovery scenarios)

With `NEXT_PUBLIC_API_URL` set, `payment_retry`, `checkout_abandonment` and
`mandate_failure` talk to the production agent: the same `RecoveryAgent`
(`voice/flow.py`), prompt and Gemini Live model that place real phone calls,
but over the visitor's microphone instead of a phone line.

```
Start call → mic permission → POST /api/demo/session {scenario_id}
  backend: fictional FailureEvent (demo_…), LiveKit room, agent dispatched
           with dial=false, 10-minute token for that room only
  browser (src/lib/liveAgent.ts, livekit-client, loaded on demand):
           joins, publishes the mic, plays the agent's audio
  room → UI: lk.transcription (live transcript), lk.agent.state (status),
             razorcovery.tool (tool calls), razorcovery.outcome (result)
End: agent's end_call deletes the room, or "End call" →
     POST /api/demo/session/{id}/end; result falls back to GET /api/demo/session/{id}
```

`src/hooks/useLiveAgentCall.ts` returns the same shape as `useAgentCall`, so
`AgentDemo` renders either. Error states: mic denied, demo lines busy (429),
service unavailable (network/5xx/disabled), agent didn't join within 20s
(timeout), call dropped (disconnected). Closing or refreshing the page hangs
up (`sendBeacon`). The `?simulate=` modes below apply to simulated
scenarios only.

Backend side (repo root): `DEMO_ENABLED=true`, this site's origin in
`DEMO_ALLOWED_ORIGINS`, `LIVEKIT_*`, `GOOGLE_API_KEY`, and a running worker
(`python -m voice.agent start`). The API never takes a phone number, is
rate-limited per IP and capped on concurrent calls, and demo calls are
audited under `demo_` ids that the merchant dashboard hides.

### Simulated calls

- **Interactive call:** an in-browser simulator (`src/lib/mockAgent.ts`)
  driven by scripted scenarios (`src/data/demoScenarios.ts`), for the
  business scenarios always, and for the recovery ones when no backend is
  configured. It does **not** call the production AI backend, and the page
  says so.
  - *Business scenarios* (real estate, car dealership, wedding venue,
    coaching, hotel, home-services follow-up) use a generic lead-call
    builder (`buildLeadCallScript` in `src/data/demoScript.ts`): confirm
    identity → ask the business's qualifying questions → record details →
    offer the next step (book / send details / hand over). Free-typed
    answers are captured as details. Busy, not interested, "talk to a
    person", "are you a bot?" and "don't call again" are handled on every
    question.
  - *Payment-recovery scenarios* (`src/data/demoConversations.ts`) mirror
    `voice/prompt.py` (identity check → explain → offer → consent or refusal
    → close → `end_call`) and fire the same tool names as `voice/flow.py`.
  - Typed or spoken replies are matched by keyword in priority order, so a
    refusal is never read as a "yes".
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
and by the provider. `?scenario=<id>` preselects a scenario: `real_estate`,
`car_dealership`, `wedding_venue`, `coaching`, `hotel`, `home_services`,
`payment_retry`, `checkout_abandonment`, `mandate_failure`.

### Adding a demo scenario

Add an entry to `defs` in `src/data/demoScenarios.ts` with `lead({...meta}, {...spec})`:
the metadata (business, agent name, trigger, goal) plus the intro line,
2–4 questions with suggested answers, the offer line and 2–3 next-step
choices (each fires a tool and ends with a result). The UI picks it up
automatically. For an industry card to link to it, set `demoScenario` in
`src/data/industries.ts`.

## Connecting the real backend

All data access goes through **`src/lib/api.ts`**. Components and the
`useAgentCall` hook never import the mock directly.

1. **Voice sessions.** Recovery scenarios are already live (see "Live
   calls" above). To put a simulated scenario on a real backend instead,
   implement the `VoiceAgentProvider` interface:

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

   A new live business agent would follow the recovery pattern instead:
   add it to `voice/demo.py` and to `LIVE_SCENARIO_IDS` in `api.ts`.

2. **Analytics.** Replace the bodies of `getAnalyticsSummary()` /
   `getRecentCalls()` with `request("/api/summary")` /
   `request("/api/calls")`, and set `ANALYTICS_IS_SAMPLE = false`. Those
   routes currently require the FastAPI login cookie, so either serve the
   site same-origin behind the same auth, or expose a read-only token-gated
   summary endpoint.

3. **Content.** Everything editorial is data in `src/data/`. Edit those, not
   the components:

   | File | Content |
   |---|---|
   | `site.ts` | Brand name, tagline, nav, availability labels |
   | `useCases.ts` | What a voice agent can do (with availability) |
   | `voiceAgents.ts` | Capability strip, "why voice agents", lead workflow |
   | `industries.ts` | Industry cards + example calls per industry |
   | `solutions.ts` | Primary offering + secondary services |
   | `howItWorks.ts` | How we work, why us, safeguards |
   | `caseStudy.ts` | Razorcovery summary, recovery steps, guardrails |
   | `demoScenarios.ts`, `demoScript.ts`, `demoConversations.ts` | Demo scenarios and scripts |
   | `testimonials.ts` | Client quotes (empty; section hidden until filled) |
   | `agents.ts`, `capabilities.ts`, `integrations.ts`, `analytics.ts` | Razorcovery case-study detail |

## Before showing this to clients

- **Brand name.** `site.name` in `src/data/site.ts` is a placeholder
  ("AI Voice Agents") because the repo has no company name. Replace it.
- `testimonials.ts` is empty on purpose. Add only real, permissioned quotes.
- `site.contactEmail` is empty. Set `NEXT_PUBLIC_CONTACT_ENDPOINT` or wire
  the form to your CRM.
- All businesses and customers in examples are fictional.

## Structure

```
client-demo/
├── public/                     images/ logos/ screenshots/ (empty, for real assets)
├── src/
│   ├── app/                    layout, /, /demo, /contact, /work/razorcovery, 404, globals.css
│   ├── components/
│   │   ├── sections/           Home: Hero, CapabilityStrip, WhyVoice, VoiceAgents, Workflow,
│   │   │                       Industries, IndustryExamples, DemoPreview, HowItWorks, CaseStudy,
│   │   │                       Solutions, WhyUs, Testimonials, CTA
│   │   │                       Case study: Capabilities, AgentShowcase, RecoveryWorkflow,
│   │   │                       Integrations, AnalyticsPreview, Trust
│   │   ├── demo/               AgentDemo, Transcript, CallControls, ScenarioPicker, OutcomePanel
│   │   └── *.tsx               Navbar, Footer, ThemeToggle, HeroCallCard, VoiceVisualizer, FeatureCard,
│   │                           AgentCard, UseCaseCard, IntegrationCard, Stats, ResultBadge,
│   │                           ContactForm, Reveal, Icon, ui (Container, buttons, badges)
│   ├── data/                   all site content, demo scenarios/scripts, sample analytics
│   ├── hooks/                  useAgentCall, useSpeech, useSpeechInput
│   ├── lib/                    api.ts (integration boundary), mockAgent.ts, errors.ts, format.ts
│   └── types/                  shared types (mirror the Python names)
├── .env.example
└── package.json
```
