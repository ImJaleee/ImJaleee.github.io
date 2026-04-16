document.addEventListener('DOMContentLoaded', async () => {
    // Only run on profile page
    if (!document.getElementById('experienceTimeline')) return;

    // Load Data
    async function loadData() {
        const experience = await fetchLocalData('experience.json');
        const education = await fetchLocalData('education.json');
        const achievements = await fetchLocalData('achievements.json');
        
        renderExperience(experience);
        renderEducation(education);
        renderAchievements(achievements);
    }

    // Render Experience
    function renderExperience(data) {
        const timeline = document.getElementById('experienceTimeline');
        timeline.innerHTML = '';
        
        if (!data || data.length === 0) {
            timeline.innerHTML = '<p style="color:var(--text-secondary); padding-left: 20px;">No experience data found.</p>';
            return;
        }

        data.forEach(exp => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            // In light theme, if there's no logo we can just not show it or use a fallback
            let logoHtml = '';
            if (exp.logo) {
                logoHtml = `<img src="${exp.logo}" alt="${exp.company}" class="company-logo" style="width: 50px; height: 50px; object-fit: contain; margin-bottom: 1rem;">`;
            }
            
            item.innerHTML = `
                <div class="timeline-content">
                    ${logoHtml}
                    <div class="timeline-date">${exp.startYear} - ${exp.endYear}</div>
                    <h3 class="timeline-title">${exp.position}</h3>
                    <div class="timeline-company">${exp.company}</div>
                    <p class="timeline-desc">${exp.description.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            timeline.appendChild(item);
        });
    }

    // Render Education
    function renderEducation(data) {
        const timeline = document.getElementById('educationTimeline');
        if (!timeline) return;
        timeline.innerHTML = '';
        
        if (!data || data.length === 0) {
            timeline.innerHTML = '<p style="color:var(--text-secondary); padding-left: 20px;">No education data found.</p>';
            return;
        }

        data.forEach(edu => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            item.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-date">${edu.year}</div>
                    <h3 class="timeline-title">${edu.degree}</h3>
                    <div class="timeline-company">${edu.school}</div>
                    <p class="timeline-desc">${edu.description.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            timeline.appendChild(item);
        });
    }

    // Render Achievements
    function renderAchievements(data) {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;
        container.innerHTML = '';
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary);">No achievements data found.</p>';
            return;
        }

        data.forEach(achie => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            
            let imageUrl = achie.media && achie.media.url ? achie.media.url : 'https://placehold.co/600x400/f8fafc/8b5cf6?text=Achievement';
            
            card.innerHTML = `
                <div class="achie-icon">🏆</div>
                <h3 class="achie-title">${achie.title}</h3>
                <p class="achie-year">${achie.date || ''}</p>
            `;
            
            card.addEventListener('click', () => openAchievementModal(achie, imageUrl));
            container.appendChild(card);
        });
    }

    function openAchievementModal(achie, fallbackImg) {
        const modal = document.getElementById('achievementModal');
        const modalBody = document.getElementById('achieModalBody');
        
        let mediaHtml = '';
        if (achie.media && achie.media.type === 'video') {
            mediaHtml = `<video src="${achie.media.url}" style="width:100%; border-radius: 12px; margin-bottom: 1.5rem;" controls autoplay muted loop></video>`;
        } else {
            mediaHtml = `<img src="${fallbackImg}" alt="${achie.title}" style="width:100%; border-radius: 12px; margin-bottom: 1.5rem;">`;
        }

        let linksHtml = '';
        if (achie.links && achie.links.length > 0) {
            linksHtml = achie.links.map(link => 
                `<a href="${link.url}" target="_blank" class="btn btn-outline" style="margin-right: 0.5rem; margin-top: 1rem;">${link.label}</a>`
            ).join('');
        }

        modalBody.innerHTML = `
            <div style="padding: 2rem;">
                ${mediaHtml}
                <h2 style="color:var(--accent-blue); margin-bottom: 0.5rem;">${achie.title}</h2>
                ${achie.date ? `<p style="color:var(--text-secondary); margin-bottom:1rem; font-weight: 500;">${achie.date}</p>` : ''}
                <div style="color:var(--text-primary); line-height: 1.6;">
                    ${achie.description ? achie.description.replace(/\n/g, '<br>') : 'No description provided.'}
                </div>
                <div>
                    ${linksHtml}
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    loadData();

    // Scroll Spy Logic
    const sections = document.querySelectorAll('.profile-section');
    const menuLinks = document.querySelectorAll('.sidebar-menu a');

    // Make smooth scrolling for menu
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 120,
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-150px 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let id = entry.target.getAttribute('id');
                menuLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});
