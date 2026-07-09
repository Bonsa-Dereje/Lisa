// js/pages/user.js
const UserPage = {
    async render() {
        try {
            const result = await api.getArtworks();
            const cards = result.artworks.map(a => Utils.renderArtCard(a)).join('');
            return `
                <div class="exhibition-header"><h2>Exhibition</h2></div>
                <div class="exhibition-grid">${cards || '<p>No work has been posted yet.</p>'}</div>
            `;
        } catch (err) {
            return `<p>Could not load the exhibition.</p>`;
        }
    },
    async afterRender() {}
};
