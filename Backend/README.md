# Privasee Project Backend

## Overview
Backend service for the Privasee Project, built with Node.js, Express, and TypeScript. This service handles CAIQ (Consensus Assessment Initiative Questionnaire) management, user assignments, and search functionality.

## Features
- Questions and Answers Management
- User Assignment System
- Advanced Search Functionality (TF-IDF)
- Property-based Filtering
- Airtable Integration for Data Storage

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Airtable Account and API Key
- TypeScript

## Installation

1. Clone the repository
```bash
git clone https://github.com/Thadivaka/privaseeProject.git
cd privaseeProject/backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```
Then edit `.env` with your credentials:
```env
PORT=4000
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
```

## Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── airtable.ts     # Airtable configuration
│   ├── utils/
│   │   ├── search.ts       # Search utility functions
│   │   └── tfidfSearch.ts  # TF-IDF search implementation
│   ├── types.ts            # TypeScript interfaces
│   └── server.ts           # Main application file
├── package.json
└── tsconfig.json
```

## API Endpoints

### Questions
```typescript
GET /api/questions
- Get all questions
- Query params:
  - assignedTo: Filter by assigned user
  - search: Search term for questions/answers

POST /api/questions
- Create new question
- Required fields: company, question, answer, companyId

PUT /api/questions/:questionId/user/:userId
- Update question answer
- Params: questionId, userId
- Body: { answer: string }

PUT /api/questions/update-assigned
- Bulk update question assignments
- Body: { questions: Array, updatedBy: string }
```

### Users
```typescript
GET /api/users
- Get all users
```

### Properties
```typescript
GET /api/properties
- Get all properties
```

### Search
```typescript
GET /api/questions/search
- Search questions and answers
- Query params:
  - query: Search term
  - searchType: Search algorithm type (fuzzy/tfidf)
```

## Data Models

### Question
```typescript
interface Question {
  id: string;
  recordId: string;
  company: string[];
  question: string;
  answer: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  updatedByName: string;
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  properties: Property[];
  questionDescription: string;
  status: string;
}
```

### Property
```typescript
interface Property {
  propertyId: string;
  propertyName: string;
  propertyType?: string;
  relatedQuestion?: string[];
  relatedCompany?: string[];
  assignedUser?: string[];
  description?: string;
}
```

## Running the Application

### Development
```bash
# Run with ts-node
npm run dev

# Or with nodemon for auto-reload
npm run dev:watch
```

## Search Implementation
TF-IDF Search
   - Term Frequency-Inverse Document Frequency
   - Better for semantic relevance
   - More accurate for large datasets

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting
Common issues and solutions:

1. Connection Issues
```bash
# Check if server is running
curl http://localhost:4000/api/health

# Verify Airtable connection
curl http://localhost:4000/api/health/airtable
```

2. Database Issues
```bash
# Reset Airtable cache
npm run clear-cache
```
