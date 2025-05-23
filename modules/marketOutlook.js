/**
 * Market Outlook and Debt Overview Module
 * 
 * This module handles fetching market outlook and debt overview data from the external API
 */

const axios = require('axios');

// API configuration
const API_CONFIG = {
  baseUrl: 'https://devie4nodeapis.azurewebsites.net/api/common/debtoverview',
  apiKey: 'APIKEY-STRFQUJDRDEyMw==',
  timeout: 10000, // 10 seconds timeout
  retries: 2,     // Number of retry attempts
  retryDelay: 1000 // Delay between retries in ms
};

/**
 * Fetch market outlook and debt overview data with retry logic
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Array>} Array of debt overview data including market outlook
 */
async function fetchMarketOutlookData(retryCount = 0) {
  try {
    console.log(`Fetching market outlook data${retryCount > 0 ? ` (Retry attempt: ${retryCount})` : ''}`);
    
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
        console.log(`Successfully fetched ${response.data.data.length || 0} market outlook entries`);
        return response.data.data;
      } else {
        console.error('Error fetching market outlook data: Invalid response format or unauthorized access', response.data);
        return [];
      }
    } else {
      console.error(`Error fetching market outlook data: Unexpected response`, response.status);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching market outlook data:`, error.message);
    console.error('Error details:', error.response?.data || 'No response data');
    
    // Implement retry logic
    if (retryCount < API_CONFIG.retries) {
      console.log(`Retrying request for market outlook data in ${API_CONFIG.retryDelay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      
      // Retry the request
      return fetchMarketOutlookData(retryCount + 1);
    }
    
    // If all retries failed or no retries configured, return empty array
    console.error('All retry attempts failed. Returning empty data.');
    return [];
  }
}

/**
 * Get mock market outlook data when API fails
 * @returns {Array} Mock market outlook data
 */
function getMockMarketOutlookData() {
  console.log('Using mock market outlook data');
  
  return [
    {
      "DebtOverviewID": "1",
      "Description": "Current Economic Conditions",
      "MarketOutlook": "The market is currently experiencing moderate growth with inflation stabilizing. Interest rates are expected to remain steady in the near term.",
      "IsActive": true,
      "CreatedBy": "System",
      "CreatedOn": "2025-05-01T09:00:00.000Z",
      "LastUpdatedBy": "System",
      "LastUpdatedOn": "2025-05-15T09:00:00.000Z"
    },
    {
      "DebtOverviewID": "2",
      "Description": "Debt Market Analysis",
      "MarketOutlook": "Corporate bonds are showing strong performance with reduced default risks. Government securities remain stable with predictable returns.",
      "IsActive": true,
      "CreatedBy": "System",
      "CreatedOn": "2025-05-01T09:00:00.000Z",
      "LastUpdatedBy": "System",
      "LastUpdatedOn": "2025-05-15T09:00:00.000Z"
    }
  ];
}

/**
 * Format market outlook data into a more usable structure
 * @param {Array} rawData - Raw market outlook data from API
 * @returns {Object} Formatted market outlook data with only the latest entry
 */
function formatMarketOutlookData(rawData) {
  try {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn('No market outlook data to format, returning empty object');
      return {
        latestEntry: null
      };
    }
    
    // Sort all entries by LastUpdatedOn date (newest first)
    const sortedEntries = [...rawData]
      .filter(item => item.IsActive)
      .sort((a, b) => new Date(b.LastUpdatedOn) - new Date(a.LastUpdatedOn));
    
    // Get only the most recent entry
    const latestEntry = sortedEntries.length > 0 ? {
      id: sortedEntries[0].DebtOverviewID,
      description: sortedEntries[0].Description,
      marketOutlook: sortedEntries[0].MarketOutlook || null,
      lastUpdated: sortedEntries[0].LastUpdatedOn,
      createdBy: sortedEntries[0].CreatedBy,
      createdOn: sortedEntries[0].CreatedOn
    } : null;
    
    console.log('Returning only the latest market outlook entry:', latestEntry);
    
    return {
      latestEntry
    };
  } catch (error) {
    console.error('Error formatting market outlook data:', error);
    return {
      latestEntry: null
    };
  }
}

module.exports = {
  fetchMarketOutlookData,
  getMockMarketOutlookData,
  formatMarketOutlookData
};
