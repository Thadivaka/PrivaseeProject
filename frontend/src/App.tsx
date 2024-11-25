import React, { useEffect, useState } from "react";
import "./index.css";
import { BrowserRouter, Route, Router, Routes, useNavigate } from "react-router-dom";
import AddQuestion from "./AddQuestion";

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

interface PropertyDetail {
  propertyId: string;
  propertyName: string;
  propertyType?: string;
  relatedQuestion?: string[];
  relatedCompany?: string[];
  assignedUser?: string[];
  description?: string;
}

interface PropertyResponse {
  properties: PropertyDetail[];
}

interface SearchResult {
  recordId: string;
  question: string;
  answer: string;
  score: number;
}

const HeaderButtons: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="header-buttons">
      <button 
        className="btn btn-primary" 
        onClick={() => navigate('/add-question')}
      >
        Add Questions
      </button>
      <button className="btn btn-success">
        Save/Update
      </button>
    </div>
  );
};

// Main Page Component
const MainPage: React.FC = () => {
  const [allquestionsanswers, setAllQuestionsAnswers] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [properties, setProperties] = useState<PropertyDetail[]>([]);
  const [allproperties, setAllProperties] = useState<PropertyDetail[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigate = useNavigate();

  const handleQuestionSelect = (recordId: string) => {
    setFilteredQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.recordId === recordId ? { ...q, isSelected: !q.isSelected } : q
      )
    );
    
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const handleSearch = async () => {
    try {
      const requestUrl = `http://localhost:4000/api/questions/search?query=${encodeURIComponent(searchQuery)}`;
      console.log("Request URL:", requestUrl);
      
      const response = await fetch(requestUrl);
      console.log("Response Status:", response.status);

      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const searchResults = await response.json();
    const matchedQuestions = searchResults.map((result: SearchResult) => {
      const fullQuestion = allquestionsanswers.find(q => q.id === result.recordId);
      if (fullQuestion) {
        return {
          ...fullQuestion,
        };
      }
      return null;
    });

    setFilteredQuestions(matchedQuestions);
    setQuestions(matchedQuestions);

    setSelectedQuestions(new Set());
    
    if (matchedQuestions.length === 0) {
      alert('No matching questions found');
    }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handlePropertyFilter = (propertyId: string) => {
    setSelectedProperty(propertyId);
    if (propertyId === '') {
      setFilteredQuestions(allquestionsanswers);
    } else {
      if(filteredQuestions.length > 0){
        setFilteredQuestions(filteredQuestions.filter(question => question.properties.some(prop => prop.propertyId === propertyId)));
      }
      else{
        setFilteredQuestions(allquestionsanswers.filter(question => question.properties.some(prop => prop.propertyId === propertyId)));
      }
    }
    setSelectedQuestions(new Set());
  };

  const handleFilterChange = (userId: string) => {
    setSelectedAssignee(userId);
    console.log('Selected Assignee:', userId);
    if (userId === '') {
      setFilteredQuestions(allquestionsanswers);
    } else {
      if(filteredQuestions.length > 0){
        setFilteredQuestions(filteredQuestions.filter(question => question.assignedTo === userId));
      }
      else{
        setFilteredQuestions(allquestionsanswers.filter(question => question.assignedTo === userId));
      }
    }

    setSelectedQuestions(new Set());
  };
  const handleBulkAssignedToChange = (userId: string) => {
    const updatedQuestions = questions.map((q) =>
      selectedQuestions.has(q.recordId)
        ? { 
            ...q, 
            assignedTo: userId, 
            assignedToName: users.find((u) => u.id === userId)?.name || 'Unassigned' 
          }
        : q
    );
    
    setQuestions(updatedQuestions);
    setFilteredQuestions(
      selectedAssignee 
        ? updatedQuestions.filter(q => q.assignedTo === selectedAssignee)
        : updatedQuestions
    );
  };

  const handleUpdateAssignments = async () => {
    if (selectedQuestions.size === 0) {
      alert('Please select at least one question to update');
      return;
    }

    try {
      const updatesArray = Array.from(selectedQuestions).map(recordId => {
        const question = questions.find(q => q.recordId === recordId);
        return {
          recordId: recordId,
          assignedTo: question?.assignedTo || ''
        };
      }).filter(update => update.assignedTo !== '');

      if (updatesArray.length === 0) {
        alert('Selected questions must have assignments');
        return;
      }

      const requestBody = {
        questions: updatesArray,
        updatedBy: "manuel@testcompany.com" 
      };

      // Make the API call
      const response = await fetch('http://localhost:4000/api/questions/update-assigned', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to update assignments');
      }

      const updatedData = await response.json();
      
      setQuestions(questions.map(question => {
        const updatedQuestion = updatedData.find((uq: any) => uq.recordId === question.recordId);
        if (updatedQuestion) {
          return {
            ...question,
            assignedTo: updatedQuestion.assignedTo,
            assignedToName: updatedQuestion.assignedToName,
            updatedAt: updatedQuestion.updatedAt,
            isSelected: false
          };
        }
        return question;
      }));

      setSelectedQuestions(new Set());
      
      alert('Assignments updated successfully!');
    } catch (error) {
      console.error('Error updating assignments:', error);
      alert('Failed to update assignments. Please try again.');
    }
  };

  useEffect(() => {
    setQuestions(filteredQuestions);
  }, [filteredQuestions])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsResponse, usersResponse, propertiesResponse] = await Promise.all([
          fetch('http://localhost:4000/api/questions'),
          fetch('http://localhost:4000/api/users'),
          fetch('http://localhost:4000/api/properties')
        ]);

        if (!questionsResponse.ok || !usersResponse.ok || !propertiesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const questionsData = await questionsResponse.json();
        const usersData = await usersResponse.json();
        const propertiesData: PropertyResponse = await propertiesResponse.json();

        const formattedQuestions = questionsData.map((item: any) => ({
          id: item.id,
          recordId: item.recordId,
          company: item.company || [],
          question: item.question,
          answer: item.answer || 'N/A',
          companyId: item.companyId || '',
          createdAt: item.createdAt || 'N/A',
          updatedAt: item.updatedAt || 'N/A',
          updatedBy: item.updatedBy || 'N/A',
          updatedByName: item.updatedByName || 'N/A',
          createdBy: item.createdBy || 'N/A',
          createdByName: item.createdByName || 'N/A',
          assignedTo: item.assignedTo || 'Unassigned',
          assignedToName: item.assignedToName || 'Unassigned',
          properties: Array.isArray(item.properties)
            ? item.properties.map((prop: Property) => ({
                propertyId: prop.propertyId || '',
                propertyName: prop.propertyName || ''
              }))
            : [],
          questionDescription: item.questionDescription || '',
          status: item.status || 'Incomplete',
          isSelected: false
        }));

        const formattedUsers = usersData.map((item: any) => ({
          id: item.userId,
          name: item.name
        }));

        setAllQuestionsAnswers(formattedQuestions);
        setQuestions(formattedQuestions);
        setFilteredQuestions(formattedQuestions);
        setProperties(propertiesData.properties);
        setAllProperties(propertiesData.properties);
        setUsers(formattedUsers);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    const handleSaveUpdate = () => {
      const selectedQuestions = questions.filter(q => q.isSelected);
      if (selectedQuestions.length === 0) {
        alert('Please select at least one question to update');
        return;
      }
      if (selectedQuestions.length > 1) {
        alert('Please select only one question to update');
        return;
      }
      
      console.log('Selected question:', selectedQuestions[0]);
      navigate('/add-question', { state: { questionData: selectedQuestions[0] } });
    };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app">
              <header className="header">
                  <h1>CAIQ</h1>
                <div className="header-buttons">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => navigate('/add-question')}
                    >
                      Add Questions
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={handleSaveUpdate}
                  >
                    Update Answer
                  </button>
                  <div className="bulk-assign-container">
            {selectedQuestions.size > 0 && (
              <select
                className="bulk-assign-select"
                onChange={(e) => handleBulkAssignedToChange(e.target.value)}
                value=""
              >
                <option value="">Assign Selected To...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
            <button 
              className="btn btn-success"
              onClick={handleUpdateAssignments}
              disabled={selectedQuestions.size === 0}
            >
              Update Assignments ({selectedQuestions.size})
            </button>
          </div>
              </div>
              </header>
      <main className="main-container">
        <div className="table-controls">
            <div className="filter-container">
              <label htmlFor="assigneeFilter">Filter by Assigned To:</label>
              <select
                id="assigneeFilter"
                className="filter-select"
                value={selectedAssignee}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="">All Assignees</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.id})
                  </option>
                ))}
              </select>
              {selectedAssignee && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handleFilterChange('')}
                >
                  Clear Filter
                </button>
              )}
            </div>
            <br></br>
            <div className="filter-group">
              <label htmlFor="propertyFilter">Filter by Property:</label>
              <select
                id="propertyFilter"
                className="filter-select"
                value={selectedProperty}
                onChange={(e) => handlePropertyFilter(e.target.value)}
              >
                <option value="">All Properties</option>
                {properties.map((property) => (
                  <option key={property.propertyId} value={property.propertyId}>
                    {property.propertyId}
                  </option>
                ))}
              </select>
              {selectedProperty && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handlePropertyFilter('')}
                >
                  Clear
                </button>
              )}
            </div>
            <br></br>
            <div className="search-group">
              <label htmlFor="searchInput">Search:</label>
              <input
                id="searchInput"
                type="text"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search terms..."
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                Search
              </button>
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handleFilterChange('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        <div className="table-container">
          <table className="question-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Question</th>
                <th>Properties</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={question.isSelected || false}
                        onChange={() => handleQuestionSelect(question.recordId)}
                        className="question-checkbox"
                      />
                    </td>
                    <td>{question.question}</td>
                    <td>
                      {question.properties.map((prop, index) => (
                        <span key={index} className="property-tag">
                          {prop.propertyId}
                          {index < question.properties.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                    <td>
                    <select
                      className="assigned-to-select disabled"
                      value={question.assignedTo || ''}
                      disabled={true}
                    >
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    </td>
                    <td className={`status ${question.status.toLowerCase()}`}>
                      {question.status || 'Incomplete'}
                    </td>
                    <td>{question.updatedAt}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// Root Layout Component
const RootLayout: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/add-question" element={<AddQuestion />} />
      </Routes>
    </BrowserRouter>
  );
};

// App Component
const App: React.FC = () => {
  return <RootLayout />;
};

export default App;

