
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';

// Mock mocks
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        user: null,
        session: null,
        loading: false,
        signOut: vi.fn(),
    }),
}));

// Mock Supabase to prevent real network calls
vi.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
    },
}));

// Setup Query Client
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

describe('System Sanity Checks', () => {
    test('Login Page Renders Correctly', () => {
        const queryClient = createTestQueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('Sistema de Compras')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('nombre@ladp.org.pe')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByText('Ingresar')).toBeInTheDocument();
    });

    // We can add more specific component tests here
});
