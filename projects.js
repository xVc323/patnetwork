// Projects page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Toggle between timeline and grid views
    setupViewToggle();
    
    // Populate grid view with timeline content
    populateGridView();
    
    // Set up interactive elements
    setupInteractiveElements();
    
    // Set up scroll animations
    setupScrollAnimations();
});

function setupViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const timelineView = document.getElementById('timeline-view');
    const gridView = document.getElementById('grid-view');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Toggle view
            const viewType = button.getAttribute('data-view');
            if (viewType === 'timeline') {
                timelineView.style.display = 'block';
                gridView.style.display = 'none';
            } else {
                timelineView.style.display = 'none';
                gridView.style.display = 'grid';
                
                // Animate grid items entrance
                const gridItems = gridView.querySelectorAll('.project-card');
                gridItems.forEach((item, index) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        item.style.transition = 'all 0.4s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100 + (index * 100));
                });
            }
        });
    });
}

function populateGridView() {
    const timelineItems = document.querySelectorAll('.timeline-content .project-card');
    const gridView = document.getElementById('grid-view');
    
    // Clear current content
    gridView.innerHTML = '';
    
    // Clone timeline items into grid view
    timelineItems.forEach(item => {
        const clone = item.cloneNode(true);
        gridView.appendChild(clone);
    });
}

function setupInteractiveElements() {
    // Enhance project cards with hover effects
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Add hover state management
        card.addEventListener('mouseenter', () => {
            const links = card.querySelectorAll('.project-link');
            links.forEach(link => {
                link.style.transform = 'translateX(5px)';
                link.style.transition = 'transform 0.3s ease';
            });
        });
        
        card.addEventListener('mouseleave', () => {
            const links = card.querySelectorAll('.project-link');
            links.forEach(link => {
                link.style.transform = 'translateX(0)';
            });
        });
        
        // Make tags interactive
        const tags = card.querySelectorAll('.project-tag');
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                // In a real implementation, this would filter projects by tag
                const tagText = tag.textContent.trim();
                alert(`Projects filtered by: ${tagText}`);
            });
            
            // Show tag as clickable
            tag.style.cursor = 'pointer';
            tag.setAttribute('title', `Filter projects by ${tag.textContent.trim()}`);
        });
    });
    
    // Add counter animation to highlight cards
    animateHighlightCounters();
}

function animateHighlightCounters() {
    const highlightNumbers = document.querySelectorAll('.highlight-card h3');
    
    highlightNumbers.forEach(number => {
        const target = number.textContent;
        
        // Only animate numeric values
        if (target !== '∞') {
            const isPlus = target.includes('+');
            let value = parseInt(target.replace(/\D/g, ''));
            let start = 0;
            let duration = 2000; // 2 seconds
            let startTime = null;
            
            // Function for smooth counting animation
            function countUp(timestamp) {
                if (!startTime) startTime = timestamp;
                
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const currentCount = Math.floor(progress * value);
                
                number.textContent = currentCount + (isPlus ? '+' : '');
                
                if (progress < 1) {
                    requestAnimationFrame(countUp);
                } else {
                    number.textContent = target; // Ensure final value is exact
                }
            }
            
            // Start animation when element comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(countUp);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(number);
        }
    });
}

function setupScrollAnimations() {
    // Create a dynamic timeline track that grows as user scrolls
    const timelineTrack = document.querySelector('.timeline-track');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineTrack || timelineItems.length === 0) return;
    
    // Function to update the timeline track height
    function updateTimelineHeight() {
        const lastItem = timelineItems[timelineItems.length - 1];
        const lastItemRect = lastItem.getBoundingClientRect();
        const trackHeight = lastItemRect.bottom - timelineTrack.getBoundingClientRect().top;
        
        timelineTrack.style.height = trackHeight + 'px';
    }
    
    // Update on load
    window.addEventListener('load', updateTimelineHeight);
    window.addEventListener('resize', updateTimelineHeight);
    
    // Animate timeline dots on scroll
    const animateDots = () => {
        timelineItems.forEach(item => {
            const dot = item.querySelector('.timeline-dot');
            const itemTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (itemTop < windowHeight * 0.75) {
                dot.style.transform = 'scale(1.2)';
                dot.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    dot.style.transform = 'scale(1)';
                }, 300);
            }
        });
    };
    
    // Set up scroll animation
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            animateDots();
            updateTimelineHeight();
        }, 100);
    });
    
    // Run once on load
    animateDots();
} 