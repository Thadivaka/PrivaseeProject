import Airtable from 'airtable';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function Connection() {
    try {
        console.log('Config:', {
            apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
            baseId: process.env.AIRTABLE_BASE_ID ? 'Present' : 'Missing'
        });

        const response = await base('Questions and Answers')
            .select({
                maxRecords: 1,
                view: 'Grid view'
            })
            .firstPage();

        console.log('Connection successful:', response.length, 'records found');
        
        const table = base('Questions and Answers');
        console.log('Table accessed:', table.name);

    } catch (error: any) {
        console.error('Connection error:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error.error
        });
    }
}

// Initialize Airtable base
export const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID as string);

Connection();
