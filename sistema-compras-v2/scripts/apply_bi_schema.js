
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Using the known good connection string from migrate.js
const connectionString = 'postgresql://postgres:Elterrordelasratas27@[2600:1f13:838:7aee:12:b5a6:fc3f:d144:d7]:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function applyRefactor() {
    try {
        console.log('🔌 Connecting to Supabase via IPv6...');
        await client.connect();

        // Read the SQL file we created earlier
        const sqlPath = path.join(__dirname, 'refactor_bi_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing BI Refactor SQL...');

        // Execute the entire script
        await client.query(sql);

        console.log('✅ Refactor applied successfully!');
    } catch (err) {
        console.error('❌ Refactor failed:', err);
    } finally {
        await client.end();
    }
}

applyRefactor();
