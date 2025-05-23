const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import modules
const profiling = require('./modules/profiling');
const risk = require('./modules/risk');
const allocation = require('./modules/allocation');
const products = require('./modules/products');
const proposal = require('./modules/proposal');
const marketOutlook = require('./modules/marketOutlook');
const stockCategories = require('./modules/stockCategories');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Investment Proposal API is running' });
});

// Client profiling endpoint
app.post('/api/profile', (req, res) => {
  try {
    const clientProfile = profiling.processClientProfile(req.body);
    res.json({ success: true, clientProfile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Risk assessment endpoint
app.post('/api/risk-assessment', (req, res) => {
  try {
    const riskAssessment = risk.assessRiskProfile(req.body);
    res.json({ success: true, riskAssessment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Manual asset allocation and risk assessment endpoint
app.post('/api/manual-allocation', async (req, res) => {
  try {
    console.log('=== Manual Allocation API Request ===');
    console.log('Raw Request Body:', JSON.stringify(req.body, null, 2));
    
    const { assetAllocation, clientProfile } = req.body;
    
    console.log('Asset Allocation:', JSON.stringify(assetAllocation, null, 2));
    console.log('Client Profile:', JSON.stringify(clientProfile, null, 2));
    
    // Validate required fields
    if (!assetAllocation || !clientProfile || !clientProfile.personalInfo || !clientProfile.personalInfo.name) {
      throw new Error('Missing required fields: asset allocation and client name');
    }
    
    // Check if assetClassAllocation exists and has the necessary properties
    if (!assetAllocation.assetClassAllocation) {
      console.error('Error: assetClassAllocation is missing in assetAllocation');
      throw new Error('Missing assetClassAllocation in asset allocation data');
    }
    
    console.log('Asset Class Allocation:', JSON.stringify(assetAllocation.assetClassAllocation, null, 2));
    
    // Verify that equity property exists in assetClassAllocation
    if (assetAllocation.assetClassAllocation.equity === undefined) {
      console.error('Error: equity is missing in assetClassAllocation');
      throw new Error('Missing equity allocation in asset allocation data');
    }
    
    // Calculate risk profile based on allocation
    const riskProfile = risk.assessRiskFromAllocation(assetAllocation);
    console.log('Risk Profile:', JSON.stringify(riskProfile, null, 2));
    
    // Generate asset allocation using our updated logic
    const portfolioSize = clientProfile.investmentObjectives?.initialInvestmentAmount || 100000;
    const portfolioSizeInCrores = portfolioSize / 10000000;
    
    console.log(`Generating allocation for ${riskProfile.riskCategory} risk profile with ${portfolioSizeInCrores} crore portfolio`);
    
    // Generate a fresh allocation using our updated logic
    const freshAllocation = allocation.generateAssetAllocation({
      clientProfile,
      riskProfile
    });
    
    console.log('Fresh allocation generated:', JSON.stringify(freshAllocation, null, 2));
    
    // Use the fresh allocation data instead of the user-provided allocation
    const allocData = freshAllocation;
    console.log('Using updated allocation data:', JSON.stringify(allocData, null, 2));
    
    // Add default product type allocation if not present
    if (!allocData.productTypeAllocation) {
      console.log('Adding default productTypeAllocation');
      allocData.productTypeAllocation = {
        equity: {
          mutualFunds: 80,
          etf: 20
        },
        debt: {
          mutualFunds: 70,
          direct: 30
        }
      };
    }
    console.log('Final Allocation Data with productTypeAllocation:', JSON.stringify(allocData, null, 2));
    
    // Generate product recommendations based on manual allocation
    try {
      console.log('Generating product recommendations with data:', JSON.stringify({
        clientProfile,
        riskProfile,
        assetAllocation: allocData
      }, null, 2));
      
      const productRecommendations = await products.recommendProducts({
        clientProfile,
        riskProfile,
        assetAllocation: allocData
      });
      
      console.log('Product recommendations generated successfully');
      
      res.json({
        success: true,
        clientProfile,
        riskProfile,
        assetAllocation: allocData,
        productRecommendations
      });
    } catch (prodError) {
      console.error('Error in product recommendations:', prodError);
      console.error('Error stack:', prodError.stack);
      throw new Error(`Error recommending products: ${prodError.message}`);
    }
  } catch (error) {
    console.error('Manual allocation API error:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Asset allocation endpoint
app.post('/api/asset-allocation', (req, res) => {
  try {
    console.log('Asset allocation request received:', JSON.stringify(req.body, null, 2));
    
    const { clientProfile, riskProfile } = req.body;
    
    // Extract portfolio size for logging
    const portfolioSize = clientProfile?.investmentObjectives?.initialInvestmentAmount || 0;
    const portfolioSizeInCrores = portfolioSize / 10000000;
    console.log(`Portfolio size: ${portfolioSize} INR (${portfolioSizeInCrores} crores)`);
    console.log(`Risk profile: ${riskProfile?.riskCategory || 'Unknown'}`);
    
    // Generate asset allocation
    const assetAllocation = allocation.generateAssetAllocation({ clientProfile, riskProfile });
    
    console.log('Generated asset allocation:', JSON.stringify(assetAllocation, null, 2));
    console.log('Asset class allocation:', JSON.stringify(assetAllocation.assetClassAllocation, null, 2));
    
    // Send response with a clear message about the allocation
    res.json({ 
      success: true, 
      message: `Generated allocation for ${riskProfile?.riskCategory || 'Unknown'} risk profile with ${portfolioSizeInCrores} crore portfolio`,
      assetAllocation 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Product recommendation endpoint
app.post('/api/product-recommendations', async (req, res) => {
  try {
    const { clientProfile, riskProfile, assetAllocation } = req.body;
    const productRecommendations = await products.recommendProducts({ clientProfile, riskProfile, assetAllocation });
    res.json({ success: true, productRecommendations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Generate Investment Proposal
app.post('/api/generate-proposal', (req, res) => {
  try {
    const clientData = req.body;
    const investmentProposal = proposal.generateProposal(clientData);
    res.json({ success: true, investmentProposal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Generate Investment Proposal PDF
app.post('/api/generate-proposal-pdf', async (req, res) => {
  try {
    console.log('Generating PDF proposal...');
    const clientData = req.body;
    console.log('Client data received, generating proposal...');
    
    // Ensure we're using the latest allocation data
    if (clientData.clientProfile && clientData.riskProfile) {
      console.log('Regenerating asset allocation to ensure consistency...');
      const portfolioSize = clientData.clientProfile.investmentObjectives?.initialInvestmentAmount || 100000;
      const portfolioSizeInCrores = portfolioSize / 10000000;
      
      // Generate fresh allocation data using our updated module
      const freshAllocation = allocation.generateAssetAllocation({
        clientProfile: clientData.clientProfile,
        riskProfile: clientData.riskProfile
      });
      
      console.log('Fresh allocation generated:', JSON.stringify(freshAllocation, null, 2));
      console.log('Detailed allocation present:', freshAllocation.detailedAllocation ? 'YES' : 'NO');
      
      if (freshAllocation.detailedAllocation) {
        console.log('Detailed allocation keys:', Object.keys(freshAllocation.detailedAllocation));
      }
      
      // Replace the allocation data in clientData
      clientData.assetAllocation = freshAllocation;
      console.log('Asset allocation regenerated successfully');
    }
    
    // Log client data before generating proposal
    console.log('Client data before proposal generation:');
    console.log('- Has clientProfile:', !!clientData.clientProfile);
    console.log('- Has riskProfile:', !!clientData.riskProfile);
    console.log('- Has assetAllocation:', !!clientData.assetAllocation);
    
    if (clientData.assetAllocation) {
      console.log('- Asset allocation has detailedAllocation:', !!clientData.assetAllocation.detailedAllocation);
    }
    
    // Generate proposal with the updated allocation data
    const investmentProposal = proposal.generateProposal(clientData);
    console.log('Investment proposal generated successfully');
    
    // Generate PDF
    console.log('Starting PDF generation...');
    const pdfBuffer = await proposal.generateProposalPDF(investmentProposal);
    console.log('PDF buffer created, size:', pdfBuffer.length);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="investment_proposal_${investmentProposal.date.replace(/\s/g, '_')}.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    console.log('PDF sent to client');
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Only start the server if this file is being run directly (not imported)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Stock categories endpoint
app.get('/api/stock-categories', async (req, res) => {
  try {
    console.log('Fetching stock categories data...');
    
    // Fetch stock categories data from the API
    const stockCategoriesData = await stockCategories.fetchStockCategories();
    
    // Format the data for frontend consumption
    const formattedData = stockCategories.formatStockCategories(stockCategoriesData);
    
    console.log('Returning stock categories to client');
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching stock categories data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Market outlook and debt overview endpoint - returns only the latest entry
app.get('/api/market-outlook', async (req, res) => {
  try {
    console.log('Fetching latest market outlook data...');
    
    // Fetch market outlook data from the API
    const marketOutlookData = await marketOutlook.fetchMarketOutlookData();
    
    // Format the data to get only the latest entry
    const formattedData = marketOutlook.formatMarketOutlookData(marketOutlookData);
    
    console.log('Returning latest market outlook entry to client');
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching market outlook data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint for external product APIs
app.get('/api/test-external-products', async (req, res) => {
  try {
    console.log('Testing external product APIs...');
    
    // Create a sample client profile and risk profile
    const clientProfile = {
      personalInfo: {
        name: 'Test User',
        age: 35
      },
      investmentObjectives: {
        initialInvestmentAmount: 15000000 // 1.5 crore
      }
    };
    
    const riskProfile = {
      riskCategory: 'aggressive',
      riskScore: 8
    };
    
    // Create a sample asset allocation with product type allocation
    const assetAllocation = {
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
    };
    
    // Generate product recommendations
    const productRecommendations = await products.recommendProducts({
      clientProfile,
      riskProfile,
      assetAllocation
    });
    
    res.json({
      success: true,
      message: 'External product APIs tested successfully',
      productRecommendations
    });
  } catch (error) {
    console.error('Error testing external product APIs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// For Vercel serverless functions, we need to export the app
module.exports = app;
