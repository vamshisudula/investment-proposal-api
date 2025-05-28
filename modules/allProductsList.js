/**
 * All Products List Module
 * 
 * This module provides a unified interface to fetch all products across different categories:
 * - Mutual Funds: Fetched from real API
 * - Unlisted Stocks, PMS, Alternative Funds, Debt Papers: Mock data for now
 */

const axios = require('axios');

// API configurations
const MF_API_CONFIG = {
  baseUrl: 'https://i4edevmfnodeapis.azurewebsites.net/api/master-data/regular-scheme-list',
  apiKey: 'APIKEY-STRFQUJDRDEyMw==',
  timeout: 15000, // 15 seconds timeout
  retries: 2,     // Number of retry attempts
  retryDelay: 1000 // Delay between retries in ms
};

/**
 * Fetch all mutual funds from the API
 * @param {Object} filters - Filters for mutual funds search
 * @returns {Promise<Array>} Array of mutual funds
 */
async function fetchAllMutualFunds(filters = {}) {
  try {
    console.log('Fetching all mutual funds...');
    
    const payload = {
      amcCode: filters.amcCode || [],
      schemeType: filters.schemeType || [],
      category: filters.category || "",
      rating: filters.rating || "",
      returnInYr: filters.returnInYr || "1Y",
      divReInvstFlag: filters.divReInvstFlag || "",
      schemeName: filters.schemeName || "",
      sipMinInvestment: filters.sipMinInvestment || "",
      sortOrder: filters.sortOrder || "desc",
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 50
    };
    
    const headers = {
      'accept': '*/*',
      'Authorization': MF_API_CONFIG.apiKey,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(MF_API_CONFIG.baseUrl, payload, { 
      headers,
      timeout: MF_API_CONFIG.timeout
    });
    
    if (response.status === 200 && response.data) {
      console.log(`Successfully fetched ${response.data.length || 0} mutual funds`);
      return response.data;
    } else {
      console.error('Error fetching mutual funds: Unexpected response', response.status);
      return getMockMutualFunds();
    }
  } catch (error) {
    console.error('Error fetching mutual funds:', error.message);
    console.error('Error details:', error.response?.data || 'No response data');
    return getMockMutualFunds();
  }
}

/**
 * Get mock mutual fund data
 * @returns {Array} Mock mutual fund data
 */
function getMockMutualFunds() {
  console.log('Using mock mutual fund data');
  
  return [
    {
      schemeCode: "120503",
      schemeName: "Axis Bluechip Fund - Direct Plan - Growth",
      amcCode: "400010",
      amcName: "Axis Mutual Fund",
      category: "Equity - Large Cap",
      schemeType: "Open Ended",
      aum: 36518.91,
      expenseRatio: 0.54,
      sipMinimumAmount: 500,
      rating: 5,
      riskometer: "Very High",
      returns: {
        "1Y": 22.67,
        "3Y": 16.31,
        "5Y": 14.29
      }
    },
    {
      schemeCode: "119166",
      schemeName: "SBI Blue Chip Fund - Direct Plan - Growth",
      amcCode: "400022",
      amcName: "SBI Mutual Fund",
      category: "Equity - Large Cap",
      schemeType: "Open Ended",
      aum: 42105.37,
      expenseRatio: 0.65,
      sipMinimumAmount: 500,
      rating: 4,
      riskometer: "Very High",
      returns: {
        "1Y": 20.14,
        "3Y": 15.83,
        "5Y": 13.92
      }
    }
  ];
}

/**
 * Get all unlisted stocks
 * @returns {Array} Mock unlisted stock data
 */
function getAllUnlistedStocks() {
  return [
    {
      scriptId: "UNL001",
      scriptName: "MobiKwik",
      sector: "Fintech",
      lastRoundValuation: 700000000,
      faceValue: 10,
      marketPrice: 695,
      riskGrade: "High",
      foundedYear: 2009,
      companyDescription: "One MobiKwik Systems Private Limited is an Indian payment service provider founded in 2009. It provides a mobile phone-based payment system and digital wallet.",
      expectedIpo: "2025-2026"
    },
    {
      scriptId: "UNL002",
      scriptName: "Ola Electric",
      sector: "Electric Vehicles",
      lastRoundValuation: 5000000000,
      faceValue: 10,
      marketPrice: 875,
      riskGrade: "Very High",
      foundedYear: 2017,
      companyDescription: "Ola Electric Mobility Pvt Ltd is an Indian electric two-wheeler manufacturer. It's a subsidiary of ANI Technologies, which operates the Ola Cabs transportation network.",
      expectedIpo: "2025"
    },
    {
      scriptId: "UNL003",
      scriptName: "Zepto",
      sector: "Quick Commerce",
      lastRoundValuation: 1400000000,
      faceValue: 10,
      marketPrice: 420,
      riskGrade: "Very High",
      foundedYear: 2021,
      companyDescription: "Zepto is a quick commerce platform that delivers groceries and essentials in 10 minutes. It was founded by two 19-year-old Stanford dropouts.",
      expectedIpo: "2027-2028"
    }
  ];
}

/**
 * Get all PMS schemes
 * @returns {Array} Mock PMS scheme data
 */
function getAllPMSSchemes() {
  return [
    {
      schemeId: "PMS001",
      schemeName: "ASK Indian Entrepreneur Portfolio",
      fundManager: "ASK Investment Managers",
      strategy: "Multi Cap",
      benchmarkName: "Nifty 500 TRI",
      riskGrade: "Moderate-High",
      minInvestment: 5000000,
      exitLoad: "3% if redeemed within 1 year",
      returns: {
        "1Y": 24.31,
        "3Y": 18.75,
        "5Y": 15.92
      },
      schemeObjective: "To invest in companies that are run by entrepreneur owner managers with significant skin in the game, focusing on business longevity, growth, and quality management."
    },
    {
      schemeId: "PMS002",
      schemeName: "Marcellus Consistent Compounders",
      fundManager: "Marcellus Investment Managers",
      strategy: "Large & Mid Cap",
      benchmarkName: "BSE 500 TRI",
      riskGrade: "Moderate",
      minInvestment: 5000000,
      exitLoad: "2% if redeemed within 1 year",
      returns: {
        "1Y": 26.05,
        "3Y": 22.17,
        "5Y": 17.61
      },
      schemeObjective: "To invest in a concentrated portfolio of 10-15 companies with clean accounting, superior capital allocation and strong competitive advantages."
    },
    {
      schemeId: "PMS003",
      schemeName: "Sameeksha Capital Equity Fund",
      fundManager: "Sameeksha Capital",
      strategy: "Multi Cap",
      benchmarkName: "Nifty 500 TRI",
      riskGrade: "High",
      minInvestment: 5000000,
      exitLoad: "1% if redeemed within 1 year",
      returns: {
        "1Y": 28.12,
        "3Y": 19.33,
        "5Y": 16.47
      },
      schemeObjective: "To invest in high quality businesses with sustainable competitive advantages and long-term growth prospects at reasonable valuations."
    }
  ];
}

/**
 * Get all alternative funds
 * @returns {Array} Mock alternative fund data
 */
function getAllAlternativeFunds() {
  return [
    {
      fundId: "AIF001",
      fundName: "Edelweiss Discovery Fund - Series 1",
      category: "Category III AIF",
      strategy: "Long-Short",
      fundManager: "Edelweiss Asset Management",
      riskGrade: "Very High",
      minInvestment: 10000000,
      lockInPeriod: "3 Years",
      returns: {
        "1Y": 18.74,
        "3Y": 15.21
      },
      fundObjective: "To generate absolute returns through a combination of long positions in high-conviction stocks and short positions to hedge market volatility."
    },
    {
      fundId: "AIF002",
      fundName: "IIFL Special Opportunities Fund - Series 10",
      category: "Category II AIF",
      strategy: "Pre-IPO & IPO",
      fundManager: "IIFL Asset Management",
      riskGrade: "High",
      minInvestment: 10000000,
      lockInPeriod: "4 Years",
      returns: {
        "1Y": 16.92,
        "3Y": 14.38
      },
      fundObjective: "To invest in pre-IPO and IPO opportunities across sectors, focusing on companies with strong business models and reasonable valuations."
    },
    {
      fundId: "AIF003",
      fundName: "Blume Ventures Fund IV",
      category: "Category I AIF",
      strategy: "Venture Capital",
      fundManager: "Blume Ventures",
      riskGrade: "Very High",
      minInvestment: 25000000,
      lockInPeriod: "7-8 Years",
      returns: {
        "Since Inception": 22.05
      },
      fundObjective: "To invest in early-stage technology startups with innovative business models and potential for exponential growth."
    }
  ];
}

/**
 * Get all debt papers
 * @returns {Array} Mock debt paper data
 */
function getAllDebtPapers() {
  return [
    {
      instrumentId: "DBT001",
      instrumentName: "Northern Arc Capital NCD Series I",
      issuer: "Northern Arc Capital",
      instrumentType: "Non-Convertible Debenture",
      maturityDate: "15 Apr 2026",
      rating: "AA",
      yield: "9.25%",
      faceValue: 10000,
      minInvestment: 200000,
      interestPayment: "Annual",
      listed: true,
      riskGrade: "Moderate",
      issuerDescription: "Northern Arc Capital is a leading financial services platform in India focused on underserved individuals and businesses",
      issueSize: "500 Crore"
    },
    {
      instrumentId: "DBT002",
      instrumentName: "Shriram Transport Finance NCD Series II",
      issuer: "Shriram Transport Finance",
      instrumentType: "Non-Convertible Debenture",
      maturityDate: "22 Jul 2027",
      rating: "AA+",
      yield: "8.75%",
      faceValue: 1000,
      minInvestment: 100000,
      interestPayment: "Quarterly",
      listed: true,
      riskGrade: "Low-Moderate",
      issuerDescription: "Shriram Transport Finance is a leading NBFC in commercial vehicle financing sector",
      issueSize: "750 Crore"
    },
    {
      instrumentId: "DBT003",
      instrumentName: "Piramal Capital Secured NCD 2025",
      issuer: "Piramal Capital & Housing Finance",
      instrumentType: "Secured Non-Convertible Debenture",
      maturityDate: "10 Mar 2025",
      rating: "AA-",
      yield: "9.50%",
      faceValue: 1000,
      minInvestment: 150000,
      interestPayment: "Semi-Annual",
      listed: true,
      riskGrade: "Moderate",
      issuerDescription: "Piramal Capital & Housing Finance is a diversified financial services conglomerate with presence across real estate and non-real estate lending",
      issueSize: "400 Crore"
    }
  ];
}

/**
 * Get all products from all categories
 * @param {string} category - Optional category filter (mutualFunds, unlistedStocks, pms, alternativeFunds, debtPapers)
 * @param {Object} filters - Additional filters for search
 * @returns {Promise<Object>} All products by category
 */
async function getAllProducts(category = null, filters = {}) {
  try {
    let result = {};
    
    // If category is specified, only fetch that category
    if (category) {
      switch (category.toLowerCase()) {
        case 'mutualfunds':
          result.mutualFunds = await fetchAllMutualFunds(filters);
          break;
        case 'unlistedstocks':
          result.unlistedStocks = getAllUnlistedStocks();
          break;
        case 'pms':
          result.pms = getAllPMSSchemes();
          break;
        case 'alternativefunds':
          result.alternativeFunds = getAllAlternativeFunds();
          break;
        case 'debtpapers':
          result.debtPapers = getAllDebtPapers();
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }
    } else {
      // Fetch all categories
      const [mutualFunds, unlistedStocks, pmsSchemes, alternativeFunds, debtPapers] = await Promise.all([
        fetchAllMutualFunds(filters),
        Promise.resolve(getAllUnlistedStocks()),
        Promise.resolve(getAllPMSSchemes()),
        Promise.resolve(getAllAlternativeFunds()),
        Promise.resolve(getAllDebtPapers())
      ]);
      
      result = {
        mutualFunds,
        unlistedStocks,
        pmsSchemes,
        alternativeFunds,
        debtPapers
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
}

/**
 * Search products across all categories
 * @param {string} searchTerm - Search term
 * @param {Array} categories - Categories to search in (default: all)
 * @returns {Promise<Object>} Search results by category
 */
async function searchProducts(searchTerm, categories = ['mutualFunds', 'unlistedStocks', 'pms', 'alternativeFunds', 'debtPapers']) {
  try {
    // Normalize search term
    const normalizedSearchTerm = searchTerm.toLowerCase();
    
    // Get all products
    const allProducts = await getAllProducts();
    
    // Filter results based on search term
    const results = {};
    
    if (categories.includes('mutualFunds')) {
      results.mutualFunds = allProducts.mutualFunds.filter(fund => 
        fund.schemeName.toLowerCase().includes(normalizedSearchTerm) || 
        fund.amcName.toLowerCase().includes(normalizedSearchTerm) ||
        fund.category.toLowerCase().includes(normalizedSearchTerm)
      );
    }
    
    if (categories.includes('unlistedStocks')) {
      results.unlistedStocks = allProducts.unlistedStocks.filter(stock => 
        stock.scriptName.toLowerCase().includes(normalizedSearchTerm) || 
        stock.sector.toLowerCase().includes(normalizedSearchTerm) ||
        stock.companyDescription.toLowerCase().includes(normalizedSearchTerm)
      );
    }
    
    if (categories.includes('pms')) {
      results.pms = allProducts.pmsSchemes.filter(scheme => 
        scheme.schemeName.toLowerCase().includes(normalizedSearchTerm) || 
        scheme.fundManager.toLowerCase().includes(normalizedSearchTerm) ||
        scheme.strategy.toLowerCase().includes(normalizedSearchTerm) ||
        scheme.schemeObjective.toLowerCase().includes(normalizedSearchTerm)
      );
    }
    
    if (categories.includes('alternativeFunds')) {
      results.alternativeFunds = allProducts.alternativeFunds.filter(fund => 
        fund.fundName.toLowerCase().includes(normalizedSearchTerm) || 
        fund.fundManager.toLowerCase().includes(normalizedSearchTerm) ||
        fund.category.toLowerCase().includes(normalizedSearchTerm) ||
        fund.strategy.toLowerCase().includes(normalizedSearchTerm) ||
        fund.fundObjective.toLowerCase().includes(normalizedSearchTerm)
      );
    }
    
    if (categories.includes('debtPapers')) {
      results.debtPapers = allProducts.debtPapers.filter(paper => 
        paper.instrumentName.toLowerCase().includes(normalizedSearchTerm) || 
        paper.issuer.toLowerCase().includes(normalizedSearchTerm) ||
        paper.instrumentType.toLowerCase().includes(normalizedSearchTerm) ||
        paper.issuerDescription.toLowerCase().includes(normalizedSearchTerm)
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
}

module.exports = {
  fetchAllMutualFunds,
  getAllUnlistedStocks,
  getAllPMSSchemes,
  getAllAlternativeFunds,
  getAllDebtPapers,
  getAllProducts,
  searchProducts
};
