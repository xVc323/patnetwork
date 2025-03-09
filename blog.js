// Blog page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Set up category filtering
    setupCategoryFilters();
    
    // Set up newsletter form
    setupNewsletterForm();
    
    // Animate blog cards on scroll
    setupScrollAnimations();
});

function setupCategoryFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    const blogCards = document.querySelectorAll('.blog-card');
    const featuredPost = document.querySelector('.featured-post');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Update active chip
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const selectedCategory = chip.dataset.category;
            
            // Filter blog cards
            blogCards.forEach(card => {
                if (selectedCategory === 'all') {
                    card.style.display = 'flex';
                    if (featuredPost) featuredPost.style.display = 'grid';
                } else {
                    const cardCategory = card.dataset.category;
                    card.style.display = cardCategory === selectedCategory ? 'flex' : 'none';
                    
                    // Hide/show featured post based on category
                    if (featuredPost) {
                        const featuredCategory = featuredPost.querySelector('.post-category').dataset.category;
                        featuredPost.style.display = featuredCategory === selectedCategory ? 'grid' : 'none';
                    }
                }
            });
            
            // Animate entering cards
            setTimeout(() => {
                document.querySelectorAll('.blog-card[style="display: flex;"]').forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 100);
                });
            }, 50);
        });
    });
}

function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // Show success message
                newsletterForm.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <p>Thanks for subscribing! We've sent a confirmation to ${email}</p>
                    </div>
                `;
                
                // In a real implementation, you would send this to your backend
                console.log('Subscribed email:', email);
            }
        });
    }
}

function setupScrollAnimations() {
    // Add a CSS class to blog cards for fade-in animation
    const blogCards = document.querySelectorAll('.blog-card');
    
    // Add animation classes to CSS
    const style = document.createElement('style');
    style.textContent = `
        .blog-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .blog-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .success-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-sm);
            color: #27C93F;
        }
        
        .success-message i {
            font-size: 2rem;
        }
    `;
    document.head.appendChild(style);
    
    // Function to check if an element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    };
    
    // Function to animate cards when they come into view
    const animateOnScroll = () => {
        blogCards.forEach(card => {
            if (isInViewport(card)) {
                card.classList.add('animate-in');
            }
        });
    };
    
    // Run on load and scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // Add hover effects to featured post
    const featuredPost = document.querySelector('.featured-post');
    if (featuredPost) {
        featuredPost.addEventListener('mouseenter', () => {
            featuredPost.style.transform = 'translateY(-5px)';
            featuredPost.style.boxShadow = 'var(--shadow-lg)';
            featuredPost.style.transition = 'all 0.3s ease';
        });
        
        featuredPost.addEventListener('mouseleave', () => {
            featuredPost.style.transform = 'translateY(0)';
            featuredPost.style.boxShadow = 'var(--shadow-md)';
        });
    }
} 