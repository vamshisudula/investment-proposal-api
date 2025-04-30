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
app.post('/api/manual-allocation', (req, res) => {
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
    
    // Generate asset allocation
    const allocData = {
      portfolioSize: clientProfile.investmentObjectives?.initialInvestmentAmount || 100000,
      portfolioSizeCategory: allocation.determinePortfolioSizeCategory(clientProfile.investmentObjectives?.initialInvestmentAmount || 100000),
      assetClassAllocation: assetAllocation.assetClassAllocation,
      riskCategory: riskProfile.riskCategory
    };
    console.log('Allocation Data:', JSON.stringify(allocData, null, 2));
    
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
        },
        goldSilver: {
          etf: 60,
          physical: 40
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
      
      const productRecommendations = products.recommendProducts({
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
    const { clientProfile, riskProfile } = req.body;
    const assetAllocation = allocation.generateAssetAllocation({ clientProfile, riskProfile });
    res.json({ success: true, assetAllocation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Product recommendation endpoint
app.post('/api/product-recommendations', (req, res) => {
  try {
    const { clientProfile, riskProfile, assetAllocation } = req.body;
    const productRecommendations = products.recommendProducts({ clientProfile, riskProfile, assetAllocation });
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
    
    // Generate proposal
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

// For Vercel serverless functions, we need to export the app
module.exports = app;
