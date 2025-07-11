import { FrontendUser } from "@shared/types";
import { BACKEND_URL } from "../constants";

export const register = async (email: string, password: string): Promise<void> => {
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
};

export const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });

    console.log(response);

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    console.log('Login successful:', data);
};

export const getUser = async (): Promise<FrontendUser> => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error('Failed to fetch user data');
        }
        const json = await res.json();
        console.log(json);
        return json;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
} 