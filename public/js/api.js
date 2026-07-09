// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Service
class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders(),
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'API request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        const result = await this.request('/auth/login', 'POST', { email, password });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async register(name, email, password, role) {
        return await this.request('/auth/register', 'POST', { name, email, password, role });
    }

    async getCurrentUser() {
        return await this.request('/auth/me', 'GET');
    }

    // Art endpoints
    async getArtworks() {
        return await this.request('/artworks', 'GET');
    }

    async getArtwork(id) {
        return await this.request(`/artworks/${id}`, 'GET');
    }

    async createArtwork(data) {
        return await this.request('/artworks', 'POST', data);
    }

    async updateArtwork(id, data) {
        return await this.request(`/artworks/${id}`, 'PUT', data);
    }

    async deleteArtwork(id) {
        return await this.request(`/artworks/${id}`, 'DELETE');
    }

    // Admin endpoints
    async getAllUsers() {
        return await this.request('/admin/users', 'GET');
    }

    async updateUserRole(userId, role) {
        return await this.request(`/admin/users/${userId}/role`, 'PUT', { role });
    }

    async deleteUser(userId) {
        return await this.request(`/admin/users/${userId}`, 'DELETE');
    }

    // Presenter endpoints
    async getMyArtworks() {
        return await this.request('/presenter/artworks', 'GET');
    }
}

// Export singleton
const api = new ApiService();
