/**
 * Competitive Intelligence Prompts
 * Specialized prompts for extracting competitive insights from community sources
 */

export interface CIPromptTemplates {
  pricingExtraction: string;
  complaintsExtraction: string;
  migrationSignals: string;
  strengthsWeaknesses: string;
  featureComparison: string;
}

export const ciPrompts: CIPromptTemplates = {
  pricingExtraction: `You are a competitive intelligence analyst. Extract pricing information from the provided community discussions, reviews, and technical content.

Focus on:
- Pricing model (subscription, usage-based, freemium, enterprise)
- Specific tier names and prices mentioned by users
- Features included in each tier
- Pricing complaints (too expensive, hidden costs, unclear pricing, billing issues)
- Value perception (worth it vs overpriced)

Return ONLY valid JSON in this exact format:
{
  "model": "subscription|usage-based|freemium|enterprise|custom",
  "tiers": [
    {"name": "Tier Name", "price": "$X/month", "features": ["feature1", "feature2"]}
  ],
  "complaints": ["complaint 1", "complaint 2"],
  "sentiment": "positive|neutral|negative"
}`,

  complaintsExtraction: `You are a competitive intelligence analyst. Extract customer complaints and pain points from community discussions, GitHub issues, and forum posts.

Focus on:
- Technical issues and bugs customers encounter
- Missing features customers request
- UX/DX frustrations
- Performance problems
- Support quality issues
- Integration challenges

Return ONLY valid JSON in this exact format:
{
  "commonComplaints": ["complaint 1", "complaint 2", "complaint 3"],
  "technicalIssues": ["issue 1", "issue 2"],
  "missingFeatures": ["feature 1", "feature 2"],
  "severity": "high|medium|low"
}`,

  migrationSignals: `You are a competitive intelligence analyst. Identify signals that customers are migrating AWAY from this product to alternatives.

Look for phrases like:
- "switching from X to Y"
- "migrating away from X"
- "moved off of X"
- "left X for Y"
- "ditched X"
- "no longer using X"

Also extract:
- Reasons for leaving
- Alternative products mentioned
- Migration timeline/difficulty

Return ONLY valid JSON in this exact format:
{
  "migrationSignals": ["signal 1", "signal 2", "signal 3"],
  "alternatives": ["Alternative Product 1", "Alternative Product 2"],
  "migrationReasons": ["reason 1", "reason 2"],
  "migrationDifficulty": "easy|moderate|difficult"
}`,

  strengthsWeaknesses: `You are a competitive intelligence analyst. Extract competitive strengths and weaknesses from community discussions and reviews.

STRENGTHS - What customers consistently praise:
- Killer features
- Best-in-class capabilities
- Ease of use
- Developer experience
- Performance
- Support quality

WEAKNESSES - What customers consistently criticize:
- Missing features
- Poor UX/DX
- Reliability issues
- Slow performance
- Weak documentation
- Expensive pricing

Return ONLY valid JSON in this exact format:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "differentiators": ["unique aspect 1", "unique aspect 2"]
}`,

  featureComparison: `You are a competitive intelligence analyst. Extract feature mentions, comparisons, and use cases from community content.

Focus on:
- Core features and capabilities
- Popular use cases
- Integration capabilities
- Technical stack/architecture
- Scalability and performance characteristics

Return ONLY valid JSON in this exact format:
{
  "coreFeatures": ["feature 1", "feature 2", "feature 3"],
  "popularUseCases": ["use case 1", "use case 2"],
  "integrations": ["integration 1", "integration 2"],
  "technicalStack": "description of technical approach"
}`
};

export interface PricingInsights {
  model: string;
  tiers: Array<{ name: string; price: string; features: string[] }>;
  complaints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ComplaintInsights {
  commonComplaints: string[];
  technicalIssues: string[];
  missingFeatures: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface MigrationInsights {
  migrationSignals: string[];
  alternatives: string[];
  migrationReasons: string[];
  migrationDifficulty: 'easy' | 'moderate' | 'difficult';
}

export interface StrengthsWeaknessesInsights {
  strengths: string[];
  weaknesses: string[];
  differentiators: string[];
}

export interface FeatureInsights {
  coreFeatures: string[];
  popularUseCases: string[];
  integrations: string[];
  technicalStack: string;
}

/**
 * Generate comprehensive CI research query for multi-source scraping
 */
export function generateCIResearchQueries(competitorName: string): {
  pricing: string[];
  complaints: string[];
  migration: string[];
  features: string[];
} {
  const baseName = competitorName.toLowerCase();
  
  return {
    pricing: [
      `${competitorName} pricing`,
      `${competitorName} cost`,
      `${competitorName} pricing plans`,
      `${competitorName} pricing complaints`,
      `${competitorName} expensive`,
      `${competitorName} vs alternatives pricing`
    ],
    complaints: [
      `${competitorName} issues`,
      `${competitorName} problems`,
      `${competitorName} bugs`,
      `${competitorName} complaints`,
      `${competitorName} support issues`,
      `${competitorName} not working`
    ],
    migration: [
      `switching from ${competitorName}`,
      `migrating from ${competitorName}`,
      `${competitorName} alternative`,
      `${competitorName} vs`,
      `leaving ${competitorName}`,
      `moved off ${competitorName}`
    ],
    features: [
      `${competitorName} features`,
      `${competitorName} capabilities`,
      `${competitorName} use cases`,
      `${competitorName} integrations`,
      `${competitorName} tutorial`,
      `how to use ${competitorName}`
    ]
  };
}
