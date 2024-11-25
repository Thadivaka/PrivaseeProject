import { FieldSet } from "airtable";

export interface QuestionFields extends FieldSet {
    'Record ID': string;
    'Company': string[];
    'Question': string;
    'Answer': string;
    'Company ID': string;
    'Created By': string[];
    'Created At': string;
    'Updated By': string[];
    'Updated At': string;
    'Assigned To': string[];
    'Properties': string[];
    'Question Description': string;
}

export interface Question {
    id?: string;               // Record ID
    company: string;           // Company
    question: string;          // Question
    answer: string;            // Answer
    companyId: string;         // Company ID
    createdAt?: string;        // Created At
    updatedAt?: string;        // Updated At
    updatedBy: string;         // Updated By
    createdBy: string;         // Created By
    assignedTo: string;        // Assigned To
    properties: PropertyDetail[];        // Properties
    questionDescription: string; // Question Description
    status: string; // Question Description
  }
  
  export interface QueryParams {
    assignedTo?: string;
    properties?: string;
    search?: string;
  }
  
  export interface BulkAssignRequest {
    questionIds: string[];
    assignedTo: string;
    updatedBy: string;
  }

export interface QuestionParams {
    questionId: string;
    userId: string;
}

// Define interface for request body
export interface UpdateQuestionBody {
    answer: string;
}  

export interface User {
  userId: string;
  name: string;
}

export interface PropertyDetail {
    propertyId: string;
    propertyName: string;
  }

export interface UpdateAssignedToRequest {
    questions: {
      recordId: string;
      assignedTo: string;
    }[];
    updatedBy: string;
  }

export interface Property {
    propertyId: string;
    propertyName: string;
    propertyType?: string;
    relatedQuestion?: string[];
    relatedCompany?: string[];
    assignedUser?: string[];
    description?: string;
  }

export interface SearchQueryParams {
    query?: string;
    searchType?: string;
  }
  
export interface SearchResult {
    recordId: string | undefined;
    question: string | undefined;
    answer: string | undefined;
    score: number;
  }
