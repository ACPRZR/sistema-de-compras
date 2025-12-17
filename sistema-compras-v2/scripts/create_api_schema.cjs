
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Elterrordelasratas27@[2600:1f13:838:7aee:12:b5a6:fc3f:d144:d7]:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function createApiSchema() {
    try {
        console.log('🔌 Connecting to DB...');
        await client.connect();

        console.log('🏗️ Creating API schema and views...');

        // 1. Create Schema
        await client.query("CREATE SCHEMA IF NOT EXISTS api;");

        // 2. Create Views (Proxy to Public)
        // Profiles
        await client.query(`
            CREATE OR REPLACE VIEW api.profiles AS 
            SELECT * FROM public.profiles;
        `);

        // Orders (Manually defining relations might be tricky for PostgREST to infer from view-to-view, 
        // but if we query api.orders and join api.profiles, it usually works if underlying FKs exist.
        // However, for best results, we might need to recreate FK-like structure or just rely on Supabase manual join logic if this fails.)
        await client.query(`
            CREATE OR REPLACE VIEW api.orders AS 
            SELECT * FROM public.orders;
        `);

        // Suppliers
        await client.query(`
            CREATE OR REPLACE VIEW api.suppliers AS 
            SELECT * FROM public.suppliers;
        `);

        // Order Items
        await client.query(`
            CREATE OR REPLACE VIEW api.order_items AS 
            SELECT * FROM public.order_items;
        `);

        // 3. Grant Permissions
        await client.query(`
            GRANT USAGE ON SCHEMA api TO anon, authenticated;
            GRANT SELECT, INSERT, UPDATE, DELETE ON api.profiles TO anon, authenticated;
            GRANT SELECT, INSERT, UPDATE, DELETE ON api.orders TO anon, authenticated;
            GRANT SELECT, INSERT, UPDATE, DELETE ON api.suppliers TO anon, authenticated;
            GRANT SELECT, INSERT, UPDATE, DELETE ON api.order_items TO anon, authenticated;
        `);

        console.log('✅ API Schema created successfully.');

    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await client.end();
    }
}

createApiSchema();
