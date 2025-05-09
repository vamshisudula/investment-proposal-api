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
    
    // Convert portfolio size from INR to crores for the allocation
    const portfolioSizeInCrores = portfolioSize / 10000000;
    
    // Get detailed portfolio allocation based on risk category and portfolio size
    const detailedAllocation = getPortfolioAllocation(riskProfile.riskCategory, portfolioSizeInCrores);
    
    // Generate asset class allocation based on risk profile and portfolio size
    // This ensures consistency between the pie chart and detailed breakdown
    const assetClassAllocation = generateAssetClassAllocation(riskProfile.riskCategory, portfolioSizeInCrores);
    
    // Generate product type allocation from detailed allocation
    const productTypeAllocation = generateProductTypeAllocation(detailedAllocation, assetClassAllocation);
    
    return {
      portfolioSize,
      portfolioSizeInCrores,
      assetClassAllocation,
      detailedAllocation,
      productTypeAllocation,
      allocationExplanation: generateAllocationExplanation(riskProfile.riskCategory, portfolioSizeInCrores)
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
 * Generate asset class allocation based on risk profile and portfolio size
 * @param {string} riskCategory - Client risk category
 * @param {number} portfolioSize - Portfolio size in crores
 * @returns {Object} Asset class allocation percentages
 */
function generateAssetClassAllocation(riskCategory, portfolioSize) {
  // For small portfolios (1 cr or less), use these specific allocations
  if (portfolioSize <= 1) {
    switch (riskCategory) {
      case 'Ultra Aggressive':
        return {
          equity: 100,  // 100% Equity MF
          debt: 0
        };
      case 'Aggressive':
        return {
          equity: 75,   // 75% Equity MF
          debt: 25      // 15% Debt MF + 10% Direct Debt
        };
      case 'Moderate':
        return {
          equity: 60,   // 60% Equity MF
          debt: 40      // 20% Debt MF + 20% Direct Debt
        };
      case 'Conservative':
        return {
          equity: 40,   // 40% Equity MF
          debt: 60      // 30% Debt MF + 30% Direct Debt
        };
    }
  }
  
  // For Conservative portfolios up to 2 cr
  if (riskCategory === 'Conservative' && portfolioSize <= 2) {
    return {
      equity: 40,
      debt: 60
    };
  }
  
  // For larger portfolios, use standard allocations
  switch (riskCategory) {
    case 'Ultra Aggressive':
      return {
        equity: 90,     // PMS + MF + part of AIF
        debt: 10
      };
    case 'Aggressive':
      return {
        equity: 80,     // Equity PMS + Equity MF + part of Equity AIF
        debt: 20        // Debt MF + Direct Debt
      };
    case 'Moderate':
      return {
        equity: 60,     // Equity PMS + Equity MF
        debt: 40        // Debt MF + Direct Debt
      };
    case 'Conservative':
      return {
        equity: 40,     // Equity PMS + Equity MF
        debt: 60,       // Debt MF + Direct Debt
        goldSilver: 0
      };
    default:
      // Default to Moderate if risk category is not recognized
      return {
        equity: 60,
        debt: 40,
        goldSilver: 0
      };
  }
}



/**
 * Generate explanation for asset allocation
 * @param {string} riskCategory - Client risk category
 * @param {number} portfolioSizeInCrores - Portfolio size in crores
 * @returns {string} Explanation of asset allocation
 */
function generateAllocationExplanation(riskCategory, portfolioSizeInCrores) {
  // Format the portfolio size for display
  const formattedSize = portfolioSizeInCrores < 1 ? 
    `₹${Math.round(portfolioSizeInCrores * 100) / 100} crores` : 
    `₹${Math.round(portfolioSizeInCrores * 10) / 10} crores`;
  
  let explanation = `Based on your ${riskCategory} risk profile and portfolio size (${formattedSize}), we have created an asset allocation strategy that balances your risk tolerance with your investment objectives.`;
  
  // Add risk category specific explanation
  switch (riskCategory) {
    case 'Ultra Aggressive':
      explanation += ` As an Ultra Aggressive investor, your allocation maximizes growth potential with very high equity exposure. While this strategy may experience significant volatility in the short term, it aims to provide superior returns over the long term.`;
      break;
    case 'Aggressive':
      explanation += ` As an Aggressive investor, your allocation favors growth with high equity exposure while maintaining a small position in debt and alternative investments for some stability. This strategy is designed for investors who can tolerate substantial market fluctuations.`;
      break;
    case 'Moderate':
      explanation += ` As a Moderate investor, your allocation balances growth potential with stability, providing a balanced mix of equity and debt investments.`;
      break;
    case 'Conservative':
      explanation += ` As a Conservative investor, your allocation prioritizes capital preservation and income generation with a greater emphasis on debt investments. This approach aims to minimize volatility while still providing some growth potential through a smaller equity allocation.`;
      break;
  }
  
  // Add portfolio size specific explanation
  if (portfolioSizeInCrores <= 1) {
    explanation += ` With a smaller portfolio size, we focus on well-diversified mutual funds to achieve proper diversification.`;
  } else if (portfolioSizeInCrores <= 2) {
    explanation += ` With your portfolio size, we can include PMS (Portfolio Management Services) for a more tailored equity approach.`;
  } else if (portfolioSizeInCrores <= 5) {
    explanation += ` With your portfolio size, we can include a mix of mutual funds, PMS, and some alternative investment funds to optimize returns while managing risk.`;
  } else {
    explanation += ` With your substantial portfolio size, we can include a comprehensive mix of mutual funds, direct investments, PMS, and alternative investment funds to optimize returns while managing risk.`;
  }
  
  return explanation;
}

/**
 * Portfolio Allocation Logic
 * 
 * This function calculates the appropriate asset allocation based on:
 * 1. Strategy type (Ultra Aggressive, Aggressive, Moderate, Conservative)
 * 2. Portfolio size (in crores)
 * 
 * NOTE: All monetary values in this function and its related functions are in CRORES of INR.
 * 
 * Special cases as per the investment guidelines:
 * - Ultra Aggressive: For 1cr and less → 100% in Equity MF
 * - Aggressive: For 1cr and less → 75% Equity MF, 15% Debt MF, 10% Direct Debt
 * - Moderate: For 1cr and less → 60% Equity MF, 20% Debt MF, 20% Direct Debt
 * - Conservative: For 2cr and less → 40% Equity MF, 30% Debt MF, 30% Direct Debt
 */
function calculateAllocation(strategy, portfolioSize) {
  // Convert portfolio size to number if it's a string
  portfolioSize = Number(portfolioSize);
  
  // Default allocation if no match is found
  let allocation = {
    error: "Invalid strategy or portfolio size"
  };

  // Special case for small portfolios (1 cr or less)
  if (portfolioSize <= 1) {
    if (strategy === "Ultra Aggressive") {
      allocation = {
        "Equity Mutual Funds": portfolioSize, // 100% in Equity MF
        "Total": portfolioSize
      };
    } else if (strategy === "Aggressive") {
      allocation = {
        "Equity Mutual Funds": portfolioSize * 0.75, // 75%
        "Debt Mutual Funds": portfolioSize * 0.15,   // 15%
        "Direct Debt": portfolioSize * 0.10,         // 10%
        "Total": portfolioSize
      };
    } else if (strategy === "Moderate") {
      allocation = {
        "Equity Mutual Funds": portfolioSize * 0.60, // 60%
        "Debt Mutual Funds": portfolioSize * 0.20,   // 20%
        "Direct Debt": portfolioSize * 0.20,         // 20%
        "Total": portfolioSize
      };
    } else if (strategy === "Conservative") {
      allocation = {
        "Equity Mutual Funds": portfolioSize * 0.40, // 40%
        "Debt Mutual Funds": portfolioSize * 0.30,   // 30%
        "Direct Debt": portfolioSize * 0.30,         // 30%
        "Total": portfolioSize
      };
    }
    
    return allocation;
  }

  // Special case for 1-2 cr in Conservative
  if (strategy === "Conservative" && portfolioSize <= 2) {
    allocation = {
      "Equity Mutual Funds": portfolioSize * 0.40, // 40%
      "Debt Mutual Funds": portfolioSize * 0.30,   // 30%
      "Direct Debt": portfolioSize * 0.30,         // 30%
      "Total": portfolioSize
    };
    return allocation;
  }

  // Standard allocations for larger portfolios
  if (strategy === "Ultra Aggressive") {
    // Ultra Aggressive has fixed percentages across portfolio sizes
    allocation = {
      "AIF": portfolioSize * 0.60,              // 60%
      "PMS": portfolioSize * 0.25,              // 25%
      "Mutual Funds": portfolioSize * 0.15,     // 15%
      "Total": portfolioSize
    };
  } else if (strategy === "Aggressive") {
    // Based on Image 3 - Aggressive strategy specific allocation for each portfolio size
    if (portfolioSize <= 2) {
      allocation = {
        "Equity PMS": 0.5,                      // Fixed 0.5 cr
        "Equity Mutual Funds": 1,               // Fixed 1 cr
        "Debt Mutual Funds": 0.25,              // Fixed 0.25 cr
        "Direct Debt": 0.25,                    // Fixed 0.25 cr
        "Total": portfolioSize
      };
    } else if (portfolioSize <= 5) {
      allocation = {
        "Equity AIF": 2,                        // Fixed 2 cr
        "Equity PMS": 1,                        // Fixed 1 cr
        "Equity Mutual Funds": 0.75,            // Fixed 0.75 cr
        "Debt Mutual Funds": 0.5,               // Fixed 0.5 cr
        "Direct Debt": 0.75,                    // Fixed 0.75 cr
        "Total": portfolioSize
      };
    } else {
      // For portfolios > 5 cr, use percentage-based logic
      allocation = {
        "Equity AIF": portfolioSize * 0.40,     // 40%
        "Equity PMS": portfolioSize * 0.20,     // 20%
        "Equity Mutual Funds": portfolioSize * 0.15, // 15%
        "Debt AIF": portfolioSize * 0.10,       // 10%
        "Debt Mutual Funds": portfolioSize * 0.05, // 5%
        "Direct Debt": portfolioSize * 0.10,    // 10%
        "Total": portfolioSize
      };
    }
  } else if (strategy === "Moderate") {
    allocation = {
      "Equity PMS": portfolioSize * 0.25,        // 25%
      "Equity Mutual Funds": portfolioSize * 0.35, // 35%
      "Debt Mutual Funds": portfolioSize * 0.20,  // 20%
      "Direct Debt": portfolioSize * 0.20,        // 20%
      "Total": portfolioSize
    };
  } else if (strategy === "Conservative") {
    allocation = {
      "Equity PMS": portfolioSize * 0.10,        // 10%
      "Equity Mutual Funds": portfolioSize * 0.30, // 30%
      "Debt Mutual Funds": portfolioSize * 0.30,  // 30%
      "Direct Debt": portfolioSize * 0.30,        // 30%
      "Total": portfolioSize
    };
  }

  return allocation;
}

/**
 * Helper function to get predefined allocations for specific portfolio sizes
 * This returns the exact values from the table for common portfolio sizes
 * or calculates the appropriate allocation for sizes not in the table
 */
function getPredefinedAllocation(strategy, portfolioSize) {
  // Convert portfolio size to number if it's a string
  portfolioSize = Number(portfolioSize);
  
  // Create lookup tables based on the CSV data
  // Based on Image 4 - Ultra Aggressive strategy table values
  const ultraAggressiveLookup = {
    2: { "AIF": 1.2, "PMS": 0.5, "Mutual Funds": 0.3 },
    5: { "AIF": 3, "PMS": 1.25, "Mutual Funds": 0.75 },
    10: { "AIF": 6, "PMS": 2.5, "Mutual Funds": 1.5 },
    15: { "AIF": 9, "PMS": 3.75, "Mutual Funds": 2.25 },
    20: { "AIF": 12, "PMS": 5, "Mutual Funds": 3 },
    25: { "AIF": 15, "PMS": 6.25, "Mutual Funds": 3.75 }
  };
  
  // Based on Image 3 - Aggressive strategy table values
  const aggressiveLookup = {
    2: { "Equity AIF": 0, "Equity PMS": 0.5, "Equity Mutual Funds": 1, "Debt AIF": 0, "Debt Mutual Funds": 0.25, "Direct Debt": 0.25 },
    5: { "Equity AIF": 2, "Equity PMS": 1, "Equity Mutual Funds": 0.75, "Debt AIF": 0, "Debt Mutual Funds": 0.5, "Direct Debt": 0.75 },
    10: { "Equity AIF": 4, "Equity PMS": 2, "Equity Mutual Funds": 1.5, "Debt AIF": 1, "Debt Mutual Funds": 0.5, "Direct Debt": 1 },
    15: { "Equity AIF": 6, "Equity PMS": 3, "Equity Mutual Funds": 2.25, "Debt AIF": 1.5, "Debt Mutual Funds": 0.75, "Direct Debt": 1.5 },
    20: { "Equity AIF": 8, "Equity PMS": 4, "Equity Mutual Funds": 3, "Debt AIF": 2, "Debt Mutual Funds": 1, "Direct Debt": 2 },
    25: { "Equity AIF": 10, "Equity PMS": 5, "Equity Mutual Funds": 3.75, "Debt AIF": 2.5, "Debt Mutual Funds": 1.25, "Direct Debt": 2.5 }
  };
  
  // Based on Image 2 - Moderate strategy table values
  const moderateLookup = {
    2: { "Equity AIF": 0, "Equity PMS": 0.5, "Equity Mutual Funds": 0.7, "Debt AIF": 0, "Debt Mutual Funds": 0.4, "Direct Debt": 0.4 },
    5: { "Equity AIF": 0, "Equity PMS": 1.25, "Equity Mutual Funds": 1.75, "Debt AIF": 0, "Debt Mutual Funds": 1, "Direct Debt": 1 },
    10: { "Equity AIF": 0, "Equity PMS": 2.5, "Equity Mutual Funds": 3.5, "Debt AIF": 0, "Debt Mutual Funds": 2, "Direct Debt": 2 },
    15: { "Equity AIF": 0, "Equity PMS": 3.75, "Equity Mutual Funds": 5.25, "Debt AIF": 0, "Debt Mutual Funds": 3, "Direct Debt": 3 },
    20: { "Equity AIF": 0, "Equity PMS": 5, "Equity Mutual Funds": 7, "Debt AIF": 0, "Debt Mutual Funds": 4, "Direct Debt": 4 },
    25: { "Equity AIF": 0, "Equity PMS": 6.25, "Equity Mutual Funds": 8.75, "Debt AIF": 0, "Debt Mutual Funds": 5, "Direct Debt": 5 }
  };
  
  // Based on Image 1 - Conservative strategy table values
  const conservativeLookup = {
    2: { "Equity AIF": 0, "Equity PMS": 0, "Equity Mutual Funds": 0.8, "Debt AIF": 0, "Debt Mutual Funds": 0.6, "Direct Debt": 0.6 },
    5: { "Equity AIF": 0, "Equity PMS": 0.5, "Equity Mutual Funds": 1.5, "Debt AIF": 0, "Debt Mutual Funds": 1.5, "Direct Debt": 1.5 },
    10: { "Equity AIF": 0, "Equity PMS": 1, "Equity Mutual Funds": 3, "Debt AIF": 0, "Debt Mutual Funds": 3, "Direct Debt": 3 },
    15: { "Equity AIF": 0, "Equity PMS": 1.5, "Equity Mutual Funds": 4.5, "Debt AIF": 0, "Debt Mutual Funds": 4.5, "Direct Debt": 4.5 },
    20: { "Equity AIF": 0, "Equity PMS": 2, "Equity Mutual Funds": 6, "Debt AIF": 0, "Debt Mutual Funds": 6, "Direct Debt": 6 },
    25: { "Equity AIF": 0, "Equity PMS": 2.5, "Equity Mutual Funds": 7.5, "Debt AIF": 0, "Debt Mutual Funds": 7.5, "Direct Debt": 7.5 }
  };
  
  // Get the lookup table based on strategy
  let lookupTable;
  if (strategy === "Ultra Aggressive") {
    lookupTable = ultraAggressiveLookup;
  } else if (strategy === "Aggressive") {
    lookupTable = aggressiveLookup;
  } else if (strategy === "Moderate") {
    lookupTable = moderateLookup;
  } else if (strategy === "Conservative") {
    lookupTable = conservativeLookup;
  } else {
    return { error: "Invalid strategy" };
  }
  
  // Define portfolio size ranges
  const ranges = [
    { max: 2, key: 2 },
    { max: 5, key: 5 },
    { max: 10, key: 10 },
    { max: 15, key: 15 },
    { max: 20, key: 20 },
    { max: 25, key: 25 },
    { max: Infinity, key: 25 } // For portfolios > 25 cr, use the 25 cr allocation
  ];
  
  // Special case for small portfolios (1 cr or less)
  if (portfolioSize <= 1) {
    console.log(`Portfolio size ${portfolioSize} cr is <= 1 cr. Using special small portfolio allocation.`);
    return calculateAllocation(strategy, portfolioSize);
  }
  
  // Special case for Conservative portfolios up to 2 cr
  if (strategy === "Conservative" && portfolioSize <= 2) {
    console.log(`Conservative portfolio with size ${portfolioSize} cr is <= 2 cr. Using special allocation.`);
    return calculateAllocation(strategy, portfolioSize);
  }
  
  // Find the appropriate range for the portfolio size
  let rangeKey = null;
  for (const range of ranges) {
    if (portfolioSize <= range.max) {
      rangeKey = range.key;
      break;
    }
  }
  
  // If we have a predefined allocation for this range, use it
  if (rangeKey && lookupTable[rangeKey]) {
    console.log(`Portfolio size ${portfolioSize} cr falls in range <= ${rangeKey} cr. Using predefined allocation for ${rangeKey} cr.`);
    
    // For portfolios that don't exactly match a key in the lookup table,
    // we need to scale the allocation proportionally
    const baseAllocation = {...lookupTable[rangeKey]};
    const result = {};
    
    // For Aggressive strategy with portfolios between 2-5 cr, use fixed values
    if (strategy === "Aggressive" && portfolioSize > 2 && portfolioSize <= 5) {
      console.log(`Aggressive portfolio with size ${portfolioSize} cr is between 2-5 cr. Using fixed values.`);
      return calculateAllocation(strategy, portfolioSize);
    }
    
    // For other cases, scale the allocation proportionally
    const scalingFactor = portfolioSize / rangeKey;
    
    // Apply scaling factor to each allocation
    for (const [key, value] of Object.entries(baseAllocation)) {
      result[key] = value * scalingFactor;
    }
    
    // Calculate total
    let total = 0;
    for (const key in result) {
      total += result[key];
    }
    result.Total = portfolioSize; // Ensure total matches the portfolio size
    
    return result;
  }
  
  // If we don't have a predefined allocation, use the calculated allocation
  console.log(`No range match found for ${strategy} with ${portfolioSize} crores. Using calculated allocation.`);
  return calculateAllocation(strategy, portfolioSize);
}

/**
 * Main function to get the portfolio allocation
 * 
 * @param {string} strategy - "Ultra Aggressive", "Aggressive", "Moderate", or "Conservative"
 * @param {number} portfolioSize - Portfolio size in crores of INR
 * @returns {object} - The allocation breakdown with all values in crores of INR
 */
function getPortfolioAllocation(strategy, portfolioSize) {
  // Always use the range-based approach to ensure consistent allocations
  // This will handle both exact matches and ranges appropriately
  return getPredefinedAllocation(strategy, portfolioSize);
}

/**
 * Generate product type allocation from detailed allocation
 * @param {Object} detailedAllocation - Detailed allocation with investment vehicles
 * @param {Object} assetClassAllocation - High-level asset class allocation percentages
 * @returns {Object} Product type allocation in the format expected by the frontend
 */
function generateProductTypeAllocation(detailedAllocation, assetClassAllocation) {
  // Initialize product type allocation structure
  const productTypeAllocation = {
    equity: {},
    debt: {}
  };
  
  // Extract total portfolio size from detailed allocation
  const totalSize = detailedAllocation.Total || 0;
  
  // Skip if we don't have a valid total
  if (totalSize <= 0) {
    return productTypeAllocation;
  }
  
  // Calculate percentages for equity products
  let equityTotal = 0;
  let debtTotal = 0;
  
  // Map detailed allocation to product types
  for (const [key, value] of Object.entries(detailedAllocation)) {
    if (key === 'Total' || key === 'error') continue;
    
    // Convert crore values to percentages of total portfolio
    const percentage = Math.round((value / totalSize) * 100);
    
    if (key.includes('Equity')) {
      equityTotal += percentage;
      
      if (key === 'Equity Mutual Funds') {
        productTypeAllocation.equity['Large Cap'] = Math.round(percentage * 0.4);
        productTypeAllocation.equity['Mid Cap'] = Math.round(percentage * 0.3);
        productTypeAllocation.equity['Small Cap'] = Math.round(percentage * 0.3);
      } else if (key === 'Equity PMS') {
        productTypeAllocation.equity['PMS'] = percentage;
      } else if (key === 'Equity AIF') {
        productTypeAllocation.equity['AIF'] = percentage;
      }
    } else if (key.includes('Debt')) {
      debtTotal += percentage;
      
      if (key === 'Debt Mutual Funds') {
        productTypeAllocation.debt['Government Bonds'] = Math.round(percentage * 0.5);
        productTypeAllocation.debt['Corporate Bonds'] = Math.round(percentage * 0.5);
      } else if (key === 'Direct Debt') {
        productTypeAllocation.debt['Fixed Deposits'] = percentage;
      } else if (key === 'Debt AIF') {
        productTypeAllocation.debt['Structured Products'] = percentage;
      }
    }
  }
  
  // Ensure the product type percentages sum to the asset class percentages
  const adjustProductTypes = (productTypes, targetPercentage) => {
    const currentTotal = Object.values(productTypes).reduce((sum, val) => sum + val, 0);
    if (currentTotal === 0) return;
    
    const adjustmentFactor = targetPercentage / currentTotal;
    for (const key in productTypes) {
      productTypes[key] = Math.round(productTypes[key] * adjustmentFactor);
    }
  };
  
  // Adjust product type percentages to match asset class percentages
  adjustProductTypes(productTypeAllocation.equity, assetClassAllocation.equity);
  adjustProductTypes(productTypeAllocation.debt, assetClassAllocation.debt);
  
  return productTypeAllocation;
}

module.exports = {
  generateAssetAllocation,
  getPortfolioAllocation,
  extractPortfolioSize,
  getPredefinedAllocation,
  generateProductTypeAllocation,
  calculateAllocation
};
