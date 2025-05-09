/**
 * Proposal Module
 * 
 * This module handles the generation of investment proposal documents
 * based on client profile, risk assessment, asset allocation, and product recommendations.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');
const os = require('os');

/**
 * Generate an investment proposal based on client profile, risk assessment, asset allocation, and product recommendations
 * @param {Object} clientData - Client data including profile, risk assessment, asset allocation, and product recommendations
 * @returns {Object} - Investment proposal object
 */
function generateProposal(clientData) {
    const { clientProfile, riskProfile, assetAllocation, productRecommendations } = clientData;
    
    console.log('generateProposal received assetAllocation:', JSON.stringify(assetAllocation, null, 2));
    console.log('assetAllocation has detailedAllocation:', !!assetAllocation?.detailedAllocation);
    
    // Extract client information
    const clientName = clientProfile?.personalInfo?.name || 'Client';
    const clientAge = clientProfile?.personalInfo?.age || 'N/A';
    const clientOccupation = clientProfile?.personalInfo?.occupation || 'N/A';
    const initialInvestment = clientProfile?.investmentObjectives?.initialInvestmentAmount || 0;
    const regularContribution = clientProfile?.investmentObjectives?.regularContributionAmount || 0;
    const investmentHorizon = clientProfile?.investmentObjectives?.investmentHorizon || 'N/A';
    const primaryGoals = clientProfile?.investmentObjectives?.primaryGoals || [];
    
    // If we don't have detailed allocation but have risk profile and client profile, generate it
    if (!assetAllocation?.detailedAllocation && clientProfile && riskProfile) {
        console.log('No detailed allocation found, regenerating it...');
        // Get the allocation module
        const allocation = require('./allocation');
        
        // Generate fresh allocation
        const freshAllocation = allocation.generateAssetAllocation({
            clientProfile,
            riskProfile
        });
        
        console.log('Regenerated allocation:', JSON.stringify(freshAllocation, null, 2));
        
        // Use the fresh allocation
        clientData.assetAllocation = freshAllocation;
    }
    
    // Format date
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
    
    // Create proposal object
    const proposal = {
        title: `Investment Proposal for ${clientName}`,
        date: formattedDate,
        companyIntroduction: {
            title: 'About INVEST4EDU PRIVATE LIMITED',
            content: generateCompanyIntroductionContent()
        },
        marketOverview: {
            title: 'Market Outlook',
            content: generateMarketOverviewContent(currentDate)
        },
        clientProfileRecap: {
            title: 'Client Profile',
            content: generateClientProfileContent(clientProfile, riskProfile)
        },
        assetAllocationSummary: {
            title: 'Asset Allocation',
            content: generateAssetAllocationContent(clientData.assetAllocation, initialInvestment)
        },
        productDetails: {
            title: 'Investment Products',
            content: generateProductRecommendationsContent(productRecommendations, initialInvestment, clientData.assetAllocation)
        },
        implementationPlan: {
            title: 'Implementation Plan',
            content: generateImplementationPlanContent(clientProfile, riskProfile)
        },
        disclaimers: {
            title: 'Disclaimer',
            content: generateDisclaimersContent()
        }
    };
    
    return proposal;
}

/**
 * Recommend products based on client risk profile and asset allocation
 * @param {Object} clientData - Client profile, risk assessment, and asset allocation data
 * @returns {Object} Product recommendations
 */
function recommendProducts(clientData) {
    try {
        const { clientProfile, riskProfile, assetAllocation } = clientData;
        
        // Extract risk level from risk profile
        const riskLevel = mapRiskCategoryToLevel(riskProfile.riskCategory);
        
        // Extract portfolio size from asset allocation
        const portfolioSize = assetAllocation.portfolioSize || clientProfile.investmentObjectives.initialInvestmentAmount;
        
        // Generate recommendations for each asset class
        const equityRecommendations = generateEquityRecommendations(riskLevel, assetAllocation, portfolioSize);
        const debtRecommendations = generateDebtRecommendations(riskLevel, assetAllocation, portfolioSize);
        const goldSilverRecommendations = generateGoldSilverRecommendations(assetAllocation, portfolioSize);
        
        // Combine recommendations
        const recommendations = {
            equity: equityRecommendations,
            debt: debtRecommendations,
            goldSilver: goldSilverRecommendations
        };
        
        // Generate recommendation summary
        const recommendationSummary = generateRecommendationSummary(recommendations, riskProfile.riskCategory);
        
        return {
            recommendations,
            recommendationSummary
        };
    } catch (error) {
        throw new Error(`Error recommending products: ${error.message}`);
    }
}

/**
 * Generate company introduction content for the proposal
 * @returns {String} - Markdown content for company introduction section
 */
function generateCompanyIntroductionContent() {
    return `
Founded with the vision to transform intellect, experience and technology into services and products for the Financial and IT industry using the digital wave. We are the first coveted Fintech platform in India to provide solution to all your business needs that you'll ever need to transform your effort and determination into a roaring success in terms of wealth creation, client happiness and business growth. All our offerings are based on the idea of inclusivity and simplicity.

The business world is adapting to the fast-changing technological environment and we are committed to build and offer nextgen comprehensive portfolio to accelerate your growth and provide sustainability to navigate through a competitive business framework. Our product and service offerings are built to harness technology and analytics.

### Our Product Offering

Our product and service offerings harness the power of technology, research, analytics, and data science. Our primary goal is to address sustainability issues and overcome challenges such as user-agnostic designs, higher cost of innovation and distribution, and non-standardization of the current channels. We are a cloud-native, multi-issuer, digital platform. With a strong emphasis on scale and speed, we strive to drive transformative change and ensure a sustainable future that benefits everyone.

- Equity Investment: Comprehensive equity solutions across market caps
- Fixed Income: Debt instruments with varying risk-return profiles
- Private Equity: Exclusive high-growth investment opportunities
- Research: Data-driven market insights and analysis
- Protection: Insurance and wealth preservation strategies
    `;
}

/**
 * Generate client profile content for the proposal
 * @param {Object} clientProfile - Client profile data
 * @param {Object} riskProfile - Risk profile data
 * @returns {String} - HTML content for client profile section
 */
function generateClientProfileContent(clientProfile, riskProfile) {
    const personalInfo = clientProfile?.personalInfo || {};
    const investmentObjectives = clientProfile?.investmentObjectives || {};
    const financialSituation = clientProfile?.financialSituation || {};
    
    return `
## Personal Information
- **Name**: ${personalInfo.name || 'N/A'}
- **Age**: ${personalInfo.age || 'N/A'}
- **Occupation**: ${personalInfo.occupation || 'N/A'}
- **Annual Income**: ₹${formatCurrency(financialSituation.annualIncome || 0)}
- **Existing Investments**: ₹${formatCurrency(financialSituation.existingInvestments || 0)}

## Investment Objectives
- **Primary Goals**: ${investmentObjectives.primaryGoals ? investmentObjectives.primaryGoals.join(', ') : 'N/A'}
- **Investment Horizon**: ${investmentObjectives.investmentHorizon || 'N/A'}
- **Initial Investment Amount**: ₹${formatCurrency(investmentObjectives.initialInvestmentAmount || 0)}
${investmentObjectives.regularContributionAmount ? `- **Regular Monthly Contribution**: ₹${formatCurrency(investmentObjectives.regularContributionAmount)}` : ''}

## Risk Profile
- **Risk Category**: ${riskProfile.riskCategory || 'N/A'}
- **Risk Score**: ${riskProfile.riskScore || 'N/A'}

${riskProfile.riskAssessmentDetails?.riskCategoryDescription || ''}
    `;
}

/**
 * Generate market overview content for the proposal
 * @param {Date} currentDate - Current date
 * @returns {String} - HTML content for market overview section
 */
function generateMarketOverviewContent(currentDate) {
    // Get current month and year
    const month = getMonthName(currentDate.getMonth());
    const year = currentDate.getFullYear();
    
    return `
${month} witnessed increased volatility in the Indian equity markets, driven by a combination of high valuations, lackluster Q2FY${year} earnings, and persistent FII outflows. Despite these challenges, India's economy has been demonstrating remarkable resilience by maintaining its status as the fastest growing major economy while effectively managing inflation.

However, Q2 growth turned out to be much lower than expected. This decline in growth was led mainly by a substantial deceleration in industrial growth from 7.4 per cent in Q1 to 2.1 per cent in Q2 due to subdued performance of manufacturing companies. Markets are hopeful of a rate cut by RBI in the next MPC meet which will further boost the growth.

The Indian equity market continues to be supported by strong domestic inflows, with SIP contributions reaching all-time highs. The long-term outlook for Indian equities remains positive, driven by:

- Robust GDP growth projections of 6.5-7% for FY${year}
- Declining inflation, creating room for potential monetary easing
- Continued government focus on infrastructure development and manufacturing
- Strong corporate earnings growth expected in the second half of the fiscal year

In the fixed income space, yields have stabilized, and the curve has steepened, creating opportunities in the medium to long-term segment. The RBI's focus on maintaining adequate liquidity while managing inflation expectations provides a supportive environment for debt investments.
    `;
}

/**
 * Generate asset allocation content for the proposal
 * @param {Object} assetAllocation - Asset allocation data
 * @param {Number} initialInvestment - Initial investment amount
 * @returns {String} - Markdown content for asset allocation section
 */
function generateAssetAllocationContent(assetAllocation, initialInvestment) {
    console.log('Generating asset allocation content with:', JSON.stringify(assetAllocation, null, 2));
    console.log('Asset allocation type:', typeof assetAllocation);
    console.log('Asset allocation keys:', Object.keys(assetAllocation || {}));
    console.log('Initial investment:', initialInvestment);
    
    // Extract allocation percentages for high-level asset classes
    const allocation = assetAllocation?.assetClassAllocation || {};
    console.log('Asset class allocation:', JSON.stringify(allocation, null, 2));
    
    // Get the detailed allocation if available
    const detailedAllocation = assetAllocation?.detailedAllocation || {};
    console.log('Detailed allocation present:', Object.keys(detailedAllocation).length > 0 ? 'YES' : 'NO');
    console.log('Detailed allocation keys:', Object.keys(detailedAllocation));
    
    // Convert initial investment to crores for display purposes
    const investmentInCrores = initialInvestment / 10000000;
    console.log('Investment in crores:', investmentInCrores);
    
    // Build the detailed allocation table
    let detailedTable = '';
    
    if (Object.keys(detailedAllocation).length > 0 && detailedAllocation.Total) {
        console.log('Using detailed allocation data for PDF generation');
        console.log('Detailed allocation Total:', detailedAllocation.Total);
        
        // Create rows for the detailed allocation table
        const rows = [];
        
        // Group allocation items by type (Equity, Debt, etc.)
        const equityItems = [];
        const debtItems = [];
        const alternativeItems = [];
        const otherItems = [];
        
        // Process each allocation item and categorize
        for (const [key, value] of Object.entries(detailedAllocation)) {
            if (key !== 'Total' && key !== 'error') {
                // Convert crore values back to rupees for display
                const amountInRupees = Math.round(value * 10000000);
                const formattedAmount = `₹${formatCurrency(amountInRupees)}`;
                
                if (key.includes('Equity')) {
                    equityItems.push(`| | ${key} | ${formattedAmount} |`);
                } else if (key.includes('Debt')) {
                    debtItems.push(`| | ${key} | ${formattedAmount} |`);
                } else if (key.includes('AIF') || key.includes('PMS')) {
                    alternativeItems.push(`| | ${key} | ${formattedAmount} |`);
                } else {
                    otherItems.push(`| | ${key} | ${formattedAmount} |`);
                }
            }
        }
        
        // Add category headers and items to rows
        if (equityItems.length > 0) {
            rows.push(`| **Equity** | | |`);
            rows.push(...equityItems);
        }
        
        if (debtItems.length > 0) {
            rows.push(`| **Debt** | | |`);
            rows.push(...debtItems);
        }
        
        if (alternativeItems.length > 0) {
            rows.push(`| **Alternative Investments** | | |`);
            rows.push(...alternativeItems);
        }
        
        if (otherItems.length > 0) {
            rows.push(`| **Other** | | |`);
            rows.push(...otherItems);
        }
        
        // Add total row
        const totalInRupees = Math.round(detailedAllocation.Total * 10000000);
        rows.push(`| **Total Investment** | | ₹${formatCurrency(totalInRupees)} |`);
        
        detailedTable = `
## Detailed Asset Allocation

<div class="asset-allocation-table">

| Asset Class | Investment Vehicle | Amount (₹) |
|-------------|-------------------|------------|
${rows.join('\n')}

</div>
`;
    } else {
        console.log('No detailed allocation data available, using fallback method');
        console.log('Reason: ' + (Object.keys(detailedAllocation).length === 0 ? 'Empty detailed allocation' : 'Missing Total property'));
        console.log('Asset allocation structure:', JSON.stringify(assetAllocation, null, 2));
        console.log('Portfolio size in crores:', investmentInCrores);
        // Fallback to the old calculation method if detailed allocation is not available
        // Calculate amounts based on percentages
        const equityAmount = (allocation.equity / 100) * initialInvestment;
        const debtAmount = (allocation.debt / 100) * initialInvestment;
        const goldSilverAmount = (allocation.goldSilver / 100) * initialInvestment;
        
        // Format all sub-allocations to integers with proper formatting
        // For equity breakdown
        const largeCapAmount = Math.round(equityAmount * 0.25);
        const globalFundAmount = Math.round(equityAmount * 0.15);
        const hybridFundAmount = Math.round(equityAmount * 0.15);
        const thematicFundAmount = Math.round(equityAmount * 0.15);
        const equityETFAmount = Math.round(equityAmount * 0.3);
        
        // For debt breakdown
        const debtMFAmount = Math.round(debtAmount * 0.5);
        const bondAmount = Math.round(debtAmount * 0.5);
        
        // For gold/silver breakdown
        const goldETFAmount = Math.round(goldSilverAmount * 0.6);
        const physicalGoldAmount = Math.round(goldSilverAmount * 0.4);
        
        detailedTable = `
## Detailed Asset Allocation

<div class="asset-allocation-table">

| Asset Class | Investment Vehicle | Amount (₹) |
|-------------|-------------------|------------|
| **Equity - ${allocation.equity || 0}%** | | |
| | Mutual Funds | ₹${formatCurrency(Math.round(equityAmount * 0.7))} |
| | - Large Cap Fund | ₹${formatCurrency(largeCapAmount)} |
| | - Global Fund | ₹${formatCurrency(globalFundAmount)} |
| | - Hybrid/Multi-Asset Fund | ₹${formatCurrency(hybridFundAmount)} |
| | - Thematic Fund | ₹${formatCurrency(thematicFundAmount)} |
| | ETFs | ₹${formatCurrency(equityETFAmount)} |
| **Debt - ${allocation.debt || 0}%** | | |
| | Mutual Funds | ₹${formatCurrency(debtMFAmount)} |
| | Bonds | ₹${formatCurrency(bondAmount)} |
| **Gold/Silver - ${allocation.goldSilver || 0}%** | | |
| | ETFs | ₹${formatCurrency(goldETFAmount)} |
| | Physical | ₹${formatCurrency(physicalGoldAmount)} |
| **Total Investment** | | ₹${formatCurrency(Math.round(initialInvestment))} |

</div>
`;
    }
    
    return `
## Asset Allocation Strategy

Based on your risk profile (${assetAllocation.riskCategory || 'Moderate'}), we recommend the following asset allocation:

<div class="asset-allocation-table">

| Asset Class | Allocation (%) |
|-------------|----------------|
| Equity | ${allocation.equity || 0}% |
| Debt | ${allocation.debt || 0}% |
| Gold/Silver | ${allocation.goldSilver || 0}% |

</div>

${detailedTable}

${assetAllocation.allocationExplanation || ''}

This asset allocation is designed to balance your need for growth, income, and capital preservation while aligning with your risk tolerance and investment horizon.
    `;
}

/**
 * Generate product recommendations content for the proposal
 * @param {Object} productRecommendations - Product recommendations data
 * @param {Number} initialInvestment - Initial investment amount
 * @param {Object} assetAllocation - Asset allocation data
 * @returns {String} - HTML content for product recommendations section
 */
function generateProductRecommendationsContent(productRecommendations, initialInvestment, assetAllocation) {
    const recommendations = productRecommendations?.recommendations || {};
    const allocation = assetAllocation?.assetClassAllocation || {};
    
    // Calculate amounts based on percentages
    const equityAmount = Math.round((allocation.equity / 100) * initialInvestment);
    const debtAmount = Math.round((allocation.debt / 100) * initialInvestment);
    const goldSilverAmount = Math.round((allocation.goldSilver / 100) * initialInvestment);
    
    // Calculate product type allocations
    const mutualFundAmount = Math.round(equityAmount * 0.7);
    const etfAmount = Math.round(equityAmount * 0.3);
    const fixedIncomeAmount = Math.round(debtAmount);
    
    let content = `
${productRecommendations?.recommendationSummary || ''}

### 1) Mutual Fund: (Target: ₹${formatCurrency(mutualFundAmount)})

- Focus on creating a Mutual fund portfolio with objective of long term wealth creation.
- Selection of fund which are majorly equity oriented and capable of generating Alpha in comparison with the benchmark returns.
- Investment in funds with a time horizon of 5-7 years.
- Selection of portfolio which are managed by Fund Managers with proven track record.

<div class="investment-products-table">

| Fund Name | Category |
|-----------|----------|
| Multi Cap Fund C | Hybrid |
| Focused Equity Fund D | Large Cap |

</div>

### 2) ETFs: (Target: ₹${formatCurrency(etfAmount)})

- ETFs offer lower expense ratios compared to mutual funds and provide real-time trading flexibility.
- They provide diversified exposure to specific market segments with high liquidity.
- Suitable for both short-term tactical positions and long-term strategic allocations.

<div class="investment-products-table">

| Fund Name | Category |
|-----------|----------|
| Nippon India ETF Nifty BeES | ETF | 
| SBI ETF Sensex | ETF |
| ICICI Prudential ETF Gold | ETF |

</div>

### 3) Fixed Income Offering: (Target: ₹${formatCurrency(fixedIncomeAmount)})

The investment strategy is to invest across high quality Fixed Income Instruments along with structured diversified portfolio with an aim to generate periodic cash flows and capital growth.

- Focus on high credit quality instruments with majority allocation to issuers with high degree of corporate governance
- Investment strategy is to achieve diversification, targeting periodic cash flows, balancing risk and higher portfolio performance

<div class="investment-products-table">

| Instrument | Category |
|------------|----------|
| Corporate Bonds | AAA-Rated |
| Government Securities | Sovereign |
| Fixed Deposits | Banking |

</div>

`;

    return content;
}

/**
 * Generate implementation plan content for the proposal
 * @param {Object} clientProfile - Client profile data
 * @param {Object} riskProfile - Risk profile data
 * @returns {String} - HTML content for implementation plan section
 */
function generateImplementationPlanContent(clientProfile, riskProfile) {
    const investmentObjectives = clientProfile?.investmentObjectives || {};
    const initialInvestment = investmentObjectives.initialInvestmentAmount || 0;
    const regularContribution = investmentObjectives.regularContributionAmount || 0;
    const investmentStrategy = regularContribution > 0 ? 'Lump Sum + SIP' : 'Lump Sum';
    
    return `
## Investment Strategy: ${investmentStrategy}

Based on your investment amount and market conditions, we recommend the following implementation approach:

${regularContribution > 0 ? '## Lump Sum + Systematic Investment Plan (SIP)' : '## Lump Sum Investment'}

${regularContribution > 0 
    ? `We recommend investing the initial amount of ₹${formatCurrency(initialInvestment)} as per the asset allocation strategy outlined above. Additionally, we recommend setting up a monthly SIP of ₹${formatCurrency(regularContribution)} to continue building your portfolio over time.` 
    : `We recommend investing the entire amount of ₹${formatCurrency(initialInvestment)} as per the asset allocation strategy outlined above. This approach is suitable given your investment horizon and current market conditions.`}

## Timeline

1. **Initial Meeting**: Review and finalize this investment proposal
2. **Documentation**: Complete necessary KYC and account opening formalities
3. **Initial Investment**: Execute the first phase of investments as per the strategy
4. **Follow-up**: Schedule a review meeting after 3 months to assess portfolio performance
5. **Regular Reviews**: Conduct quarterly portfolio reviews to ensure alignment with goals

## Monitoring and Review

We recommend regular portfolio reviews to ensure your investments remain aligned with your goals and risk profile:

- Quarterly performance review
- Semi-annual rebalancing (if required)
- Annual comprehensive review of investment strategy and goals
    `;
}

/**
 * Generate disclaimers content for the proposal
 * @returns {String} - HTML content for disclaimers section
 */
function generateDisclaimersContent() {
    return `


Investments in securities market are subject to market risks, read all the related documents carefully before investing.

The information and opinions in this report have been prepared by Invest4Edu (i4E) Private limited and are subject to change without any notice. The report and information contained herein are strictly confidential and meant solely for the intended recipient and may not be altered in any way, transmitted to, copied or redistributed, in part or in whole, to any other person or to the media or reproduced in any form, without prior written consent of i4E.

The information and opinions contained in the research report have been compiled or arrived at from sources believed to be reliable and have not been independently verified and no guarantee, representation of warranty, express or implied, is made as to their accuracy, completeness, authenticity or validity. No information or opinions expressed constitute an offer, or an invitation to make an offer, to buy or sell any securities or any derivative instruments related to such securities. Investments in securities are subject to market risk. The value and return on investment may vary because of changes in interest rates, foreign exchange rates or any other reason. Investors should note that each security's price or value may rise or fall and, accordingly, investors may even receive amounts which are less than originally invested. The investor is advised to take into consideration all risk factors including their own financial condition, suitability to risk return profile and the like, and take independent professional and/or tax advice before investing.

Opinions expressed are our current opinions as of the date appearing on this report. Investor should understand that statements regarding future prospects may not materialize and are of general nature which may not be specifically suitable to any particular investor. Past performance may not necessarily be an indicator of future performance. Actual results may differ materially from those set forth in projections.

i4E, its research analysts, directors, officers, employees and associates accept no liabilities for any loss or damage of any kind arising out of the use of this report. This report is not directed or intended for distribution to, or use by, any person or entity who is a citizen or resident of or located in any locality, state, country or other jurisdiction, where such distribution, publication, availability or use would be contrary to law, regulation or which would subject i4E and associates to any registration or licensing requirement within such jurisdiction. The securities described herein may or may not be eligible for sale in all jurisdictions or to certain category of investors. Persons in whose possession this document may come are required to inform themselves of and to observe such restriction.
    `;
}

/**
 * Generate a PDF version of the investment proposal using markdown-pdf
 * @param {Object} proposal - Investment proposal object
 * @returns {Buffer} - PDF document as buffer
 */
function generateProposalPDF(proposal) {
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting PDF generation with markdown-pdf');
            
            // Create markdown content
            const markdownContent = generateMarkdownFromProposal(proposal);
            
            // Create a temporary file path
            const tempDir = os.tmpdir();
            const tempMdFile = path.join(tempDir, `proposal_${Date.now()}.md`);
            const tempPdfFile = path.join(tempDir, `proposal_${Date.now()}.pdf`);
            
            // Write markdown to temp file
            fs.writeFileSync(tempMdFile, markdownContent);
            
            // PDF styling options
            const options = {
                cssPath: path.join(__dirname, '../assets/pdf-style.css'),
                paperFormat: 'A4',
                paperOrientation: 'portrait',
                paperBorder: '1cm',
                runningsPath: path.join(__dirname, '../assets/pdf-header-footer.js'),
                // Ensure HTML and CSS are processed correctly
                remarkable: {
                    html: true,
                    breaks: true,
                    tables: true,
                    xhtmlOut: true
                },
                // Add a slight delay to ensure CSS is properly applied
                renderDelay: 1000
            };
            
            // Convert markdown to PDF
            markdownpdf(options)
                .from(tempMdFile)
                .to(tempPdfFile, () => {
                    // Read the generated PDF
                    const pdfBuffer = fs.readFileSync(tempPdfFile);
                    
                    // Clean up temp files
                    try {
                        fs.unlinkSync(tempMdFile);
                        fs.unlinkSync(tempPdfFile);
                    } catch (cleanupError) {
                        console.warn('Warning: Could not clean up temporary files:', cleanupError);
                    }
                    
                    console.log('PDF generation completed successfully');
                    resolve(pdfBuffer);
                });
        } catch (error) {
            console.error('Error generating PDF document:', error);
            reject(error);
        }
    });
}

/**
 * Generate markdown content from proposal object
 * @param {Object} proposal - Investment proposal object
 * @returns {String} - Markdown content
 */
function generateMarkdownFromProposal(proposal) {
    let markdown = `# ${proposal.title}\n\n`;
    markdown += `**Date:** ${proposal.date}\n\n`;
    
    // Add section contents
            const sections = [
                proposal.companyIntroduction,
                proposal.marketOverview,
                proposal.clientProfileRecap,
                proposal.assetAllocationSummary,
                proposal.productDetails,
                proposal.implementationPlan,
                proposal.disclaimers
            ];
            
            sections.forEach(section => {
                if (!section || !section.content) return;
                
        // Add the section title as a heading
        markdown += `\n# ${section.title}\n\n`;
        
        // Keep the content as is - markdown-pdf handles both Markdown and HTML
        // We won't strip out the HTML div wrappers as they're needed for styling
        let content = section.content;
        
        // Just ensure proper line breaks
        content = content.replace(/\\n/g, '\n');
        
        markdown += content + '\n\n';
    });
    
    return markdown;
}

/**
 * Render a table in the PDF with improved formatting
 * @param {PDFDocument} doc - PDFKit document
 * @param {Array} headers - Table headers
 * @param {Array} rows - Table rows
 */
function renderImprovedTable(doc, headers, rows) {
    try {
        // Early return for empty tables
        if (!headers || !rows || headers.length === 0 || rows.length === 0) {
            return;
        }
        
        // Check if we need to add a page for the table
        const estimatedTableHeight = (rows.length + 1) * 25 + 20; // Header + rows + margins
        if (doc.y + estimatedTableHeight > doc.page.height - 70) {
            doc.addPage();
        }
        
        // Calculate column widths based on content
        const availableWidth = doc.page.width - 100;
        let columnWidths = [];
        
        // Initialize with header widths
        headers.forEach(header => {
            const width = doc.widthOfString(header) + 20; // Text width + more padding
            columnWidths.push(width);
        });
        
        // Adjust based on row content widths - look through all content
        rows.forEach(row => {
            row.forEach((cell, i) => {
                if (i < headers.length) {
                    const width = doc.widthOfString(cell) + 20; // More padding for cell content
                    if (width > columnWidths[i]) {
                        columnWidths[i] = width;
                    }
                }
            });
        });
        
        // Make sure each column has a reasonable minimum width
        columnWidths = columnWidths.map(width => Math.max(width, 50));
        
        // Normalize column widths if they exceed available width
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        if (totalWidth > availableWidth) {
            const scaleFactor = availableWidth / totalWidth;
            columnWidths = columnWidths.map(width => width * scaleFactor);
        }
        
        // Set up position variables
        const startX = 50;
        let startY = doc.y;
        const rowHeight = 25;
        const tableStartY = startY;
        
        // Draw header with a stronger background
        doc.fillColor('#d0d0d0'); // Darker gray for header
        doc.rect(startX, startY, availableWidth, rowHeight).fill();
        doc.fillColor('#000000');
        
        // Add a little space before the table
        doc.moveDown(0.5);
        
        // Draw header text
        doc.font('Helvetica-Bold');
        let xOffset = startX;
        headers.forEach((header, i) => {
            // Determine text alignment
            const align = isNumeric(header) || header.includes('(₹)') || header.includes('(%)') ? 'right' : 'left';
            
            doc.text(
                header,
                xOffset + 5,
                startY + 7,
                { width: columnWidths[i] - 10, align: align }
            );
            xOffset += columnWidths[i];
        });
        
        // Move to next row
        startY += rowHeight;
        
        // Draw rows
        doc.font('Helvetica');
        rows.forEach((row, rowIndex) => {
            // Check if we need to add a page
            if (startY + rowHeight > doc.page.height - 50) {
                // Draw table borders for the current page
                drawTableBorders(doc, startX, tableStartY, columnWidths, startY - tableStartY);
                
                // Add new page and reset position
                doc.addPage();
                startY = 50;
                const tableStartY = startY;
                
                // Redraw header on new page
                doc.fillColor('#d0d0d0');
                doc.rect(startX, startY, availableWidth, rowHeight).fill();
                doc.fillColor('#000000');
                
                doc.font('Helvetica-Bold');
                let xOffset = startX;
                headers.forEach((header, i) => {
                    const align = isNumeric(header) || header.includes('(₹)') || header.includes('(%)') ? 'right' : 'left';
                    doc.text(
                        header,
                        xOffset + 5,
                        startY + 7,
                        { width: columnWidths[i] - 10, align: align }
                    );
                    xOffset += columnWidths[i];
                });
                
                // Move to next row and reset font
                startY += rowHeight;
                doc.font('Helvetica');
            }
            
            // Alternate row background for better readability
            if (rowIndex % 2 === 1) {
                doc.fillColor('#f0f0f0'); // Slightly darker for better contrast
                doc.rect(startX, startY, availableWidth, rowHeight).fill();
                doc.fillColor('#000000');
            }
            
            // Draw cells for this row
            let xOffset = startX;
            row.forEach((cell, i) => {
                if (i < headers.length) {
                    // Use bold for total row
                    if (cell.includes('Total Investment') || (cell === '' && row.some(c => c.includes('Total Investment')))) {
                        doc.font('Helvetica-Bold');
                    }
                    
                    // Determine text alignment
                    const align = isNumeric(cell) || cell.includes('₹') || cell.includes('%') ? 'right' : 'left';
                    
                    // Add more padding for better readability
                    doc.text(
                        cell,
                        xOffset + 5,
                        startY + 7,
                        { width: columnWidths[i] - 10, align: align }
                    );
                    xOffset += columnWidths[i];
                    
                    // Reset font after using bold
                    if (cell.includes('Total Investment') || (cell === '' && row.some(c => c.includes('Total Investment')))) {
                        doc.font('Helvetica');
                    }
                }
            });
            
            startY += rowHeight;
        });
        
        // Draw table borders with a thicker line for better visibility
        doc.lineWidth(0.7);
        drawTableBorders(doc, startX, tableStartY, columnWidths, startY - tableStartY);
        doc.lineWidth(0.5); // Reset line width
        
        // Update document Y position to after the table
        doc.y = startY + 15; // Add more space after the table
    } catch (error) {
        console.error('Error rendering improved table:', error);
        // Fallback to simple text
        doc.text('Table data could not be rendered properly.', 50, doc.y);
        doc.moveDown(1);
    }
}

/**
 * Draw borders around a table
 * @param {PDFDocument} doc - PDFKit document
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {Array} columnWidths - Array of column widths
 * @param {number} height - Total height of the table
 */
function drawTableBorders(doc, startX, startY, columnWidths, height) {
    // Draw outer rectangle with a slightly thicker border
    doc.rect(startX, startY, columnWidths.reduce((sum, width) => sum + width, 0), height).stroke();
    
    // Draw horizontal line after header with a slightly thicker line
    doc.moveTo(startX, startY + 25)
        .lineTo(startX + columnWidths.reduce((sum, width) => sum + width, 0), startY + 25)
        .stroke();
    
    // Draw vertical lines between columns
    let xPos = startX;
    columnWidths.forEach(width => {
        xPos += width;
        
        // Skip the last vertical line (it's part of the outer rectangle)
        if (xPos < startX + columnWidths.reduce((sum, w) => sum + w, 0)) {
            doc.moveTo(xPos, startY)
                .lineTo(xPos, startY + height)
                .stroke();
        }
    });
    
    // Draw horizontal lines between rows
    for (let y = startY + 25 * 2; y < startY + height; y += 25) {
        // Use a lighter stroke for row dividers
        doc.strokeOpacity(0.5);
        doc.moveTo(startX, y)
           .lineTo(startX + columnWidths.reduce((sum, width) => sum + width, 0), y)
           .stroke();
        doc.strokeOpacity(1); // Reset stroke opacity
    }
}

/**
 * Check if a string contains numeric data
 * @param {string} str - String to check
 * @returns {boolean} - True if numeric
 */
function isNumeric(str) {
    return /^[\d.,₹%]+$/.test(str.trim());
}

/**
 * Helper function to get month name
 * @param {Number} monthIndex - Month index (0-11)
 * @returns {String} - Month name
 */
function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
}

/**
 * Helper function to format currency
 * @param {Number} amount - Amount to format
 * @returns {String} - Formatted amount
 */
function formatCurrency(amount) {
    // Round to 0 decimal places to avoid floating point precision issues
    const roundedAmount = Math.round(amount);
    // Format with thousand separators
    return roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = {
    generateProposal,
    generateProposalPDF,
    recommendProducts,
    formatCurrency,
    renderImprovedTable
};
