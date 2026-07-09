// js/pages/presenter.js
const PresenterPage = {
    async render() {
        return `
            <div class="dashboard-header">
                <h2>Presenter Dashboard</h2>
                <p>Post your work for the exhibition</p>
            </div>

            <div class="presenter-actions mb-40">
                <button id="postWorkBtn" class="btn btn-primary">Post Your Work</button>
            </div>

            <div class="dashboard-header">
                <h3>Your Posted Work</h3>
            </div>
            <div id="myArtworksList" class="exhibition-grid"></div>

            <!-- Post Work Modal -->
            <div class="modal" id="postWorkModal">
                <div class="modal-content">
                    <span class="close" id="closePostWork">&times;</span>
                    <h2>Post Your Work</h2>
                    <p class="modal-subtitle">Give it a name and add an image</p>
                    <form id="postWorkForm">
                        <div class="form-group">
                            <label for="workName">Name</label>
                            <input type="text" id="workName" placeholder="Name your work" required>
                        </div>
                        <div class="form-group">
                            <label for="workImage">Image</label>
                            <input type="file" id="workImage" accept="image/*" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="postWorkSubmit">Post</button>
                    </form>
                </div>
            </div>
        `;
    },

    async afterRender() {
        const modal = document.getElementById('postWorkModal');
        const openBtn = document.getElementById('postWorkBtn');
        const closeBtn = document.getElementById('closePostWork');
        const form = document.getElementById('postWorkForm');
        const submitBtn = document.getElementById('postWorkSubmit');

        openBtn.addEventListener('click', () => Utils.openModal('postWorkModal'));
        closeBtn.addEventListener('click', () => Utils.closeModal('postWorkModal'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) Utils.closeModal('postWorkModal');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('workName').value;
            const fileInput = document.getElementById('workImage');
            const file = fileInput.files[0];

            if (!file) {
                Utils.showNotification('Please choose an image', 'error');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Posting...';

                const { data, mimetype } = await Utils.fileToBase64(file);

                await api.createArtwork({
                    title: name,
                    imageData: data,
                    imageMimetype: mimetype
                });

                Utils.showNotification('Your work has been posted!', 'success');
                form.reset();
                Utils.closeModal('postWorkModal');
                this.loadMyArtworks();
            } catch (err) {
                Utils.showNotification(err.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post';
            }
        });

        this.loadMyArtworks();
    },

    async loadMyArtworks() {
        const list = document.getElementById('myArtworksList');
        try {
            const result = await api.getMyArtworks();
            if (!result.artworks.length) {
                list.innerHTML = `<p>You haven't posted anything yet.</p>`;
                return;
            }
            list.innerHTML = result.artworks.map(a => Utils.renderArtCard(a)).join('');
        } catch (err) {
            list.innerHTML = `<p>Could not load your posted work.</p>`;
        }
    }
};
