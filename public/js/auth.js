// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.role = null;
    }

    async init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await api.getCurrentUser();
                this.currentUser = userData.user;
                this.isAuthenticated = true;
                this.role = userData.user.role;
                this.updateUI();
                return true;
            } catch (error) {
                console.error('Auth init error:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    async login(email, password) {
        try {
            const result = await api.login(email, password);
            this.currentUser = result.user;
            this.isAuthenticated = true;
            this.role = result.user.role;
            this.updateUI();
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(name, email, password, role) {
        try {
            const result = await api.register(name, email, password, role);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        api.setToken(null);
        this.currentUser = null;
        this.isAuthenticated = false;
        this.role = null;
        this.updateUI();
        window.location.reload();
    }

    updateUI() {
        const navAuth = document.getElementById('navAuth');
        const navUser = document.getElementById('navUser');
        const userNameDisplay = document.getElementById('userNameDisplay');

        if (this.isAuthenticated && this.currentUser) {
            navAuth.style.display = 'none';
            navUser.style.display = 'flex';
            userNameDisplay.textContent = this.currentUser.name;
        } else {
            navAuth.style.display = 'flex';
            navUser.style.display = 'none';
        }
    }

    hasRole(role) {
        return this.isAuthenticated && this.role === role;
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    isPresenter() {
        return this.hasRole('presenter');
    }

    isUser() {
        return this.hasRole('user');
    }
}

// Export singleton
const auth = new AuthManager();
