import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders login page by default', () => {
    render(
        <MemoryRouter>
            <App />
        </MemoryRouter>
    );
    const loginTitle = screen.getByText(/Login/i);
    expect(loginTitle).toBeInTheDocument();
});

test('renders signup link', () => {
    render(
        <MemoryRouter>
            <App />
        </MemoryRouter>
    );
    const signupLink = screen.getByText(/Sign up/i);
    expect(signupLink).toBeInTheDocument();
});
