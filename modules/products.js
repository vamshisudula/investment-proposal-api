/**
 * Products Module
 * 
 * This module handles product recommendations based on client risk profile
 * and asset allocation.
 */

const axios = require('axios');

// Import external products module
const externalProducts = require('./externalProducts');

// Sample product database - in a real implementation, this would be loaded from a database
const productDatabase = {
  equity: {
    mutualFunds: {
      conservative: [
        { name: 'Large Cap Fund A', description: 'Focus on stable large-cap companies', expectedReturn: '10-12%', risk: 'Moderate', lockInPeriod: 'None' },
        { name: 'Dividend Yield Fund B', description: 'Companies with consistent dividend history', expectedReturn: '9-11%', risk: 'Moderate-Low', lockInPeriod: 'None' }
      ],
      moderate: [
        { name: 'Multi Cap Fund C', description: 'Diversified across market caps', expectedReturn: '12-14%', risk: 'Moderate', lockInPeriod: 'None' },
        { name: 'Focused Equity Fund D', description: 'Concentrated portfolio of 25-30 stocks', expectedReturn: '13-15%', risk: 'Moderate-High', lockInPeriod: 'None' }
      ],
      aggressive: [
        { name: 'Mid Cap Fund E', description: 'Focus on high-growth mid-cap companies', expectedReturn: '14-16%', risk: 'High', lockInPeriod: 'None' },
        { name: 'Small Cap Fund F', description: 'Emerging small-cap companies with high growth potential', expectedReturn: '15-18%', risk: 'Very High', lockInPeriod: 'None' },
        { name: 'Sectoral Fund G', description: 'Focus on high-growth sectors', expectedReturn: '15-20%', risk: 'Very High', lockInPeriod: 'None' }
      ]
    },
    pms: {
      conservative: [
        { name: 'Blue Chip PMS H', description: 'Focus on established blue-chip companies', expectedReturn: '12-14%', risk: 'Moderate', lockInPeriod: '1 year', minimumInvestment: '50 Lakhs' }
      ],
      moderate: [
        { name: 'Multi-Strategy PMS I', description: 'Blend of value and growth strategies', expectedReturn: '14-16%', risk: 'Moderate-High', lockInPeriod: '1 year', minimumInvestment: '50 Lakhs' }
      ],
      aggressive: [
        { name: 'Concentrated Growth PMS J', description: 'High-conviction portfolio of growth stocks', expectedReturn: '16-20%', risk: 'High', lockInPeriod: '1 year', minimumInvestment: '50 Lakhs' }
      ]
    },
    aif: {
      conservative: [
        { name: 'Long-Only Value AIF K', description: 'Value investing approach with long-term horizon', expectedReturn: '13-15%', risk: 'Moderate-High', lockInPeriod: '3 years', minimumInvestment: '1 Crore' }
      ],
      moderate: [
        { name: 'Special Situations AIF L', description: 'Focus on special situations and turnarounds', expectedReturn: '15-18%', risk: 'High', lockInPeriod: '3 years', minimumInvestment: '1 Crore' }
      ],
      aggressive: [
        { name: 'Long-Short AIF M', description: 'Long-short strategy to capture market opportunities', expectedReturn: '18-22%', risk: 'Very High', lockInPeriod: '3 years', minimumInvestment: '1 Crore' }
      ]
    }
  },
  debt: {
    mutualFunds: {
      conservative: [
        { name: 'Liquid Fund N', description: 'Very low risk, high liquidity', expectedReturn: '5-6%', risk: 'Very Low', lockInPeriod: 'None' },
        { name: 'Ultra Short Duration Fund O', description: 'Low risk, high liquidity', expectedReturn: '6-7%', risk: 'Low', lockInPeriod: 'None' }
      ],
      moderate: [
        { name: 'Short Duration Fund P', description: 'Moderate risk, good returns', expectedReturn: '7-8%', risk: 'Low-Moderate', lockInPeriod: 'None' },
        { name: 'Corporate Bond Fund Q', description: 'Focus on high-quality corporate bonds', expectedReturn: '7.5-8.5%', risk: 'Moderate', lockInPeriod: 'None' }
      ],
      aggressive: [
        { name: 'Credit Risk Fund R', description: 'Higher yield through lower-rated bonds', expectedReturn: '8-10%', risk: 'High', lockInPeriod: 'None' },
        { name: 'Dynamic Bond Fund S', description: 'Actively managed duration strategy', expectedReturn: '8-9%', risk: 'Moderate-High', lockInPeriod: 'None' }
      ]
    },
    direct: {
      conservative: [
        { name: 'Government Securities T', description: 'Sovereign backed securities', expectedReturn: '6.5-7.5%', risk: 'Very Low', lockInPeriod: 'Varies', minimumInvestment: '10 Lakhs' }
      ],
      moderate: [
        { name: 'AAA Corporate Bonds U', description: 'Highest rated corporate bonds', expectedReturn: '7.5-8.5%', risk: 'Low', lockInPeriod: 'Varies', minimumInvestment: '10 Lakhs' }
      ],
      aggressive: [
        { name: 'AA Corporate Bonds V', description: 'High-yield corporate bonds', expectedReturn: '8.5-9.5%', risk: 'Moderate', lockInPeriod: 'Varies', minimumInvestment: '10 Lakhs' }
      ]
    },
    aif: {
      conservative: [
        { name: 'Structured Credit AIF W', description: 'Secured lending to established businesses', expectedReturn: '9-11%', risk: 'Moderate', lockInPeriod: '3 years', minimumInvestment: '1 Crore' }
      ],
      moderate: [
        { name: 'Real Estate Debt AIF X', description: 'Debt financing for real estate projects', expectedReturn: '11-13%', risk: 'Moderate-High', lockInPeriod: '3 years', minimumInvestment: '1 Crore' }
      ],
      aggressive: [
        { name: 'High Yield Debt AIF Y', description: 'Higher yield debt instruments', expectedReturn: '13-15%', risk: 'High', lockInPeriod: '3 years', minimumInvestment: '1 Crore' }
      ]
    }
  },
  goldSilver: {
    etf: [
      { name: 'Gold ETF', description: 'Exchange-traded fund tracking gold prices', expectedReturn: '8-10%', risk: 'Moderate', lockInPeriod: 'None' },
      { name: 'Sovereign Gold Bond', description: 'Government bonds denominated in grams of gold', expectedReturn: '8-11%', risk: 'Moderate-Low', lockInPeriod: '5-8 years' },
      { name: 'Silver ETF', description: 'Exchange-traded fund tracking silver prices', expectedReturn: '8-12%', risk: 'Moderate-High', lockInPeriod: 'None' }
    ],
    physical: [
      { name: 'Physical Gold', description: 'Investment in physical gold bars or coins', expectedReturn: 'Variable', risk: 'Moderate', lockInPeriod: 'None' },
      { name: 'Digital Gold', description: 'Electronically held gold with physical delivery option', expectedReturn: 'Variable', risk: 'Moderate-Low', lockInPeriod: 'None' },
      { name: 'Silver Coins/Bars', description: 'Investment in physical silver', expectedReturn: 'Variable', risk: 'Moderate-High', lockInPeriod: 'None' }
    ]
  }
};

/**
 * Recommend products based on client risk profile and asset allocation
 * @param {Object} clientData - Client profile, risk assessment, and asset allocation data
 * @returns {Object} Product recommendations
 */
async function recommendProducts(clientData) {
  try {
    console.log('recommendProducts - Input:', JSON.stringify(clientData, null, 2));
    
    const { clientProfile, riskProfile, assetAllocation } = clientData;
    
    // Validate inputs
    if (!assetAllocation) {
      console.error('Error: assetAllocation is missing');
      throw new Error('Asset allocation data is required');
    }
    
    if (!riskProfile) {
      console.error('Error: riskProfile is missing');
      throw new Error('Risk profile data is required');
    }
    
    // Extract risk level from risk profile
    const riskLevel = mapRiskCategoryToLevel(riskProfile.riskCategory);
    
    // Extract portfolio size from asset allocation
    const portfolioSize = assetAllocation.portfolioSize || clientProfile.investmentObjectives.initialInvestmentAmount;
    
    // Generate recommendations for each asset class
    let equityRecommendations, debtRecommendations, goldSilverRecommendations;
    
    try {
      console.log('Generating equity recommendations...');
      equityRecommendations = await generateEquityRecommendations(riskLevel, assetAllocation, portfolioSize);
    } catch (equityError) {
      console.error('Error generating equity recommendations:', equityError);
      equityRecommendations = { 
        mutualFunds: { 
          allocation: 100, 
          products: productDatabase.equity.mutualFunds.moderate 
        } 
      };
    }
    
    try {
      console.log('Generating debt recommendations...');
      debtRecommendations = await generateDebtRecommendations(riskLevel, assetAllocation, portfolioSize);
    } catch (debtError) {
      console.error('Error generating debt recommendations:', debtError);
      debtRecommendations = { 
        mutualFunds: { 
          allocation: 100, 
          products: productDatabase.debt.mutualFunds.moderate 
        } 
      };
    }
    
    try {
      console.log('Generating gold/silver recommendations...');
      goldSilverRecommendations = await generateGoldSilverRecommendations(assetAllocation, portfolioSize);
    } catch (goldError) {
      console.error('Error generating gold/silver recommendations:', goldError);
      goldSilverRecommendations = {};
    }
    
    // Combine recommendations
    const recommendations = {
      equity: equityRecommendations,
      debt: debtRecommendations,
      goldSilver: goldSilverRecommendations
    };
    
    // Generate recommendation summary
    const recommendationSummary = generateRecommendationSummary(recommendations, riskProfile.riskCategory || 'Moderate');
    
    console.log('Product recommendations generated successfully');
    
    return {
      recommendations,
      recommendationSummary
    };
  } catch (error) {
    console.error('Error in recommendProducts:', error);
    console.error('Stack trace:', error.stack);
    
    // Provide a fallback response with minimal recommendations
    const fallbackRecommendations = {
      equity: { 
        mutualFunds: { 
          allocation: 100, 
          products: productDatabase.equity.mutualFunds.moderate 
        } 
      },
      debt: {
        mutualFunds: {
          allocation: 100,
          products: productDatabase.debt.mutualFunds.moderate
        }
      },
      goldSilver: {}
    };
    
    return {
      recommendations: fallbackRecommendations,
      recommendationSummary: "Based on your risk profile, we've prepared a basic set of investment recommendations. These are default recommendations as we encountered an error processing your specific profile."
    };
  }
}

/**
 * Map risk category to risk level
 * @param {string} riskCategory - Risk category
 * @returns {string} Risk level
 */
function mapRiskCategoryToLevel(riskCategory) {
  switch (riskCategory) {
    case 'Conservative':
      return 'conservative';
    case 'Moderate':
      return 'moderate';
    case 'Aggressive':
      return 'aggressive';
    default:
      return 'moderate';
  }
}

/**
 * Generate equity product recommendations
 * @param {string} riskLevel - Client risk level
 * @param {Object} assetAllocation - Asset allocation data
 * @param {number} portfolioSize - Portfolio size in INR
 * @returns {Object} Equity product recommendations
 */
async function generateEquityRecommendations(riskLevel, assetAllocation, portfolioSize) {
  console.log('generateEquityRecommendations - Input:', JSON.stringify({
    riskLevel,
    assetAllocation,
    portfolioSize
  }, null, 2));

  try {
    const recommendations = {};
    
    // Safety check for assetClassAllocation
    if (!assetAllocation.assetClassAllocation) {
      console.error('Error: assetClassAllocation missing in generateEquityRecommendations');
      return { mutualFunds: { allocation: 100, products: productDatabase.equity.mutualFunds.moderate } };
    }

    const equityAllocation = assetAllocation.assetClassAllocation.equity;
    
    // Safety check for productTypeAllocation
    if (!assetAllocation.productTypeAllocation || !assetAllocation.productTypeAllocation.equity) {
      console.log('Warning: productTypeAllocation.equity missing, using default values');
      // Default allocation if not specified
      const defaultProductTypeAllocation = { mutualFunds: 80, etf: 20 };
      
      // Calculate amount allocated to equity
      const equityAmount = (portfolioSize * equityAllocation) / 100;
      
      // Mutual Funds (default)
      recommendations.mutualFunds = {
        allocation: defaultProductTypeAllocation.mutualFunds,
        amount: (equityAmount * defaultProductTypeAllocation.mutualFunds) / 100,
        products: productDatabase.equity.mutualFunds[riskLevel] || productDatabase.equity.mutualFunds.moderate
      };
      
      // ETF (default)
      recommendations.etf = {
        allocation: defaultProductTypeAllocation.etf,
        amount: (equityAmount * defaultProductTypeAllocation.etf) / 100,
        products: [
          { 
            name: "Nippon India ETF Nifty BeES",
            description: "An ETF tracking the Nifty 50 index",
            expectedReturn: "10-12% p.a.",
            risk: "Moderate",
            lockInPeriod: "None"
          }
        ]
      };
      
      return recommendations;
    }
    
    // Normal flow when productTypeAllocation exists
    const productTypeAllocation = assetAllocation.productTypeAllocation.equity;
    
    // Calculate amount allocated to equity
    const equityAmount = (portfolioSize * equityAllocation) / 100;
    
    // Mutual Funds
    if (productTypeAllocation.mutualFunds > 0) {
      const mutualFundAmount = (equityAmount * productTypeAllocation.mutualFunds) / 100;
      recommendations.mutualFunds = {
        allocation: productTypeAllocation.mutualFunds,
        amount: mutualFundAmount,
        products: productDatabase.equity.mutualFunds[riskLevel] || productDatabase.equity.mutualFunds.moderate
      };
    }
    
    // PMS
    if (productTypeAllocation.pms > 0 && portfolioSize >= 5000000) { // 50 Lakhs minimum
      const pmsAmount = (equityAmount * productTypeAllocation.pms) / 100;
      
      // Fetch PMS products from external API
      try {
        console.log('Fetching PMS products from external API...');
        const pmsProducts = await externalProducts.fetchPMS('1 Month');
        const formattedPmsProducts = externalProducts.formatProductData(pmsProducts, 'pms');
        
        recommendations.pms = {
          allocation: productTypeAllocation.pms,
          amount: pmsAmount,
          products: formattedPmsProducts.length > 0 ? 
            formattedPmsProducts : 
            productDatabase.equity.pms[riskLevel] || productDatabase.equity.pms.moderate
        };
        
        console.log(`Fetched ${formattedPmsProducts.length} PMS products from API`);
      } catch (error) {
        console.error('Error fetching PMS products:', error);
        recommendations.pms = {
          allocation: productTypeAllocation.pms,
          amount: pmsAmount,
          products: productDatabase.equity.pms[riskLevel] || productDatabase.equity.pms.moderate
        };
      }
    }
    
    // AIF
    if (productTypeAllocation.aif > 0 && portfolioSize >= 10000000) { // 1 Crore minimum
      const aifAmount = (equityAmount * productTypeAllocation.aif) / 100;
      
      // Fetch Alternative Funds products from external API
      try {
        console.log('Fetching Alternative Funds products from external API...');
        const alternativeFunds = await externalProducts.fetchAlternativeFunds('1 Month');
        const formattedAlternativeFunds = externalProducts.formatProductData(alternativeFunds, 'alternativeFunds');
        
        recommendations.aif = {
          allocation: productTypeAllocation.aif,
          amount: aifAmount,
          products: formattedAlternativeFunds.length > 0 ? 
            formattedAlternativeFunds : 
            productDatabase.equity.aif[riskLevel] || productDatabase.equity.aif.moderate
        };
        
        console.log(`Fetched ${formattedAlternativeFunds.length} Alternative Funds products from API`);
      } catch (error) {
        console.error('Error fetching Alternative Funds products:', error);
        recommendations.aif = {
          allocation: productTypeAllocation.aif,
          amount: aifAmount,
          products: productDatabase.equity.aif[riskLevel] || productDatabase.equity.aif.moderate
        };
      }
    }
    
    // Unlisted Stocks (if portfolio size is sufficient)
    if (portfolioSize >= 10000000 && productTypeAllocation.unlistedStocks > 0) { // 1 Crore minimum
      const unlistedStocksAmount = (equityAmount * productTypeAllocation.unlistedStocks) / 100;
      
      // Fetch Unlisted Stocks products from external API
      try {
        console.log('Fetching Unlisted Stocks products from external API...');
        const unlistedStocks = await externalProducts.fetchUnlistedStocks('1 Month');
        const formattedUnlistedStocks = externalProducts.formatProductData(unlistedStocks, 'unlistedStocks');
        
        if (formattedUnlistedStocks.length > 0) {
          recommendations.unlistedStocks = {
            allocation: productTypeAllocation.unlistedStocks || 5, // Default 5% if not specified
            amount: unlistedStocksAmount,
            products: formattedUnlistedStocks
          };
          
          console.log(`Fetched ${formattedUnlistedStocks.length} Unlisted Stocks products from API`);
        }
      } catch (error) {
        console.error('Error fetching Unlisted Stocks products:', error);
        // No fallback for unlisted stocks as they are optional
      }
    }
    
    // ETF (add default if only mutual funds are present)
    if (!recommendations.mutualFunds && !recommendations.pms && !recommendations.aif) {
      recommendations.mutualFunds = {
        allocation: 100,
        amount: equityAmount,
        products: productDatabase.equity.mutualFunds[riskLevel] || productDatabase.equity.mutualFunds.moderate
      };
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error in generateEquityRecommendations:', error);
    // Return fallback recommendations
    return { 
      mutualFunds: { 
        allocation: 100, 
        products: productDatabase.equity.mutualFunds.moderate 
      } 
    };
  }
}

/**
 * Generate debt product recommendations
 * @param {string} riskLevel - Client risk level
 * @param {Object} assetAllocation - Asset allocation data
 * @param {number} portfolioSize - Portfolio size in INR
 * @returns {Object} Debt product recommendations
 */
async function generateDebtRecommendations(riskLevel, assetAllocation, portfolioSize) {
  console.log('generateDebtRecommendations - Input:', JSON.stringify({
    riskLevel,
    assetAllocation,
    portfolioSize
  }, null, 2));

  try {
    const recommendations = {};
    
    // Safety check for assetClassAllocation
    if (!assetAllocation.assetClassAllocation) {
      console.error('Error: assetClassAllocation missing in generateDebtRecommendations');
      return { mutualFunds: { allocation: 100, products: productDatabase.debt.mutualFunds.moderate } };
    }

    const debtAllocation = assetAllocation.assetClassAllocation.debt;
    
    // Safety check for productTypeAllocation
    if (!assetAllocation.productTypeAllocation || !assetAllocation.productTypeAllocation.debt) {
      console.log('Warning: productTypeAllocation.debt missing, using default values');
      // Default allocation if not specified
      const defaultProductTypeAllocation = { mutualFunds: 70, direct: 30 };
      
      // Calculate amount allocated to debt
      const debtAmount = (portfolioSize * debtAllocation) / 100;
      
      // Fetch Mutual Funds from API based on risk level basket
      let basketName;
      switch(riskLevel) {
        case 'conservative':
          basketName = 'Edu Omega';
          break;
        case 'moderate':
          basketName = 'Edu Sigma';
          break;
        case 'aggressive':
          basketName = 'Edu Alpha';
          break;
        default:
          basketName = 'Edu Sigma';
      }
      
      // Try to get funds from the basket first
      let mutualFundProducts = await fetchMutualFundsFromBasket(basketName);
      
      // If basket fetch fails, try the regular API
      if (mutualFundProducts.length === 0) {
        console.log(`Basket ${basketName} fetch failed, trying regular API`);
        mutualFundProducts = await fetchMutualFundsBasedOnRisk(riskLevel);
      }
      
      recommendations.mutualFunds = {
        allocation: defaultProductTypeAllocation.mutualFunds,
        amount: (debtAmount * defaultProductTypeAllocation.mutualFunds) / 100,
        products: mutualFundProducts.length > 0 ? mutualFundProducts : productDatabase.debt.mutualFunds.moderate
      };
      
      // Direct (default)
      recommendations.direct = {
        allocation: defaultProductTypeAllocation.direct,
        amount: (debtAmount * defaultProductTypeAllocation.direct) / 100,
        products: [
          {
            name: "Fixed Deposit - HDFC Bank",
            description: "Bank fixed deposit with stable returns",
            expectedReturn: "5-6% p.a.",
            risk: "Very Low",
            lockInPeriod: "1-5 years"
          }
        ]
      };
      
      return recommendations;
    }
    
    // Normal flow when productTypeAllocation exists
    const productTypeAllocation = assetAllocation.productTypeAllocation.debt;
    
    // Calculate amount allocated to debt
    const debtAmount = (portfolioSize * debtAllocation) / 100;
    
    // Mutual Funds
    if (productTypeAllocation.mutualFunds > 0) {
      const mutualFundAmount = (debtAmount * productTypeAllocation.mutualFunds) / 100;
      
      // Fetch Mutual Funds from API based on risk level basket
      let basketName;
      switch(riskLevel) {
        case 'conservative':
          basketName = 'Edu Omega';
          break;
        case 'moderate':
          basketName = 'Edu Sigma';
          break;
        case 'aggressive':
          basketName = 'Edu Alpha';
          break;
        default:
          basketName = 'Edu Sigma';
      }
      
      // Try to get funds from the basket first
      let mutualFundProducts = await fetchMutualFundsFromBasket(basketName);
      
      // If basket fetch fails, try the regular API
      if (mutualFundProducts.length === 0) {
        console.log(`Basket ${basketName} fetch failed, trying regular API`);
        mutualFundProducts = await fetchMutualFundsBasedOnRisk(riskLevel);
      }
      
      recommendations.mutualFunds = {
        allocation: productTypeAllocation.mutualFunds,
        amount: mutualFundAmount,
        products: mutualFundProducts.length > 0 ? mutualFundProducts : productDatabase.debt.mutualFunds[riskLevel] || productDatabase.debt.mutualFunds.moderate
      };
    }
    
    // Direct Debt
    if (productTypeAllocation.direct > 0) {
      const directAmount = (debtAmount * productTypeAllocation.direct) / 100;
      recommendations.direct = {
        allocation: productTypeAllocation.direct,
        amount: directAmount,
        products: productDatabase.debt.direct[riskLevel] || productDatabase.debt.direct.moderate
      };
    }
    
    // AIF
    if (productTypeAllocation.aif > 0 && portfolioSize >= 50000000) { // 5 Crores for debt AIF
      const aifAmount = (debtAmount * productTypeAllocation.aif) / 100;
      recommendations.aif = {
        allocation: productTypeAllocation.aif,
        amount: aifAmount,
        products: productDatabase.debt.aif[riskLevel] || productDatabase.debt.aif.moderate
      };
    }
    
    // Add default if no recommendations were generated
    if (!recommendations.mutualFunds && !recommendations.direct && !recommendations.aif) {
      // Fetch Mutual Funds from API based on risk level basket
      let basketName;
      switch(riskLevel) {
        case 'conservative':
          basketName = 'Edu Omega';
          break;
        case 'moderate':
          basketName = 'Edu Sigma';
          break;
        case 'aggressive':
          basketName = 'Edu Alpha';
          break;
        default:
          basketName = 'Edu Sigma';
      }
      
      // Try to get funds from the basket first
      let mutualFundProducts = await fetchMutualFundsFromBasket(basketName);
      
      // If basket fetch fails, try the regular API
      if (mutualFundProducts.length === 0) {
        console.log(`Basket ${basketName} fetch failed, trying regular API`);
        mutualFundProducts = await fetchMutualFundsBasedOnRisk(riskLevel);
      }
      
      recommendations.mutualFunds = {
        allocation: 100,
        amount: debtAmount,
        products: mutualFundProducts.length > 0 ? mutualFundProducts : productDatabase.debt.mutualFunds[riskLevel] || productDatabase.debt.mutualFunds.moderate
      };
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error in generateDebtRecommendations:', error);
    // Return fallback recommendations
    return { 
      mutualFunds: { 
        allocation: 100, 
        products: productDatabase.debt.mutualFunds.moderate 
      } 
    };
  }
}

/**
 * Fetch mutual funds from API based on risk level
 * @param {string} riskLevel - Client risk level (conservative, moderate, aggressive)
 * @returns {Array} Array of mutual fund products
 */
async function fetchMutualFundsBasedOnRisk(riskLevel) {
  try {
    // Define API endpoint and headers
    const url = 'https://i4edevmfnodeapis.azurewebsites.net/api/master-data/regular-scheme-list';
    const headers = {
      'accept': '*/*',
      'Authorization': 'APIKEY-STRFQUJDRDEyMw==',
      'Content-Type': 'application/json'
    };
    
    // Set up request body based on risk level
    let requestBody = {
      amcCode: [],
      schemeType: [],
      category: null,
      rating: null,
      returnInYr: 5,
      divReInvstFlag: null,
      schemeName: null,
      sipMinInvestment: null,
      sortOrder: 0,
      pageNumber: 1,
      pageSize: 10
    };
    
    // Adjust parameters based on risk level
    switch(riskLevel) {
      case 'conservative':
        requestBody.category = 'Debt';
        requestBody.schemeType = ['Liquid Fund', 'Ultra Short Duration Fund'];
        requestBody.rating = 5; // Highest rating for conservative
        break;
      case 'moderate':
        requestBody.category = 'Debt';
        requestBody.schemeType = ['Short Duration Fund', 'Corporate Bond Fund'];
        requestBody.rating = 4; // High rating for moderate
        break;
      case 'aggressive':
        requestBody.category = 'Debt';
        requestBody.schemeType = ['Credit Risk Fund', 'Dynamic Bond Fund'];
        requestBody.rating = 3; // Lower rating acceptable for aggressive
        break;
      default:
        requestBody.category = 'Debt';
        break;
    }
    
    // Make API call
    const response = await axios.post(url, requestBody, { headers });
    
    // Check if response is valid
    if (response.status === 200 && response.data && Array.isArray(response.data.data)) {
      // Map API response to our product format
      return response.data.data.map(fund => ({
        name: fund.SchemeName || 'Mutual Fund',
        description: `${fund.CategoryName || 'Debt'} fund by ${fund.AMCName || 'AMC'}`,
        expectedReturn: fund['5YrReturn'] ? `${fund['5YrReturn']}%` : '7-9%',
        risk: mapRatingToRiskLevel(fund.Rating),
        lockInPeriod: 'None',
        amcCode: fund.AMCCode,
        schemeCode: fund.SchemeCode,
        nav: fund.NAV,
        rating: fund.Rating,
        category: fund.CategoryName,
        schemeType: fund.SchemeType
      }));
    } else {
      console.warn('Invalid response from mutual fund API, using fallback data');
      return [];
    }
  } catch (error) {
    console.error('Error fetching mutual funds from API:', error);
    return [];
  }
}

/**
 * Try to fetch mutual funds from a specific basket
 * @param {string} basketName - Name of the basket (e.g., 'Edu Omega', 'Edu Sigma', 'Edu Alpha')
 * @returns {Array} Array of mutual fund products from the basket
 */
async function fetchMutualFundsFromBasket(basketName) {
  try {
    // Define API endpoint and headers
    const url = 'https://devie4nodeapis.azurewebsites.net/api/common/basketDetails/';
    const headers = {
      'accept': 'application/json',
      'Authorization': 'APIKEY-STRFQUJDRDEyMw=='
    };
    
    console.log(`Fetching mutual funds from basket: ${basketName}`);
    
    // Make API call
    const response = await axios.get(url, { headers });
    
    // Check if response is valid
    if (response.status === 200 && response.data && response.data.data) {
      console.log(`Basket API response received with ${response.data.data.length} baskets`);
      
      // Find the specific basket
      const basket = response.data.data.find(b => b.NAME === basketName);
      
      if (basket && basket.SuggestedSchemeDetails && Array.isArray(basket.SuggestedSchemeDetails)) {
        console.log(`Found basket '${basketName}' with ${basket.SuggestedSchemeDetails.length} schemes`);
        
        // Filter for debt funds if we're looking for debt recommendations
        const filteredSchemes = basket.SuggestedSchemeDetails.filter(scheme => {
          // For conservative (Edu Omega), prioritize fixed income schemes
          if (basketName === 'Edu Omega') {
            return scheme.SchemeType === 'Fixed Income' || scheme.CategoryName === 'Conservative Allocation';
          }
          // For moderate (Edu Sigma), include allocation schemes
          else if (basketName === 'Edu Sigma') {
            return scheme.SchemeType === 'Allocation' || scheme.CategoryName.includes('Allocation');
          }
          // For aggressive (Edu Alpha), include all schemes but prioritize equity
          return true;
        });
        
        if (filteredSchemes.length > 0) {
          console.log(`Using ${filteredSchemes.length} filtered schemes from basket '${basketName}'`);
          
          // Map basket schemes to our product format
          return filteredSchemes.map(scheme => ({
            name: scheme.SchemeName || 'Mutual Fund',
            description: `${scheme.CategoryName || 'Investment'} fund - ${basketName} basket`,
            expectedReturn: scheme['5YrReturn'] ? `${scheme['5YrReturn']}%` : '8-10%',
            risk: mapRatingToRiskLevel(scheme.Rating),
            lockInPeriod: 'None',
            isin: scheme.ISIN,
            bseSchemeCode: scheme.BSESchemeCode,
            amcCode: scheme.AMCCode,
            rating: scheme.Rating,
            category: scheme.CategoryName,
            schemeType: scheme.SchemeType,
            returns: {
              '1yr': scheme['1YrReturn'],
              '3yr': scheme['3YrReturn'],
              '5yr': scheme['5YrReturn'],
              '10yr': scheme['10YrReturn']
            }
          }));
        } else {
          console.log(`No suitable schemes found in basket '${basketName}' after filtering`);
        }
      } else {
        console.warn(`Basket '${basketName}' not found in response or has no schemes`);
      }
    } else {
      console.warn(`Invalid response from basket API: ${JSON.stringify(response.data)}`);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching mutual funds from basket API:', error);
    return [];
  }
}

/**
 * Map rating to risk level
 * @param {number} rating - Rating (1-5)
 * @returns {string} Risk level description
 */
function mapRatingToRiskLevel(rating) {
  switch(rating) {
    case 5:
      return 'Very Low';
    case 4:
      return 'Low';
    case 3:
      return 'Moderate';
    case 2:
      return 'High';
    case 1:
      return 'Very High';
    default:
      return 'Moderate';
  }
}

/**
 * Generate gold/silver product recommendations
 * @param {Object} assetAllocation - Asset allocation data
 * @param {number} portfolioSize - Portfolio size in INR
 * @returns {Object} Gold/silver product recommendations
 */
async function generateGoldSilverRecommendations(assetAllocation, portfolioSize) {
  console.log('generateGoldSilverRecommendations - Input:', JSON.stringify({
    assetAllocation,
    portfolioSize
  }, null, 2));

  try {
    const recommendations = {};
    
    // Safety check for assetClassAllocation
    if (!assetAllocation.assetClassAllocation) {
      console.error('Error: assetClassAllocation missing in generateGoldSilverRecommendations');
      return {};
    }
    
    // Check if goldSilver allocation exists
    if (!assetAllocation.assetClassAllocation.goldSilver) {
      console.log('Warning: goldSilver allocation missing in assetClassAllocation');
      return {};
    }
    
    const goldSilverAllocation = assetAllocation.assetClassAllocation.goldSilver;
    
    // Calculate amount allocated to gold/silver
    const goldSilverAmount = (portfolioSize * goldSilverAllocation) / 100;
    
    // Add a default product if none exists in the database
    const defaultGoldProducts = [
      { name: 'Gold ETF', description: 'Exchange-traded fund tracking gold prices', expectedReturn: '8-10% p.a.', risk: 'Moderate', lockInPeriod: 'None' },
      { name: 'Sovereign Gold Bond', description: 'Government bonds denominated in grams of gold', expectedReturn: '8-11% p.a.', risk: 'Moderate-Low', lockInPeriod: '5-8 years' }
    ];
    
    // Safety check for productTypeAllocation
    if (!assetAllocation.productTypeAllocation || !assetAllocation.productTypeAllocation.goldSilver) {
      console.log('Warning: productTypeAllocation.goldSilver missing, using default values');
      // Default allocation if not specified
      const defaultProductTypeAllocation = { etf: 70, physical: 30 };
      
      // ETF (default)
      recommendations.etf = {
        allocation: defaultProductTypeAllocation.etf,
        amount: (goldSilverAmount * defaultProductTypeAllocation.etf) / 100,
        products: productDatabase.goldSilver?.etf || defaultGoldProducts
      };
      
      // Physical (default)
      recommendations.physical = {
        allocation: defaultProductTypeAllocation.physical,
        amount: (goldSilverAmount * defaultProductTypeAllocation.physical) / 100,
        products: productDatabase.goldSilver?.physical || [
          { name: 'Physical Gold', description: 'Investment in physical gold bars or coins', expectedReturn: 'Variable', risk: 'Moderate', lockInPeriod: 'None' },
          { name: 'Digital Gold', description: 'Electronically held gold with physical delivery option', expectedReturn: 'Variable', risk: 'Moderate-Low', lockInPeriod: 'None' }
        ]
      };
      
      return recommendations;
    }
    
    // Normal flow when productTypeAllocation exists
    const productTypeAllocation = assetAllocation.productTypeAllocation.goldSilver;
    
    // ETF
    if (productTypeAllocation.etf > 0) {
      const etfAmount = (goldSilverAmount * productTypeAllocation.etf) / 100;
      recommendations.etf = {
        allocation: productTypeAllocation.etf,
        amount: etfAmount,
        products: productDatabase.goldSilver?.etf || defaultGoldProducts
      };
    }
    
    // Physical
    if (productTypeAllocation.physical > 0) {
      const physicalAmount = (goldSilverAmount * productTypeAllocation.physical) / 100;
      recommendations.physical = {
        allocation: productTypeAllocation.physical,
        amount: physicalAmount,
        products: productDatabase.goldSilver?.physical || [
          { name: 'Physical Gold', description: 'Investment in physical gold bars or coins', expectedReturn: 'Variable', risk: 'Moderate', lockInPeriod: 'None' },
          { name: 'Digital Gold', description: 'Electronically held gold with physical delivery option', expectedReturn: 'Variable', risk: 'Moderate-Low', lockInPeriod: 'None' }
        ]
      };
    }
    
    // If both are missing, add default ETF
    if (!recommendations.etf && !recommendations.physical) {
      recommendations.etf = {
        allocation: 100,
        amount: goldSilverAmount,
        products: productDatabase.goldSilver?.etf || defaultGoldProducts
      };
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error in generateGoldSilverRecommendations:', error);
    // Return empty recommendations as fallback
    return {};
  }
}

/**
 * Generate summary of product recommendations
 * @param {Object} recommendations - Product recommendations
 * @param {string} riskCategory - Client risk category
 * @returns {string} Summary of recommendations
 */
function generateRecommendationSummary(recommendations, riskCategory) {
  let summary = `Based on your ${riskCategory} risk profile, we have recommended a diversified portfolio of investment products.`;
  
  // Add equity summary
  if (recommendations.equity && Object.keys(recommendations.equity).length > 0) {
    summary += '\n\nFor equity allocation:';
    if (recommendations.equity.mutualFunds) {
      summary += `\n- Equity mutual funds focused on ${riskCategory === 'conservative' ? 'large-cap and dividend-yielding' : riskCategory === 'moderate' ? 'multi-cap and focused' : 'mid-cap, small-cap, and sectoral'} stocks.`;
    }
    if (recommendations.equity.pms) {
      summary += `\n- Portfolio Management Services (PMS) with a ${riskCategory === 'conservative' ? 'blue-chip' : riskCategory === 'moderate' ? 'multi-strategy' : 'concentrated growth'} approach.`;
    }
    if (recommendations.equity.aif) {
      summary += `\n- Alternative Investment Funds (AIF) with ${riskCategory === 'conservative' ? 'long-only value' : riskCategory === 'moderate' ? 'special situations' : 'long-short'} strategies.`;
    }
    if (recommendations.equity.unlistedStocks) {
      summary += `\n- Unlisted Stocks with high growth potential and pre-IPO opportunities for higher returns.`;
    }
  }
  
  // Add debt summary
  if (recommendations.debt && Object.keys(recommendations.debt).length > 0) {
    summary += '\n\nFor debt allocation:';
    if (recommendations.debt.mutualFunds) {
      summary += `\n- Debt mutual funds with ${riskCategory === 'conservative' ? 'liquid and ultra-short duration' : riskCategory === 'moderate' ? 'short duration and corporate bond' : 'credit risk and dynamic bond'} strategies.`;
    }
    if (recommendations.debt.direct) {
      summary += `\n- Direct debt investments in ${riskCategory === 'conservative' ? 'government securities' : riskCategory === 'moderate' ? 'AAA-rated corporate bonds' : 'AA-rated corporate bonds'}.`;
    }
    if (recommendations.debt.aif) {
      summary += `\n- Debt AIFs focused on ${riskCategory === 'conservative' ? 'structured credit' : riskCategory === 'moderate' ? 'real estate debt' : 'distressed assets'}.`;
    }
  }
  
  // Add gold/silver summary
  if (recommendations.goldSilver && Object.keys(recommendations.goldSilver).length > 0) {
    summary += '\n\nFor gold/silver allocation:';
    if (recommendations.goldSilver.etf) {
      summary += '\n- Gold and Silver ETFs for efficient exposure to precious metals.';
    }
    if (recommendations.goldSilver.physical) {
      summary += '\n- Physical gold and silver for long-term wealth preservation.';
    }
  }
  
  return summary;
}

module.exports = {
  recommendProducts
};
