/**
 * Test script for external products API integration
 * 
 * This script tests the functionality for fetching products from external APIs:
 * - Unlisted Stocks (IVP001)
 * - Alternative Funds (IVP005)
 * - PMS (IVP004)
 */

const externalProducts = require('./modules/externalProducts');

// Test function to fetch and display products
async function testExternalProductsAPI() {
  console.log('=== Testing External Products API Integration ===');
  
  try {
    // Test PMS products (IVP004)
    console.log('\n--- Testing PMS Products API (IVP004) ---');
    const pmsProducts = await externalProducts.fetchPMS('1 Month');
    console.log(`Fetched ${pmsProducts.length || 0} PMS products`);
    
    if (pmsProducts && pmsProducts.length > 0) {
      const formattedPMS = externalProducts.formatProductData(pmsProducts, 'pms');
      console.log('Sample PMS product:');
      console.log(JSON.stringify(formattedPMS[0], null, 2));
    } else {
      console.log('No PMS products found');
    }
    
    // Test Alternative Funds (IVP005)
    console.log('\n--- Testing Alternative Funds API (IVP005) ---');
    const altFunds = await externalProducts.fetchAlternativeFunds('1 Month');
    console.log(`Fetched ${altFunds.length || 0} Alternative Funds products`);
    
    if (altFunds && altFunds.length > 0) {
      const formattedAltFunds = externalProducts.formatProductData(altFunds, 'alternativeFunds');
      console.log('Sample Alternative Fund product:');
      console.log(JSON.stringify(formattedAltFunds[0], null, 2));
    } else {
      console.log('No Alternative Funds products found');
    }
    
    // Test Unlisted Stocks (IVP001)
    console.log('\n--- Testing Unlisted Stocks API (IVP001) ---');
    const unlistedStocks = await externalProducts.fetchUnlistedStocks('1 Month');
    console.log(`Fetched ${unlistedStocks.length || 0} Unlisted Stocks products`);
    
    if (unlistedStocks && unlistedStocks.length > 0) {
      const formattedUnlistedStocks = externalProducts.formatProductData(unlistedStocks, 'unlistedStocks');
      console.log('Sample Unlisted Stock product:');
      console.log(JSON.stringify(formattedUnlistedStocks[0], null, 2));
    } else {
      console.log('No Unlisted Stocks products found');
    }
    
    console.log('\n=== External Products API Testing Complete ===');
  } catch (error) {
    console.error('Error testing external products API:', error);
  }
}

// Run the test
testExternalProductsAPI();
