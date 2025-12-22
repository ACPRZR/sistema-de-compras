
import React from 'react';
import { render, screen } from '@testing-library/react';

test('Smoke Test: Jest works', () => {
    expect(true).toBe(true);
});

test('Smoke Test: Can render generic element', () => {
    render(<div>Hello Test</div>);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
});
