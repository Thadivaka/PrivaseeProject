# Privasee Project Frontend

## Overview
Frontend application for the Privasee Project, built with React and TypeScript. This application provides a user interface for managing CAIQ (Consensus Assessment Initiative Questionnaire), handling question assignments, and implementing search functionality.

## Features
- Question Management Dashboard
- User Assignment System
- Real-time Search
- Multi-level Filtering
  - Property-based filtering
  - Assigned User filtering
- Responsive Design
- 
## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- React 18+
- TypeScript

## Installation

1. Clone the repository
```bash
git clone https://github.com/Thadivaka/privaseeProject.git
cd privaseeProject/frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```
Add the following to your `.env`:
```env
REACT_APP_API_URL=http://localhost:4000/api
```

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── AddQuestion/
│   │   ├── MainPage/
│   │   └── common/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
└── tsconfig.json
```

## Components

### Main Components

1. **MainPage**
```typescript
// Main dashboard component
- Question table display
- Filtering system
- Search functionality
- Assignment management
```

2. **AddQuestion**
```typescript
// Question creation/editing component
- Form handling
- Question submission
```

### Interface Types

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
  isSelected?: boolean;
}

interface Property {
  propertyId: string;
  propertyName: string;
}

interface User {
  id: string;
  name: string;
}
```

## Features Documentation

### 1. Filtering System
The application implements multiple filtering mechanisms:
```typescript
// Assigned To Filter
const handleFilterChange = (userId: string) => {
  setSelectedAssignee(userId);
  // Filter questions based on assigned user
};

// Property Filter
const handlePropertyFilter = (propertyId: string) => {
  setSelectedProperty(propertyId);
  // Filter questions based on property
};
```

### 2. Search Implementation
```typescript
// Search functionality
const handleSearch = async (query: string) => {
  // Performs search and updates results
};
```

### 3. Bulk Assignment
```typescript
// Bulk assignment functionality
const handleBulkAssignedToChange = (userId: string) => {
  // Update assignments for selected questions
};
```

## Available Scripts

```bash
# Start development server
npm start

```

## Styling

The application uses a combination of:
- Custom CSS
- CSS Modules
- Responsive design principles

Example class structure:
```css
.filter-container {
  display: flex;
  gap: 24px;
  padding: 20px;
}

.search-group {
  display: flex;
  align-items: center;
}
```

## API Integration

The frontend integrates with the backend API:
```typescript
// Example API calls
const fetchQuestions = async () => {
  const response = await fetch(`${API_URL}/questions`);
  return response.json();
};

const updateAssignment = async (data) => {
  const response = await fetch(`${API_URL}/questions/update-assigned`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

## State Management

The application uses React's built-in state management:
- useState for local state
- useEffect for side effects
- Props for component communication

## Performance Optimizations

1. Debounced Search
2. Memoized Components
3. Efficient Filtering
4. Optimized Rendering

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Guidelines

1. **Code Style**
   - Use TypeScript strictly
   - Follow ESLint configuration
   - Use functional components
   - Implement proper error handling

2. **Component Structure**
   - Keep components small and focused
   - Use TypeScript interfaces
   - Implement proper prop types
   - Add JSDoc comments

## Troubleshooting

Common issues and solutions:

1. **Build Issues**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

2. **Runtime Issues**
```bash
# Check for correct environment variables
echo $REACT_APP_API_URL

# Verify API connectivity
curl $REACT_APP_API_URL/health
```
