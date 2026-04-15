document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const ghTokenInput = document.getElementById('ghTokenInput');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const tabs = document.querySelectorAll('.tab-btn');
    const tableContainer = document.getElementById('tableContainer');
    const addNewBtn = document.getElementById('addNewBtn');
    
    // Modal Elements
    const crudModal = document.getElementById('crudModal');
    const crudForm = document.getElementById('crudForm');
    const dynamicFormFields = document.getElementById('dynamicFormFields');
    const modalFormTitle = document.getElementById('modalFormTitle');
    const cancelCrudBtn = document.getElementById('cancelCrudBtn');
    const saveCrudBtn = document.getElementById('saveCrudBtn');

    // State
    let currentTab = 'projects'; // projects, experience, achievements, certificates
    let currentData = [];
    let currentSha = null;
    let editingId = null;

    // Check login state
    checkLoginState();

    // Login logic
    loginSubmitBtn.addEventListener('click', async () => {
        const token = ghTokenInput.value.trim();
        if (!token) return;

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Verifying...';
        
        GitHubAPI.setToken(token);
        const isValid = await GitHubAPI.verifyUser();
        
        if (isValid) {
            loginError.style.display = 'none';
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            logoutBtn.style.display = 'block';
            ghTokenInput.value = '';
            loadDataForTab(currentTab);
        } else {
            GitHubAPI.clearToken();
            loginError.style.display = 'block';
        }
        
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = 'Login';
    });

    logoutBtn.addEventListener('click', () => {
        GitHubAPI.clearToken();
        dashboardSection.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginSection.style.display = 'block';
    });

    // Tab Navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.dataset.target;
            loadDataForTab(currentTab);
        });
    });

    // Add New
    addNewBtn.addEventListener('click', () => {
        editingId = null;
        modalFormTitle.textContent = `Add New ${capitalize(currentTab)}`;
        renderFormFields(currentTab, null);
        crudModal.classList.add('active');
    });

    // Close Modal
    cancelCrudBtn.addEventListener('click', () => {
        crudModal.classList.remove('active');
    });

    // Save Data (Create or Update)
    crudForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveCrudBtn.disabled = true;
        saveCrudBtn.textContent = 'Saving...';

        try {
            const formData = new FormData(crudForm);
            const dataObj = Object.fromEntries(formData.entries());
            
            // Generate basic ID if new
            if (!editingId) {
                dataObj.id = Date.now().toString();
            } else {
                dataObj.id = editingId;
            }

            // Parse specific fields based on tab (like arrays for tags/links)
            processFormData(currentTab, dataObj);

            // Fetch latest data to avoid Conflicts
            const fileData = await GitHubAPI.getFile(`data/${currentTab}.json`);
            let fileContent = fileData.content;
            let currentShaToUse = fileData.sha;

            if (editingId) {
                const index = fileContent.findIndex(item => item.id === editingId);
                if (index !== -1) {
                    fileContent[index] = dataObj;
                }
            } else {
                fileContent.push(dataObj);
            }

            await GitHubAPI.updateFile(`data/${currentTab}.json`, fileContent, currentShaToUse, `Update ${currentTab} via Admin`);
            
            crudModal.classList.remove('active');
            alert('Saved successfully!');
            loadDataForTab(currentTab);

        } catch (error) {
            console.error(error);
            alert('Failed to save data. Check console.');
        } finally {
            saveCrudBtn.disabled = false;
            saveCrudBtn.textContent = 'Save Changes';
        }
    });

    async function checkLoginState() {
        if (GitHubAPI.getToken()) {
            const isValid = await GitHubAPI.verifyUser();
            if (isValid) {
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                logoutBtn.style.display = 'block';
                loadDataForTab(currentTab);
            } else {
                GitHubAPI.clearToken();
            }
        }
    }

    async function loadDataForTab(tab) {
        tableContainer.innerHTML = '<div class="loading-spinner">Loading data from GitHub...</div>';
        try {
            const data = await GitHubAPI.getFile(`data/${tab}.json`);
            currentData = data.content;
            currentSha = data.sha;
            renderTable(tab, currentData);
        } catch (error) {
            console.error(error);
            tableContainer.innerHTML = `<div style="color:#ef4444; padding:2rem;">Error loading data for ${tab}. Is repository setup correctly?</div>`;
        }
    }

    function renderTable(tab, data) {
        if (!data || data.length === 0) {
            tableContainer.innerHTML = '<div style="padding:2rem;">No data found. Click Add New to create some.</div>';
            return;
        }

        let columns = [];
        if (tab === 'projects') columns = ['Title', 'Description', 'Featured'];
        if (tab === 'experience') columns = ['Company', 'Position', 'Start Year', 'End Year'];
        if (tab === 'achievements') columns = ['Title', 'Date'];
        if (tab === 'certificates') columns = ['Title', 'Issuer', 'Category'];

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        ${columns.map(c => `<th>${c}</th>`).join('')}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(item => {
            let rowHtml = '';
            if (tab === 'projects') rowHtml = `<td>${item.title || ''}</td><td>${excerpt(item.description)}</td><td>${item.featured ? 'Yes' : 'No'}</td>`;
            if (tab === 'experience') rowHtml = `<td>${item.company || ''}</td><td>${item.position || ''}</td><td>${item.startYear || ''}</td><td>${item.endYear || ''}</td>`;
            if (tab === 'achievements') rowHtml = `<td>${item.title || ''}</td><td>${item.date || ''}</td>`;
            if (tab === 'certificates') rowHtml = `<td>${item.title || ''}</td><td>${item.issuer || ''}</td><td>${item.category || ''}</td>`;

            html += `
                <tr>
                    ${rowHtml}
                    <td>
                        <div class="action-btns">
                            <button class="btn-sm btn-edit" onclick="editItem('${item.id}')">Edit</button>
                            <button class="btn-sm btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        tableContainer.innerHTML = html;
    }

    // Expose global methods for inline handlers (Edit/Delete)
    window.editItem = (id) => {
        const item = currentData.find(i => i.id === id);
        if (item) {
            editingId = id;
            modalFormTitle.textContent = `Edit ${capitalize(currentTab)}`;
            renderFormFields(currentTab, item);
            crudModal.classList.add('active');
        }
    };

    window.deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        tableContainer.innerHTML = '<div class="loading-spinner">Deleting from GitHub...</div>';
        
        try {
            const fileData = await GitHubAPI.getFile(`data/${currentTab}.json`);
            let fileContent = fileData.content;
            let currentShaToUse = fileData.sha;

            fileContent = fileContent.filter(item => item.id !== id);

            await GitHubAPI.updateFile(`data/${currentTab}.json`, fileContent, currentShaToUse, `Delete item from ${currentTab}`);
            alert('Deleted successfully!');
            loadDataForTab(currentTab);
        } catch (error) {
            console.error(error);
            alert('Failed to delete.');
            loadDataForTab(currentTab);
        }
    };

    function renderFormFields(tab, item = null) {
        let html = '';
        const v = (key, defaultVal = '') => (item && item[key] !== undefined) ? item[key] : defaultVal;

        if (tab === 'projects') {
            html = `
                <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" value="${v('title')}" required></div>
                <div class="form-group"><label>Short Description</label><input type="text" class="form-control" name="description" value="${v('description')}" required></div>
                <div class="form-group"><label>Full Description</label><textarea class="form-control" name="fullDescription">${v('fullDescription')}</textarea></div>
                <div class="form-group"><label>Media Image URL</label><input type="text" class="form-control" name="mediaUrl" value="${item && item.media ? item.media.url : ''}"></div>
                <div class="form-group"><label>Tags (comma separated)</label><input type="text" class="form-control" name="tags" value="${item && item.tags ? item.tags.join(', ') : ''}"></div>
                <div class="form-group">
                    <label>Featured?</label>
                    <select class="form-control" name="featured">
                        <option value="true" ${v('featured') === true ? 'selected' : ''}>Yes</option>
                        <option value="false" ${v('featured') !== true ? 'selected' : ''}>No</option>
                    </select>
                </div>
            `;
        } else if (tab === 'experience') {
            html = `
                <div class="form-group"><label>Company</label><input type="text" class="form-control" name="company" value="${v('company')}" required></div>
                <div class="form-group"><label>Company Logo URL</label><input type="text" class="form-control" name="logo" value="${v('logo')}"></div>
                <div class="form-group"><label>Position</label><input type="text" class="form-control" name="position" value="${v('position')}" required></div>
                <div style="display:flex; gap:1rem;">
                    <div class="form-group" style="flex:1;"><label>Start Year</label><input type="text" class="form-control" name="startYear" value="${v('startYear')}"></div>
                    <div class="form-group" style="flex:1;"><label>End Year</label><input type="text" class="form-control" name="endYear" value="${v('endYear')}"></div>
                </div>
                <div class="form-group"><label>Description</label><textarea class="form-control" name="description">${v('description')}</textarea></div>
            `;
        } else if (tab === 'achievements') {
            html = `
                <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" value="${v('title')}" required></div>
                <div class="form-group"><label>Date/Year</label><input type="text" class="form-control" name="date" value="${v('date')}"></div>
                <div class="form-group"><label>Description</label><textarea class="form-control" name="description">${v('description')}</textarea></div>
                <div class="form-group"><label>Image URL</label><input type="text" class="form-control" name="mediaUrl" value="${item && item.media ? item.media.url : ''}"></div>
                <div class="form-group"><label>Certificate Link (Optional)</label><input type="text" class="form-control" name="certLink" value="${item && item.links && item.links[0] ? item.links[0].url : ''}"></div>
            `;
        } else if (tab === 'certificates') {
            html = `
                <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" value="${v('title')}" required></div>
                <div class="form-group"><label>Issuer Org</label><input type="text" class="form-control" name="issuer" value="${v('issuer')}" required></div>
                <div class="form-group"><label>Date</label><input type="text" class="form-control" name="date" value="${v('date')}"></div>
                <div class="form-group">
                    <label>Category</label>
                    <select class="form-control" name="category">
                        <option value="Data Analyst" ${v('category') === 'Data Analyst' ? 'selected' : ''}>Data Analyst</option>
                        <option value="Data Science" ${v('category') === 'Data Science' ? 'selected' : ''}>Data Science</option>
                        <option value="App/Web" ${v('category') === 'App/Web' ? 'selected' : ''}>App/Web</option>
                    </select>
                </div>
                <div class="form-group"><label>Image URL</label><input type="text" class="form-control" name="image" value="${v('image')}"></div>
                <div class="form-group"><label>Credential URL</label><input type="text" class="form-control" name="credentialUrl" value="${v('credentialUrl')}"></div>
            `;
        }

        dynamicFormFields.innerHTML = html;
    }

    function processFormData(tab, dataObj) {
        // Handle specific type conversions
        if (tab === 'projects') {
            dataObj.featured = dataObj.featured === 'true';
            if (dataObj.tags) {
                dataObj.tags = dataObj.tags.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }
            if (dataObj.mediaUrl) {
                dataObj.media = { type: 'image', url: dataObj.mediaUrl };
                delete dataObj.mediaUrl;
            }
        } else if (tab === 'achievements') {
             if (dataObj.mediaUrl) {
                dataObj.media = { type: 'image', url: dataObj.mediaUrl };
                delete dataObj.mediaUrl;
            }
            if (dataObj.certLink) {
                dataObj.links = [{ label: 'Verify', url: dataObj.certLink }];
                delete dataObj.certLink;
            }
        }
    }

    function excerpt(str, length = 50) {
        if (!str) return '';
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
});
