
const { Client } = require('pg');

// Using the IPv6 address found in migrate.js which works for this user
const connectionString = 'postgresql://postgres:Elterrordelasratas27@[2600:1f13:838:7aee:12:b5a6:fc3f:d144:d7]:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function basicQuery(query, params = []) {
    try {
        const res = await client.query(query, params);
        console.log(`✅ Query executed. Rows affected: ${res.rowCount}`);
    } catch (e) {
        console.error(`❌ Query failed: ${e.message}`);
    }
}

async function fixLogin() {
    try {
        console.log('🔌 Connecting to DB (CJS)...');
        await client.connect();

        console.log('🔨 Fixing user account...');

        // 1. Force confirm email and set password
        await basicQuery(`
            UPDATE auth.users 
            SET 
                email_confirmed_at = NOW(),
                encrypted_password = crypt($1, gen_salt('bf')),
                raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email"]}'::jsonb,
                updated_at = NOW()
            WHERE email = $2
        `, ['Elterrordelasratas27', 'alvaro-cpr@outlook.com']);

        // 2. Ensure Profile is Admin
        await basicQuery(`
            UPDATE public.profiles 
            SET role = 'admin' 
            WHERE email = $1
        `, ['alvaro-cpr@outlook.com']);

        console.log('✨ Fix completed.');
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        await client.end();
    }
}

fixLogin();
