
import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgresql://postgres:Elterrordelasratas27@[2600:1f13:838:7aee:12:b5a6:fc3f:d144:d7]:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function reloadSchema() {
    try {
        console.log('🔌 Connecting to DB...');
        await client.connect();

        console.log('🔄 Reloading PostgREST schema cache...');
        await client.query("NOTIFY pgrst, 'reload config'");

        console.log('✅ Reload signal sent.');
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await client.end();
    }
}

reloadSchema();
