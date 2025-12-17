
import { createClient } from '@supabase/supabase-js'

// Using the credentials provided in the summary/env
const supabaseUrl = 'https://yzhhmixqfkwrhiaortib.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aGhtaXhxZmt3cmhpYW9ydGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzA5NDUsImV4cCI6MjA4MTQwNjk0NX0.A9Ysoeuwt6uYEIxjEAoeP9cIDNPkPz3jKMX1AoKY5NA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    console.log('Attempting to create admin user...');

    // 1. Sign Up the user
    const { data, error } = await supabase.auth.signUp({
        email: 'alvaro-cpr@outlook.com',
        password: 'Elterrordelasratas27',
        options: {
            data: {
                full_name: 'Alvaro CPR (Admin)',
            }
        }
    })

    if (error) {
        console.error('Error creating user (might already exist):', error.message)
        // If user already exists, we might just want to ensure he is admin?
        // We can't easily sign him in to update profile without his interaction if we don't have service key.
        // But we can assume if this fails, the user needs to login or we use SQL to update role.
    } else {
        console.log('User created successfully:', data.user?.id)
        console.log('Please run the SQL update to set role to admin.')
    }
}

createAdmin()
