export const API_URL = '/api';

export interface UserResponse {
    id: number;
    email: string;
    full_name: string;
    is_active: true;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    user: UserResponse;
}

export const authService = {
    async register(fullName: string, email: string, password: string): Promise<UserResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to register');
        }

        return response.json();
    },

    async login(email: string, password: string): Promise<TokenResponse> {
        // FastAPI's OAuth2PasswordRequestForm expects form-urlencoded data
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects 'username'
        formData.append('password', password);

        const response = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            body: formData, // URL-encoded form data
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to login');
        }

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    getUser(): UserResponse | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export const apiService = {
    async get<T>(url: string): Promise<T> {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url.startsWith('/api') ? url : `${API_URL}${url}`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            let errorMsg = `Request failed with status ${response.status}`;
            try {
                const error = await response.json();
                errorMsg = error.detail || error.message || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        return response.json();
    },

    async post<T>(url: string, data: any): Promise<T> {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        let body: any;
        if (data instanceof FormData) {
            // fetch will automatically set the correct Content-Type including boundary
            delete headers['Content-Type'];
            body = data;
        } else {
            body = JSON.stringify(data);
        }

        const response = await fetch(url.startsWith('/api') ? url : `${API_URL}${url}`, {
            method: 'POST',
            headers,
            body
        });

        if (!response.ok) {
            let errorMsg = `Request failed with status ${response.status}`;
            try {
                const error = await response.json();
                errorMsg = error.detail || error.message || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        return response.json();
    },

    async delete<T>(url: string): Promise<T> {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url.startsWith('/api') ? url : `${API_URL}${url}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            let errorMsg = `Request failed with status ${response.status}`;
            try {
                const error = await response.json();
                errorMsg = error.detail || error.message || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        return response.json();
    }
};
