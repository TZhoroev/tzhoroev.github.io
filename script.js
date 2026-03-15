// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // Load publications from JSON
    loadPublications();

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to cards and timeline items
    const animatedElements = document.querySelectorAll('.research-card, .timeline-item, .education-card, .award-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

// Load and render publications from JSON
async function loadPublications() {
    const container = document.getElementById('publications-list');
    const statsContainer = document.getElementById('pub-stats');
    
    try {
        const response = await fetch('publications.json');
        const data = await response.json();
        
        // Display stats
        if (statsContainer && data.total_citations) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${data.total_citations}</span>
                    <span class="stat-label">Total Citations</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${data.publications.length}</span>
                    <span class="stat-label">Publications</span>
                </div>
            `;
        }
        
        // Filter out publications without year or with generic titles
        const filteredPubs = data.publications.filter(pub => 
            pub.year && 
            pub.title && 
            !pub.title.includes('REPORT OF MAJOR IMPACT')
        );
        
        // Render publications
        let html = '';
        filteredPubs.forEach(pub => {
            const authors = formatAuthors(pub.authors);
            html += `
                <div class="publication">
                    <div class="pub-year">${pub.year}</div>
                    <div class="pub-content">
                        <h3>${pub.url ? `<a href="${pub.url}" target="_blank">${pub.title}</a>` : pub.title}</h3>
                        <p class="pub-authors">${authors}</p>
                        ${pub.venue ? `<p class="pub-venue">${pub.venue}</p>` : ''}
                        ${pub.citations > 0 ? `<p class="pub-citations"><i class="fas fa-quote-right"></i> ${pub.citations} citations</p>` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Animate publications
        document.querySelectorAll('.publication').forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
    } catch (error) {
        console.error('Error loading publications:', error);
        container.innerHTML = '<p>Unable to load publications. Please visit <a href="https://scholar.google.com/citations?user=ShuoePgAAAAJ&hl=en">Google Scholar</a>.</p>';
    }
}

// Format author names, highlighting "Zhoroev"
function formatAuthors(authorString) {
    if (!authorString) return '';
    
    // Split by " and " and clean up
    const authors = authorString.split(' and ').map(a => a.trim());
    
    return authors.map(author => {
        // Check if this is Zhoroev
        if (author.toLowerCase().includes('zhoroev')) {
            return `<strong>${author}</strong>`;
        }
        return author;
    }).join(', ');
}
