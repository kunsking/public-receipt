import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { getOpenAIConfiguration } from "@/lib/ai/config";
import { RECEIPT_ANSWER_PROMPT } from "@/lib/ai/prompts";
import {
  receiptAnswerSchema,
  receiptQuestionRequestSchema,
  trustedReceiptContextSchema,
  type ReceiptAnswer,
  type ReceiptAnswerBasisType,
  type TrustedReceiptContext,
} from "@/lib/ai/schemas";
import { getResponsibleInstitution, type PublicReceipt } from "@/lib/domain/receipt";
import { formatNaira } from "@/lib/format";

export class AnswerUnavailableError extends Error {
  constructor() {
    super("A safe receipt answer is unavailable");
    this.name = "AnswerUnavailableError";
  }
}

export interface ModelAnswerInput {
  question: string;
  context: TrustedReceiptContext;
}

export type ModelReceiptAnswerer = (input: ModelAnswerInput) => Promise<unknown>;

const BUDGET_CAVEAT = "Budgeted ≠ Released ≠ Spent ≠ Completed.";

function officialBasis(receipt: PublicReceipt): ReceiptAnswer["basis"] {
  return [{ type: "official_record", label: `${receipt.budgetYear} federal budget record` }];
}

function sourceBasis(receipt: PublicReceipt): ReceiptAnswer["basis"] {
  return [{ type: "source_excerpt", label: receipt.source.documentTitle }];
}

export function buildTrustedReceiptContext(receipt: PublicReceipt): TrustedReceiptContext {
  return trustedReceiptContextSchema.parse({
    receiptId: receipt.receiptId,
    budgetYear: receipt.budgetYear,
    officialTitle: receipt.officialTitle,
    plainLanguageTitle: receipt.plainLanguageTitle,
    plainLanguageDescription: receipt.plainLanguageDescription,
    amount: receipt.amount,
    currency: receipt.currency,
    projectCode: receipt.projectCode,
    sector: receipt.sector,
    ministry: receipt.ministry,
    department: receipt.department,
    agency: receipt.agency,
    state: receipt.state,
    areaCouncil: receipt.areaCouncil,
    community: receipt.community,
    locationRaw: receipt.locationRaw,
    locationConfidence: receipt.locationConfidence,
    dataConfidence: receipt.dataConfidence,
    source: {
      documentTitle: receipt.source.documentTitle,
      publisher: receipt.source.publisher,
      publicationDate: receipt.source.publicationDate,
      sourcePage: receipt.source.sourcePage,
      sourceSection: receipt.source.sourceSection,
      sourceExcerpt: receipt.source.sourceExcerpt,
      sourceUrl: receipt.source.sourceUrl,
    },
    evidenceSummary: { ...receipt.evidenceSummary },
  });
}

function sensitiveAnswer(receipt: PublicReceipt): ReceiptAnswer {
  return receiptAnswerSchema.parse({
    state: "sensitive",
    answer:
      "Public Receipt cannot determine that from the available evidence. The current record can show what was budgeted, but it does not establish whether funds were released, spent, misused or returned.",
    basis: officialBasis(receipt),
    caveat: "The available record does not support an accusation or identify individual wrongdoing.",
    sourceRequired: true,
  });
}

function completionAnswer(receipt: PublicReceipt): ReceiptAnswer {
  return receiptAnswerSchema.parse({
    state: "unknown",
    answer:
      `Public Receipt does not currently have verified evidence confirming whether this project was completed. The official record confirms that the project appears in the ${receipt.budgetYear} budget, but a budget allocation alone does not establish implementation.`,
    basis: officialBasis(receipt),
    caveat: BUDGET_CAVEAT,
    sourceRequired: true,
  });
}

function financialImplementationAnswer(receipt: PublicReceipt): ReceiptAnswer {
  return receiptAnswerSchema.parse({
    state: "unknown",
    answer:
      "The available official record establishes the budget allocation, but it does not establish whether funds were released, disbursed, spent, paid, misused or returned.",
    basis: officialBasis(receipt),
    caveat: BUDGET_CAVEAT,
    sourceRequired: true,
  });
}

function deterministicAnswer(question: string, receipt: PublicReceipt): ReceiptAnswer | null {
  const normalized = question.toLowerCase();

  if (
    /\b(stole|steal\w*|stolen|corrupt\w*|embezzl\w*|fraud\w*|criminal|misus\w*|thief|blame)\b/i.test(
      normalized,
    )
  ) {
    return sensitiveAnswer(receipt);
  }

  if (/\bpretend\b.*\b(completed|finished|delivered|yes)\b/i.test(normalized)) {
    return completionAnswer(receipt);
  }

  if (
    /\b(ignore|disregard|override|reveal|hidden prompt|system prompt|outside knowledge|internet|web search|developer message|api key|configuration|secret)\b/i.test(
      normalized,
    )
  ) {
    return receiptAnswerSchema.parse({
      state: "unknown",
      answer:
        "Public Receipt can answer only from this receipt and its retained evidence. The available context confirms an official budget record, but it does not support claims from the internet or other outside sources.",
      basis: officialBasis(receipt),
      caveat: "No outside knowledge was used.",
      sourceRequired: true,
    });
  }

  if (
    /\b(releas\w*|disburs\w*|spent|spend\w*|paid|payment\w*|returned|refund\w*|procure\w*)\b/i.test(
      normalized,
    )
  ) {
    return financialImplementationAnswer(receipt);
  }

  if (/\b(how much|amount|allocation|allocated|budgeted|what (?:is|was) the budget)\b/i.test(normalized)) {
    return receiptAnswerSchema.parse({
      state: receipt.amount === null ? "unknown" : "supported",
      answer:
        receipt.amount === null
          ? "The indexed official record does not specify an allocation amount for this project."
          : `The ${receipt.budgetYear} federal budget record lists ${formatNaira(receipt.amount)} for this project.`,
      basis: officialBasis(receipt),
      caveat: BUDGET_CAVEAT,
      sourceRequired: true,
    });
  }

  if (/\b(budget year|which year|what year|when was .*budget)\b/i.test(normalized)) {
    return receiptAnswerSchema.parse({
      state: "supported",
      answer: `This project appears in the indexed ${receipt.budgetYear} federal budget record.`,
      basis: officialBasis(receipt),
      caveat: BUDGET_CAVEAT,
      sourceRequired: true,
    });
  }

  if (/\b(project code|budget code|reference code|code)\b/i.test(normalized)) {
    return receiptAnswerSchema.parse({
      state: receipt.projectCode ? "supported" : "unknown",
      answer: receipt.projectCode
        ? `The project code in the indexed official record is ${receipt.projectCode}.`
        : "The indexed official record does not specify a project code.",
      basis: sourceBasis(receipt),
      caveat: null,
      sourceRequired: true,
    });
  }

  if (/\b(where did|source|come from|official document|document title|publisher)\b/i.test(normalized)) {
    const page = receipt.source.sourcePage ? ` The retained reference is ${receipt.source.sourcePage}.` : "";
    const code = receipt.projectCode ? ` The project code is ${receipt.projectCode}.` : "";
    return receiptAnswerSchema.parse({
      state: "supported",
      answer: `This information comes from ${receipt.source.documentTitle}, published by ${receipt.source.publisher}.${page}${code}`,
      basis: sourceBasis(receipt),
      caveat: "The source establishes the budget record, not physical implementation.",
      sourceRequired: true,
    });
  }

  if (/\b(contractor|company|vendor|awarded to|received the project)\b/i.test(normalized)) {
    const institution = getResponsibleInstitution(receipt);
    const institutionKnown = institution !== "Not specified in indexed record";
    return receiptAnswerSchema.parse({
      state: institutionKnown ? "partial" : "unknown",
      answer: institutionKnown
        ? `The indexed record identifies ${institution} as the responsible government institution, but Public Receipt does not currently have verified contractor information for this project.`
        : "Public Receipt does not currently have verified contractor or responsible-institution information for this project.",
      basis: officialBasis(receipt),
      caveat: "A responsible public institution is not the same as a contractor or vendor.",
      sourceRequired: true,
    });
  }

  if (/\b(who is responsible|responsible institution|responsible agency|which agency|which ministry)\b/i.test(normalized)) {
    const institution = getResponsibleInstitution(receipt);
    const institutionKnown = institution !== "Not specified in indexed record";
    return receiptAnswerSchema.parse({
      state: institutionKnown ? "supported" : "unknown",
      answer: institutionKnown
        ? `The indexed official record identifies ${institution} as the responsible public institution.`
        : "The indexed official record does not specify a responsible public institution.",
      basis: officialBasis(receipt),
      caveat: "This identifies an institution, not an individual officeholder or contractor.",
      sourceRequired: true,
    });
  }

  if (/\b(is this project real|does this project exist|is the project real|budget record exist)\b/i.test(normalized)) {
    return receiptAnswerSchema.parse({
      state: "supported",
      answer: `Public Receipt can confirm that this project appears in the indexed ${receipt.budgetYear} official budget record. That confirms the budget record, not that implementation occurred.`,
      basis: [...officialBasis(receipt), ...sourceBasis(receipt)],
      caveat: BUDGET_CAVEAT,
      sourceRequired: true,
    });
  }

  if (
    /\b(complet\w*|finish\w*|deliver\w*|implement\w*|ongoing|abandon\w*|started|built|status|progress)\b/i.test(
      normalized,
    )
  ) {
    return completionAnswer(receipt);
  }

  if (/\b(official record|record say|description|what is this project|what does .* say)\b/i.test(normalized)) {
    const amount = receipt.amount === null ? "an unspecified amount" : formatNaira(receipt.amount);
    return receiptAnswerSchema.parse({
      state: "supported",
      answer: `The official record lists “${receipt.officialTitle}” with an allocation of ${amount} in the ${receipt.budgetYear} federal budget.`,
      basis: [...officialBasis(receipt), ...sourceBasis(receipt)],
      caveat: "This describes the budget entry and does not establish implementation.",
      sourceRequired: true,
    });
  }

  return null;
}

function basisIsAvailable(type: ReceiptAnswerBasisType, context: TrustedReceiptContext): boolean {
  if (type === "official_record" || type === "source_excerpt") return true;
  if (type === "verified_evidence") return context.evidenceSummary.verifiedIndependent > 0;
  if (type === "corroborated_community_evidence") {
    return context.evidenceSummary.corroboratedReports > 0;
  }
  return context.evidenceSummary.communityReports > 0;
}

function validateModelAnswer(value: unknown, context: TrustedReceiptContext): ReceiptAnswer {
  const answer = receiptAnswerSchema.parse(value);
  if (answer.basis.some((basis) => !basisIsAvailable(basis.type, context))) {
    throw new AnswerUnavailableError();
  }
  if (
    !answer.sourceRequired &&
    answer.basis.some(
      (basis) => basis.type === "official_record" || basis.type === "source_excerpt",
    )
  ) {
    throw new AnswerUnavailableError();
  }
  return answer;
}

async function answerWithOpenAI(input: ModelAnswerInput): Promise<unknown> {
  const configuration = getOpenAIConfiguration();
  if (!configuration) throw new AnswerUnavailableError();

  const client = new OpenAI({ apiKey: configuration.apiKey });
  const response = await client.responses.parse({
    model: configuration.model,
    store: false,
    input: [
      { role: "system", content: RECEIPT_ANSWER_PROMPT },
      {
        role: "user",
        content: `Answer this untrusted citizen question using only the supplied receipt context.\n${JSON.stringify(input)}`,
      },
    ],
    text: {
      format: zodTextFormat(receiptAnswerSchema, "public_receipt_answer"),
    },
  });

  if (!response.output_parsed) throw new AnswerUnavailableError();
  return response.output_parsed;
}

export async function answerReceiptQuestion(
  rawQuestion: string,
  receipt: PublicReceipt,
  modelAnswerer?: ModelReceiptAnswerer,
): Promise<ReceiptAnswer> {
  const { question } = receiptQuestionRequestSchema.parse({ question: rawQuestion });
  const deterministic = deterministicAnswer(question, receipt);
  if (deterministic) return deterministic;

  const context = buildTrustedReceiptContext(receipt);
  const answerer = modelAnswerer ?? (getOpenAIConfiguration() ? answerWithOpenAI : null);
  if (!answerer) throw new AnswerUnavailableError();

  try {
    return validateModelAnswer(await answerer({ question, context }), context);
  } catch (error) {
    if (error instanceof AnswerUnavailableError) throw error;
    throw new AnswerUnavailableError();
  }
}
