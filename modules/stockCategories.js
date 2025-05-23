/**
 * Stock Categories Module
 * 
 * This module handles fetching stock category data from the external API
 */

const axios = require('axios');

// API configuration
const API_CONFIG = {
  baseUrl: 'https://devie4nodeapis.azurewebsites.net/api/common/stockcategory',
  apiKey: 'APIKEY-STRFQUJDRDEyMw==',
  timeout: 10000, // 10 seconds timeout
  retries: 2,     // Number of retry attempts
  retryDelay: 1000 // Delay between retries in ms
};

/**
 * Fetch stock categories with retry logic
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Array>} Array of stock categories
 */
async function fetchStockCategories(retryCount = 0) {
  try {
    console.log(`Fetching stock categories${retryCount > 0 ? ` (Retry attempt: ${retryCount})` : ''}`);
    
    // Request headers
    const headers = {
      'accept': 'application/json',
      'Authorization': API_CONFIG.apiKey
    };
    
    // Make API request with timeout
    const response = await axios.get(API_CONFIG.baseUrl, { 
      headers,
      timeout: API_CONFIG.timeout
    });
    
    // Check if response is valid
    if (response.status === 200 && response.data) {
      // Check if the response has a valid responseCode
      if (response.data.responseCode === 200 && Array.isArray(response.data.data)) {
        console.log(`Successfully fetched ${response.data.data.length || 0} stock categories`);
        return response.data.data;
      } else {
        console.error('Error fetching stock categories: Invalid response format or unauthorized access', response.data);
        return [];
      }
    } else {
      console.error(`Error fetching stock categories: Unexpected response`, response.status);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching stock categories:`, error.message);
    console.error('Error details:', error.response?.data || 'No response data');
    
    // Implement retry logic
    if (retryCount < API_CONFIG.retries) {
      console.log(`Retrying request for stock categories in ${API_CONFIG.retryDelay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      
      // Retry the request
      return fetchStockCategories(retryCount + 1);
    }
    
    // If all retries failed or no retries configured, return empty array
    console.error('All retry attempts failed. Returning empty data.');
    return [];
  }
}

/**
 * Get mock stock categories when API fails
 * @returns {Array} Mock stock categories
 */
function getMockStockCategories() {
  console.log('Using mock stock categories data');
  
  return [
    {
      "StockCategoryID": "1",
      "StockCategoryCode": "LACAP",
      "StockCategoryValue": "Large Cap"
    },
    {
      "StockCategoryID": "2",
      "StockCategoryCode": "MIDCAP",
      "StockCategoryValue": "Mid Cap"
    },
    {
      "StockCategoryID": "3",
      "StockCategoryCode": "SMCAP",
      "StockCategoryValue": "Small Cap"
    },
    {
      "StockCategoryID": "4",
      "StockCategoryCode": "MICCAP",
      "StockCategoryValue": "Micro Cap"
    }
  ];
}

/**
 * Format stock categories data into a more usable structure
 * @param {Array} rawData - Raw stock categories data from API
 * @returns {Array} Formatted stock categories
 */
function formatStockCategories(rawData) {
  try {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn('No stock categories data to format, returning empty array');
      return [];
    }
    
    // Format all stock categories
    return rawData.map(item => ({
      id: item.StockCategoryID,
      code: item.StockCategoryCode,
      name: item.StockCategoryValue
    }));
  } catch (error) {
    console.error('Error formatting stock categories data:', error);
    return [];
  }
}

module.exports = {
  fetchStockCategories,
  getMockStockCategories,
  formatStockCategories
};
