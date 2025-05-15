/**
 * Risk Assessment Module
 * 
 * This module handles the risk assessment of clients based on their
 * questionnaire responses.
 */

/**
 * Assess client risk profile based on questionnaire responses
 * @param {Object} clientProfile - Processed client profile data
 * @returns {Object} Risk assessment results
 */
function assessRiskProfile(clientProfile) {
  try {
    // Calculate risk score based on client responses
    const riskScore = calculateRiskScore(clientProfile);
    
    // Determine risk category based on score
    const riskCategory = determineRiskCategory(riskScore);
    
    // Check for inconsistencies in risk profile
    const inconsistencies = checkForInconsistencies(clientProfile, riskCategory);
    
    return {
      riskScore,
      riskCategory,
      inconsistencies,
      riskAssessmentDetails: generateRiskAssessmentDetails(clientProfile, riskScore, riskCategory)
    };
  } catch (error) {
    throw new Error(`Error assessing risk profile: ${error.message}`);
  }
}

/**
 * Calculate risk score based on client responses
 * @param {Object} clientProfile - Processed client profile data
 * @returns {number} Calculated risk score
 */
function calculateRiskScore(clientProfile) {
  let score = 0;
  
  // Risk tolerance scoring
  const { riskTolerance } = clientProfile;
  
  // Market drop reaction (1-5 points)
  switch (riskTolerance.marketDropReaction) {
    case 'sell_all':
      score += 1;
      break;
    case 'sell_some':
      score += 2;
      break;
    case 'do_nothing':
      score += 3;
      break;
    case 'buy_some':
      score += 4;
      break;
    case 'buy_more':
      score += 5;
      break;
    default:
      score += 3; // Default to moderate
  }
  
  // Maximum acceptable loss (1-5 points)
  if (riskTolerance.maxAcceptableLoss <= 5) {
    score += 1;
  } else if (riskTolerance.maxAcceptableLoss <= 10) {
    score += 2;
  } else if (riskTolerance.maxAcceptableLoss <= 15) {
    score += 3;
  } else if (riskTolerance.maxAcceptableLoss <= 25) {
    score += 4;
  } else {
    score += 5;
  }
  
  // Returns vs stability preference (1-5 points)
  switch (riskTolerance.returnsVsStabilityPreference) {
    case 'stability':
      score += 1;
      break;
    case 'mostly_stability':
      score += 2;
      break;
    case 'balanced':
      score += 3;
      break;
    case 'mostly_returns':
      score += 4;
      break;
    case 'returns':
      score += 5;
      break;
    default:
      score += 3; // Default to balanced
  }
  
  // Preferred portfolio style (1-5 points)
  switch (riskTolerance.preferredPortfolioStyle) {
    case 'conservative':
      score += 1;
      break;
    case 'moderately_conservative':
      score += 2;
      break;
    case 'balanced':
      score += 3;
      break;
    case 'moderately_aggressive':
      score += 4;
      break;
    case 'aggressive':
      score += 5;
      break;
    default:
      score += 3; // Default to balanced
  }
  
  // Investment horizon scoring (1-3 points)
  const { investmentObjectives } = clientProfile;
  switch (investmentObjectives.investmentHorizon) {
    case 'short_term': // <3 years
      score += 1;
      break;
    case 'medium_term': // 3-7 years
      score += 2;
      break;
    case 'long_term': // 7+ years
      score += 3;
      break;
    default:
      score += 2; // Default to medium term
  }
  
  // Knowledge and experience scoring (1-3 points)
  const { knowledgeAndExperience } = clientProfile;
  if (knowledgeAndExperience) {
    switch (knowledgeAndExperience.investmentKnowledge) {
      case 'beginner':
        score += 1;
        break;
      case 'intermediate':
        score += 2;
        break;
      case 'advanced':
        score += 3;
        break;
      default:
        score += 1; // Default to beginner
    }
  } else {
    score += 1; // Default to beginner if not provided
  }
  
  // Age-based scoring (1-3 points)
  const { personalInfo } = clientProfile;
  const age = typeof personalInfo.age === 'number' ? personalInfo.age : calculateAgeFromDOB(personalInfo.age);
  
  if (age >= 60) {
    score += 1;
  } else if (age >= 40) {
    score += 2;
  } else {
    score += 3;
  }
  
  return score;
}

/**
 * Calculate age from date of birth string
 * @param {string} dob - Date of birth string
 * @returns {number} Age in years
 */
function calculateAgeFromDOB(dob) {
  if (!dob) return 40; // Default age if not provided
  
  try {
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return 40; // Default age if calculation fails
  }
}

/**
 * Determine risk category based on risk score
 * @param {number} riskScore - Calculated risk score
 * @returns {string} Risk category
 */
function determineRiskCategory(riskScore) {
  if (riskScore <= 12) {
    return 'Conservative'; // Low Risk (8-12 Points)
  } else if (riskScore <= 17) {
    return 'Moderate'; // Balanced Risk (13-17 Points)
  } else if (riskScore <= 22) {
    return 'Aggressive'; // High Risk (18-22 Points)
  } else {
    return 'Ultra-Aggressive'; // Very High Risk (23+ Points)
  }
}

/**
 * Check for inconsistencies in risk profile
 * @param {Object} clientProfile - Processed client profile data
 * @param {string} riskCategory - Determined risk category
 * @returns {Array} List of inconsistencies, if any
 */
function checkForInconsistencies(clientProfile, riskCategory) {
  const inconsistencies = [];
  const { riskTolerance, investmentObjectives } = clientProfile;
  
  // Check for inconsistency between risk category and preferred portfolio style
  if (riskCategory === 'Aggressive' && 
      (riskTolerance.preferredPortfolioStyle === 'conservative' || 
       riskTolerance.preferredPortfolioStyle === 'moderately_conservative')) {
    inconsistencies.push({
      type: 'risk_style_mismatch',
      message: 'Risk score indicates Aggressive profile, but preferred portfolio style is Conservative'
    });
  }
  
  if (riskCategory === 'Conservative' && 
      (riskTolerance.preferredPortfolioStyle === 'aggressive' || 
       riskTolerance.preferredPortfolioStyle === 'moderately_aggressive')) {
    inconsistencies.push({
      type: 'risk_style_mismatch',
      message: 'Risk score indicates Conservative profile, but preferred portfolio style is Aggressive'
    });
  }
  
  // Check for inconsistency between risk category and investment horizon
  if (riskCategory === 'Aggressive' && investmentObjectives.investmentHorizon === 'short_term') {
    inconsistencies.push({
      type: 'horizon_risk_mismatch',
      message: 'Aggressive risk profile with short-term investment horizon may not be suitable'
    });
  }
  
  // Check for inconsistency between max acceptable loss and risk category
  if (riskCategory === 'Aggressive' && riskTolerance.maxAcceptableLoss <= 10) {
    inconsistencies.push({
      type: 'loss_tolerance_mismatch',
      message: 'Risk score indicates Aggressive profile, but maximum acceptable loss is low'
    });
  }
  
  if (riskCategory === 'Conservative' && riskTolerance.maxAcceptableLoss >= 20) {
    inconsistencies.push({
      type: 'loss_tolerance_mismatch',
      message: 'Risk score indicates Conservative profile, but maximum acceptable loss is high'
    });
  }
  
  return inconsistencies;
}

/**
 * Generate detailed risk assessment explanation
 * @param {Object} clientProfile - Processed client profile data
 * @param {number} riskScore - Calculated risk score
 * @param {string} riskCategory - Determined risk category
 * @returns {Object} Detailed risk assessment
 */
function generateRiskAssessmentDetails(clientProfile, riskScore, riskCategory) {
  // Get risk category description
  const riskCategoryDescription = getRiskCategoryDescription(riskCategory);
  
  // Generate risk score explanation
  const riskScoreExplanation = `Your risk score of ${riskScore} places you in the ${riskCategory.toLowerCase()} risk category. ${getRiskScoreExplanation(riskScore, riskCategory)}`;
  
  return {
    riskCategoryDescription,
    riskScoreExplanation
  };
}

/**
 * Get explanation for risk score
 * @param {number} riskScore - Risk score
 * @param {string} riskCategory - Risk category
 * @returns {string} Risk score explanation
 */
function getRiskScoreExplanation(riskScore, riskCategory) {
  switch (riskCategory) {
    case 'Conservative':
      return 'This indicates you prefer stability and capital preservation over high returns. Your portfolio will focus on minimizing volatility while providing modest growth potential.';
    case 'Moderate':
      return 'This means you have a balanced approach to risk and return, seeking growth while maintaining some stability in your portfolio.';
    case 'Aggressive':
      return 'This suggests you are comfortable with higher volatility in pursuit of greater long-term returns. Your portfolio will focus on growth-oriented investments.';
    case 'Ultra-Aggressive':
      return 'This indicates you are willing to accept very high volatility in pursuit of maximum long-term returns. Your portfolio will focus on high-growth investments.';
    default:
      return 'This indicates your balanced approach to investing.';
  }
}

/**
 * Get description for risk category
 * @param {string} riskCategory - Risk category
 * @returns {string} Description of risk category
 */
function getRiskCategoryDescription(riskCategory) {
  switch (riskCategory) {
    case 'Conservative':
      return 'A conservative risk profile (8-12 points) prioritizes capital preservation and income over growth. This portfolio has a higher allocation to fixed-income investments and alternative assets, with a smaller allocation to equities to provide some growth potential.';
    case 'Moderate':
      return 'A moderate risk profile (13-17 points) balances growth potential with stability. This portfolio has a meaningful allocation to equities for growth, combined with fixed-income investments to provide income and reduce overall volatility.';
    case 'Aggressive':
      return 'An aggressive risk profile (18-22 points) indicates a willingness to accept higher volatility in exchange for potentially higher returns. This portfolio has a significant allocation to equity investments, which can experience substantial short-term fluctuations but historically offer better long-term growth potential.';
    case 'Ultra-Aggressive':
      return 'An ultra-aggressive risk profile (23+ points) maximizes growth potential with very high tolerance for volatility. This portfolio has a dominant allocation to equity investments, potentially including higher-risk sectors, emerging markets, and alternative investments. Suitable for investors with very long time horizons and high risk tolerance.';
    default:
      return 'Risk profile description not available.';
  }
}

/**
 * Determine risk profile based on manual asset allocation
 * @param {Object} assetAllocation - User's manual asset allocation percentages
 * @returns {Object} Risk assessment results
 */
function assessRiskFromAllocation(assetAllocation) {
  try {
    console.log('Risk Assessment - Asset Allocation Input:', JSON.stringify(assetAllocation, null, 2));
    
    // Check if we have assetClassAllocation structure
    if (assetAllocation.assetClassAllocation) {
      // Extract allocation percentages from assetClassAllocation
      const { equity = 0, debt = 0 } = assetAllocation.assetClassAllocation;
      console.log(`Risk Assessment - Extracted values: equity=${equity}, debt=${debt}`);
      
      // Determine risk category based on equity allocation
      let riskCategory = '';
      let riskScore = 0;
      
      if (equity >= 70) {
        riskCategory = 'Aggressive';
        riskScore = 22;
      } else if (equity >= 50) {
        riskCategory = 'Moderate';
        riskScore = 18;
      } else {
        riskCategory = 'Conservative';
        riskScore = 12;
      }
      
      // Generate details about the risk assessment
      const details = generateRiskAssessmentDetailsFromAllocation(equity, debt, goldSilver, riskCategory);
      
      return {
        riskScore,
        riskCategory,
        assetAllocation,
        riskAssessmentDetails: details
      };
    } else {
      // Direct structure - legacy format
      // Extract allocation percentages
      const { equity = 0, debt = 0 } = assetAllocation;
      console.log(`Risk Assessment - Legacy format: equity=${equity}, debt=${debt}`);
      
      // Determine risk category based on equity allocation
      let riskCategory = '';
      let riskScore = 0;
      
      if (equity >= 80) {
        riskCategory = 'Ultra-Aggressive';
        riskScore = 24;
      } else if (equity >= 65) {
        riskCategory = 'Aggressive';
        riskScore = 20;
      } else if (equity >= 45) {
        riskCategory = 'Moderate';
        riskScore = 15;
      } else {
        riskCategory = 'Conservative';
        riskScore = 10;
      }
      
      // Generate details about the risk assessment
      const details = generateRiskAssessmentDetailsFromAllocation(equity, debt, goldSilver, riskCategory);
      
      return {
        riskScore,
        riskCategory,
        assetAllocation,
        riskAssessmentDetails: details
      };
    }
  } catch (error) {
    console.error('Error in assessRiskFromAllocation:', error);
    throw new Error(`Error assessing risk from allocation: ${error.message}`);
  }
}

/**
 * Generate risk assessment details based on manual asset allocation
 * @param {number} equity - Equity allocation percentage
 * @param {number} debt - Debt allocation percentage
 * @param {string} riskCategory - Determined risk category
 * @returns {Object} Risk assessment details
 */
function generateRiskAssessmentDetailsFromAllocation(equity, debt, riskCategory) {
  const descriptions = {
    'Ultra-Aggressive': {
      description: 'An ultra-aggressive risk profile (23+ points) maximizes growth potential with very high tolerance for volatility. This portfolio has a dominant allocation to equity investments, potentially including higher-risk sectors, emerging markets, and alternative investments.',
      characteristics: [
        'Maximized for long-term capital appreciation',
        'Very high tolerance for market volatility',
        'Very long investment time horizon (10+ years)',
        'Suitable for investors with substantial risk capacity and willingness to accept significant fluctuations'
      ]
    },
    'Aggressive': {
      description: 'An aggressive risk profile (18-22 points) indicates a willingness to accept higher volatility in exchange for potentially higher returns. This portfolio has a significant allocation to equity investments, which can experience substantial short-term fluctuations but historically offer better long-term growth potential.',
      characteristics: [
        'Focused on long-term capital appreciation',
        'Comfortable with market volatility',
        'Longer investment time horizon (7+ years)',
        'May be suitable for younger investors with time to recover from market downturns'
      ]
    },
    'Moderate': {
      description: 'A moderate risk profile (13-17 points) balances growth potential with stability. This portfolio has a meaningful allocation to equities for growth, combined with fixed-income investments to provide income and reduce overall volatility.',
      characteristics: [
        'Balanced approach to growth and capital preservation',
        'Moderate tolerance for market fluctuations',
        'Medium to long investment time horizon (5+ years)',
        'Suitable for investors who want growth but with reduced volatility'
      ]
    },
    'Conservative': {
      description: 'A conservative risk profile (8-12 points) prioritizes capital preservation and income over growth. This portfolio has a higher allocation to fixed-income investments and alternative assets, with a smaller allocation to equities to provide some growth potential.',
      characteristics: [
        'Focus on capital preservation and income',
        'Low tolerance for market volatility',
        'Shorter investment time horizon (3-5 years)',
        'May be suitable for investors nearing or in retirement'
      ]
    }
  };
  
  return {
    riskCategoryDescription: `
## ${riskCategory} Risk Profile

${descriptions[riskCategory].description}

### Key Characteristics
${descriptions[riskCategory].characteristics.map(c => `- ${c}`).join('\n')}

### Your Asset Allocation
- **Equity**: ${equity}%
- **Fixed Income**: ${debt}%

This risk profile is determined based on your manual asset allocation, particularly your ${equity}% allocation to equity investments.
    `
  };
}

module.exports = {
  assessRiskProfile,
  assessRiskFromAllocation
};
