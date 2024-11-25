import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddQuestion.css';

interface Property {
    propertyId: string;
    propertyName: string;
  }

interface QuestionForm {
  question: string;
  answer: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  assignedTo: string;
  properties: Property[]; 
  questionDescription: string;
}

interface User {
    userId: string;
    name: string;
  }
  
const AddQuestion: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState<QuestionForm>({
    question: '',
    answer: '',
    createdBy: '',
    createdAt: '',
    updatedBy: '',
    updatedAt: '',
    assignedTo: '',
    properties: [],
    questionDescription: ''
  });


useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        }
    };

    fetchUsers();
}, []);

useEffect(() => {
    const questionData = location.state?.questionData;
    if (questionData) {
        setIsEditMode(true);
        setFormData({
            question: questionData.question || '',
            answer: questionData.answer || '',
            createdBy: questionData.createdBy || '',
            createdAt: questionData.createdAt || '',
            updatedBy: questionData.updatedBy || '',
            updatedAt: questionData.updatedAt || '',
            assignedTo: questionData.assignedTo || '',
            properties: Array.isArray(questionData.properties) 
                ? questionData.properties
                : [],
            questionDescription: questionData.questionDescription || ''
        });
    }
}, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        if (isEditMode) {
            
            const url = `http://localhost:4000/api/questions/${location.state.questionData.recordId}/user/manuel@testcompany.com`;
            
            const response = await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                answer: formData.answer,
                assignedTo: formData.assignedTo,
                properties: formData.properties,
                updatedBy: formData.updatedBy
              })
            });
    
            if (!response.ok) {
              throw new Error('Failed to update question');
            }
          } else {
            const response = await fetch('http://localhost:4000/api/questions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                company: 'Test Company2',
                question: formData.question,
                answer: formData.answer,
                companyId: 'COMP123',
                createdBy: formData.createdBy,
                createdAt: formData.createdAt,
                updatedBy:formData.updatedBy,
                updatedAt: formData.updatedAt,
                assignedTo: formData.assignedTo,
                properties: formData.properties,
                questionDescription: formData.questionDescription,
              })
            });
    
            if (!response.ok) {
              throw new Error('Failed to create question');
            }
          }
    
          alert(`Question ${isEditMode ? 'updated' : 'created'} successfully!`);
          navigate('/');
    
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Error:', err);
        } finally {
          setIsLoading(false);
        }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

  return (
    <div className="add-question-container">
      <div className="add-question-header">
        <h2>{isEditMode ? 'Update Question' : 'Add New Question'}</h2>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
        >
          Back
        </button>
      </div>

    {error && (
      <div className="error-message">
        {error}
      </div>
    )}
      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label htmlFor="question">Question*</label>
          <textarea
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            required
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="answer">Answer</label>
          <textarea
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="createdBy">Created By</label>
            <select
                id="createdBy"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleChange}
                className="form-select"
            >
                <option value="">Select Created By</option>
                {users.map(user => (
                    <option key={user.userId} value={user.userId}>
                        {user.name} ({user.userId})
                    </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="CreatedAt">Created At</label>
            <input
              type="text"
              id="CreatedAt"
              name="CreatedAt"
              value={formData.createdAt}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="updatedBy">Updated By</label>
            <select
                id="updatedBy"
                name="updatedBy"
                value={formData.updatedBy}
                onChange={handleChange}
                className="form-select"
            >
                <option value="">Select Updated By</option>
                {users.map(user => (
                    <option key={user.userId} value={user.userId}>
                        {user.name} ({user.userId})
                    </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="updatedAt">Updated At</label>
            <input
              type="text"
              id="updatedAt"
              name="updatedAt"
              value={formData.updatedAt}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="AssignedTo">Assigned To</label>
            <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="form-select"
            >
                <option value="">Select Assigned To</option>
                {users.map(user => (
                    <option key={user.userId} value={user.userId}>
                        {user.name} ({user.userId})
                    </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-group">
            <label htmlFor="properties">Properties</label>
            <div className="properties-container">
                {formData.properties.map((prop, index) => (
                    <span key={index} className="property-tag">
                        {prop.propertyId}
                    </span>
                ))}
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="questionDescription">Question Description</label>
          <textarea
            id="questionDescription"
            name="questionDescription"
            value={formData.questionDescription}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-actions">
            <button 
            type="submit" 
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Question' : 'Save Question'}
            </button>
            <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
            disabled={isLoading}
            >
            Cancel
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestion;