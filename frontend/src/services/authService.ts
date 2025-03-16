export const register = async (email: string, password: string): Promise<void> => {
    try {
        const response = await fetch('http://localhost:3030/api/v1/auth/register', {
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
        const response = await fetch('http://localhost:3030/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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