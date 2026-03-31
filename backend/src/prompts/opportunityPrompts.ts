export interface OpportunityPromptInput {
  productName: string;
  demandScore: number;
  profitScore: number;
  competitionScore: number;
  supplierScore: number;
  estimatedSellPrice: number;
  estimatedCost: number;
  shippingCost: number;
  supplierName?: string;
  supplierRating?: number;
}

export function buildOpportunityPrompt(input: OpportunityPromptInput): string {
  return `
You are an ecommerce product research assistant.

Write one short merchant-facing summary about this product opportunity.

Rules:
- Write 2 sentences maximum.
- Maximum 50 words.
- Mention the main upside and one practical risk.
- Do not mention AI, scoring formulas, or internal metrics.
- Output plain text only.

Product:
- Name: ${input.productName}
- Estimated selling price: $${input.estimatedSellPrice.toFixed(2)}
- Estimated cost: $${input.estimatedCost.toFixed(2)}
- Estimated shipping cost: $${input.shippingCost.toFixed(2)}

Scores:
- Demand score: ${input.demandScore}/100
- Profit score: ${input.profitScore}/100
- Competition score: ${input.competitionScore}/100
- Supplier score: ${input.supplierScore}/100

Supplier:
- Supplier name: ${input.supplierName || "Unknown"}
- Supplier rating: ${input.supplierRating ?? 0}
`.trim();
}