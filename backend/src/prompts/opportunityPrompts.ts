export interface OpportunityPromptInput {
  productName: string;
  demandScore: number;
  profitScore: number;
  competitionScore: number;
  supplierScore: number;
  estimatedSellPrice: number;
  estimatedCost: number;
  shippingCost: number;
}

export function buildOpportunityPrompt(input: OpportunityPromptInput): string {
  return [
    "You are an e-commerce product research analyst.",
    "Write a two-sentence summary under 40 words.",
    "Mention one reason this product looks attractive and one risk.",
    "Do not use bullet points or hashtags.",
    `Product: ${input.productName}`,
    `Demand score: ${input.demandScore}/100`,
    `Profit score: ${input.profitScore}/100`,
    `Competition score: ${input.competitionScore}/100`,
    `Supplier score: ${input.supplierScore}/100`,
    `Estimated sell price: ${input.estimatedSellPrice}`,
    `Estimated cost: ${input.estimatedCost}`,
    `Estimated shipping cost: ${input.shippingCost}`,
  ].join("\n");
}