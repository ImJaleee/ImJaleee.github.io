document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('allProjectsContainer')) return;

    let allProjects = [];

    async function loadProjects() {
        allProjects = await fetchLocalData('projects.json');
        renderProjects('all');
    }

    function renderProjects(filterCategory) {
        const container = document.getElementById('allProjectsContainer');
        const noMsg = document.getElementById('noProjectsMsg');
        container.innerHTML = '';
        
        let filtered = allProjects;
        if (filterCategory !== 'all') {
            filtered = allProjects.filter(p => p.category === filterCategory);
        }

        if (filtered.length === 0) {
            noMsg.style.display = 'block';
        } else {
            noMsg.style.display = 'none';
        }

        filtered.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel';
            
            let imageUrl = project.media && project.media.url ? project.media.url : 'https://placehold.co/600x400/f8fafc/3b82f6?text=Project';
            
            card.innerHTML = `
                <img src="${imageUrl}" alt="${project.title}" class="project-img">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p style="color:var(--text-secondary); font-size:0.9rem;">${project.description}</p>
                    <div class="project-tags">
                        ${project.tags ? project.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => openProjectModal(project));
            container.appendChild(card);
        });
    }

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.getAttribute('data-filter');
            renderProjects(cat);
        });
    });

    function openProjectModal(project) {
        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('projectModalBody');
        
        let mediaHtml = '';
        if (project.media && project.media.type === 'video') {
            mediaHtml = `<video src="${project.media.url}" style="width:100%; border-radius:12px; margin-bottom:2rem;" controls autoplay muted loop></video>`;
        } else {
            let imgUrl = project.media && project.media.url ? project.media.url : 'https://placehold.co/1000x500/f8fafc/3b82f6?text=Project+Media';
            mediaHtml = `<img src="${imgUrl}" alt="${project.title}" style="width:100%; border-radius:12px; margin-bottom:2rem; object-fit: cover; max-height: 400px;">`;
        }

        let linksHtml = '';
        if (project.links && project.links.length > 0) {
            linksHtml = project.links.map(link => 
                `<a href="${link.url}" target="_blank" class="btn btn-primary" style="margin-right:1rem; margin-top: 1rem;">
                    ${link.label}
                </a>`
            ).join('');
        }

        // Expanded Data Handling
        let overview = project.overview || project.fullDescription || project.description || 'No overview available.';
        let techUsed = project.techUsed || (project.tags ? project.tags.join(', ') : 'None');
        let outcome = project.outcome || '-';
        let challenges = project.challenges || '-';
        let year = project.year || '-';
        let category = project.category || 'Portfolio';

        const techListArray = techUsed.split(',').map(t => t.trim()).filter(Boolean);

        modalBody.innerHTML = `
            <div style="padding: 2rem;">
                <div class="project-header-info">
                    <h2>${project.title}</h2>
                    <div class="project-meta">
                        <span>Year: ${year}</span>
                        <span>Category: ${category}</span>
                    </div>
                </div>
                
                ${mediaHtml}
                
                <div class="project-detail-grid">
                    <!-- Left Column: Story -->
                    <div>
                        <h3 class="project-section-title">Overview</h3>
                        <div class="project-text-content">${overview.replace(/\n/g, '<br>')}</div>
                        
                        <h3 class="project-section-title">Challenges & Learnings</h3>
                        <div class="project-text-content">${challenges.replace(/\n/g, '<br>')}</div>
                    </div>
                    
                    <!-- Right Column: Sidebar info -->
                    <div>
                        <div class="tech-stack-container">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary);">Technologies Used</h3>
                            <div class="tech-list">
                                ${techListArray.map(t => `<span class="tech-item">${t}</span>`).join('')}
                            </div>
                        </div>

                        <h3 class="project-section-title">Key Outcome</h3>
                        <div class="project-text-content">${outcome.replace(/\n/g, '<br>')}</div>
                        
                        <div style="margin-top: 2rem;">
                            ${linksHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    loadProjects();
});
