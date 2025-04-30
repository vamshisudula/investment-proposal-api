/**
 * Client Profiling Module
 * 
 * This module handles the processing of client profile information
 * based on the questionnaire responses.
 */

/**
 * Process client profile data from the questionnaire
 * @param {Object} clientData - Raw client data from the questionnaire
 * @returns {Object} Processed client profile
 */
function processClientProfile(clientData) {
  try {
    // Validate required fields
    validateClientData(clientData);
    
    // Process and structure the client data
    const processedProfile = {
      personalInfo: extractPersonalInfo(clientData),
      financialSituation: extractFinancialInfo(clientData),
      investmentObjectives: extractInvestmentObjectives(clientData),
      riskTolerance: extractRiskTolerance(clientData),
      liquidityNeeds: extractLiquidityNeeds(clientData),
      taxConsiderations: extractTaxConsiderations(clientData),
      knowledgeAndExperience: extractKnowledgeAndExperience(clientData),
      behavioralInsights: extractBehavioralInsights(clientData)
    };
    
    return processedProfile;
  } catch (error) {
    throw new Error(`Error processing client profile: ${error.message}`);
  }
}

/**
 * Validate required client data fields
 * @param {Object} clientData - Raw client data
 */
function validateClientData(clientData) {
  const requiredFields = [
    'personalInfo',
    'financialSituation',
    'investmentObjectives',
    'riskTolerance'
  ];
  
  for (const field of requiredFields) {
    if (!clientData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Extract personal information from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured personal information
 */
function extractPersonalInfo(clientData) {
  const { personalInfo } = clientData;
  
  return {
    name: personalInfo.name,
    age: personalInfo.age || personalInfo.dateOfBirth,
    maritalStatus: personalInfo.maritalStatus,
    dependents: personalInfo.dependents,
    occupation: personalInfo.occupation,
    annualIncome: personalInfo.annualIncome,
    contactDetails: personalInfo.contactDetails
  };
}

/**
 * Extract financial information from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured financial information
 */
function extractFinancialInfo(clientData) {
  const { financialSituation } = clientData;
  
  return {
    currentInvestments: financialSituation.currentInvestments,
    liabilities: financialSituation.liabilities,
    realEstateHoldings: financialSituation.realEstateHoldings,
    savings: financialSituation.savings,
    emergencyFundStatus: financialSituation.emergencyFundStatus,
    monthlyExpenses: financialSituation.monthlyExpenses,
    existingInvestmentProducts: financialSituation.existingInvestmentProducts
  };
}

/**
 * Extract investment objectives from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured investment objectives
 */
function extractInvestmentObjectives(clientData) {
  const { investmentObjectives } = clientData;
  
  return {
    primaryGoals: investmentObjectives.primaryGoals,
    investmentHorizon: investmentObjectives.investmentHorizon,
    preferredStyle: investmentObjectives.preferredStyle,
    initialInvestmentAmount: investmentObjectives.initialInvestmentAmount,
    regularContributionAmount: investmentObjectives.regularContributionAmount
  };
}

/**
 * Extract risk tolerance information from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured risk tolerance information
 */
function extractRiskTolerance(clientData) {
  const { riskTolerance } = clientData;
  
  return {
    marketDropReaction: riskTolerance.marketDropReaction,
    maxAcceptableLoss: riskTolerance.maxAcceptableLoss,
    returnsVsStabilityPreference: riskTolerance.returnsVsStabilityPreference,
    preferredPortfolioStyle: riskTolerance.preferredPortfolioStyle
  };
}

/**
 * Extract liquidity needs from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured liquidity needs
 */
function extractLiquidityNeeds(clientData) {
  const { liquidityNeeds } = clientData;
  
  if (!liquidityNeeds) {
    return {
      shortTermLiquidity: false,
      accessiblePortfolioPercentage: 0
    };
  }
  
  return {
    shortTermLiquidity: liquidityNeeds.shortTermLiquidity,
    accessiblePortfolioPercentage: liquidityNeeds.accessiblePortfolioPercentage
  };
}

/**
 * Extract tax considerations from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured tax considerations
 */
function extractTaxConsiderations(clientData) {
  const { taxConsiderations } = clientData;
  
  if (!taxConsiderations) {
    return {
      taxSavingInvestmentsRequired: false,
      taxBracket: null
    };
  }
  
  return {
    taxSavingInvestmentsRequired: taxConsiderations.taxSavingInvestmentsRequired,
    taxBracket: taxConsiderations.taxBracket
  };
}

/**
 * Extract knowledge and experience from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured knowledge and experience
 */
function extractKnowledgeAndExperience(clientData) {
  const { knowledgeAndExperience } = clientData;
  
  if (!knowledgeAndExperience) {
    return {
      investmentKnowledge: 'beginner',
      decisionMakingApproach: null
    };
  }
  
  return {
    investmentKnowledge: knowledgeAndExperience.investmentKnowledge,
    decisionMakingApproach: knowledgeAndExperience.decisionMakingApproach
  };
}

/**
 * Extract behavioral insights from client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} Structured behavioral insights
 */
function extractBehavioralInsights(clientData) {
  const { behavioralInsights } = clientData;
  
  if (!behavioralInsights) {
    return {
      emotionalReaction: null,
      managementPreference: null
    };
  }
  
  return {
    emotionalReaction: behavioralInsights.emotionalReaction,
    managementPreference: behavioralInsights.managementPreference
  };
}

module.exports = {
  processClientProfile
};
