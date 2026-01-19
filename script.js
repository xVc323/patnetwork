// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetSection.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll - now handled by theme system

// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// Add scroll reveal to sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('scroll-reveal');
        observer.observe(section);
    });

    // Add scroll reveal to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.classList.add('scroll-reveal');
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Add scroll reveal to skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((category, index) => {
        category.classList.add('scroll-reveal');
        category.style.animationDelay = `${index * 0.1}s`;
        observer.observe(category);
    });
});

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Simple form validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission (replace with actual implementation)
        showNotification('Thanks for your message! I\'ll get back to you soon.', 'success');
        contactForm.reset();
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Typing animation for hero text
function initTypingAnimation() {
    const titleElement = document.querySelector('.hero-title .name');
    if (!titleElement) return;
    
    const text = 'Pat';
    titleElement.textContent = '';
    
    let index = 0;
    function typeChar() {
        if (index < text.length) {
            titleElement.textContent += text[index];
            index++;
            setTimeout(typeChar, 150);
        }
    }
    
    // Start typing animation after a delay
    setTimeout(typeChar, 500);
}

// Initialize typing animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initTypingAnimation, 1000);
});

// Floating elements animation enhancement
document.addEventListener('DOMContentLoaded', () => {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        // Add random rotation animation
        element.style.animation = `float 3s ease-in-out infinite, rotate 10s linear infinite`;
        element.style.animationDelay = `${index * 0.5}s, ${index * 2}s`;
    });
    
    // Add rotation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate {
            from { transform: rotate(0deg) translateY(0px); }
            25% { transform: rotate(90deg) translateY(-10px); }
            50% { transform: rotate(180deg) translateY(0px); }
            75% { transform: rotate(270deg) translateY(-10px); }
            to { transform: rotate(360deg) translateY(0px); }
        }
    `;
    document.head.appendChild(style);
});

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const root = document.documentElement;
    
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme;
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        currentTheme = systemPrefersDark ? 'dark' : 'light';
    }
    
    // Apply initial theme
    setTheme(currentTheme);
    
    // Add click event listener to toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(currentTheme);
            localStorage.setItem('theme', currentTheme);
        });
    }
    
    // Listen for system theme changes (only if no manual preference is saved)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            currentTheme = e.matches ? 'dark' : 'light';
            setTheme(currentTheme);
        }
    });
    
    function setTheme(theme) {
        // Remove any existing theme classes
        root.classList.remove('theme-dark', 'theme-light');
        
        // Add the new theme class
        root.classList.add(`theme-${theme}`);
        
        // Update the icon
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Update navbar background for theme compatibility
        updateNavbarForTheme(theme);
        
        currentTheme = theme;
    }
    
    function updateNavbarForTheme(theme) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // Update navbar background on scroll based on theme
            const updateNavbarBg = () => {
                if (window.scrollY > 50) {
                    navbar.style.background = theme === 'dark' 
                        ? 'rgba(10, 10, 10, 0.98)' 
                        : 'rgba(248, 249, 250, 0.98)';
                } else {
                    navbar.style.background = theme === 'dark' 
                        ? 'rgba(10, 10, 10, 0.95)' 
                        : 'rgba(248, 249, 250, 0.95)';
                }
            };
            
            // Update immediately and on scroll
            updateNavbarBg();
            window.removeEventListener('scroll', updateNavbarBg);
            window.addEventListener('scroll', updateNavbarBg);
        }
    }
}

// Project card hover effects
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add subtle scale animation
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Skills animation on scroll
function animateSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        }, index * 50);
    });
}

// Stats counter animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = stat.textContent;
        const numericValue = parseInt(target.replace(/\D/g, ''));
        const suffix = target.replace(/\d/g, '');
        
        let current = 0;
        const increment = numericValue / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current) + suffix;
        }, 30);
    });
}

// Initialize animations when elements come into view
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('skills')) {
                animateSkills();
            }
            if (entry.target.classList.contains('hero-stats')) {
                animateStats();
            }
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const skillsSection = document.querySelector('.skills');
    const statsSection = document.querySelector('.hero-stats');
    
    if (skillsSection) animationObserver.observe(skillsSection);
    if (statsSection) animationObserver.observe(statsSection);
});

// Copy to clipboard functionality for contact info
function initCopyToClipboard() {
    const copyableElements = document.querySelectorAll('[data-copy]');
    
    copyableElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', () => {
            const textToCopy = element.getAttribute('data-copy') || element.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification('Copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('Failed to copy', 'error');
            });
        });
    });
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initCopyToClipboard();
    
    // Add smooth reveal animation to all elements
    const allElements = document.querySelectorAll('h1, h2, h3, p, .btn, .project-card, .skill-category');
    allElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll-based animations go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler); 