document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    initTheme();

    // Mobile navigation drawer
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    let overlay = document.querySelector('.nav-overlay');

    // Create overlay if not present
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    // Create close button inside nav-menu if not present
    if (navMenu && !navMenu.querySelector('.nav-close')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'nav-close';
        closeBtn.setAttribute('aria-label', 'Close navigation menu');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        navMenu.prepend(closeBtn);
        closeBtn.addEventListener('click', closeDrawer);
    }

    function openDrawer() {
        navMenu.classList.add('active');
        overlay.classList.add('active');
        if (hamburger) {
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });
    }

    // Close drawer on overlay click
    overlay.addEventListener('click', closeDrawer);

    // Close drawer on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeDrawer);
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

    // Navbar shadow on scroll + scroll-to-top visibility + active nav highlighting
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.getElementById('scroll-top');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    const sections = [];
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const section = document.querySelector(href);
            if (section) sections.push({ el: section, link: link });
        }
    });

    window.addEventListener('scroll', function() {
        navbar.style.boxShadow = window.scrollY > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none';
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
        }

        // Active nav highlighting
        if (sections.length > 0) {
            const scrollPos = window.scrollY + navbar.offsetHeight + 100;
            let currentSection = null;
            for (let i = sections.length - 1; i >= 0; i--) {
                if (sections[i].el.offsetTop <= scrollPos) {
                    currentSection = sections[i];
                    break;
                }
            }
            navLinks.forEach(l => l.classList.remove('active-link'));
            if (currentSection) {
                currentSection.link.classList.add('active-link');
            }
        }
    });
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Load publications
    loadPublications();

    // Typing effect for subtitle
    initTypingEffect();

    // Scroll animations with staggered card reveal
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Staggered reveal for research cards
    const researchCards = document.querySelectorAll('.research-card');
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = Array.from(researchCards);
                const idx = cards.indexOf(entry.target);
                const delay = prefersReducedMotion ? 0 : idx * 100;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                    entry.target.style.opacity = '1';
                    if (!prefersReducedMotion) {
                        entry.target.style.transform = 'translateY(0)';
                    }
                }, delay);
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    researchCards.forEach(el => {
        el.style.opacity = '0';
        if (!prefersReducedMotion) {
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        } else {
            el.style.transition = 'opacity 0.3s ease';
        }
        staggerObserver.observe(el);
    });

    // Standard reveal for other elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                entry.target.style.opacity = '1';
                if (!prefersReducedMotion) {
                    entry.target.style.transform = 'translateY(0)';
                }
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.timeline-item, .education-card, .award-item').forEach(el => {
        el.style.opacity = '0';
        if (!prefersReducedMotion) {
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        } else {
            el.style.transition = 'opacity 0.3s ease';
        }
        observer.observe(el);
    });

    // Timeline marker pulse on scroll into view
    const markerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                markerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.timeline-marker').forEach(marker => {
        markerObserver.observe(marker);
    });

    // Reveal sections on scroll
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.section-title, .about-content, .publications-stats, .contact-content, .affiliations-strip').forEach(el => {
        if (!prefersReducedMotion) {
            el.classList.add('reveal');
            sectionObserver.observe(el);
        }
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

// Typing effect
function initTypingEffect() {
    const el = document.getElementById('typed-subtitle');
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (sessionStorage.getItem('typingDone')) return;

    const text = el.getAttribute('data-text') || el.textContent;
    el.textContent = '';

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '\u200B';
    el.appendChild(cursor);

    let i = 0;
    const speed = 45;

    function type() {
        if (i < text.length) {
            el.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
            setTimeout(type, speed);
        } else {
            sessionStorage.setItem('typingDone', '1');
            setTimeout(() => { cursor.remove(); }, 2000);
        }
    }

    setTimeout(type, 400);
}
