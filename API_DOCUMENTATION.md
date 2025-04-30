# Invest4DU API Documentation

## Overview

The Invest4DU API provides a comprehensive suite of endpoints for generating personalized investment proposals based on client profiles, risk assessments, and asset allocations. This API allows financial advisors and applications to create detailed investment recommendations tailored to individual client needs.

## Base URL

Production: `https://investeduapi-3uqwegfq9-princechintu70-yahoocoms-projects.vercel.app`

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## API Endpoints

### Health Check

```
GET /
```

Checks if the API is running.

**Response:**
```json
{
  "message": "Investment Proposal API is running"
}
```

### Client Profiling

```
POST /api/profile
```

Process client profile information to create a structured client profile.

**Request Body:**
```json
{
  "personalInfo": {
    "name": "John Doe",
    "age": 35,
    "occupation": "Software Engineer",
    "annualIncome": 120000,
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "address": "123 Main St, Anytown, USA"
  },
  "financialSituation": {
    "netWorth": 500000,
    "monthlyExpenses": 3000,
    "existingInvestments": {
      "stocks": 100000,
      "bonds": 50000,
      "realEstate": 200000,
      "cash": 30000
    },
    "debts": {
      "mortgage": 250000,
      "studentLoans": 20000,
      "carLoan": 15000,
      "creditCards": 5000
    },
    "emergencyFund": 25000,
    "insuranceCoverage": {
      "health": true,
      "life": true,
      "disability": false,
      "propertyAndCasualty": true
    }
  },
  "investmentObjectives": {
    "primaryGoal": "retirement",
    "timeHorizon": 25,
    "initialInvestmentAmount": 100000,
    "monthlyContribution": 1000,
    "riskTolerance": "moderate"
  },
  "preferences": {
    "preferredInvestmentTypes": ["stocks", "bonds", "mutualFunds"],
    "excludedSectors": ["tobacco", "gambling"],
    "preferredGeographies": ["US", "Europe"],
    "sustainabilityFocus": true,
    "liquidityNeeds": "medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "clientProfile": {
    // Processed client profile with additional metadata
  }
}
```

### Risk Assessment

```
POST /api/risk-assessment
```

Assess the risk profile of a client based on their profile information.

**Request Body:**
```json
{
  "personalInfo": {
    "age": 35
  },
  "investmentObjectives": {
    "timeHorizon": 25,
    "riskTolerance": "moderate"
  },
  "financialSituation": {
    "netWorth": 500000,
    "emergencyFund": 25000
  }
}
```

**Response:**
```json
{
  "success": true,
  "riskAssessment": {
    "riskScore": 65,
    "riskCategory": "moderate",
    "ageFactorScore": 70,
    "timeHorizonScore": 80,
    "selfReportedRiskScore": 60,
    "financialStabilityScore": 75,
    "recommendedAssetAllocation": {
      "equity": 65,
      "debt": 25,
      "alternatives": 5,
      "cash": 5
    }
  }
}
```

### Manual Asset Allocation

```
POST /api/manual-allocation
```

Process a manually specified asset allocation and generate appropriate risk assessment and product recommendations.

**Request Body:**
```json
{
  "assetAllocation": {
    "assetClassAllocation": {
      "equity": 60,
      "debt": 30,
      "goldSilver": 5,
      "cash": 5
    },
    "productTypeAllocation": {
      "equity": {
        "mutualFunds": 80,
        "etf": 20
      },
      "debt": {
        "mutualFunds": 70,
        "direct": 30
      },
      "goldSilver": {
        "etf": 60,
        "physical": 40
      }
    }
  },
  "clientProfile": {
    // Client profile information as in the /api/profile endpoint
  }
}
```

**Response:**
```json
{
  "success": true,
  "clientProfile": {
    // Client profile information
  },
  "riskProfile": {
    "riskScore": 60,
    "riskCategory": "moderate"
  },
  "assetAllocation": {
    // Processed asset allocation with additional details
  },
  "productRecommendations": {
    // Product recommendations based on the allocation
  }
}
```

### Asset Allocation

```
POST /api/asset-allocation
```

Generate an asset allocation based on client profile and risk assessment.

**Request Body:**
```json
{
  "clientProfile": {
    // Client profile information as in the /api/profile endpoint
  },
  "riskProfile": {
    // Risk profile information as in the /api/risk-assessment response
  }
}
```

**Response:**
```json
{
  "success": true,
  "assetAllocation": {
    "portfolioSize": 100000,
    "portfolioSizeCategory": "medium",
    "assetClassAllocation": {
      "equity": 65,
      "debt": 25,
      "goldSilver": 5,
      "cash": 5
    },
    "productTypeAllocation": {
      "equity": {
        "mutualFunds": 80,
        "etf": 20
      },
      "debt": {
        "mutualFunds": 70,
        "direct": 30
      },
      "goldSilver": {
        "etf": 60,
        "physical": 40
      }
    }
  }
}
```

### Product Recommendations

```
POST /api/product-recommendations
```

Generate product recommendations based on client profile, risk assessment, and asset allocation.

**Request Body:**
```json
{
  "clientProfile": {
    // Client profile information
  },
  "riskProfile": {
    // Risk profile information
  },
  "assetAllocation": {
    // Asset allocation information
  }
}
```

**Response:**
```json
{
  "success": true,
  "productRecommendations": {
    "equity": {
      "mutualFunds": [
        {
          "name": "Vanguard Total Stock Market ETF",
          "ticker": "VTI",
          "expenseRatio": 0.03,
          "category": "Large Blend",
          "allocation": 25,
          "amountToInvest": 25000,
          "description": "Provides broad exposure to the U.S. equity market"
        },
        // Additional mutual fund recommendations
      ],
      "etf": [
        // ETF recommendations
      ]
    },
    "debt": {
      "mutualFunds": [
        // Debt mutual fund recommendations
      ],
      "direct": [
        // Direct debt instrument recommendations
      ]
    },
    "goldSilver": {
      "etf": [
        // Gold/Silver ETF recommendations
      ],
      "physical": [
        // Physical gold/silver recommendations
      ]
    },
    "cash": [
      // Cash and cash equivalent recommendations
    ]
  }
}
```

### Generate Investment Proposal

```
POST /api/generate-proposal
```

Generate a complete investment proposal based on client data.

**Request Body:**
```json
{
  "clientProfile": {
    // Client profile information
  },
  "riskProfile": {
    // Risk profile information
  },
  "assetAllocation": {
    // Asset allocation information
  },
  "productRecommendations": {
    // Product recommendations
  }
}
```

**Response:**
```json
{
  "success": true,
  "investmentProposal": {
    "title": "Investment Proposal for John Doe",
    "date": "April 29, 2025",
    "clientSummary": {
      // Summary of client information
    },
    "riskAssessment": {
      // Risk assessment summary
    },
    "investmentStrategy": {
      // Investment strategy details
    },
    "assetAllocation": {
      // Asset allocation details
    },
    "productRecommendations": {
      // Product recommendation details
    },
    "implementationPlan": {
      // Implementation plan
    },
    "monitoringAndRebalancing": {
      // Monitoring and rebalancing guidelines
    },
    "disclaimers": {
      // Legal disclaimers
    }
  }
}
```

### Generate Investment Proposal PDF

```
POST /api/generate-proposal-pdf
```

Generate a PDF document of the investment proposal.

**Request Body:**
Same as `/api/generate-proposal`

**Response:**
A PDF file with the investment proposal, with the following headers:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="investment_proposal_[DATE].pdf"

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (invalid input)
- 500: Internal Server Error

## Sample Workflow

A typical workflow for using the API would be:

1. Submit client information to `/api/profile`
2. Use the client profile to get a risk assessment with `/api/risk-assessment`
3. Generate an asset allocation with `/api/asset-allocation`
4. Get product recommendations with `/api/product-recommendations`
5. Generate a complete investment proposal with `/api/generate-proposal`
6. Generate a PDF version with `/api/generate-proposal-pdf`

Alternatively, for a more manual approach:
1. Submit client information to `/api/profile`
2. Submit a manual asset allocation with `/api/manual-allocation` (which will also return risk profile and product recommendations)
3. Generate a complete investment proposal with `/api/generate-proposal`
4. Generate a PDF version with `/api/generate-proposal-pdf`

## Rate Limiting

Currently, there are no rate limits in place. This may change in future versions of the API.

## Versioning

This documentation is for version 1.0.0 of the Invest4DU API.
