
import pg from 'pg';

// Handle ESM import of pg
const { Client } = pg;

const connectionString = 'postgresql://postgres:Elterrordelasratas27@[2600:1f13:838:7aee:12:b5a6:fc3f:d144:d7]:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function basicQuery(query) {
    try {
        await client.query(query);
        console.log(`✅ Executed: ${query.substring(0, 50)}...`);
    } catch (e) {
        console.error(`❌ Failed: ${query.substring(0, 50)}... -> ${e.message}`);
        // Don't throw, try to continue
    }
}

async function setupApi() {
    try {
        console.log('🔌 Connecting...');
        await client.connect();

        console.log('🏗️ Setting up API Schema...');

        await basicQuery("CREATE SCHEMA IF NOT EXISTS api;");

        // Re-create views
        await basicQuery("DROP VIEW IF EXISTS api.profiles CASCADE;");
        await basicQuery("CREATE OR REPLACE VIEW api.profiles AS SELECT * FROM public.profiles;");

        await basicQuery("DROP VIEW IF EXISTS api.orders CASCADE;");
        // Ensure PostgREST can "see" the FK by just selecting * from the table that has FK
        await basicQuery("CREATE OR REPLACE VIEW api.orders AS SELECT * FROM public.orders;");

        await basicQuery("DROP VIEW IF EXISTS api.suppliers CASCADE;");
        await basicQuery("CREATE OR REPLACE VIEW api.suppliers AS SELECT * FROM public.suppliers;");

        await basicQuery("DROP VIEW IF EXISTS api.order_items CASCADE;");
        await basicQuery("CREATE OR REPLACE VIEW api.order_items AS SELECT * FROM public.order_items;");

        // Grant permissions
        await basicQuery("GRANT USAGE ON SCHEMA api TO anon, authenticated;");
        await basicQuery("GRANT ALL ON api.profiles TO anon, authenticated;");
        await basicQuery("GRANT ALL ON api.orders TO anon, authenticated;");
        await basicQuery("GRANT ALL ON api.suppliers TO anon, authenticated;");
        await basicQuery("GRANT ALL ON api.order_items TO anon, authenticated;");

        // Reload schema cache
        await basicQuery("NOTIFY pgrst, 'reload config'");

        console.log('✨ Done.');
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    } finally {
        await client.end();
    }
}

setupApi();
