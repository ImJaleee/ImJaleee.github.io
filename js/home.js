document.addEventListener('DOMContentLoaded', async () => {
    // Only run on home page
    if (!document.getElementById('projectsContainer')) return;

    let allProjects = [];

    async function loadProjects() {
        allProjects = await fetchLocalData('projects.json');
        renderProjects();
    }

    function renderProjects() {
        const container = document.getElementById('projectsContainer');
        container.innerHTML = '';
        
        // Show featured first or limit to initially visible
        const displayProjects = allProjects.filter(p => p.featured).slice(0, 3);
        if (displayProjects.length === 0) displayProjects.push(...allProjects.slice(0, 3));

        displayProjects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel';
            
            let imageUrl = project.media && project.media.url ? project.media.url : 'https://placehold.co/600x400/f8fafc/3b82f6?text=Project+Image';
            
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

    function openProjectModal(project) {
        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');
        
        let mediaHtml = '';
        if (project.media && project.media.type === 'video') {
            mediaHtml = `<video src="${project.media.url}" class="modal-media" style="width:100%; border-radius:12px; margin-bottom:1.5rem;" controls autoplay muted loop></video>`;
        } else {
            let imgUrl = project.media && project.media.url ? project.media.url : 'https://placehold.co/600x400/f8fafc/3b82f6?text=Project+Image';
            mediaHtml = `<img src="${imgUrl}" alt="${project.title}" class="modal-media" style="width:100%; border-radius:12px; margin-bottom:1.5rem;">`;
        }

        let linksHtml = '';
        if (project.links && project.links.length > 0) {
            linksHtml = project.links.map(link => 
                `<a href="${link.url}" target="_blank" class="btn btn-outline" style="margin-right:0.5rem;">${link.label}</a>`
            ).join('');
        }

        modalBody.innerHTML = `
            <div style="padding: 2rem;">
                ${mediaHtml}
                <div class="modal-info" style="padding:0;">
                    <h2 style="color:var(--text-primary); margin-bottom:0.5rem;">${project.title}</h2>
                    <div class="modal-desc" style="color:var(--text-secondary); margin-bottom:1.5rem;">
                        ${(project.fullDescription || project.description).replace(/\n/g, '<br>')}
                    </div>
                    <div class="modal-links">
                        ${linksHtml}
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    loadProjects();
});
