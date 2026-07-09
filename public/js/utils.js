// Utility Functions
const Utils = {
    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const div = document.createElement('div');
        div.className = `notification${type === 'error' ? ' notification-error' : ''}`;
        div.textContent = message;
        document.body.appendChild(div);

        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.3s ease';
            setTimeout(() => div.remove(), 300);
        }, 4000);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    canAccessPage(page, userRole) {
        const accessMap = {
            'user': ['home', 'exhibition', 'about', 'user-dashboard'],
            'presenter': ['home', 'exhibition', 'about', 'presenter-dashboard'],
            'admin': ['home', 'exhibition', 'about', 'admin-dashboard']
        };
        return accessMap[userRole] && accessMap[userRole].includes(page);
    },

    generateId() {
        return Math.random().toString(36).substring(2, 10);
    },

    hasPermission(action, userRole) {
        const permissions = {
            'view_artworks': ['user', 'presenter', 'admin'],
            'create_artwork': ['presenter', 'admin'],
            'edit_artwork': ['presenter', 'admin'],
            'delete_artwork': ['presenter', 'admin'],
            'manage_users': ['admin'],
            'manage_roles': ['admin']
        };
        return permissions[action] && permissions[action].includes(userRole);
    },

    // Reads an <input type="file"> file into a base64 string (no data: prefix)
    // plus its mimetype, ready to send to the API for storage in SQL.
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const [, base64] = reader.result.split(',');
                resolve({ data: base64, mimetype: file.type || 'image/png' });
            };
            reader.onerror = () => reject(new Error('Could not read that image'));
            reader.readAsDataURL(file);
        });
    },

    // Renders a single posted-work card: image with the creator's name
    // captioned at the bottom, and its sequential item number.
    renderArtCard(artwork) {
        const imageSrc = artwork.image_data
            ? `data:${artwork.image_mimetype || 'image/png'};base64,${artwork.image_data}`
            : '';

        return `
            <div class="art-card">
                <div class="art-image-wrap">
                    ${imageSrc
                        ? `<img src="${imageSrc}" alt="${Utils.escapeHtml(artwork.title)}">`
                        : `<div class="art-image-empty">No Image</div>`}
                    <span class="item-badge">Item ${artwork.item_number}</span>
                    <div class="creator-caption">${Utils.escapeHtml(artwork.creator_name || '')}</div>
                </div>
                <div class="card-body">
                    <h3>${Utils.escapeHtml(artwork.title)}</h3>
                </div>
            </div>
        `;
    }
};
