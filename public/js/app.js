// js/app.js - minimal SPA router (stand-in — replace with your real app.js if you have one)
const pages = {
    home: {
        render: async () => `
            <div class="hero">
                <h1>Welcome to <span class="highlight">LISA</span></h1>
                <p>A community space for discovering and sharing art.</p>
            </div>
        `,
        afterRender: async () => {}
    },
    exhibition: UserPage,
    'presenter-dashboard': PresenterPage,
    'admin-dashboard': AdminPage,
    about: {
        render: async () => `<h2>About LISA</h2><p>Community art exhibition platform.</p>`,
        afterRender: async () => {}
    }
};

async function loadPage(page) {
    const page404 = `<h2>Page not found</h2>`;
    const pageObj = pages[page] || { render: async () => page404, afterRender: async () => {} };
    document.getElementById('mainContent').innerHTML = await pageObj.render();
    await pageObj.afterRender();

    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
}

function currentDashboardPage() {
    if (auth.isAdmin()) return 'admin-dashboard';
    if (auth.isPresenter()) return 'presenter-dashboard';
    return 'exhibition';
}

document.addEventListener('DOMContentLoaded', async () => {
    await auth.init();

    // nav links
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage(a.dataset.page);
        });
    });

    // modal open/close
    document.getElementById('loginBtn').addEventListener('click', () => Utils.openModal('loginModal'));
    document.getElementById('registerBtn').addEventListener('click', () => Utils.openModal('registerModal'));
    document.getElementById('closeLogin').addEventListener('click', () => Utils.closeModal('loginModal'));
    document.getElementById('closeRegister').addEventListener('click', () => Utils.closeModal('registerModal'));
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        Utils.closeModal('loginModal');
        Utils.openModal('registerModal');
    });
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        Utils.closeModal('registerModal');
        Utils.openModal('loginModal');
    });

    // login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const result = await auth.login(email, password);
        if (result.success) {
            Utils.closeModal('loginModal');
            Utils.showNotification('Welcome back!', 'success');
            loadPage(currentDashboardPage());
        } else {
            Utils.showNotification(result.error, 'error');
        }
    });

    // register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;
        const result = await auth.register(name, email, password, role);
        if (result.success) {
            Utils.closeModal('registerModal');
            Utils.showNotification('Account created! Please log in.', 'success');
            Utils.openModal('loginModal');
        } else {
            Utils.showNotification(result.error, 'error');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => auth.logout());

    loadPage(auth.isAuthenticated ? currentDashboardPage() : 'home');
});
