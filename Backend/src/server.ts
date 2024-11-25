
import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import { base } from './config/airtable';
import { calculateSearchScore, createFuzzyMatcher } from './utils/search';
import { Question, QueryParams, BulkAssignRequest, QuestionParams, UpdateQuestionBody, User, UpdateAssignedToRequest, Property, SearchResult, SearchQueryParams } from './types';
import { TFIDFSearchEngine } from './utils/tfidfSearch';

const app = express();
app.use(cors());
app.use(express.json());

const searchEngine = new TFIDFSearchEngine();

app.get('/api/questions', async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
  try {
    const { assignedTo, search } = req.query;
    
    const userRecords = await base('Users').select().all();
    const users = new Map(
      userRecords.map(user => [
        user.id,
        {
          userId: user.get('User ID') as string,
          name: user.get('Name') as string
        }
      ])
    );

    const propertyRecords = await base('Properties').select().all();
    const properties = new Map(propertyRecords.map(property => [
      property.id,
      {
        propertyId: property.get('Property ID') as string,
        propertyName: property.get('Property Name') as string,
        relatedQuestion: property.get('Related Question') as string[]
      }
    ]));

    let filterFormula = `AND({Company} = 'Test Company Limited')`;

    if (assignedTo) {
      filterFormula += `,{Assigned To} = '${assignedTo}'`;
    }

    const records = await base('Questions and Answers').select({
        
        fields: ['Record ID', 'Company', 'Question', 'Answer', 'Company ID', 
                 'Created At', 'Updated At', 'Updated By', 'Created By', 
                 'Assigned To', 'Properties', 'Question Description', 'Status']
      }).all();

      let questions: Question[] = records.map(record => {
        try {
            const assignedToIds = record.get('Assigned To') as string[] || [];
            const createdByIds = record.get('Created By') as string[] || [];
            const updatedByIds = record.get('Updated By') as string[] || [];
            const propertyIds = record.get('Properties') as string[] || [];

            const assignedToId = assignedToIds[0];
            const createdById = createdByIds[0];
            const updatedById = updatedByIds[0];
           
            const propertyDetails = propertyIds.map(propId => properties.get(propId))
            .filter(prop => prop !== undefined)
            .map(prop => ({
              propertyId: prop?.propertyId || '',
              propertyName: prop?.propertyName || ''
            }));

            return {
                id: record.id,
                recordId: record.get('Record ID') as string || '',
                company: record.get('Company') as string || '',
                question: record.get('Question') as string || '',
                answer: record.get('Answer') as string || '',
                companyId: record.get('Company ID') as string || '',
                createdAt: record.get('Created At') as string,
                updatedAt: record.get('Updated At') as string,
                updatedBy: users.get(updatedById)?.userId || '',
                updatedByName: users.get(updatedById)?.name || '',
                createdBy: users.get(createdById)?.userId || '',
                createdByName: users.get(createdById)?.name || '',
                assignedTo: users.get(assignedToId)?.userId || '',
                assignedToName: users.get(assignedToId)?.name || '',
                properties: propertyDetails,
                questionDescription: record.get('Question Description') as string || '',
                status: record.get('Status') as string || ''
            };
        } catch (error) {
            console.error(`Error mapping record ${record.id}:`, error);
            console.error('Record data:', record.fields);
            throw error;
        }
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const records = await base('Users').select({
        fields: ['User ID', 'Name']
      }).all();
  
      const users: User[] = records.map(record => ({
        userId: record.get('User ID') as string,
        name: record.get('Name') as string
      }));
  
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

app.get('/api/questions/search', async (req: Request<{}, {}, {}, SearchQueryParams>, res: Response) => {
    try {
      const { query, searchType = "" } = req.query;
      
      const records = await base('Questions and Answers').select({
        fields: ['Record ID', 'Question', 'Answer']
      }).all();

      var text = "";
        records.forEach(record => {
          text = `${record.get('Question')} ${record.get('Answer')}`;
          searchEngine.addDocument(record.id, text);
        });
  
        const searchResults = searchEngine.search(query as string, 10);
        const results: SearchResult[] = searchResults.map(result => ({
          recordId: result.id,
          question: records.find(record => record.id === result.id)?.get('Question') as string,
          answer: records.find(record => record.id === result.id)?.get('Answer') as string,
          score: result.score
        }));

      res.json(results);
      searchEngine.clear();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/properties', async (req: Request, res: Response) => {
    try {
      const propertyRecords = await base('Properties').select({
        fields: [
          'Property ID',
          'Property Name',
          'Property Type',
          'Related Question',
          'Related Company',
          'Assigned User',
          'Description'
        ]
      }).all();
  
      const properties: Property[] = propertyRecords.map(record => {
        try {
          return {
            propertyId: record.get('Property ID') as string || '',
            propertyName: record.get('Property Name') as string || '',
            propertyType: record.get('Property Type') as string || '',
            relatedQuestion: record.get('Related Question') as string[] || [],
            relatedCompany: record.get('Related Company') as string[] || [],
            assignedUser: record.get('Assigned User') as string[] || [],
            description: record.get('Description') as string || ''
          };
        } catch (error) {
          console.error(`Error mapping property record ${record.id}:`, error);
          console.error('Record data:', record.fields);
          throw error;
        }
      });
  
      properties.sort((a, b) => {
        if (a.propertyId < b.propertyId) return -1;
        if (a.propertyId > b.propertyId) return 1;
        return 0;
      });
  
      res.json({ properties });
  
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ error: 'Failed to fetch properties' });
    }
  });  
  
app.post('/api/questions', async (req: Request<{}, {}, Question>, res: Response) => {
  try {
    const {
        company,
        question,
        answer,
        companyId,
        createdBy,
        assignedTo,
        properties,
        questionDescription
    } = req.body;

    const existingRecords = await base('Questions and Answers')
      .select({
        fields: ['Record ID']
      })
      .all();
    
    const recordCount = existingRecords.length + 1;
    const recordId = `rec${String(recordCount).padStart(3, '0')}`;
    
    const companyRecords = await base('Companies').select({
        filterByFormula: `{Company ID} = 'Test Company Limited'`
    }).firstPage();

    const userId = await base('Users').select({
        filterByFormula: `{User ID} = '${createdBy}'`
    }).firstPage();

    const propertyId = await base('Properties').select({
        filterByFormula: `{Property ID} = 'section:Privacy'`
    }).firstPage();
    
    if (companyRecords.length > 0 && userId.length > 0 && propertyId.length > 0) {
        const companyRecordId = companyRecords[0].id;
        const  user_id = userId[0].id;
        const property_Id = propertyId[0].id;
        
        const record = await base('Questions and Answers').create({
            'Record ID': recordId,
            'Company': [companyRecordId], 
            'Question': question,
            'Answer': answer,
            'Company ID': companyId,
            'Created At': new Date().toISOString(),
            'Updated At': new Date().toISOString(),
            'Updated By': [user_id],
            'Created By': [user_id],
            'Assigned To': [user_id],
            'Properties': [property_Id],
            'Question Description': questionDescription
        });

        res.json({
        id: record.id,
        ...record.fields
        });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/questions/:questionId/user/:userId', 
    async (req: Request<QuestionParams, any, UpdateQuestionBody>, res: Response): Promise<void> =>  {
    try {
            const { questionId, userId } = req.params;
            const { answer } = req.body;

            console.log('Received PUT request for questionId:', questionId, 'userId:', userId, 'answer:', answer);

            const userRecords = await base('Users').select({
                filterByFormula: `{User ID} = '${userId}'`
            }).firstPage();

            if (!userRecords.length) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const userRecordId = userRecords[0].id;
            console.log('User record ID:', userRecordId);

            const records = await base('Questions and Answers').select({
                filterByFormula: `{Record ID} = '${questionId}'`
            }).firstPage();
    
            if (records.length === 0) {
                res.status(404).json({ error: 'Question not found' });
                return;
            }
    
            const actualRecordId = records[0].id;
            console.log('Actual Record ID:', actualRecordId);

            const updatedRecords = await base('Questions and Answers').update([
            {
                id: actualRecordId,
                fields: {
                    'Answer': answer,
                    'Updated By': [userRecords[0].id],
                    'Updated At': new Date().toISOString()
                }
            }
        ]);

        res.json({
            id: updatedRecords[0].id,
            ...updatedRecords[0].fields
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

app.put('/api/questions/update-assigned', async (req: Request<{}, {}, UpdateAssignedToRequest>, res: Response) => {
    try {
      const { questions, updatedBy } = req.body;
  
      const updatedByUser = await base('Users').select({
        filterByFormula: `{User ID} = '${updatedBy}'`
      }).firstPage();
  
      if (updatedByUser.length === 0) {
        res.status(404).json({ error: 'Updated By user not found' });
        return;
      }
  
      const updatedById = updatedByUser[0].id;
  
      const updates = [];
      for (const question of questions) {
        const assignedToUser = await base('Users').select({
          filterByFormula: `{User ID} = '${question.assignedTo}'`
        }).firstPage();
  
        if (assignedToUser.length === 0) {
          res.status(404).json({ error: `Assigned To user not found for ID: ${question.assignedTo}` });
          return;
        }
  
        const questionRecords = await base('Questions and Answers').select({
          filterByFormula: `{Record ID} = '${question.recordId}'`
        }).firstPage();
  
        if (questionRecords.length === 0) {
          res.status(404).json({ error: `Question not found: ${question.recordId}` });
          return;
        }
  
        updates.push({
          id: questionRecords[0].id,
          fields: {
            'Assigned To': [assignedToUser[0].id],
            'Updated By': [updatedById],
            'Updated At': new Date().toISOString()
          }
        });
      }
  
      const records = await base('Questions and Answers').update(updates);
  
      const response = await Promise.all(records.map(async record => {
        const assignedToIds = record.get('Assigned To') as string[] || [];
        const assignedToId = assignedToIds[0];
  
        const userRecords = await base('Users').select().all();
        const users = new Map(
          userRecords.map(user => [
            user.id,
            {
              userId: user.get('User ID') as string,
              name: user.get('Name') as string
            }
          ])
        );
  
        return {
          id: record.id,
          recordId: record.get('Record ID') as string,
          assignedTo: users.get(assignedToId)?.userId || '',
          assignedToName: users.get(assignedToId)?.name || '',
          updatedAt: record.get('Updated At') as string
        };
      }));
  
      res.json(response);
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
app.post('/api/questions/bulk-assign', async (req: Request<{}, {}, BulkAssignRequest>, res: Response) => {
  try {
    const { questionIds, assignedTo, updatedBy } = req.body;

    const assignedToUser = await base('Users').select({
        filterByFormula: `{User ID} = '${assignedTo}'`
    }).firstPage();

    const updatedByUser = await base('Users').select({
        filterByFormula: `{User ID} = '${updatedBy}'`
    }).firstPage();

    const assignedToId = assignedToUser[0].id;
    const updatedById = updatedByUser[0].id;

    if (assignedToUser.length == 0 || updatedByUser.length == 0) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const actualRecordIds = [];
    for (const questionId of questionIds) {
        const records = await base('Questions and Answers').select({
            filterByFormula: `{Record ID} = '${questionId}'`
        }).firstPage();

        if (records.length === 0) {
        res.status(404).json({ error: `Question not found: ${questionId}` });
        return;
        }

        actualRecordIds.push(records[0].id);
    }

    console.log('Actual Record IDs:', actualRecordIds);

    const updates = actualRecordIds.map(id => ({
        id,
        fields: {
        'Assigned To': [assignedToId],
        'Updated By': [updatedById],
        'Updated At': new Date().toISOString()
        }
    }));

    const records = await base('Questions and Answers').update(updates);

    res.json(records.map(record => ({
      id: record.id,
      ...record.fields
    })));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
