document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    initTheme();

    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Navbar shadow on scroll + scroll-to-top visibility
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', function() {
        navbar.style.boxShadow = window.scrollY > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none';
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
        }
    });
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Load publications
    loadPublications();

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.research-card, .timeline-item, .education-card, .award-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

// Theme management
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'dark' || (!stored && prefersDark)) {
        document.body.classList.add('dark');
        updateToggleIcon(true);
    }

    if (toggle) {
        toggle.addEventListener('click', function() {
            const isDark = document.body.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateToggleIcon(isDark);
        });
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
            updateToggleIcon(e.matches);
        }
    });
}

function updateToggleIcon(isDark) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Publications loader
async function loadPublications() {
    const container = document.getElementById('publications-list');
    const statsContainer = document.getElementById('pub-stats');
    if (!container) return;

    try {
        const response = await fetch('publications.json');
        const data = await response.json();

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

        const filteredPubs = data.publications.filter(pub =>
            pub.year && pub.title && !pub.title.includes('REPORT OF MAJOR IMPACT')
        );

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

function formatAuthors(authorString) {
    if (!authorString) return '';
    const authors = authorString.split(' and ').map(a => a.trim());
    return authors.map(author => {
        if (author.toLowerCase().includes('zhoroev')) {
            return `<strong>${author}</strong>`;
        }
        return author;
    }).join(', ');
}
