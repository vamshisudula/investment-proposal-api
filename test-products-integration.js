/**
 * Test script to verify if products.js is correctly using externalProducts.js
 * 
 * This script tests the integration between the products.js and externalProducts.js modules
 * to ensure products.js is correctly receiving and using data from externalProducts.js
 */

// Import required modules
const products = require('./modules/products');
const externalProducts = require('./modules/externalProducts');

// Utility function to log objects cleanly
function logObject(obj, maxDepth = 2) {
  const cache = new Set();
  const stringified = JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return '[Circular]';
      cache.add(value);
    }
    return value;
  }, 2);
  console.log(stringified);
}

// Create a test function
async function testProductsIntegration() {
  console.log('\n======================================================');
  console.log('   TESTING PRODUCTS.JS AND EXTERNALPRODUCTS.JS INTEGRATION');
  console.log('======================================================\n');
  
  // Step 1: Test externalProducts.js directly
  console.log('\n🔍 STEP 1: TESTING EXTERNALPRODUCTS.JS DIRECTLY\n');
  
  let unlistedStocksFromExternal = [];
  let formattedUnlistedStocks = [];
  
  try {
    // Test Unlisted Stocks API
    console.log('📊 Testing Unlisted Stocks API...');
    unlistedStocksFromExternal = await externalProducts.fetchUnlistedStocks();
    console.log(`✅ Success! Fetched ${unlistedStocksFromExternal.length || 0} unlisted stocks directly from externalProducts.js`);
    
    if (unlistedStocksFromExternal.length > 0) {
      // Format the unlisted stocks
      formattedUnlistedStocks = externalProducts.formatProductData(unlistedStocksFromExternal, 'unlistedStocks');
      console.log(`✅ Successfully formatted ${formattedUnlistedStocks.length} unlisted stocks`);
      
      // Print a sample of the raw and formatted data
      console.log('\n📋 SAMPLE RAW UNLISTED STOCK FROM EXTERNALPRODUCTS.JS:');
      console.log('----------------------------------------');
      const sampleRaw = unlistedStocksFromExternal[0];
      console.log(`Script Name: ${sampleRaw.script_name || 'N/A'}`);
      console.log(`ISIN: ${sampleRaw.isin_number || 'N/A'}`);
      console.log(`Face Value: ${sampleRaw.face_value || 'N/A'}`);
      console.log(`Sector: ${sampleRaw.sector_name || 'N/A'}`);
      
      console.log('\n📋 SAMPLE FORMATTED UNLISTED STOCK FROM EXTERNALPRODUCTS.JS:');
      console.log('----------------------------------------');
      const sampleFormatted = formattedUnlistedStocks[0];
      console.log(`Name: ${sampleFormatted.name || 'N/A'}`);
      console.log(`Description: ${sampleFormatted.description || 'N/A'}`);
      console.log(`Risk: ${sampleFormatted.risk || 'N/A'}`);
      console.log(`Sector: ${sampleFormatted.sector || 'N/A'}`);
      console.log(`Face Value: ${sampleFormatted.faceValue || 'N/A'}`);
    }
  } catch (error) {
    console.error('❌ Error testing externalProducts.js directly:', error.message);
  }
  
  // Step 2: Test products.js integration
  console.log('\n\n🔍 STEP 2: TESTING PRODUCTS.JS INTEGRATION WITH EXTERNALPRODUCTS.JS\n');
  
  try {
    // Create test client data
    const clientData = {
      clientProfile: {
        personalInfo: {
          name: 'Test User',
          age: 35
        },
        investmentObjectives: {
          initialInvestmentAmount: 15000000 // 1.5 crore
        }
      },
      riskProfile: {
        riskCategory: 'aggressive',
        riskScore: 8
      },
      assetAllocation: {
        portfolioSize: 15000000, // 1.5 crore
        assetClassAllocation: {
          equity: 70,
          debt: 20,
          goldSilver: 10
        },
        productTypeAllocation: {
          equity: {
            mutualFunds: 40,
            pms: 30,
            aif: 20,
            unlistedStocks: 10
          },
          debt: {
            mutualFunds: 70,
            direct: 30
          },
          goldSilver: {
            etf: 100
          }
        }
      }
    };
    
    console.log('📊 Calling products.recommendProducts()...');
    const productRecommendations = await products.recommendProducts(clientData);
    console.log('✅ Successfully received recommendations from products.js');
    
    // Check if we got recommendations for each product type
    console.log('\n📋 CHECKING PRODUCT RECOMMENDATIONS:');
    console.log('----------------------------------------');
    
    // Check Unlisted Stocks
    if (productRecommendations.recommendations?.equity?.unlistedStocks?.products?.length > 0) {
      const unlistedStocksCount = productRecommendations.recommendations.equity.unlistedStocks.products.length;
      console.log(`✅ Unlisted Stocks: ${unlistedStocksCount} products found`);
      
      // Compare with what we got directly from externalProducts.js
      console.log(`   Direct from externalProducts.js: ${formattedUnlistedStocks.length} products`);
      
      // Check if the first unlisted stock from products.js matches what we got from externalProducts.js
      const unlistedStockFromProducts = productRecommendations.recommendations.equity.unlistedStocks.products[0];
      
      console.log('\n📋 SAMPLE UNLISTED STOCK FROM PRODUCTS.JS:');
      console.log('----------------------------------------');
      console.log(`Name: ${unlistedStockFromProducts.name || 'N/A'}`);
      console.log(`Description: ${unlistedStockFromProducts.description || 'N/A'}`);
      console.log(`Risk: ${unlistedStockFromProducts.risk || 'N/A'}`);
      console.log(`Sector: ${unlistedStockFromProducts.sector || 'N/A'}`);
      console.log(`Face Value: ${unlistedStockFromProducts.faceValue || 'N/A'}`);
      
      // Check if the data is the same
      if (formattedUnlistedStocks.length > 0) {
        const isNameMatch = unlistedStockFromProducts.name === formattedUnlistedStocks[0].name;
        const isSectorMatch = unlistedStockFromProducts.sector === formattedUnlistedStocks[0].sector;
        
        console.log('\n🔄 COMPARING DATA BETWEEN MODULES:');
        console.log('----------------------------------------');
        console.log(`Name match: ${isNameMatch ? '✅ YES' : '❌ NO'}`);
        console.log(`Sector match: ${isSectorMatch ? '✅ YES' : '❌ NO'}`);
        
        console.log('\n🔍 INTEGRATION RESULT:');
        if (isNameMatch && isSectorMatch) {
          console.log('✅ PASS: products.js is correctly receiving data from externalProducts.js');
        } else {
          console.log('❌ FAIL: Data mismatch between products.js and externalProducts.js');
        }
      }
    } else {
      console.log('❌ No Unlisted Stocks recommendations found in products.js');
    }
    
    // Check PMS
    if (productRecommendations.recommendations?.equity?.pms?.products?.length > 0) {
      console.log(`\n✅ PMS: ${productRecommendations.recommendations.equity.pms.products.length} products found`);
    } else {
      console.log('\n❌ No PMS recommendations found');
    }
    
    // Check AIF (Alternative Funds)
    if (productRecommendations.recommendations?.equity?.aif?.products?.length > 0) {
      console.log(`\n✅ Alternative Funds: ${productRecommendations.recommendations.equity.aif.products.length} products found`);
    } else {
      console.log('\n❌ No Alternative Funds recommendations found');
    }
  } catch (error) {
    console.error('\n❌ Error testing products.js integration:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n======================================================');
  console.log('            INTEGRATION TESTING COMPLETE');
  console.log('======================================================');
}

// Run the test
testProductsIntegration();
