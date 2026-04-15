document.addEventListener('DOMContentLoaded', async () => {
    // Only run on profile page
    if (!document.getElementById('experienceTimeline')) return;

    async function loadData() {
        const experience = await fetchLocalData('experience.json');
        const achievements = await fetchLocalData('achievements.json');
        
        renderExperience(experience);
        renderAchievements(achievements);
    }

    function renderExperience(data) {
        const timeline = document.getElementById('experienceTimeline');
        timeline.innerHTML = '';
        
        if (data.length === 0) {
            timeline.innerHTML = '<p style="color:var(--text-secondary); padding-left: 20px;">No experience data found.</p>';
            return;
        }

        data.forEach(exp => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            let logoUrl = exp.logo ? exp.logo : 'https://placehold.co/100x100/12192b/00d4ff?text=Logo';
            
            item.innerHTML = `
                <div class="timeline-content glass-panel">
                    <img src="${logoUrl}" alt="${exp.company}" class="company-logo">
                    <div class="exp-details">
                        <h3>${exp.position}</h3>
                        <h4>${exp.company}</h4>
                        <div class="exp-date">${exp.startYear} - ${exp.endYear}</div>
                        <p style="color:var(--text-secondary); font-size:0.95rem;">${exp.description.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            `;
            timeline.appendChild(item);
        });
    }

    function renderAchievements(data) {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = '';
        
        if (data.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary);">No achievements data found.</p>';
            return;
        }

        data.forEach(achie => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            
            let imageUrl = achie.media && achie.media.url ? achie.media.url : 'https://placehold.co/600x400/12192b/7c3aed?text=Achievement';
            
            card.innerHTML = `
                <img src="${imageUrl}" alt="${achie.title}" class="achievement-img">
                <div class="achievement-info">
                    <h3 style="color:var(--accent-purple); margin-bottom:0.5rem;">${achie.title}</h3>
                    <p style="color:var(--text-secondary); font-size:0.9rem;">${achie.date || ''}</p>
                </div>
            `;
            
            card.addEventListener('click', () => openAchievementModal(achie));
            container.appendChild(card);
        });
    }

    function openAchievementModal(achie) {
        const modal = document.getElementById('achievementModal');
        const modalBody = document.getElementById('achieModalBody');
        
        let mediaHtml = '';
        if (achie.media && achie.media.type === 'video') {
            mediaHtml = `<video src="${achie.media.url}" class="modal-media" controls autoplay muted loop></video>`;
        } else {
            let imgUrl = achie.media && achie.media.url ? achie.media.url : 'https://placehold.co/600x400/12192b/7c3aed?text=Achievement';
            mediaHtml = `<img src="${imgUrl}" alt="${achie.title}" class="modal-media">`;
        }

        let linksHtml = '';
        if (achie.links && achie.links.length > 0) {
            linksHtml = achie.links.map(link => 
                `<a href="${link.url}" target="_blank" class="btn btn-outline">${link.label}</a>`
            ).join('');
        }

        modalBody.innerHTML = `
            <div class="modal-body-split">
                <div class="modal-media-container">
                    ${mediaHtml}
                </div>
                <div class="modal-info">
                    <h2 style="color:var(--accent-purple);">${achie.title}</h2>
                    ${achie.date ? `<p style="color:white; margin-bottom:1rem;">${achie.date}</p>` : ''}
                    <div class="modal-desc">
                        ${achie.description ? achie.description.replace(/\n/g, '<br>') : 'No description provided.'}
                    </div>
                    <div class="modal-links">
                        ${linksHtml}
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    loadData();
});
