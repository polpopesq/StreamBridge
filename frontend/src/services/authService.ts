import { BACKEND_URL } from "../constants";

export const register = async (email: string, password: string): Promise<void> => {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const data = await response.json();
        console.log('Registration successful:', data);
    } catch (error) {
        console.error('Error registering:', error);
    }
};

export const login = async (email: string, password: string): Promise<void> => {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        console.log('Login successful:', data);
    } catch (error) {
        console.error('Error logging in:', error);
    }
};

export const isLoggedIn = async (): Promise<boolean> => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
            credentials: "include",
        });

        return res.ok;
    } catch {
        return false;
    }
};