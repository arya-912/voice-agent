import type { CallResult, DemoScenario, FailureType, TurnEvent } from "@/types";
import {
  ACK,
  AI_Q,
  BUSY,
  CARD,
  HARD_STOP,
  NO_SOFT,
  PRIORITY,
  PROMISE,
  WRONG,
  YES,
  type Script,
  type ScriptNode,
  type ScriptReply,
} from "./demoScript";

/**
 * Razorcovery payment-recovery calls for the /demo simulator.
 *
 * The script follows the real workflow in voice/prompt.py (identity check →
 * explain → offer → consent/refusal → close → end_call) and fires the same
 * tool names as voice/flow.py. It is a simulation: replies are matched by
 * keyword, not by the production model.
 *
 * All customers and merchants below are fictional.
 */

export const RECOVERY_AGENT_NAME = "Priya";


const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

type RecoveryScenario = DemoScenario & { failureType: FailureType; amountInr: number };

const EXPLAIN: Record<FailureType, (s: RecoveryScenario) => TurnEvent[]> = {
  payment_retry: (s) => [
    {
      kind: "say",
      text: `Aapka ${inr(s.amountInr)} ka pichhla payment attempt fail ho gaya tha, bank ne decline kar diya.`,
      translation: `Your last payment attempt of ${inr(s.amountInr)} failed; the bank declined it.`,
    },
    {
      kind: "say",
      text: "Main ek fresh secure payment link SMS pe bhej deti hoon, usse aap 2 minute mein retry kar sakte hain. Bhej doon?",
      translation: "I can send a fresh secure payment link by SMS so you can retry in 2 minutes. Shall I send it?",
    },
  ],
  checkout_abandonment: (s) => [
    {
      kind: "say",
      text: `Aapka ${inr(s.amountInr)} ka checkout adhura reh gaya tha, payment complete nahi hua.`,
      translation: `Your ${inr(s.amountInr)} checkout wasn't completed; the payment didn't go through.`,
    },
    {
      kind: "say",
      text: "Aapka order abhi bhi reserved hai. Main ek payment link bhej deti hoon taaki aap wahin se complete kar sakein?",
      translation: "Your order is still reserved. Shall I send a payment link so you can finish from there?",
    },
  ],
  mandate_failure: (s) => [
    {
      kind: "say",
      text: `Aapka ${inr(s.amountInr)} ka auto-pay subscription charge is baar fail ho gaya.`,
      translation: `Your ${inr(s.amountInr)} auto-pay subscription charge failed this time.`,
    },
    {
      kind: "say",
      text: "Main ek link bhejti hoon jisse aap is mahine ka payment manually clear kar sakein. Bhej doon?",
      translation: "I'll send a link so you can clear this month's payment manually. Shall I send it?",
    },
  ],
};

export function buildRecoveryScript(s: RecoveryScenario): Script {
  const first = s.customerName.split(" ")[0];

  const identityReplies: ScriptReply[] = [
    { id: "confirm", label: "Haan ji, boliye", text: "Haan ji, boliye.", translation: "Yes, go ahead.", next: "explain", match: YES, priority: PRIORITY.agree },
    { id: "ai", label: "Kya aap AI ho?", text: "Ek second, kya aap AI ho?", translation: "Wait, are you an AI?", next: "ai_disclose", match: AI_Q, priority: PRIORITY.ai },
    { id: "busy", label: "Abhi busy hoon", text: "Abhi main busy hoon, baad mein baat karte hain.", translation: "I'm busy right now, let's talk later.", next: "busy", match: BUSY, priority: PRIORITY.busy },
    { id: "wrong", label: "Wrong number", text: `Nahi, yahan koi ${first} nahi hai. Wrong number hai.`, translation: `No, there's no ${first} here. Wrong number.`, next: "wrong", match: WRONG, priority: PRIORITY.wrong },
  ];

  const offerReplies: ScriptReply[] = [
    { id: "agree", label: "Haan, bhej dijiye", text: "Haan, link bhej dijiye.", translation: "Yes, send the link.", next: "link_sent", match: YES, priority: PRIORITY.agree },
    { id: "promise", label: "Kal tak ho jayega", text: "Abhi nahi, kal tak payment ho jayega.", translation: "Not now, the payment will be done by tomorrow.", next: "promise", match: PROMISE, priority: PRIORITY.promise },
    { id: "card", label: "Card number bata doon?", text: "Card number le lijiye, aap hi payment kar do.", translation: "Take my card number and just do the payment yourself.", next: "no_card", match: CARD, priority: PRIORITY.card },
    { id: "soft_no", label: "Abhi interest nahi", text: "Abhi interest nahi hai.", translation: "Not interested right now.", next: "soft_retry", match: NO_SOFT, priority: PRIORITY.softNo },
    { id: "refuse", label: "Dobara call mat karna", text: "Mujhe dobara call mat karna.", translation: "Don't call me again.", next: "dnc", match: HARD_STOP, priority: PRIORITY.refuse },
  ];

  const ackReplies = (next: string): ScriptReply[] => [
    { id: "ack", label: "Theek hai, thank you", text: "Theek hai, thank you.", translation: "Okay, thank you.", next, match: ACK, priority: PRIORITY.ack },
  ];

  const close = (text: string, translation: string, result: CallResult): ScriptNode => ({
    events: [
      { kind: "say", text, translation },
      { kind: "tool", tool: "end_call", detail: "Closing line finished, hanging up" },
    ],
    result,
  });

  const nodes: Record<string, ScriptNode> = {
    greet: {
      events: [
        {
          kind: "say",
          text: `Namaste! Main ${s.agentName} bol rahi hoon, ${s.business} ki taraf se. Kya main ${s.customerName} se baat kar rahi hoon?`,
          translation: `Hello! This is ${s.agentName} calling on behalf of ${s.business}. Am I speaking with ${s.customerName}?`,
        },
      ],
      replies: identityReplies,
    },
    ai_disclose: {
      events: [
        {
          kind: "say",
          text: `Ji haan, main ek AI assistant hoon, ${s.business} ki taraf se call kar rahi hoon. Kya main ${s.customerName} se baat kar rahi hoon?`,
          translation: `Yes, I'm an AI assistant calling on behalf of ${s.business}. Am I speaking with ${s.customerName}?`,
        },
      ],
      replies: identityReplies.filter((r) => r.id !== "ai"),
    },
    explain: { events: EXPLAIN[s.failureType](s), replies: offerReplies },
    no_card: {
      events: [
        {
          kind: "say",
          text: "Nahi nahi, please card number, CVV ya OTP kisi ke saath share mat kijiye, mere saath bhi nahi. Main sirf ek secure link bhejti hoon jo aap khud use karte hain. Link bhej doon?",
          translation: "No, please don't share your card number, CVV or OTP with anyone, including me. I only send a secure link that you use yourself. Shall I send it?",
        },
      ],
      replies: offerReplies.filter((r) => r.id !== "card"),
    },
    soft_retry: {
      events: [
        {
          kind: "say",
          text: "Samajh sakti hoon, koi pressure nahi. Main link bhej doon taaki jab convenient ho tab kar lein? Woh 24 ghante valid rahega.",
          translation: "I understand, no pressure. Shall I send the link so you can pay whenever it suits you? It stays valid for 24 hours.",
        },
      ],
      replies: [
        { id: "agree", label: "Theek hai, bhej do", text: "Theek hai, bhej do.", translation: "Okay, send it.", next: "link_sent", match: YES, priority: PRIORITY.agree },
        { id: "no", label: "Nahi, rehne dijiye", text: "Nahi, rehne dijiye.", translation: "No, leave it.", next: "declined", match: NO_SOFT, priority: PRIORITY.softNo },
        { id: "refuse", label: "Dobara call mat karna", text: "Bola na, dobara call mat karna.", translation: "I said, don't call again.", next: "dnc", match: HARD_STOP, priority: PRIORITY.refuse },
      ],
    },
    link_sent: {
      events: [
        { kind: "tool", tool: "send_retry_link", detail: "Retry link created · valid 24h · consent captured" },
        {
          kind: "say",
          text: "Link bhej diya hai, 24 ghante tak valid rahega. SMS check kijiye aur wahin se payment complete kar lijiye.",
          translation: "I've sent the link, valid for 24 hours. Check your SMS and complete the payment from there.",
        },
      ],
      replies: ackReplies("close_recovered"),
    },
    close_recovered: close(
      `Dhanyavaad ${first} ji, aapka din shubh rahe!`,
      `Thank you, ${first}. Have a great day!`,
      "recovered",
    ),
    promise: {
      events: [
        { kind: "tool", tool: "offer_declined", detail: "Soft no · note: “will pay by tomorrow”" },
        {
          kind: "say",
          text: "Bilkul, maine note kar liya hai ki aap kal tak payment kar denge. Aapka time dene ke liye shukriya!",
          translation: "Of course, I've noted that you'll pay by tomorrow. Thanks for your time!",
        },
        { kind: "tool", tool: "end_call", detail: "Closing line finished, hanging up" },
      ],
      result: "declined",
    },
    declined: {
      events: [
        { kind: "tool", tool: "offer_declined", detail: "Soft no · customer may be contacted again later" },
        {
          kind: "say",
          text: "Koi baat nahi, main samajhti hoon. Aapka time dene ke liye shukriya, aapka din accha rahe.",
          translation: "No problem, I understand. Thanks for your time, have a good day.",
        },
        { kind: "tool", tool: "end_call", detail: "Closing line finished, hanging up" },
      ],
      result: "declined",
    },
    dnc: {
      events: [
        { kind: "tool", tool: "mark_do_not_contact", detail: "Refusal captured · all channels blocked for this customer" },
        {
          kind: "say",
          text: "Ji, maaf kijiye disturb karne ke liye. Aapko aage se contact nahi kiya jayega.",
          translation: "Of course, sorry for the disturbance. You won't be contacted again.",
        },
        { kind: "tool", tool: "end_call", detail: "Closing line finished, hanging up" },
      ],
      result: "refused",
    },
    wrong: {
      events: [
        { kind: "tool", tool: "wrong_person", detail: "Wrong number · flagged on the event" },
        {
          kind: "say",
          text: "Oh, maaf kijiye, galti se disturb kiya. Aapka din accha rahe.",
          translation: "Oh, sorry for disturbing you by mistake. Have a good day.",
        },
        { kind: "tool", tool: "end_call", detail: "Closing line finished, hanging up" },
      ],
      result: "wrong_number",
    },
    busy: close(
      "Koi baat nahi, main baad mein try karungi. Dhanyavaad!",
      "No problem, I'll try again later. Thank you!",
      "declined",
    ),
  };

  return {
    start: "greet",
    nodes,
    notUnderstood: {
      text: "Maaf kijiye, main theek se samajh nahi payi. Kya aap dobara bata sakte hain?",
      translation: "Sorry, I didn't quite catch that. Could you say it again?",
    },
  };
}
