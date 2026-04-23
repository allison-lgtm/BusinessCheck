import React, { useState } from "react";

/* DESIGN TOKENS — matched to Probate Pathfinder */
const C = {
  navy: "#1a2744",
  slate: "#2d3a4f",
  gold: "#c8973e",
  goldLight: "#e8c97a",
  cream: "#f5f0e8",
  warmWhite: "#faf8f4",
  sage: "#6b8f71",
  sageLight: "#e8f0e9",
  coral: "#c4654a",
  coralLight: "#fae8e3",
  orange: "#d98841",
  orangeLight: "#fbe8d4",
  red: "#b54848",
  redLight: "#f5dcdc",
  text: "#2d3a4f",
  textLight: "#6b7a8f",
  border: "#e2ddd5",
  white: "#ffffff",
};

const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const serif = "'Georgia', 'Times New Roman', serif";

const CALENDLY_URL = "https://calendly.com/allisonbeckham/30min";

const SCORE = { YES: 0, PARTIAL: 1, UNSURE: 2, NO: 3 };

const stdOptions = [
  { label: "Yes, in place and current", value: "yes", score: SCORE.YES },
  { label: "Yes, but outdated or incomplete", value: "partial", score: SCORE.PARTIAL },
  { label: "Unsure / don't know", value: "unsure", score: SCORE.UNSURE },
  { label: "No", value: "no", score: SCORE.NO },
];

const ynuOptions = [
  { label: "Yes", value: "yes", score: SCORE.YES },
  { label: "Unsure / don't know", value: "unsure", score: SCORE.UNSURE },
  { label: "No", value: "no", score: SCORE.NO },
];

const screeningQuestions = [
  {
    id: "active_dispute",
    question: "Is there currently a lawsuit, threatened lawsuit, demand letter, or formal dispute involving the business or its owners?",
    subtext: "This tool is designed for preventive planning. Active disputes need direct legal counsel.",
    options: [
      { label: "No active or threatened dispute", value: "no" },
      { label: "Yes — there is an active or threatened dispute", value: "yes" },
    ],
  },
  {
    id: "texas_business",
    question: "Is the business organized or primarily operating in Texas?",
    subtext: "This tool is built around Texas law.",
    options: [
      { label: "Yes, Texas", value: "yes" },
      { label: "No, another state", value: "no" },
    ],
  },
  {
    id: "entity_type",
    question: "How is the business organized?",
    subtext: "",
    options: [
      { label: "LLC", value: "llc" },
      { label: "Corporation", value: "corp" },
      { label: "Partnership", value: "partnership" },
      { label: "Sole proprietorship", value: "sole" },
      { label: "Unsure", value: "unsure" },
    ],
  },
  {
    id: "owner_count",
    question: "How many owners does the business have?",
    subtext: "",
    options: [
      { label: "1 (sole owner)", value: "1" },
      { label: "2", value: "2" },
      { label: "3 to 5", value: "3-5" },
      { label: "6 or more", value: "6+" },
    ],
  },
  {
    id: "role",
    question: "What is your role in the business?",
    subtext: "",
    options: [
      { label: "Owner", value: "owner" },
      { label: "Officer, director, or manager", value: "manager" },
      { label: "Both owner and manager", value: "both" },
      { label: "Advisor or other", value: "other" },
    ],
  },
  {
    id: "family_involved",
    question: "Are any owners or key personnel related by blood or marriage?",
    subtext: "This includes spouses, parents, children, siblings, and in-laws — whether or not they are owners.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
  },
];

const profileQuestions = [
  {
    id: "years",
    question: "How long has the business been in operation?",
    subtext: "",
    options: [
      { label: "Less than 2 years", value: "<2" },
      { label: "2 to 5 years", value: "2-5" },
      { label: "5 to 15 years", value: "5-15" },
      { label: "15 or more years", value: "15+" },
    ],
  },
  {
    id: "revenue",
    question: "Approximate annual revenue?",
    subtext: "Used to calibrate risk weighting. Not shared.",
    options: [
      { label: "Under $250,000", value: "<250k" },
      { label: "$250,000 to $1 million", value: "250k-1m" },
      { label: "$1 million to $5 million", value: "1m-5m" },
      { label: "$5 million or more", value: "5m+" },
      { label: "Prefer not to say", value: "na" },
    ],
  },
  {
    id: "industry",
    question: "What industry best describes the business?",
    subtext: "",
    options: [
      { label: "Professional services", value: "professional" },
      { label: "Construction or trades", value: "construction" },
      { label: "Real estate", value: "realestate" },
      { label: "Retail, restaurant, or hospitality", value: "retail" },
      { label: "Manufacturing or distribution", value: "manufacturing" },
      { label: "Other", value: "other" },
    ],
  },
  {
    id: "ownership_changed",
    question: "Has ownership changed in the last 5 years?",
    subtext: "Includes any buy-in, buy-out, transfer, gift, or inheritance of ownership.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Unsure", value: "unsure" },
    ],
  },
  {
    id: "generation",
    question: "Which generation currently runs the business?",
    subtext: "",
    options: [
      { label: "Founder / first generation", value: "g1" },
      { label: "Second generation", value: "g2" },
      { label: "Third generation or later", value: "g3+" },
      { label: "Not a family business / not applicable", value: "na" },
    ],
    show: (a) => a.family_involved === "yes",
  },
];

const govQuestions = [
  { id: "gov_written_agreement", category: "governance", question: "Does the business have a current written governing agreement (operating agreement, shareholder agreement, or partnership agreement)?", subtext: "Sole proprietorships without co-owners may skip.", options: stdOptions, critical: (v) => v === "no" && true, show: (a) => a.entity_type !== "sole" && a.owner_count !== "1" },
  { id: "gov_last_reviewed", category: "governance", question: "When was the governing agreement last reviewed or updated?", subtext: "", options: [{ label: "Within the last 2 years", value: "recent", score: SCORE.YES },{ label: "2 to 5 years ago", value: "mid", score: SCORE.PARTIAL },{ label: "More than 5 years ago", value: "old", score: SCORE.PARTIAL },{ label: "Never reviewed since signing", value: "never", score: SCORE.NO },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }], show: (a) => a.gov_written_agreement === "yes" || a.gov_written_agreement === "partial" },
  { id: "gov_reflects_reality", category: "governance", question: "Does the governing agreement reflect current ownership percentages, roles, and business operations?", subtext: "", options: ynuOptions, show: (a) => a.gov_written_agreement === "yes" || a.gov_written_agreement === "partial" },
  { id: "gov_source", category: "governance", question: "How was the current governing agreement created?", subtext: "", options: [{ label: "Drafted or reviewed by an attorney", value: "attorney", score: SCORE.YES },{ label: "Downloaded form or online template", value: "form", score: SCORE.NO, critical: true },{ label: "Drafted internally without legal review", value: "internal", score: SCORE.PARTIAL },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }], show: (a) => a.gov_written_agreement === "yes" || a.gov_written_agreement === "partial" },
  { id: "gov_all_signed", category: "governance", question: "Have all current owners signed the current version?", subtext: "", options: ynuOptions, show: (a) => a.gov_written_agreement === "yes" || a.gov_written_agreement === "partial" },
];

const ownershipQuestions = [
  { id: "own_percentages_documented", category: "ownership_succession", question: "Is each owner's percentage interest documented in writing?", subtext: "", options: ynuOptions, show: (a) => a.owner_count !== "1" },
  { id: "own_transfers_documented", category: "ownership_succession", question: "Have all past ownership transfers, gifts, or buy-ins been formally documented?", subtext: "Undocumented transfers are a common source of later disputes.", options: ynuOptions, critical: (v) => v === "no", show: (a) => a.owner_count !== "1" && a.ownership_changed === "yes" },
  { id: "own_buysell", category: "ownership_succession", question: "Is there a written buy-sell agreement (standalone or embedded in the governing agreement)?", subtext: "A buy-sell defines what happens to an owner's interest when triggering events occur.", options: stdOptions, critical: (v) => v === "no" && true, show: (a) => a.owner_count !== "1" },
  {
    id: "own_buysell_triggers", category: "ownership_succession",
    question: "Which of the following triggering events does your buy-sell address?",
    subtext: "Select all that apply.",
    type: "multi",
    options: [
      { label: "Death of an owner", value: "death" },
      { label: "Disability or incapacity", value: "disability" },
      { label: "Divorce of an owner", value: "divorce" },
      { label: "Bankruptcy of an owner", value: "bankruptcy" },
      { label: "Voluntary departure / retirement", value: "voluntary" },
      { label: "Involuntary removal / termination for cause", value: "involuntary" },
      { label: "None of these / unsure", value: "none" },
    ],
    scoreMulti: (vals) => {
      if (!vals || vals.length === 0 || vals.includes("none")) return SCORE.NO;
      if (vals.length >= 5) return SCORE.YES;
      if (vals.length >= 3) return SCORE.PARTIAL;
      return SCORE.NO;
    },
    show: (a) => a.own_buysell === "yes" || a.own_buysell === "partial",
  },
  { id: "own_valuation", category: "ownership_succession", question: "Does the buy-sell specify a valuation method, and has it been reviewed in the last 3 years?", subtext: "A valuation formula set at founding rarely still fits.", options: stdOptions, show: (a) => a.own_buysell === "yes" || a.own_buysell === "partial" },
  { id: "own_buysell_funded", category: "ownership_succession", question: "Is the buy-sell funded (for example, by life insurance, sinking fund, or installment terms)?", subtext: "An unfunded buy-sell can be unenforceable in practice.", options: ynuOptions, show: (a) => a.own_buysell === "yes" || a.own_buysell === "partial" },
  { id: "own_succession_plan", category: "ownership_succession", question: "Is there a written succession plan for key leadership roles?", subtext: "", options: ynuOptions },
];

const fiduciaryQuestions = [
  { id: "fid_awareness", category: "fiduciary", question: "Do the owners and managers understand what fiduciary duties they owe the business and to each other?", subtext: "Fiduciary duties generally include loyalty, candor, refraining from self-dealing, and good faith.", options: ynuOptions, critical: (v) => v === "no" || v === "unsure" },
  {
    id: "fid_duties_modified", category: "fiduciary",
    question: "Has your governing agreement modified, waived, or expanded any fiduciary duties?",
    subtext: "Texas permits significant modification of default duties in some entity types. Most owners don't know whether theirs does.",
    options: [
      { label: "Yes, and we understand the modifications", value: "yes_known", score: SCORE.YES },
      { label: "Yes, but unsure what they say", value: "yes_unknown", score: SCORE.NO, critical: true },
      { label: "No, duties are not modified", value: "no", score: SCORE.YES },
      { label: "Unsure / don't know", value: "unsure", score: SCORE.UNSURE, critical: true },
    ],
    show: (a) => a.entity_type !== "sole" && a.owner_count !== "1",
  },
  { id: "fid_conflict_policy", category: "fiduciary", question: "Is there a written conflict-of-interest policy for owners, officers, or managers?", subtext: "", options: ynuOptions, show: (a) => a.owner_count !== "1" },
  { id: "fid_related_party", category: "fiduciary", question: "Are transactions between the business and its owners (or their relatives or affiliates) documented and formally approved?", subtext: "Examples: the business leasing property from an owner, hiring an owner's family member, or buying from an owner-affiliated vendor.", options: stdOptions, show: (a) => a.owner_count !== "1" },
  { id: "fid_decisions_defined", category: "fiduciary", question: "Are voting thresholds and a list of 'major decisions' (e.g., sale, borrowing, new owners) specified in the governing agreement?", subtext: "", options: stdOptions, show: (a) => a.owner_count !== "1" },
  { id: "fid_deadlock", category: "fiduciary", question: "Is there a deadlock resolution mechanism if owners or managers cannot agree?", subtext: "Relevant especially for 2-owner or 50/50 businesses.", options: ynuOptions, show: (a) => a.owner_count === "2" || a.owner_count === "3-5" },
  { id: "fid_authority", category: "fiduciary", question: "Is it clearly documented who has authority to bind the company to contracts, debts, or major decisions?", subtext: "", options: ynuOptions, show: (a) => a.owner_count !== "1" },
];

const recordsQuestions = [
  { id: "rec_meetings", category: "records", question: "Does the business hold and document annual meetings or written consents?", subtext: "", options: stdOptions, show: (a) => a.owner_count !== "1" },
  { id: "rec_major_decisions", category: "records", question: "Are major decisions memorialized in written resolutions, minutes, or consents?", subtext: "", options: stdOptions, show: (a) => a.owner_count !== "1" },
  { id: "rec_books_records", category: "records", question: "Is there a defined process for maintaining and producing books and records when owners request them?", subtext: "Owners have statutory rights to inspect records. Refusing or mishandling a request is a common dispute trigger.", options: stdOptions, show: (a) => a.owner_count !== "1" },
  { id: "rec_franchise_tax", category: "records", question: "Is the business current on Texas franchise tax filings and registered agent designations?", subtext: "", options: ynuOptions },
  { id: "rec_employment_basics", category: "records", question: "For any employees (including family members): are written offer letters, I-9s, and a basic employee handbook in place?", subtext: "Family-run businesses often skip these steps for family hires. That creates risk.", options: stdOptions, show: (a) => a.entity_type !== "sole" || a.family_involved === "yes" },
  { id: "rec_distributions", category: "records", question: "Are distributions and owner compensation documented and historically proportionate to ownership (or explicitly authorized otherwise)?", subtext: "Informal \"rewarding yourself\" is one of the most common fiduciary-duty lawsuits in closely held businesses.", options: stdOptions, critical: (v) => v === "no", show: (a) => a.owner_count !== "1" },
];

const insuranceQuestions = [
  { id: "ins_reviewed", category: "insurance", question: "When was your insurance coverage last reviewed against your actual current operations?", subtext: "Operations change faster than policies.", options: [{ label: "Within the last 2 years", value: "recent", score: SCORE.YES },{ label: "3 to 5 years ago", value: "mid", score: SCORE.PARTIAL },{ label: "More than 5 years ago", value: "old", score: SCORE.NO },{ label: "Never / unsure", value: "never", score: SCORE.NO }] },
  { id: "ins_exclusions", category: "insurance", question: "Do you understand what your current policies exclude?", subtext: "Claim denials almost always turn on exclusions the insured didn't know about.", options: [{ label: "Yes, clearly", value: "yes", score: SCORE.YES },{ label: "Somewhat", value: "somewhat", score: SCORE.PARTIAL },{ label: "No / unsure", value: "no", score: SCORE.NO }] },
  { id: "ins_operations_changed", category: "insurance", question: "Have your operations, revenue, or workforce changed significantly since your last policy review?", subtext: "", options: [{ label: "No significant change", value: "no", score: SCORE.YES },{ label: "Yes, and I've updated coverage", value: "yes_updated", score: SCORE.YES },{ label: "Yes, but I haven't updated coverage", value: "yes_not_updated", score: SCORE.NO, critical: true },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
  { id: "ins_contract_requirements", category: "insurance", question: "Do any of your contracts require specific insurance coverage that you haven't verified you actually carry?", subtext: "", options: [{ label: "No — we have verified coverage matches contract requirements", value: "no", score: SCORE.YES },{ label: "Yes — there are contract requirements we haven't checked", value: "yes", score: SCORE.NO, critical: true },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE, critical: true },{ label: "Not applicable — our contracts don't require specific insurance", value: "na", score: SCORE.YES }] },
  { id: "ins_claim_history", category: "insurance", question: "Have you ever had a claim denied or defended under a reservation of rights?", subtext: "A prior denial is a strong signal to reassess coverage.", options: [{ label: "No", value: "no", score: SCORE.YES },{ label: "Yes, and we addressed the underlying coverage issue", value: "yes_addressed", score: SCORE.YES },{ label: "Yes, and we haven't changed coverage since", value: "yes_not_addressed", score: SCORE.NO },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
];

const contractQuestions = [
  { id: "con_written_with_keys", category: "contracts", question: "Do you have written contracts with all major customers, vendors, and suppliers?", subtext: "", options: stdOptions },
  { id: "con_attorney_review", category: "contracts", question: "Are your significant contracts reviewed by an attorney before signing?", subtext: "\"Significant\" typically means recurring obligations, personal guarantees, large dollar value, or long term.", options: [{ label: "Yes, routinely", value: "yes", score: SCORE.YES },{ label: "Sometimes", value: "sometimes", score: SCORE.PARTIAL },{ label: "Rarely or never", value: "no", score: SCORE.NO },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
  { id: "con_templates", category: "contracts", question: "Does the business have attorney-drafted template agreements for common transactions?", subtext: "Examples: customer agreements, vendor agreements, NDAs, independent contractor agreements.", options: stdOptions },
  { id: "con_concentration", category: "contracts", question: "Do you have any single customer or vendor representing more than 25% of revenue or spend?", subtext: "Concentration risk magnifies the importance of contract terms.", options: [{ label: "No", value: "no", score: SCORE.YES },{ label: "Yes, and the contract is well-negotiated", value: "yes_good_contract", score: SCORE.PARTIAL },{ label: "Yes, and the contract is weak, outdated, or missing", value: "yes_weak_contract", score: SCORE.NO, critical: true },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
  { id: "con_tracking", category: "contracts", question: "Are renewal dates, termination windows, and recurring obligations under your contracts tracked systematically?", subtext: "", options: stdOptions },
  { id: "con_key_clauses", category: "contracts", question: "Have you actually reviewed the indemnification, limitation-of-liability, and insurance requirement clauses in your key contracts?", subtext: "", options: ynuOptions },
  { id: "con_arbitration", category: "contracts", question: "Do your contracts contain arbitration or other dispute-resolution clauses, and do you understand what they require?", subtext: "Arbitration is often agreed to without understanding the cost, speed, and appeal implications.", options: [{ label: "Yes, and we understand what they require", value: "yes_understood", score: SCORE.YES },{ label: "Yes, but we don't fully understand them", value: "yes_not_understood", score: SCORE.NO, critical: true },{ label: "No arbitration clauses", value: "no", score: SCORE.YES },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE, critical: true }] },
  { id: "con_recent_unreviewed", category: "contracts", question: "In the last 2 years, have you signed any contracts without legal review that involve recurring obligations, personal guarantees, or significant financial exposure?", subtext: "", options: [{ label: "No", value: "no", score: SCORE.YES },{ label: "Yes", value: "yes", score: SCORE.NO, critical: true },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
];

const familyLightQuestions = [
  { id: "fam_charter", category: "fiduciary", question: "Is there a written family business charter, policy, or set of agreed-upon rules for family members in the business?", subtext: "", options: stdOptions, show: (a) => a.family_involved === "yes" },
  { id: "fam_employment_process", category: "records", question: "Are employment decisions for family members (hiring, pay, promotion, termination) handled through a defined written process?", subtext: "", options: stdOptions, show: (a) => a.family_involved === "yes" },
];

const coreAuditQuestions = [...govQuestions, ...ownershipQuestions, ...fiduciaryQuestions, ...recordsQuestions, ...insuranceQuestions, ...contractQuestions, ...familyLightQuestions];

const categories = {
  governance: { label: "Governance Documents", weight: 1.0, color: C.navy },
  ownership_succession: { label: "Ownership & Succession", weight: 2.0, color: C.gold },
  fiduciary: { label: "Fiduciary Duty & Decisions", weight: 2.0, color: C.coral },
  records: { label: "Records & Compliance", weight: 1.0, color: C.slate },
  insurance: { label: "Insurance Coverage", weight: 1.5, color: C.sage },
  contracts: { label: "Third-Party Contracts", weight: 1.5, color: C.orange },
};

const deepDiveFamily = [
  { id: "dd_fam_succession_conversation", category: "ownership_succession", question: "Has there been an informal family conversation about succession that has never been put in writing?", subtext: "Verbal \"understandings\" about who will eventually run or inherit the business are among the most common sources of family business litigation.", options: [{ label: "No informal discussions — it's all documented or hasn't been discussed", value: "no", score: SCORE.YES },{ label: "Yes, and we should document it", value: "yes", score: SCORE.NO, critical: true },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
  { id: "dd_fam_spousal_consents", category: "ownership_succession", question: "Are non-owner spouses of owners subject to any written agreements (spousal consents, NDAs, waivers)?", subtext: "Relevant especially in community-property states like Texas.", options: ynuOptions },
  { id: "dd_fam_estate_coordinated", category: "ownership_succession", question: "Are the estate plans of the owners coordinated with the business's buy-sell and succession documents?", subtext: "Mismatches between an owner's will and the buy-sell are a classic dispute trigger.", options: stdOptions },
  { id: "dd_fam_inlaws_ops", category: "fiduciary", question: "Are there non-owner family members (in-laws, adult children, siblings) who work in or influence the business without formal documentation of their role?", subtext: "", options: [{ label: "No", value: "no", score: SCORE.YES },{ label: "Yes, and roles are documented", value: "yes_documented", score: SCORE.YES },{ label: "Yes, and roles are not documented", value: "yes_not_documented", score: SCORE.NO, critical: true },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
  { id: "dd_fam_next_gen", category: "ownership_succession", question: "Has the next generation been meaningfully prepared for leadership (training, roles, decision-making exposure)?", subtext: "", options: stdOptions, show: (a) => a.generation === "g1" || a.generation === "g2" },
];

const deepDiveBuySell = [
  { id: "dd_bs_trigger_price_match", category: "ownership_succession", question: "Does the buy-sell's price or valuation method yield fundamentally different results for different triggering events (e.g., death vs. voluntary departure)?", subtext: "Many buy-sells use one formula for every trigger, which can produce unfair outcomes.", options: [{ label: "Yes, it's intentionally tailored", value: "yes", score: SCORE.YES },{ label: "No, same formula for everything", value: "no", score: SCORE.PARTIAL },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
  { id: "dd_bs_installment", category: "ownership_succession", question: "If a buyout is required, are installment payment terms, interest rate, and security specified?", subtext: "", options: ynuOptions },
  { id: "dd_bs_drag_tag", category: "ownership_succession", question: "Does the governing agreement address drag-along and tag-along rights for minority owners?", subtext: "Particularly important if a sale of the business is a realistic exit path.", options: ynuOptions },
  { id: "dd_bs_noncompete", category: "ownership_succession", question: "Does the buy-sell require departing owners to sign a non-competition or non-solicitation covenant?", subtext: "", options: ynuOptions },
  { id: "dd_bs_transfer_restrictions", category: "ownership_succession", question: "Does the agreement restrict transfers of ownership to third parties (e.g., right of first refusal, consent requirement)?", subtext: "", options: ynuOptions },
];

const deepDiveContracts = [
  { id: "dd_con_personal_guarantees", category: "contracts", question: "Have any owners signed personal guarantees on business contracts, leases, or loans?", subtext: "", options: [{ label: "No personal guarantees", value: "no", score: SCORE.YES },{ label: "Yes, and we have a current inventory of them", value: "yes_tracked", score: SCORE.PARTIAL },{ label: "Yes, but we don't have a current list", value: "yes_untracked", score: SCORE.NO, critical: true },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE, critical: true }] },
  { id: "dd_con_lease", category: "contracts", question: "Do you have a commercial lease, and if so, was it negotiated (not just signed on the landlord's form)?", subtext: "", options: [{ label: "No commercial lease", value: "na", score: SCORE.YES },{ label: "Yes, and it was negotiated / attorney-reviewed", value: "negotiated", score: SCORE.YES },{ label: "Yes, and it was signed without real negotiation", value: "signed", score: SCORE.NO },{ label: "Unsure", value: "unsure", score: SCORE.UNSURE }] },
  { id: "dd_con_confidentiality", category: "contracts", question: "Are employees and contractors with access to confidential information required to sign confidentiality agreements before accessing it?", subtext: "", options: stdOptions },
  { id: "dd_con_counterparty_research", category: "contracts", question: "Do you research counterparties (lawsuit history, financial stability) before entering significant contracts with them?", subtext: "A short background check has prevented many clients from losing money they couldn't recover.", options: [{ label: "Yes, routinely", value: "yes", score: SCORE.YES },{ label: "Sometimes", value: "sometimes", score: SCORE.PARTIAL },{ label: "Rarely or never", value: "no", score: SCORE.NO }] },
  { id: "dd_con_venue_jurisdiction", category: "contracts", question: "Do your contracts specify venue, jurisdiction, and choice of law in ways that protect the business (not just the other side)?", subtext: "", options: ynuOptions },
];

/* SCORING */
function scoreQuestion(q, value) {
  if (value == null) return { score: 0, max: 0, critical: false };
  if (q.type === "multi") {
    const max = 3;
    const score = q.scoreMulti ? q.scoreMulti(value) : 0;
    return { score, max, critical: false };
  }
  const opt = q.options.find((o) => o.value === value);
  if (!opt || typeof opt.score !== "number") return { score: 0, max: 0, critical: false };
  const max = 3;
  const critical = (typeof q.critical === "function" && q.critical(value)) || opt.critical === true;
  return { score: opt.score, max, critical };
}

function computeResults(answers, askedQuestions) {
  const catTotals = {};
  const criticalFlags = [];
  Object.keys(categories).forEach((k) => { catTotals[k] = { raw: 0, max: 0, weighted: 0, weightedMax: 0 }; });
  askedQuestions.forEach((q) => {
    if (!q.category) return;
    const v = answers[q.id];
    if (v == null) return;
    const { score, max, critical } = scoreQuestion(q, v);
    const cat = catTotals[q.category];
    if (!cat) return;
    cat.raw += score; cat.max += max;
    const w = categories[q.category].weight;
    cat.weighted += score * w; cat.weightedMax += max * w;
    if (critical) criticalFlags.push({ qid: q.id, question: q.question, value: v });
  });
  const categoryResults = {};
  Object.entries(catTotals).forEach(([k, t]) => {
    const pct = t.max > 0 ? (t.raw / t.max) * 100 : 0;
    let rating;
    if (pct === 0 && t.max === 0) rating = "na";
    else if (pct <= 20) rating = "green";
    else if (pct <= 50) rating = "yellow";
    else if (pct <= 75) rating = "orange";
    else rating = "red";
    categoryResults[k] = { ...t, pct, rating };
  });
  const totalWeighted = Object.values(catTotals).reduce((s, t) => s + t.weighted, 0);
  const totalWeightedMax = Object.values(catTotals).reduce((s, t) => s + t.weightedMax, 0);
  const riskPct = totalWeightedMax > 0 ? totalWeighted / totalWeightedMax : 0;
  const healthScore = Math.round((1 - riskPct) * 100);
  let overallRating;
  if (healthScore >= 80) overallRating = "green";
  else if (healthScore >= 60) overallRating = "yellow";
  else if (healthScore >= 40) overallRating = "orange";
  else overallRating = "red";
  const priorities = Object.entries(categoryResults)
    .filter(([, r]) => r.max > 0 && r.pct > 20)
    .sort((a, b) => {
      const rank = { red: 4, orange: 3, yellow: 2, green: 1, na: 0 };
      if (rank[b[1].rating] !== rank[a[1].rating]) return rank[b[1].rating] - rank[a[1].rating];
      return b[1].pct - a[1].pct;
    })
    .slice(0, 3).map(([k, r]) => ({ key: k, ...r }));
  return { categories: categoryResults, healthScore, overallRating, priorities, criticalFlags };
}

const priorityNarratives = {
  governance: { headline: "Your foundational governance documents need attention.", body: "Most closely held business disputes I've seen started with an agreement that was outdated, incomplete, or downloaded from the internet. A current, well-drafted governing agreement sets the ground rules before anyone is angry and prevents most fights from ever starting." },
  ownership_succession: { headline: "Your ownership and succession structure has meaningful gaps.", body: "Buy-sell agreements, valuation methods, and succession plans are the architecture that determines what happens when an owner dies, divorces, retires, or wants out. Gaps here are where the most expensive disputes happen — because by the time they surface, everyone's interests have diverged." },
  fiduciary: { headline: "Fiduciary duties and decision-making protocols are under-defined.", body: "Fiduciary duty is the highest standard in the law, and it's the one owners and managers most often overlook. Many owners don't know what they owe each other until they've already breached it. Clear conflict-of-interest policies, decision-making rules, and documented related-party transactions prevent most of those problems." },
  records: { headline: "Your records and compliance practices need tightening.", body: "Undocumented meetings, informal distributions, and missing written consents don't cause disputes on their own — but when a dispute does arise, their absence turns a solvable disagreement into a trial. Good records are cheap insurance." },
  insurance: { headline: "Your insurance coverage is likely out of step with your actual risk.", body: "Most business owners bought their policies once, renewed on autopilot, and have no idea what's excluded until a claim is denied. An insurance review against current operations and contract requirements is one of the highest-value preventive steps a business can take." },
  contracts: { headline: "Your third-party contract practices expose the business to avoidable risk.", body: "The pattern I see most often is owners who didn't consult an attorney before signing a contract, and later discovered how one-sided the agreement was. The time to negotiate — or at least understand — a contract is before you sign it." },
};

function getEducationalModules(answers) {
  const mods = [];
  if (answers.con_arbitration === "yes_not_understood" || answers.con_arbitration === "unsure") mods.push("arbitration");
  if (answers.fid_awareness === "no" || answers.fid_awareness === "unsure" || answers.fid_duties_modified === "yes_unknown" || answers.fid_duties_modified === "unsure") mods.push("fiduciary");
  if (answers.gov_source === "form") mods.push("form_contracts");
  if (answers.con_concentration === "yes_weak_contract") mods.push("concentration");
  return mods;
}

function Card({ children, style }) {
  return <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "24px", marginBottom: 16, ...style }}>{children}</div>;
}
function SectionTitle({ children }) {
  return <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 14px", fontFamily: sans }}>{children}</h3>;
}
function Expander({ title, children, accentColor = C.gold }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12, background: C.white, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.text, textAlign: "left", borderLeft: `3px solid ${accentColor}` }}>
        <span>{title}</span>
        <span style={{ color: C.textLight, fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "4px 18px 18px", fontFamily: serif, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{children}</div>}
    </div>
  );
}
function RatingPill({ rating, size = "md" }) {
  const map = {
    green: { label: "Healthy", bg: C.sageLight, color: C.sage },
    yellow: { label: "Attention", bg: "#fef3e2", color: "#b8860b" },
    orange: { label: "Gaps", bg: C.orangeLight, color: C.orange },
    red: { label: "High Risk", bg: C.redLight, color: C.red },
    na: { label: "N/A", bg: C.cream, color: C.textLight },
  };
  const s = map[rating] || map.na;
  const sizes = { sm: { padding: "3px 10px", fontSize: 11 }, md: { padding: "4px 12px", fontSize: 12 } };
  return <span style={{ display: "inline-block", borderRadius: 20, fontWeight: 700, background: s.bg, color: s.color, fontFamily: sans, letterSpacing: "0.5px", textTransform: "uppercase", ...sizes[size] }}>{s.label}</span>;
}

function LifeOfLawsuit() {
  const stages = [
    ["Pre-Suit", "Find and provide key evidence for your attorney. Discuss strategy and potential outcomes.", "right"],
    ["Plaintiff's Petition", "The petition states the claims against the defendant and begins the legal proceeding.", "left"],
    ["Serving the Defendant", "Service notifies the defendant of the lawsuit and begins the timeline to answer.", "right"],
    ["Defendant's Answer", "Defendant responds and may also counterclaim.", "left"],
    ["Written Discovery", "You answer written questions and collect all relevant documents.", "right"],
    ["Depositions", "Parties and witnesses are questioned under oath. Preparation takes many hours; depositions often last a full day.", "left"],
    ["Motions", "Attorneys file and respond to motions throughout the case — from discovery disputes to motions to dismiss claims.", "right"],
    ["Pre-Trial", "In the weeks before trial, you prepare witnesses, identify exhibits, finalize the jury charge, and complete court-required tasks.", "left"],
    ["Trial", "The culmination of the case. The court or jury decides the outcome.", "right"],
    ["Post-Trial", "Even after trial, there are steps to enter judgment, disregard the verdict, or appeal.", "left"],
    ["Judgment", "Assuming no appeal, the court issues a final judgment that ends the lawsuit.", "right"],
    ["Collecting", "You take the judgment and seek to enforce it against the defendant by finding non-exempt assets a sheriff can seize and sell.", "left"],
  ];
  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4, fontFamily: sans }}>The Life Of A</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, letterSpacing: "-0.5px", fontFamily: sans }}>LAWSUIT</div>
      </div>
      <div style={{ position: "relative", paddingLeft: 20, borderLeft: `2px solid ${C.border}` }}>
        {stages.map(([title, desc, side], i) => {
          const accent = side === "left" ? C.coral : C.gold;
          return (
            <div key={i} style={{ position: "relative", marginBottom: 18, paddingLeft: 12 }}>
              <div style={{ position: "absolute", left: -27, top: 4, width: 12, height: 12, borderRadius: "50%", background: accent, border: `2px solid ${C.white}`, boxShadow: `0 0 0 2px ${accent}` }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: sans, marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontFamily: sans }}>{desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ArbitrationTable() {
  const rows = [
    ["Decision-maker", "A judge or jury decides the outcome.", "An arbitrator or panel decides the outcome. Arbitrators are typically experienced attorneys."],
    ["Filing costs", "Minimal filing fees, plus a jury fee.", "Thousands in filing fees, plus payment of the arbitrator(s) at their hourly rate."],
    ["Public or private", "Allegations and court filings are public record.", "Documents filed in arbitration are generally not available to the public."],
    ["Scheduling control", "Minimal control — scheduling is driven by the court's availability.", "Parties can dictate the schedule, subject to the arbitrator's availability."],
    ["Rules of evidence", "Parties must follow rules of evidence and procedure.", "Rules of evidence and procedure generally do not apply; more informal."],
    ["Dispositive motions", "Claims can sometimes be dismissed before trial (motion to dismiss, summary judgment).", "Arbitrators are less likely to grant dispositive motions, so a defendant may have to go through the entire hearing on a claim a court might have dismissed."],
    ["Appeal rights", "Parties can appeal on many grounds, including insufficient evidence or misapplied law.", "Extremely limited bases to appeal. Misapplication of the law is not a ground for appeal."],
    ["Awards", "Juries can be generous with their verdicts.", "Arbitrators are more likely to issue \"split the baby\" awards."],
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "10px 8px", background: C.cream, color: C.navy, fontWeight: 700, borderBottom: `2px solid ${C.border}`, width: "22%" }}></th>
            <th style={{ textAlign: "left", padding: "10px 8px", background: C.cream, color: C.navy, fontWeight: 700, borderBottom: `2px solid ${C.border}` }}>Litigation</th>
            <th style={{ textAlign: "left", padding: "10px 8px", background: C.cream, color: C.navy, fontWeight: 700, borderBottom: `2px solid ${C.border}` }}>Arbitration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, lit, arb], i) => (
            <tr key={i}>
              <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, color: C.textLight, verticalAlign: "top" }}>{label}</td>
              <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}`, color: C.text, verticalAlign: "top", lineHeight: 1.5 }}>{lit}</td>
              <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}`, color: C.text, verticalAlign: "top", lineHeight: 1.5 }}>{arb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BusinessHealthCheck() {
  const [screen, setScreen] = useState("landing");
  const [answers, setAnswers] = useState({});
  const [multiSelect, setMultiSelect] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentStage, setCurrentStage] = useState("screening");
  const [activeDeepDives, setActiveDeepDives] = useState([]);
  const [currentDeepDive, setCurrentDeepDive] = useState(null);
  const [exitReason, setExitReason] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const currentDeepDiveQuestions = () => {
    if (currentDeepDive === "family") return deepDiveFamily;
    if (currentDeepDive === "buysell") return deepDiveBuySell;
    if (currentDeepDive === "contracts") return deepDiveContracts;
    return [];
  };

  const getStageQuestions = (stage) => {
    let base;
    if (stage === "screening") base = screeningQuestions;
    else if (stage === "profile") base = profileQuestions;
    else if (stage === "audit") base = coreAuditQuestions;
    else if (stage === "deepdive") base = currentDeepDiveQuestions();
    else base = [];
    return base.filter((q) => (q.show ? q.show(answers) : true));
  };

  const visible = getStageQuestions(currentStage);
  const q = visible[currentQ];
  const progress = visible.length > 0 ? (currentQ / visible.length) * 100 : 0;

  const handleSingleAnswer = (qid, value) => {
    const updated = { ...answers, [qid]: value };
    setAnswers(updated);
    if (qid === "active_dispute" && value === "yes") { setExitReason("active_dispute"); setTimeout(() => setScreen("exit"), 250); return; }
    if (qid === "texas_business" && value === "no") { setExitReason("non_texas"); setTimeout(() => setScreen("exit"), 250); return; }
    setTimeout(() => advance(updated), 200);
  };

  const handleMultiSubmit = (qid) => {
    const updated = { ...answers, [qid]: multiSelect };
    setAnswers(updated);
    setMultiSelect([]);
    setTimeout(() => advance(updated), 150);
  };

  const advance = (updated) => {
    const newVisible = (() => {
      let base;
      if (currentStage === "screening") base = screeningQuestions;
      else if (currentStage === "profile") base = profileQuestions;
      else if (currentStage === "audit") base = coreAuditQuestions;
      else if (currentStage === "deepdive") base = currentDeepDiveQuestions();
      else base = [];
      return base.filter((q2) => (q2.show ? q2.show(updated) : true));
    })();
    const next = currentQ + 1;
    if (next < newVisible.length) {
      setCurrentQ(next);
    } else {
      if (currentStage === "screening") { setCurrentStage("profile"); setCurrentQ(0); setScreen("profile"); }
      else if (currentStage === "profile") { setCurrentStage("audit"); setCurrentQ(0); setScreen("audit"); }
      else if (currentStage === "audit") { setScreen("deepdive_choice"); }
      else if (currentStage === "deepdive") {
        const remaining = activeDeepDives.filter((d) => d !== currentDeepDive);
        if (remaining.length > 0) {
          setActiveDeepDives(remaining);
          setCurrentDeepDive(remaining[0]);
          setCurrentQ(0);
        } else {
          setScreen("results");
        }
      }
    }
  };

  const goBack = () => {
    if (currentQ > 0) { setCurrentQ(currentQ - 1); return; }
    if (currentStage === "profile") { setCurrentStage("screening"); const v = screeningQuestions.filter((q2) => (q2.show ? q2.show(answers) : true)); setCurrentQ(Math.max(0, v.length - 1)); setScreen("screening"); }
    else if (currentStage === "audit") { setCurrentStage("profile"); const v = profileQuestions.filter((q2) => (q2.show ? q2.show(answers) : true)); setCurrentQ(Math.max(0, v.length - 1)); setScreen("profile"); }
    else if (currentStage === "deepdive") { setScreen("deepdive_choice"); }
    else { restart(); }
  };

  const restart = () => {
    setScreen("landing"); setCurrentStage("screening"); setCurrentQ(0);
    setAnswers({}); setMultiSelect([]); setActiveDeepDives([]);
    setCurrentDeepDive(null); setExitReason(null); setEmail(""); setEmailSubmitted(false);
  };

  const startDeepDive = (keys) => {
    if (!keys || keys.length === 0) { setScreen("results"); return; }
    setActiveDeepDives(keys); setCurrentDeepDive(keys[0]);
    setCurrentStage("deepdive"); setCurrentQ(0); setScreen("deepdive");
  };

  const askedCoreAudit = coreAuditQuestions.filter((q2) => (q2.show ? q2.show(answers) : true));

  /* LANDING */
  if (screen === "landing") {
    return (
      <div style={{ minHeight: "100vh", background: C.warmWhite, fontFamily: serif }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: C.navy, marginBottom: 20 }}>
              <span style={{ fontSize: 28, color: C.gold }}>&#9873;</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 400, color: C.navy, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Business Legal Health Check</h1>
            <p style={{ fontSize: 13, color: C.gold, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", margin: "0", fontFamily: sans }}>Free Texas Diagnostic Tool</p>
          </div>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 12px", lineHeight: 1.3 }}>A check-up for your business — before there's a dispute.</h2>
            <p style={{ fontSize: 16, color: C.text, lineHeight: 1.7, margin: "0 0 16px" }}>Most business lawsuits are preventable. The problems I've spent my career litigating — governance gaps, ambiguous ownership, missing buy-sells, fiduciary breaches, bad contracts, inadequate insurance — almost always trace back to a handful of decisions (or non-decisions) made years before the dispute arose.</p>
            <p style={{ fontSize: 16, color: C.text, lineHeight: 1.7, margin: "0 0 16px" }}>Think of this as an annual physical for your business. It won't replace a conversation with a lawyer, but it will surface the gaps most likely to cause real trouble — and show you which ones matter most.</p>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.6, margin: 0 }}>Answer about 35 questions (10–12 minutes), and you'll receive a governance health score, a category-by-category dashboard, and a plain-English list of priorities.</p>
          </div>
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.navy, margin: "0 0 14px", fontFamily: sans }}>This tool is for you if:</h3>
            {["You own or help run a closely held business in Texas","You want to find the weak spots before they become disputes","You're not currently in active litigation or a formal dispute","You'd rather prevent problems than litigate them"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start", fontFamily: sans }}>
                <span style={{ color: C.sage, fontWeight: 700, fontSize: 16, flexShrink: 0, marginTop: 1 }}>&#10003;</span>
                <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.navy, margin: "0 0 14px", fontFamily: sans }}>What you'll learn:</h3>
            {[["A governance health score", "Out of 100 — plus a category-by-category dashboard"],["Your top priorities", "The specific gaps most likely to cause problems, in order of severity"],["Where the risks actually live", "Ownership & succession, fiduciary duty, insurance, contracts, and more"],["What to do next", "A clear path to close the most important gaps"]].map(([title, desc], i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 14 : 0, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.gold, flexShrink: 0, marginTop: 2, fontFamily: sans }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: sans }}>{title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.4, marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </Card>
          <button onClick={() => { setScreen("screening"); setCurrentStage("screening"); setCurrentQ(0); }} style={{ width: "100%", padding: "16px 24px", fontSize: 16, fontWeight: 600, color: "white", background: C.navy, border: "none", borderRadius: 10, cursor: "pointer", marginBottom: 16, fontFamily: sans, letterSpacing: "0.3px" }}>Get Started — It's Free</button>
          <div style={{ background: C.cream, borderRadius: 10, padding: "16px 20px", marginBottom: 12, borderLeft: `3px solid ${C.gold}` }}>
            <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.5, margin: 0, fontFamily: sans }}><strong style={{ color: C.text }}>Important:</strong> This tool provides legal information, not legal advice. It does not create an attorney-client relationship. Results are based on general Texas law and may not account for every detail of your situation. When in doubt, talk to a lawyer.</p>
          </div>
          <div style={{ borderRadius: 8, padding: "10px 20px", marginBottom: 16, fontSize: 12, color: C.textLight, fontFamily: sans, textAlign: "center" }}>Your answers are not saved. No personal information is collected.</div>
          <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: C.textLight, fontFamily: sans }}>Built by A. Beckham Law, PLLC — Pearland, Texas<br /><span style={{ fontSize: 11 }}>Legal information, not legal advice</span></div>
        </div>
      </div>
    );
  }

  if (screen === "exit") {
    const activeDispute = exitReason === "active_dispute";
    return (
      <div style={{ minHeight: "100vh", background: C.warmWhite, fontFamily: serif }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: C.coralLight, marginBottom: 16 }}>
              <span style={{ fontSize: 24, color: C.coral }}>&#9888;</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: C.navy, margin: "0 0 8px" }}>{activeDispute ? "This tool isn't the right fit right now." : "This tool is built for Texas businesses."}</h2>
          </div>
          <Card>
            {activeDispute ? (
              <>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: "0 0 16px" }}>The Business Legal Health Check is designed for preventive planning — for owners who want to find the gaps before a dispute arises.</p>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: "0 0 16px" }}>If there's an active lawsuit, threatened lawsuit, demand letter, or formal dispute already in motion, that situation needs direct legal counsel — not a diagnostic tool.</p>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, margin: 0, fontFamily: sans }}>A few options: the State Bar of Texas Lawyer Referral Service (<a href="https://www.texasbar.com/AM/Template.cfm?Section=Lawyer_Referral_Service1" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>texasbar.com</a>) connects you with a licensed Texas attorney for a $20 consultation. If you already have a lawyer, this is the time to call them.</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: "0 0 16px" }}>This tool is built around Texas law, so the results wouldn't be reliable for a business organized or primarily operating in another state.</p>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, margin: 0, fontFamily: sans }}>If your business has a Texas connection (property, operations, or owners in Texas), feel free to start over and answer accordingly. Otherwise, look for a business attorney licensed in your state.</p>
              </>
            )}
          </Card>
          <button onClick={restart} style={{ width: "100%", padding: "14px 24px", fontSize: 14, fontWeight: 600, color: C.navy, background: "white", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", fontFamily: sans, marginTop: 8 }}>← Start Over</button>
        </div>
      </div>
    );
  }

  if ((screen === "screening" || screen === "profile" || screen === "audit" || screen === "deepdive") && q) {
    const stageLabel = { screening: "Screening", profile: "Business Profile", audit: "Legal Health Audit", deepdive: currentDeepDive === "family" ? "Family Dynamics Deep Dive" : currentDeepDive === "buysell" ? "Buy-Sell Deep Dive" : "Contracts Deep Dive" }[screen];
    return (
      <div style={{ minHeight: "100vh", background: C.warmWhite, fontFamily: serif }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 40px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <button onClick={goBack} style={{ fontSize: 13, color: C.textLight, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: sans }}>← {currentQ > 0 || currentStage !== "screening" ? "Back" : "Start over"}</button>
              <span style={{ fontSize: 12, color: C.textLight, fontFamily: sans, letterSpacing: "0.5px", textTransform: "uppercase" }}>{stageLabel} · {currentQ + 1} of {visible.length}</span>
            </div>
            <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: C.gold, borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 8px", lineHeight: 1.35, fontFamily: serif }}>{q.question}</h2>
            {q.subtext && <p style={{ fontSize: 13, color: C.textLight, margin: 0, lineHeight: 1.5, fontFamily: sans }}>{q.subtext}</p>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt) => {
              const isMulti = q.type === "multi";
              const isSelected = isMulti ? multiSelect.includes(opt.value) : answers[q.id] === opt.value;
              return (
                <button key={opt.value} onClick={() => { if (isMulti) { setMultiSelect((prev) => prev.includes(opt.value) ? prev.filter((v) => v !== opt.value) : [...prev, opt.value]); } else { handleSingleAnswer(q.id, opt.value); } }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: isSelected ? C.navy : "white", color: isSelected ? "white" : C.text, border: `1px solid ${isSelected ? C.navy : C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "all 0.15s ease", fontFamily: sans }}>
                  <span style={{ flex: 1, lineHeight: 1.4 }}>{opt.label}</span>
                  {isMulti && <span style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, border: `2px solid ${isSelected ? "white" : C.border}`, background: isSelected ? C.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white" }}>{isSelected && "✓"}</span>}
                </button>
              );
            })}
          </div>
          {q.type === "multi" && (
            <button onClick={() => handleMultiSubmit(q.id)} disabled={multiSelect.length === 0} style={{ width: "100%", marginTop: 16, padding: "13px 24px", fontSize: 14, fontWeight: 600, color: multiSelect.length === 0 ? C.textLight : "white", background: multiSelect.length === 0 ? C.border : C.gold, border: "none", borderRadius: 10, cursor: multiSelect.length === 0 ? "default" : "pointer", fontFamily: sans }}>Continue →</button>
          )}
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textLight, lineHeight: 1.4, fontFamily: sans, textAlign: "center" }}>This tool provides legal information, not legal advice. No attorney-client relationship is created.</div>
        </div>
      </div>
    );
  }

  if (screen === "deepdive_choice") {
    const options = [
      { key: "family", label: "Family Dynamics", desc: "Succession conversations, spousal consents, estate plan coordination, non-owner family involvement.", show: answers.family_involved === "yes" },
      { key: "buysell", label: "Buy-Sell Deep Dive", desc: "Trigger-specific pricing, installment terms, drag-along/tag-along, non-competes, transfer restrictions.", show: answers.owner_count !== "1" },
      { key: "contracts", label: "Contracts Deep Dive", desc: "Personal guarantees, leases, confidentiality practices, counterparty research, venue and choice of law.", show: true },
    ].filter((o) => o.show);
    const toggle = (key) => { setActiveDeepDives((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]); };
    return (
      <div style={{ minHeight: "100vh", background: C.warmWhite, fontFamily: serif }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: C.sageLight, marginBottom: 16 }}>
              <span style={{ fontSize: 22, color: C.sage }}>&#10003;</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 400, color: C.navy, margin: "0 0 8px", lineHeight: 1.3 }}>Core audit complete.</h2>
            <p style={{ fontSize: 14, color: C.textLight, margin: 0, fontFamily: sans, lineHeight: 1.6 }}>You can view your results now, or go deeper in one or more specific areas (5–7 extra questions per topic).</p>
          </div>
          <Card>
            <SectionTitle>Optional deep dives</SectionTitle>
            {options.map((o) => {
              const selected = activeDeepDives.includes(o.key);
              return (
                <button key={o.key} onClick={() => toggle(o.key)} style={{ width: "100%", display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", marginBottom: 10, background: selected ? C.cream : "white", border: `1px solid ${selected ? C.gold : C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left", fontFamily: sans }}>
                  <span style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0, marginTop: 2, border: `2px solid ${selected ? C.gold : C.border}`, background: selected ? C.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", fontWeight: 700 }}>{selected && "✓"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 3 }}>{o.label}</div>
                    <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.4 }}>{o.desc}</div>
                  </div>
                </button>
              );
            })}
          </Card>
          <button onClick={() => startDeepDive(activeDeepDives)} style={{ width: "100%", padding: "15px 24px", fontSize: 15, fontWeight: 600, color: "white", background: C.navy, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: sans, marginBottom: 10 }}>{activeDeepDives.length > 0 ? `Continue with ${activeDeepDives.length} deep dive${activeDeepDives.length > 1 ? "s" : ""} →` : "Skip and view results →"}</button>
          <button onClick={() => setScreen("results")} style={{ width: "100%", padding: "13px 24px", fontSize: 13, fontWeight: 500, color: C.textLight, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", fontFamily: sans }}>Skip deep dives — show me my results</button>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    const allAsked = [...askedCoreAudit];
    ["family", "buysell", "contracts"].forEach((k) => {
      const pool = k === "family" ? deepDiveFamily : k === "buysell" ? deepDiveBuySell : deepDiveContracts;
      pool.forEach((qq) => { if (answers[qq.id] != null) allAsked.push(qq); });
    });
    const results = computeResults(answers, allAsked);
    const mods = getEducationalModules(answers);
    const anyOrangeOrRed = Object.values(results.categories).some((c) => c.rating === "orange" || c.rating === "red");
    const ratingBand = (r) => {
      if (r === "green") return { label: "Healthy", color: C.sage, bg: C.sageLight };
      if (r === "yellow") return { label: "Attention Needed", color: "#b8860b", bg: "#fef3e2" };
      if (r === "orange") return { label: "Significant Gaps", color: C.orange, bg: C.orangeLight };
      return { label: "High Risk", color: C.red, bg: C.redLight };
    };
    const band = ratingBand(results.overallRating);
    return (
      <div style={{ minHeight: "100vh", background: C.warmWhite, fontFamily: serif }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 48px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontFamily: sans }}>Your Results</div>
            <h1 style={{ fontSize: 28, fontWeight: 400, color: C.navy, margin: "0 0 6px", letterSpacing: "-0.5px" }}>Business Legal Health Check</h1>
          </div>
          <Card style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ fontSize: 12, color: C.textLight, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: sans, marginBottom: 10 }}>Governance Health Score</div>
            <div style={{ fontSize: 72, fontWeight: 300, color: band.color, lineHeight: 1, margin: "0 0 6px", fontFamily: serif }}>{results.healthScore}<span style={{ fontSize: 28, color: C.textLight }}>/100</span></div>
            <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: band.bg, color: band.color, fontFamily: sans, fontSize: 13, fontWeight: 700, letterSpacing: "0.5px", marginTop: 4 }}>{band.label}</div>
          </Card>
          <Card>
            <SectionTitle>Category Dashboard</SectionTitle>
            {Object.entries(results.categories).map(([k, r]) => {
              if (r.max === 0) return null;
              const meta = categories[k];
              const pctInverted = Math.round(100 - r.pct);
              return (
                <div key={k} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: sans }}>{meta.label}</div>
                    <RatingPill rating={r.rating} size="sm" />
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pctInverted}%`, background: ratingBand(r.rating).color, borderRadius: 3, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </Card>
          {results.priorities.length > 0 && (
            <Card>
              <SectionTitle>Your Top Priorities</SectionTitle>
              {results.priorities.map((p, i) => {
                const narr = priorityNarratives[p.key];
                if (!narr) return null;
                return (
                  <div key={p.key} style={{ marginBottom: i < results.priorities.length - 1 ? 18 : 0, paddingLeft: 16, borderLeft: `3px solid ${ratingBand(p.rating).color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ratingBand(p.rating).color, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4, fontFamily: sans }}>Priority {i + 1} · {categories[p.key].label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: sans }}>{narr.headline}</div>
                    <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, fontFamily: serif }}>{narr.body}</div>
                  </div>
                );
              })}
            </Card>
          )}
          {results.criticalFlags.length > 0 && (
            <Card style={{ borderLeft: `3px solid ${C.coral}` }}>
              <SectionTitle>Specific items worth attention</SectionTitle>
              <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 12px", fontFamily: sans, lineHeight: 1.5 }}>A few of your answers flagged specific issues that commonly lead to serious problems:</p>
              {results.criticalFlags.slice(0, 6).map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: C.coral, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>!</span>
                  <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontFamily: sans }}>{f.question}</span>
                </div>
              ))}
            </Card>
          )}
          {mods.length > 0 && (
            <Card>
              <SectionTitle>Worth understanding</SectionTitle>
              <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 14px", fontFamily: sans, lineHeight: 1.5 }}>Your answers touched on a few topics where the details really matter. Expand any of the sections below to learn more.</p>
              {mods.includes("fiduciary") && (
                <Expander title="Fiduciary duty — what it is and why it matters" accentColor={C.coral}>
                  <p style={{ margin: "0 0 10px" }}>If you're in business, you're likely a fiduciary or deal with one regularly. Not understanding this role is one of the most common reasons people get sued.</p>
                  <p style={{ margin: "0 0 10px" }}>A fiduciary is anyone in a position of trust and confidence: an attorney to a client, a trustee to a beneficiary, a partner to other partners, an officer or director to the business, an executor to an estate. Fiduciaries owe:</p>
                  <ul style={{ margin: "0 0 10px", paddingLeft: 22, lineHeight: 1.8 }}>
                    <li>A duty of loyalty</li>
                    <li>A duty of candor and full disclosure</li>
                    <li>A duty to refrain from self-dealing</li>
                    <li>A duty of good faith and fair dealing</li>
                  </ul>
                  <p style={{ margin: "0 0 10px" }}>Fiduciary duties are a very high standard, and they're most often dismissed or ignored in family-run businesses — exactly because the relationships feel informal and trusting.</p>
                  <p style={{ margin: 0, fontStyle: "italic", color: C.textLight }}>A good rule of thumb: disclose everything. If you're hesitant to disclose something, that hesitation probably means you're breaching — or about to breach — your fiduciary duty.</p>
                </Expander>
              )}
              {mods.includes("arbitration") && (
                <Expander title="Arbitration vs. litigation — what you actually agreed to" accentColor={C.gold}>
                  <p style={{ margin: "0 0 14px" }}>Many contracts contain arbitration clauses, but most people don't fully understand what arbitration is or how different it is from going to court. Here's a side-by-side:</p>
                  <ArbitrationTable />
                  <p style={{ margin: "14px 0 0", fontSize: 13 }}>Arbitration isn't inherently better or worse than litigation — but agreeing to it without understanding it is a mistake. The time to weigh the trade-offs is before you sign, not after a dispute arises.</p>
                </Expander>
              )}
              {mods.includes("form_contracts") && (
                <Expander title="Why downloaded form agreements cause problems" accentColor={C.orange}>
                  <p style={{ margin: "0 0 10px" }}>Governing agreements aren't one-size-fits-all. The odds of an online form actually fitting your business are low, and worse than no agreement is one with rules that are unfair, inappropriate for your circumstances, or simply incomprehensible.</p>
                  <p style={{ margin: 0 }}>A common example: a downloaded agreement requires arbitration under AAA rules. Many business owners don't know that filing a claim with AAA can cost thousands just to start — and thousands more to pay the arbitrator. That's a provision that quietly rewrites what a future dispute will look like, and it was agreed to without anyone noticing.</p>
                </Expander>
              )}
              {mods.includes("concentration") && (
                <Expander title="Concentration risk in customer and vendor relationships" accentColor={C.orange}>
                  <p style={{ margin: "0 0 10px" }}>When a single customer or vendor represents a large share of revenue or spend, contract terms matter disproportionately. A weak or informal contract with a concentrated counterparty is one of the riskiest configurations a business can be in.</p>
                  <p style={{ margin: 0 }}>Owners who invest years building a key relationship often find — too late — that the other side can walk away freely, change terms unilaterally, or squeeze pricing with no contractual defense. The time to fix this is while the relationship is good.</p>
                </Expander>
              )}
            </Card>
          )}
          {anyOrangeOrRed && (
            <Card>
              <SectionTitle>If these gaps aren't addressed</SectionTitle>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, margin: "0 0 16px", fontFamily: serif }}>Preventive legal work is dramatically cheaper and less stressful than litigation. If the gaps your audit surfaced eventually turn into a formal dispute, here is what resolving them in court typically looks like:</p>
              <LifeOfLawsuit />
              <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "20px 0 0", fontFamily: sans, fontStyle: "italic" }}>Even those who win often suffer financially and emotionally in the process. That's the case for fixing the things this audit flagged now, while it's still inexpensive and everyone's on speaking terms.</p>
            </Card>
          )}
          <Card style={{ background: C.navy, borderColor: C.navy, color: "white", textAlign: "center" }}>
            <h3 style={{ fontSize: 20, fontWeight: 400, color: "white", margin: "0 0 10px", fontFamily: serif }}>Want to talk through your results?</h3>
            <p style={{ fontSize: 14, color: "#d8dfe8", lineHeight: 1.6, margin: "0 0 20px", fontFamily: sans }}>A 30-minute consultation is the easiest way to translate this report into concrete next steps for your business.</p>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "14px 28px", background: C.gold, color: C.navy, fontFamily: sans, fontWeight: 700, fontSize: 15, borderRadius: 10, textDecoration: "none", letterSpacing: "0.3px" }}>Schedule a Consultation →</a>
            <div style={{ fontSize: 11, color: "#a8b3c4", marginTop: 14, fontFamily: sans }}>No attorney-client relationship is created until you sign an engagement agreement.</div>
          </Card>
          {!emailSubmitted && (
            <Card style={{ background: C.cream, borderColor: C.border }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: C.navy, margin: "0 0 6px", fontFamily: sans }}>Want a copy of your results? (optional)</h4>
              <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 14px", fontFamily: sans, lineHeight: 1.5 }}>Enter your email and we'll send you a copy you can review later or share with your CPA or advisors. Skip this if you'd rather not.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, minWidth: 200, padding: "12px 14px", fontSize: 14, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: sans, background: "white", color: C.text }} />
                <button onClick={() => { if (email && email.includes("@")) setEmailSubmitted(true); }} style={{ padding: "12px 20px", fontSize: 14, fontWeight: 600, color: "white", background: C.navy, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: sans }}>Send</button>
              </div>
            </Card>
          )}
          {emailSubmitted && (
            <Card style={{ borderLeft: `3px solid ${C.sage}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.sage, marginBottom: 4, fontFamily: sans }}>Thanks — we'll be in touch.</div>
              <div style={{ fontSize: 13, color: C.textLight, fontFamily: sans }}>A copy of your results is on the way.</div>
            </Card>
          )}
          <div style={{ background: C.cream, borderRadius: 8, padding: "16px 20px", marginBottom: 20, fontFamily: sans, marginTop: 8 }}>
            <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6, margin: "0 0 8px" }}><strong style={{ color: C.text }}>About this result:</strong> This result is based on general Texas law and the information you provided. It is legal information — not legal advice tailored to your specific situation.</p>
            <p style={{ fontSize: 11, color: C.textLight, lineHeight: 1.5, margin: 0 }}>Your specific facts may raise issues this tool does not address. Applicable law, tax treatment, and best practices are subject to change. This tool does not evaluate the validity of any contract, governing document, or insurance policy. No attorney-client relationship has been created by your use of this tool. If you are unsure about any aspect of your situation, consult a licensed Texas attorney before taking action.</p>
          </div>
          <button onClick={restart} style={{ width: "100%", padding: "14px 24px", fontSize: 14, fontWeight: 600, color: C.navy, background: "white", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", fontFamily: sans }}>← Start Over</button>
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: C.textLight, fontFamily: sans }}>Built by A. Beckham Law, PLLC — Pearland, Texas<br /><span style={{ fontSize: 11 }}>Legal information, not legal advice | No attorney-client relationship created</span></div>
        </div>
      </div>
    );
  }

  return null;
}
