document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('certContainer')) return;

    let allCerts = [];

    async function loadCerts() {
        allCerts = await fetchLocalData('certificates.json');
        renderCerts('All');
        setupFilters();
    }

    function renderCerts(filterValue) {
        const container = document.getElementById('certContainer');
        container.innerHTML = '';
        
        const filtered = filterValue === 'All' 
            ? allCerts 
            : allCerts.filter(c => c.category === filterValue);

        if (filtered.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1/-1; text-align: center;">No certificates found for this category.</p>';
            return;
        }

        filtered.forEach(cert => {
            const card = document.createElement('div');
            card.className = 'cert-card';
            
            let imageUrl = cert.image ? cert.image : 'https://placehold.co/600x400/12192b/00d4ff?text=Certificate';
            
            card.innerHTML = `
                <div class="cert-img-container">
                    <img src="${imageUrl}" alt="${cert.title}" class="cert-img">
                </div>
                <div class="cert-info">
                    <h3 class="cert-title">${cert.title}</h3>
                    <p class="cert-issuer">${cert.issuer} • ${cert.date}</p>
                </div>
            `;
            
            card.addEventListener('click', () => openCertModal(cert, imageUrl));
            container.appendChild(card);
        });
    }

    function setupFilters() {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                btns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderCerts(e.target.dataset.filter);
            });
        });
    }

    function openCertModal(cert, imageUrl) {
        const modal = document.getElementById('imageModal');
        document.getElementById('fullSizeImg').src = imageUrl;
        document.getElementById('certModalTitle').textContent = cert.title;
        document.getElementById('certModalIssuer').textContent = `${cert.issuer} • ${cert.date}`;
        
        const linkElem = document.getElementById('certModalLink');
        if (cert.credentialUrl) {
            linkElem.style.display = 'inline-block';
            linkElem.href = cert.credentialUrl;
        } else {
            linkElem.style.display = 'none';
        }

        modal.classList.add('active');
    }

    loadCerts();
});
