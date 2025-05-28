/**
 * External Products Module
 * 
 * This module handles fetching product data from external APIs for:
 * - Unlisted Stocks (IVP001)
 * - Alternative Funds (IVP005)
 * - PMS (IVP004)
 * - Listed Stocks (Mutual Fund API)
 */

const axios = require('axios');
require('dotenv').config();

// API configuration
const API_CONFIG = {
  baseUrl: process.env.PRODUCTS_API_URL || 'https://nfddevapi.azurewebsites.net/api/product/getproductsbyproductcode',
  apiKey: process.env.EXTERNAL_PRODUCTS_API_KEY || 'api_key_94f6b0f2-1a3e-4d57-bc4f-dafce73a92c5',
  productCodes: {
    UNLISTED_STOCKS: 'IVP001',
    ALTERNATIVE_FUNDS: 'IVP005',
    PMS: 'IVP004',
    DEBT_PAPERS: 'IVP002'
  },
  returns: '1 Month',
  timeout: 10000, // 10 seconds timeout
  retries: 2,     // Number of retry attempts
  retryDelay: 1000 // Delay between retries in ms
};

// Listed Stocks API configuration
const LISTED_STOCKS_API_CONFIG = {
  baseUrl: process.env.LISTED_STOCKS_API_URL || 'https://i4eprodmfnodeapis.azurewebsites.net/api/master-data/regular-scheme-list',
  apiKey: process.env.LISTED_STOCKS_API_KEY || 'APIKEY-STRFQUJDRDEyMw==',
  timeout: 15000, // 15 seconds timeout
  retries: 2,     // Number of retry attempts
  retryDelay: 1000 // Delay between retries in ms
};

/**
 * Fetch products from external API by product code with retry logic
 * @param {string} productCode - Product code (e.g., 'IVP001', 'IVP004', 'IVP005')
 * @param {string} returns - Return period (e.g., '1 Month', '3 Months', '1 Year')
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Array>} Array of products
 */
async function fetchProductsByCode(productCode, returns = '1 Month', retryCount = 0) {
  try {
    console.log(`Fetching products for product code: ${productCode}${retryCount > 0 ? ` (Retry attempt: ${retryCount})` : ''}`);
    
    // Request payload - different for each product type
    let payload;
    
    if (productCode === API_CONFIG.productCodes.UNLISTED_STOCKS) {
      // For Unlisted Stocks, include product_code and account_id as per example
      payload = {
        product_code: productCode,
        account_id: "674a9fc63624e335735c0161",
        returns: "1 Month",
        product_id: "66ff949c983a4af4b75da15e"
      };
    } else {
      // For other product types, include returns
      payload = {
        product_code: productCode,
        returns: returns
      };
    }
    
    // Request headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': API_CONFIG.apiKey
    };
    
    // Make API request with timeout
    const response = await axios.post(API_CONFIG.baseUrl, payload, { 
      headers,
      timeout: API_CONFIG.timeout
    });
    
    // Check if response is valid
    if (response.status === 200 && response.data) {
      // Handle different response formats
      if (productCode === API_CONFIG.productCodes.PMS && response.data.schemes) {
        // For PMS, the response has a 'schemes' array
        console.log(`Successfully fetched ${response.data.schemes.length || 0} PMS schemes`);
        return response.data.schemes;
      } else if (productCode === API_CONFIG.productCodes.UNLISTED_STOCKS && response.data.products) {
        // For Unlisted Stocks, the response has a 'products' array
        console.log(`Successfully fetched ${response.data.products.length || 0} Unlisted Stocks`);
        return response.data.products;
      } else if (Array.isArray(response.data)) {
        // For other products that return an array directly
        console.log(`Successfully fetched ${response.data.length || 0} products for ${productCode}`);
        return response.data;
      } else {
        // For other response formats
        console.log(`Successfully fetched data for ${productCode}`);
        return response.data;
      }
    } else {
      console.error(`Error fetching products for ${productCode}: Unexpected response`, response.status);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching products for ${productCode}:`, error.message);
    console.error('Error details:', error.response?.data || 'No response data');
    
    // Implement retry logic
    if (retryCount < API_CONFIG.retries) {
      console.log(`Retrying request for ${productCode} in ${API_CONFIG.retryDelay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      
      // Retry the request
      return fetchProductsByCode(productCode, returns, retryCount + 1);
    }
    
    // If all retries failed or no retries configured, return empty array
    console.log(`All retry attempts failed for ${productCode}. Using fallback data.`);
    return [];
  }
}

/**
 * Get mock product data when API fails
 * @param {string} productCode - Product code
 * @returns {Array} Mock product data
 */
function getMockProductData(productCode) {
  console.log(`Using mock data for ${productCode}`);
  
  // Mock data in the exact format as the API response
  const mockData = {
    [API_CONFIG.productCodes.DEBT_PAPERS]: [
      {
        _id: '675fc866a647e3fe623641ee',
        account_id: '674a9fc63624e335735c0161',
        manufacturer_id: {
          _id: '675fc70ea647e3fe62364183',
          manufacturer_name: 'Northern Arc Capital'
        },
        product_id: '66ff94cb983a4af4b75da16b',
        instrument_name: 'Northern Arc Capital NCD Series I',
        instrument_type: 'Non-Convertible Debenture',
        maturity_date: '15 Apr 2026',
        rating: 'AA',
        yield: '9.25%',
        face_value: 10000,
        min_investment: 200000,
        interest_payment: 'Annual',
        listed: true,
        risk_grade: 'Moderate',
        issuer_description: 'Northern Arc Capital is a leading financial services platform in India focused on underserved individuals and businesses',
        issue_size: '500 Crore'
      },
      {
        _id: '675fc866a647e3fe623641ef',
        account_id: '674a9fc63624e335735c0161',
        manufacturer_id: {
          _id: '675fc70ea647e3fe62364184',
          manufacturer_name: 'Shriram Transport Finance'
        },
        product_id: '66ff94cb983a4af4b75da16c',
        instrument_name: 'Shriram Transport Finance NCD Series II',
        instrument_type: 'Non-Convertible Debenture',
        maturity_date: '22 Jul 2027',
        rating: 'AA+',
        yield: '8.75%',
        face_value: 1000,
        min_investment: 100000,
        interest_payment: 'Quarterly',
        listed: true,
        risk_grade: 'Low-Moderate',
        issuer_description: 'Shriram Transport Finance is a leading NBFC in commercial vehicle financing sector',
        issue_size: '750 Crore'
      },
      {
        _id: '675fc866a647e3fe623641eg',
        account_id: '674a9fc63624e335735c0161',
        manufacturer_id: {
          _id: '675fc70ea647e3fe62364185',
          manufacturer_name: 'Piramal Capital & Housing Finance'
        },
        product_id: '66ff94cb983a4af4b75da16d',
        instrument_name: 'Piramal Capital Secured NCD 2025',
        instrument_type: 'Secured Non-Convertible Debenture',
        maturity_date: '10 Mar 2025',
        rating: 'AA-',
        yield: '9.50%',
        face_value: 1000,
        min_investment: 150000,
        interest_payment: 'Semi-Annual',
        listed: true,
        risk_grade: 'Moderate',
        issuer_description: 'Piramal Capital & Housing Finance is a diversified financial services conglomerate with presence across real estate and non-real estate lending',
        issue_size: '400 Crore'
      }
    ],
    [API_CONFIG.productCodes.PMS]: [
      {
        _id: '675fc866a647e3fe623641ed',
        account_id: '674a9fc63624e335735c0161',
        manufacturer_id: {
          _id: '675fc70ea647e3fe62364182',
          manufacturer_name: 'Mansi Share & Stock Advisors Pvt Ltd'
        },
        product_id: '66ff94cb983a4af4b75da16a',
        scheme_name: 'Seven Island',
        scheme_benchmark_name: 'S&P BSE 500 Total Return Index',
        scheme_code: 'SIL011',
        scheme_classification: 'Mid Cap',
        scheme_inception_date: '15 Jan 2022',
        scheme_risk_grade: 'Moderate-High',
        scheme_objective: 'To invest in a portfolio of mid-cap companies with strong growth potential',
        scheme_expense_ratio: 1.8,
        scheme_exit_load: '1 Year: 2%',
        scheme_min_investment: 5000000,
        scheme_plan_type: 'Silver',
        active_returns_1_month: '2000',
        fund_managers: [
          {
            fund_manager_id: '1f01ce7e-a5ae-4d26-ab7d-e6c9fe9305f0',
            fund_manager_name: 'Niranjan',
            fund_manager_aum: '10000000',
            fund_manager_description: 'Experienced fund manager with focus on mid-cap stocks'
          }
        ]
      },
      {
        _id: '6756cda21b6a40b5b92c947d',
        account_id: '674a9fc63624e335735c0161',
        manufacturer_id: {
          _id: '6756ccd818402876c14596b6',
          manufacturer_name: 'Motilal Oswal Asset Management'
        },
        product_id: '66ff94cb983a4af4b75da16a',
        scheme_name: 'Northern Arc Income Builder Fund Series II',
        scheme_code: 'NAIB-1',
        scheme_classification: 'Large Cap',
        scheme_inception_date: '31 Aug 2023',
        scheme_exit_load: 'None',
        scheme_benchmark_name: 'CRISIL Composite Bond Index',
        scheme_risk_grade: 'Aggressive',
        scheme_objective: 'To invest in a mix of microfinance, small business loan finance, affordable housing finance, commercial vehicle finance, corporate finance and agri-business finance debt with Market Linked Debenture and Senior Secured Debt to earn higher risk-adjusted returns',
        scheme_expense_ratio: 1.5,
        scheme_min_investment: 5000000,
        scheme_plan_type: 'Gold',
        active_returns_1_month: '1000',
        active_returns_1_year: '100000',
        fund_managers: [
          {
            fund_manager_id: '81c5ee56-97db-42b6-a551-741cb2229ddc',
            fund_manager_name: 'Vijay Chouhan',
            fund_manager_aum: '10000',
            fund_manager_description: 'Up to 32% higher throughput, improved horizontal scaling, expanded queryable encryption capabilities, and more.'
          }
        ]
      }
    ],
    [API_CONFIG.productCodes.ALTERNATIVE_FUNDS]: [
      {
        scheme_name: 'Special Situations AIF',
        scheme_objective: 'Focuses on special situations and turnaround opportunities in the market',
        active_returns_1_month: '1670',
        scheme_risk_grade: 'High',
        scheme_exit_load: '3 years',
        scheme_min_investment: 10000000,
        fund_manager: 'ICICI Prudential AMC',
        scheme_classification: 'Special Situations'
      },
      {
        scheme_name: 'Long-Short Equity AIF',
        scheme_objective: 'Long-short strategy to capture market opportunities while hedging downside risk',
        active_returns_1_month: '1420',
        scheme_risk_grade: 'Moderate-High',
        scheme_exit_load: '3 years',
        scheme_min_investment: 10000000,
        fund_manager: 'Edelweiss Asset Management',
        scheme_classification: 'Long-Short Equity'
      }
    ],
    [API_CONFIG.productCodes.UNLISTED_STOCKS]: [
      {
        _id: '67614fd53955c7fc851ded97',
        account_id: '674a9fc63624e335735c0161',
        script_name: 'Cochin International Airport Limited',
        isin_number: 'INE02KH01019',
        face_value: '100',
        is_primary_script: false,
        documents: [
          {
            id: 1,
            document_name: 'Script Logo',
            path: 'https://ivdevstroage.blob.core.windows.net/sample-files/cial-logo(1).jpg',
            is_uploaded: true,
            is_visible: true
          }
        ],
        sector_name: 'Aviation'
      },
      {
        _id: '67614ff03955c7fc851dedc6',
        account_id: '674a9fc63624e335735c0161',
        script_name: 'SBI MUTUAL FUND',
        isin_number: 'INE640G01020',
        face_value: '10',
        is_primary_script: false,
        documents: [
          {
            id: 1,
            document_name: 'Script Logo',
            path: 'https://ivdevstroage.blob.core.windows.net/sample-files/sbi_mutual_fund1694777085073.png',
            is_uploaded: true,
            is_visible: true
          }
        ],
        sector_name: 'Finance'
      },
      {
        _id: '676150063955c7fc851dedca',
        account_id: '674a9fc63624e335735c0161',
        script_name: 'Indian Potash',
        isin_number: 'INE863S01015',
        face_value: '10',
        is_primary_script: true,
        documents: [
          {
            id: 1,
            document_name: 'Script Logo',
            path: 'https://ivdevstroage.blob.core.windows.net/sample-files/Indian_Potash_Limited_Logo.jpg',
            is_uploaded: true,
            is_visible: true
          }
        ],
        sector_name: 'Agriculture'
      }
    ]
  };
  
  return mockData[productCode] || [];
}

/**
 * Fetch unlisted stocks products
 * @param {string} returns - Return period (e.g., '1 Month', '3 Months', '1 Year')
 * @returns {Promise<Array>} Array of unlisted stocks products
 */
async function fetchUnlistedStocks(returns = '1 Month') {
  try {
    // For unlisted stocks, we don't use the returns parameter in the API call
    // as it has a different structure
    const data = await fetchProductsByCode(API_CONFIG.productCodes.UNLISTED_STOCKS, returns);
    
    // Check if we got data back and it's not empty
    if (data && data.length > 0) {
      console.log(`Successfully processed ${data.length} unlisted stocks`);
      return data;
    } else {
      console.log('No unlisted stocks data returned from API, using mock data');
      return getMockProductData(API_CONFIG.productCodes.UNLISTED_STOCKS);
    }
  } catch (error) {
    console.error('Error in fetchUnlistedStocks:', error);
    return getMockProductData(API_CONFIG.productCodes.UNLISTED_STOCKS);
  }
}

/**
 * Fetch alternative funds products
 * @param {string} returns - Return period (e.g., '1 Month', '3 Months', '1 Year')
 * @returns {Promise<Array>} Array of alternative funds products
 */
async function fetchAlternativeFunds(returns = '1 Month') {
  try {
    const data = await fetchProductsByCode(API_CONFIG.productCodes.ALTERNATIVE_FUNDS, returns);
    return data.length > 0 ? data : getMockProductData(API_CONFIG.productCodes.ALTERNATIVE_FUNDS);
  } catch (error) {
    console.error('Error in fetchAlternativeFunds:', error);
    return getMockProductData(API_CONFIG.productCodes.ALTERNATIVE_FUNDS);
  }
}

/**
 * Fetch PMS products
 * @param {string} returns - Return period (e.g., '1 Month', '3 Months', '1 Year')
 * @returns {Promise<Array>} Array of PMS products
 */
async function fetchPMS(returns = '1 Month') {
  try {
    const data = await fetchProductsByCode(API_CONFIG.productCodes.PMS, returns);
    return data.length > 0 ? data : getMockProductData(API_CONFIG.productCodes.PMS);
  } catch (error) {
    console.error('Error in fetchPMS:', error);
    return getMockProductData(API_CONFIG.productCodes.PMS);
  }
}

/**
 * Format raw product data into a standardized format
 * @param {Array} rawProducts - Raw product data from API
 * @param {string} productType - Type of product ('unlistedStocks', 'alternativeFunds', 'pms')
 * @returns {Array} Formatted product data
 */
function formatProductData(rawProducts, productType) {
  if (!rawProducts || !Array.isArray(rawProducts)) {
    console.warn(`No valid products found for ${productType}`);
    return [];
  }
  
  try {
    return rawProducts.map(product => {
      // Base formatted product with default values
      const formattedProduct = {
        name: 'Unknown Product',
        description: 'No description available',
        expectedReturn: 'Variable',
        risk: 'Moderate',
        lockInPeriod: 'Variable',
        minimumInvestment: 'Not specified',
        // Include original data for reference
        originalData: product
      };
      
      // Format based on product type
      switch (productType) {
        case 'debtPapers':
          // Format Debt Papers data
          formattedProduct.name = product.instrument_name || 'Unknown Debt Instrument';
          formattedProduct.description = product.issuer_description || 'No description available';
          formattedProduct.expectedReturn = product.yield || 'Variable';
          formattedProduct.risk = product.risk_grade || 'Moderate';
          formattedProduct.lockInPeriod = `Until ${product.maturity_date}` || 'Variable';
          formattedProduct.minimumInvestment = product.min_investment ? 
            `₹${product.min_investment.toLocaleString('en-IN')}` : 'Not specified';
          
          // Add debt paper-specific fields
          formattedProduct.instrumentType = product.instrument_type || 'Debt Instrument';
          formattedProduct.maturityDate = product.maturity_date || 'Not specified';
          formattedProduct.rating = product.rating || 'Not rated';
          formattedProduct.faceValue = product.face_value ? 
            `₹${product.face_value.toLocaleString('en-IN')}` : 'Not specified';
          formattedProduct.interestPayment = product.interest_payment || 'Not specified';
          formattedProduct.issuer = product.manufacturer_id?.manufacturer_name || 'Unknown Issuer';
          formattedProduct.issueSize = product.issue_size || 'Not specified';
          formattedProduct.listed = product.listed ? 'Yes' : 'No';
          break;
          
        case 'pms':
          // Format PMS data based on the exact structure provided
          formattedProduct.name = product.scheme_name || 'Unknown PMS';
          formattedProduct.description = product.scheme_objective || 'No description available';
          formattedProduct.expectedReturn = product.active_returns_1_month ? 
            `${product.active_returns_1_month}` : 'Variable';
          formattedProduct.risk = product.scheme_risk_grade || 'Moderate';
          formattedProduct.lockInPeriod = product.scheme_exit_load || 'Variable';
          formattedProduct.minimumInvestment = product.scheme_min_investment ? 
            `${product.scheme_min_investment}` : 'Not specified';
          
          // Add PMS-specific fields
          if (product.scheme_benchmark_name) {
            formattedProduct.benchmark = product.scheme_benchmark_name;
          }
          
          if (product.scheme_classification) {
            formattedProduct.strategy = product.scheme_classification;
          }
          
          if (product.fund_managers && product.fund_managers.length > 0) {
            formattedProduct.fundManager = product.fund_managers[0].fund_manager_name || 'Not specified';
          } else if (product.manufacturer_id && product.manufacturer_id.manufacturer_name) {
            formattedProduct.fundManager = product.manufacturer_id.manufacturer_name;
          }
          break;
          
        case 'alternativeFunds':
          // Format Alternative Funds data
          formattedProduct.name = product.name || product.scheme_name || product.product_name || 'Unknown Fund';
          formattedProduct.description = product.description || product.scheme_objective || 'No description available';
          formattedProduct.expectedReturn = product.returns || product.active_returns_1_month || 'Variable';
          formattedProduct.risk = product.risk_level || product.scheme_risk_grade || 'Moderate';
          formattedProduct.lockInPeriod = product.lock_in_period || product.scheme_exit_load || 'Variable';
          formattedProduct.minimumInvestment = product.minimum_investment || product.scheme_min_investment || 'Not specified';
          formattedProduct.fundManager = product.fund_manager || 'Not specified';
          formattedProduct.strategy = product.strategy || product.scheme_classification || 'Not specified';
          break;
          
        case 'unlistedStocks':
          // Format Unlisted Stocks data based on the exact structure provided
          formattedProduct.name = product.script_name || 'Unknown Stock';
          formattedProduct.description = `Unlisted stock with ISIN: ${product.isin_number || 'Not available'}`;
          formattedProduct.expectedReturn = 'Variable'; // No returns data in API response
          formattedProduct.risk = 'High'; // Default risk for unlisted stocks
          formattedProduct.companyName = product.script_name;
          formattedProduct.sector = product.sector_name || 'Not specified';
          formattedProduct.faceValue = product.face_value || 'Not specified';
          
          // Add logo if available
          if (product.documents && product.documents.length > 0) {
            const logoDoc = product.documents.find(doc => doc.document_name === 'Script Logo' && doc.is_uploaded);
            if (logoDoc && logoDoc.path) {
              formattedProduct.logoUrl = logoDoc.path;
            }
          }
          break;
      }
      
      return formattedProduct;
    });
  } catch (error) {
    console.error(`Error formatting ${productType} data:`, error);
    return [];
  }
}

/**
 * Fetch debt papers
 * @param {string} returns - Return period (e.g., '1 Month', '3 Months', '1 Year')
 * @returns {Promise<Array>} Array of debt paper products
 */
async function fetchDebtPapers(returns = '1 Month') {
  try {
    console.log('Fetching debt papers...');
    const debtPaperProducts = await fetchProductsByCode(API_CONFIG.productCodes.DEBT_PAPERS, returns);
    
    if (debtPaperProducts && debtPaperProducts.length > 0) {
      // Format the data if needed
      return formatProductData(debtPaperProducts, 'debtPapers');
    } else {
      console.log('No debt paper products found or API failed. Using mock data.');
      return getMockProductData(API_CONFIG.productCodes.DEBT_PAPERS);
    }
  } catch (error) {
    console.error('Error fetching debt papers:', error.message);
    return getMockProductData(API_CONFIG.productCodes.DEBT_PAPERS);
  }
}

/**
 * Fetch listed stocks from the mutual fund API
 * @param {Object} options - Options for filtering stocks
 * @param {number} options.pageNumber - Page number for pagination (default: 1)
 * @param {number} options.pageSize - Number of items per page (default: 20)
 * @param {string} options.category - Filter by category (e.g., 'Small-Cap', 'Large-Cap')
 * @param {number} options.returnInYr - Return period in years (default: 5)
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Array>} Array of listed stocks
 */
async function fetchListedStocks(options = {}, retryCount = 0) {
  try {
    console.log(`Fetching listed stocks${retryCount > 0 ? ` (Retry attempt: ${retryCount})` : ''}`);
    
    // Default options
    const defaultOptions = {
      pageNumber: 1,
      pageSize: 20,
      category: '',
      returnInYr: 5
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Request payload
    const payload = {
      amcCode: [],
      category: mergedOptions.category,
      rating: '',
      divReInvstFlag: '',
      pageNumber: mergedOptions.pageNumber,
      pageSize: mergedOptions.pageSize,
      returnInYr: mergedOptions.returnInYr,
      schemeName: '',
      schemeType: [],
      sipMinInvestment: '',
      sortOrder: 0
    };
    
    // Request headers
    const headers = {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LISTED_STOCKS_API_CONFIG.apiKey}`
    };
    
    // Make API request with timeout
    const response = await axios.post(LISTED_STOCKS_API_CONFIG.baseUrl, payload, { 
      headers,
      timeout: LISTED_STOCKS_API_CONFIG.timeout
    });
    
    // Check if response is valid
    if (response.status === 200 && response.data && response.data.responseCode === 200) {
      if (response.data.data && response.data.data.schemeList && Array.isArray(response.data.data.schemeList)) {
        console.log(`Successfully fetched ${response.data.data.schemeList.length} listed stocks`);
        console.log(`Total available: ${response.data.data.totalCount || 'unknown'}`);
        return response.data.data.schemeList;
      } else {
        console.error('Invalid response format from listed stocks API');
        return [];
      }
    } else {
      console.error(`Error fetching listed stocks: Unexpected response`, response.status);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching listed stocks:`, error.message);
    console.error('Error details:', error.response?.data || 'No response data');
    
    // Implement retry logic
    if (retryCount < LISTED_STOCKS_API_CONFIG.retries) {
      console.log(`Retrying request for listed stocks in ${LISTED_STOCKS_API_CONFIG.retryDelay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, LISTED_STOCKS_API_CONFIG.retryDelay));
      
      // Retry the request
      return fetchListedStocks(options, retryCount + 1);
    }
    
    // If all retries failed or no retries configured, return empty array
    console.error('All retry attempts failed. Returning empty data.');
    return [];
  }
}

/**
 * Format listed stocks data into a standardized format
 * @param {Array} rawStocks - Raw listed stocks data from API
 * @returns {Array} Formatted listed stocks data
 */
function formatListedStocksData(rawStocks) {
  try {
    if (!Array.isArray(rawStocks) || rawStocks.length === 0) {
      console.warn('No listed stocks data to format, returning empty array');
      return [];
    }
    
    // Format all listed stocks
    return rawStocks.map(stock => {
      // Map category to risk level
      let risk = 'Moderate';
      let expectedReturn = '10-12%';
      
      // Determine risk and expected return based on category
      if (stock.DPCategoryName) {
        if (stock.DPCategoryName.includes('Large-Cap')) {
          risk = 'Moderate';
          expectedReturn = '10-12%';
        } else if (stock.DPCategoryName.includes('Mid-Cap')) {
          risk = 'Moderate-High';
          expectedReturn = '12-15%';
        } else if (stock.DPCategoryName.includes('Small-Cap')) {
          risk = 'High';
          expectedReturn = '15-18%';
        } else if (stock.DPCategoryName.includes('Multi-Cap') || stock.DPCategoryName.includes('Flexi-Cap')) {
          risk = 'Moderate-High';
          expectedReturn = '12-14%';
        } else if (stock.DPCategoryName.includes('Liquid') || stock.DPCategoryName.includes('Money Market')) {
          risk = 'Very Low';
          expectedReturn = '5-7%';
        } else if (stock.DPCategoryName.includes('Debt')) {
          risk = 'Low';
          expectedReturn = '7-9%';
        }
      }
      
      // Use actual returns if available
      if (stock.OneYrReturn) {
        expectedReturn = `${Math.round(stock.OneYrReturn)}%`;
      }
      
      return {
        name: stock.SchemeName || 'Unknown Stock',
        description: `${stock.SchemeType || 'Equity'} fund in ${stock.DPCategoryName || 'Unknown'} category`,
        expectedReturn: expectedReturn,
        risk: risk,
        category: stock.DPCategoryName || 'Unknown',
        minInvestment: 5000, // Default minimum investment
        dataSource: 'Listed Stocks API',
        isin: stock.ISIN,
        nav: stock.NAV,
        navDate: stock.NAVDate,
        oneYearReturn: stock.OneYrReturn,
        threeYearReturn: stock.ThreeYrReturn,
        rating: stock.MRRatingOverall,
        fundSize: stock.FundSize,
        schemeType: stock.SchemeType
      };
    });
  } catch (error) {
    console.error('Error formatting listed stocks data:', error);
    return [];
  }
}

module.exports = {
  fetchUnlistedStocks,
  fetchAlternativeFunds,
  fetchPMS,
  fetchDebtPapers,
  formatProductData,
  fetchListedStocks,
  formatListedStocksData
};
