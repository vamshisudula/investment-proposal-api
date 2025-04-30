/**
 * Asset Allocation Module
 * 
 * This module handles the asset allocation based on client risk profile
 * and portfolio size.
 */

/**
 * Generate asset allocation based on client risk profile and portfolio size
 * @param {Object} clientData - Client profile and risk assessment data
 * @returns {Object} Asset allocation recommendations
 */
function generateAssetAllocation(clientData) {
  try {
    const { riskProfile, clientProfile } = clientData;
    
    // Extract portfolio size from client data
    const portfolioSize = extractPortfolioSize(clientProfile);
    
    // Determine portfolio size category
    const portfolioSizeCategory = determinePortfolioSizeCategory(portfolioSize);
    
    // Generate asset class allocation based on risk profile
    const assetClassAllocation = generateAssetClassAllocation(riskProfile.riskCategory);
    
    // Generate product type allocation based on risk profile and portfolio size
    const productTypeAllocation = generateProductTypeAllocation(riskProfile.riskCategory, portfolioSizeCategory);
    
    return {
      portfolioSize,
      portfolioSizeCategory,
      assetClassAllocation,
      productTypeAllocation,
      allocationExplanation: generateAssetAllocationExplanation(riskProfile.riskCategory, portfolioSizeCategory)
    };
  } catch (error) {
    throw new Error(`Error generating asset allocation: ${error.message}`);
  }
}

/**
 * Extract portfolio size from client profile
 * @param {Object} clientProfile - Client profile data
 * @returns {number} Portfolio size in INR
 */
function extractPortfolioSize(clientProfile) {
  const { investmentObjectives } = clientProfile;
  
  // Use initial investment amount as portfolio size
  return investmentObjectives.initialInvestmentAmount || 0;
}

/**
 * Determine portfolio size category based on amount
 * @param {number} portfolioSize - Portfolio size in INR
 * @returns {string} Portfolio size category
 */
function determinePortfolioSizeCategory(portfolioSize) {
  // Convert to lakhs for easier comparison (1 lakh = 100,000 INR)
  const sizeInLakhs = portfolioSize / 100000;
  
  if (sizeInLakhs < 50) {
    return 'Below 50L';
  } else if (sizeInLakhs < 100) {
    return '50L-1Cr';
  } else if (sizeInLakhs < 200) {
    return '1Cr-2Cr';
  } else if (sizeInLakhs < 500) {
    return '2Cr-5Cr';
  } else if (sizeInLakhs < 1000) {
    return '5Cr-10Cr';
  } else if (sizeInLakhs < 2500) {
    return '10Cr-25Cr';
  } else {
    return 'Above 25Cr';
  }
}

/**
 * Generate asset class allocation based on risk profile
 * @param {string} riskCategory - Client risk category
 * @returns {Object} Asset class allocation percentages
 */
function generateAssetClassAllocation(riskCategory) {
  switch (riskCategory) {
    case 'Ultra Aggressive':
      return {
        equity: 95,
        debt: 5,
        goldSilver: 0
      };
    case 'Aggressive':
      return {
        equity: 80,
        debt: 15,
        goldSilver: 5
      };
    case 'Moderate':
      return {
        equity: 55,
        debt: 30,
        goldSilver: 15
      };
    case 'Conservative':
      return {
        equity: 25,
        debt: 60,
        goldSilver: 15
      };
    default:
      // Default to Moderate if risk category is not recognized
      return {
        equity: 55,
        debt: 30,
        goldSilver: 15
      };
  }
}

/**
 * Generate product type allocation based on risk profile and portfolio size
 * @param {string} riskCategory - Client risk category
 * @param {string} portfolioSizeCategory - Portfolio size category
 * @returns {Object} Product type allocation
 */
function generateProductTypeAllocation(riskCategory, portfolioSizeCategory) {
  // Base allocation structure
  const allocation = {
    equity: {
      mutualFunds: 0,
      pms: 0,
      aif: 0,
      direct: 0
    },
    debt: {
      mutualFunds: 0,
      direct: 0,
      pms: 0,
      aif: 0
    },
    goldSilver: {
      etf: 0,
      physical: 0
    }
  };
  
  // Adjust allocation based on portfolio size category
  switch (portfolioSizeCategory) {
    case 'Below 50L':
      // For smaller portfolios, focus on mutual funds
      allocation.equity.mutualFunds = 100;
      allocation.debt.mutualFunds = 100;
      allocation.goldSilver.etf = 100;
      break;
      
    case '50L-1Cr':
      // Can include PMS for equity
      allocation.equity.mutualFunds = 70;
      allocation.equity.pms = 30;
      allocation.debt.mutualFunds = 100;
      allocation.goldSilver.etf = 100;
      break;
      
    case '1Cr-2Cr':
      // Can include Equity AIF
      allocation.equity.mutualFunds = 60;
      allocation.equity.pms = 30;
      allocation.equity.aif = 10;
      allocation.debt.mutualFunds = 100;
      allocation.goldSilver.etf = 100;
      break;
      
    case '2Cr-5Cr':
      // Can include Direct Debt
      allocation.equity.mutualFunds = 50;
      allocation.equity.pms = 30;
      allocation.equity.aif = 20;
      allocation.debt.mutualFunds = 70;
      allocation.debt.direct = 30;
      allocation.goldSilver.etf = 100;
      break;
      
    case '5Cr-10Cr':
      // Can include Debt AIF
      allocation.equity.mutualFunds = 40;
      allocation.equity.pms = 30;
      allocation.equity.aif = 30;
      allocation.debt.mutualFunds = 60;
      allocation.debt.direct = 30;
      allocation.debt.aif = 10;
      allocation.goldSilver.etf = 100;
      break;
      
    case '10Cr-25Cr':
    case 'Above 25Cr':
      // Fully diversified
      allocation.equity.mutualFunds = 30;
      allocation.equity.pms = 35;
      allocation.equity.aif = 35;
      allocation.debt.mutualFunds = 40;
      allocation.debt.direct = 40;
      allocation.debt.aif = 20;
      allocation.goldSilver.etf = 80;
      allocation.goldSilver.physical = 20;
      break;
      
    default:
      // Default to smaller portfolio allocation
      allocation.equity.mutualFunds = 100;
      allocation.debt.mutualFunds = 100;
      allocation.goldSilver.etf = 100;
  }
  
  // Adjust allocation based on risk category
  if (riskCategory === 'Conservative') {
    // Conservative investors may prefer more direct debt and less alternative investments
    if (portfolioSizeCategory !== 'Below 50L') {
      allocation.equity.mutualFunds += 20;
      allocation.equity.aif = Math.max(0, allocation.equity.aif - 20);
      
      if (allocation.debt.direct > 0) {
        allocation.debt.direct += 10;
        allocation.debt.aif = Math.max(0, allocation.debt.aif - 10);
      }
    }
  } else if (riskCategory === 'Aggressive' || riskCategory === 'Ultra Aggressive') {
    // Aggressive investors may prefer more alternative investments
    if (portfolioSizeCategory !== 'Below 50L') {
      allocation.equity.mutualFunds = Math.max(0, allocation.equity.mutualFunds - 20);
      allocation.equity.aif += 20;
      
      if (allocation.debt.aif > 0) {
        allocation.debt.aif += 10;
        allocation.debt.direct = Math.max(0, allocation.debt.direct - 10);
      }
    }
  }
  
  return allocation;
}

/**
 * Generate explanation for asset allocation
 * @param {string} riskCategory - Client risk category
 * @param {string} portfolioSizeCategory - Portfolio size category
 * @returns {string} Explanation of asset allocation
 */
function generateAssetAllocationExplanation(riskCategory, portfolioSizeCategory) {
  let explanation = `Based on your ${riskCategory} risk profile and portfolio size (${portfolioSizeCategory}), we have created an asset allocation strategy that balances your risk tolerance with your investment objectives.`;
  
  // Add risk category specific explanation
  switch (riskCategory) {
    case 'Ultra Aggressive':
      explanation += ` As an Ultra Aggressive investor, your allocation maximizes growth potential with very high equity exposure. While this strategy may experience significant volatility in the short term, it aims to provide superior returns over the long term.`;
      break;
    case 'Aggressive':
      explanation += ` As an Aggressive investor, your allocation favors growth with high equity exposure while maintaining a small position in debt and alternative investments for some stability. This strategy is designed for investors who can tolerate substantial market fluctuations.`;
      break;
    case 'Moderate':
      explanation += ` As a Moderate investor, your allocation balances growth potential with stability, providing a balanced mix of equity and debt investments. With your portfolio size, we can include direct debt investments, which can offer better yields compared to debt mutual funds.`;
      break;
    case 'Conservative':
      explanation += ` As a Conservative investor, your allocation prioritizes capital preservation and income generation with a greater emphasis on debt investments. This approach aims to minimize volatility while still providing some growth potential through a smaller equity allocation.`;
      break;
  }
  
  // Add portfolio size specific explanation
  if (portfolioSizeCategory === 'Below 50L') {
    explanation += ` With a smaller portfolio size, we focus on well-diversified mutual funds to achieve proper diversification.`;
  } else if (portfolioSizeCategory === '50L-1Cr') {
    explanation += ` With your portfolio size, we can include PMS (Portfolio Management Services) for a more tailored equity approach.`;
  } else if (portfolioSizeCategory.includes('Cr')) {
    explanation += ` With your substantial portfolio size, we can include a mix of mutual funds, direct investments, PMS, and alternative investment funds to optimize returns while managing risk.`;
  }
  
  return explanation;
}

module.exports = {
  generateAssetAllocation,
  determinePortfolioSizeCategory
};
