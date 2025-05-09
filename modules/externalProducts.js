/**
 * External Products Module
 * 
 * This module handles fetching product data from external APIs for:
 * - Unlisted Stocks (IVP001)
 * - Alternative Funds (IVP005)
 * - PMS (IVP004)
 */

const axios = require('axios');

// API configuration
const API_CONFIG = {
  baseUrl: 'https://nfddevapi.azurewebsites.net/api/product/getproductsbyproductcode',
  apiKey: 'api_key_94f6b0f2-1a3e-4d57-bc4f-dafce73a92c5',
  productCodes: {
    UNLISTED_STOCKS: 'IVP001',
    ALTERNATIVE_FUNDS: 'IVP005',
    PMS: 'IVP004'
  },
  returns: '1 Month',
  timeout: 10000, // 10 seconds timeout
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

module.exports = {
  fetchUnlistedStocks,
  fetchAlternativeFunds,
  fetchPMS,
  formatProductData
};
