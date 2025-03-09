// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Function to get system color scheme preference
const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Function to update theme
const updateTheme = (theme) => {
  if (theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  } else {
    // If no theme specified, remove the attribute to follow system preference
    htmlElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  }
};

// Initialize theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  // Use saved theme if it exists
  updateTheme(savedTheme);
} else {
  // Otherwise, follow system preference
  htmlElement.removeAttribute('data-theme');
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    // Only update if user hasn't manually set a theme
    htmlElement.removeAttribute('data-theme');
  }
});

// Theme toggle handler
themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const systemTheme = getSystemTheme();
  
  if (!currentTheme) {
    // If following system preference, override with opposite of system theme
    updateTheme(systemTheme === 'dark' ? 'light' : 'dark');
  } else {
    // If manually set, toggle between light and dark
    updateTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }
});

// Typing Animation
const typingText = document.getElementById('typingText');
// Ensure the typing animation works with h1 element
if (typingText) {
  typingText.style.display = 'block';
  const messages = [
    "Data Analytics & Artificial Intelligence",
    "Bridging data and decision-making",
    "Exploring the intersection of AI and business",
    "Transforming data into actionable insights",
    "Passionate about data science",
    "Building innovative AI solutions",
    "Combining Python with business strategy",
    "Leveraging statistical models for insights",
    "Turning information into knowledge",
    "Creating data-driven solutions"
  ];
  let messageIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentMessage = messages[messageIndex];
    
    if (!isDeleting && charIndex < currentMessage.length) {
      typingText.textContent = currentMessage.substring(0, charIndex + 1);
      charIndex++;
      setTimeout(type, 100);
    } else if (isDeleting && charIndex > 0) {
      typingText.textContent = currentMessage.substring(0, charIndex - 1);
      charIndex--;
      setTimeout(type, 50);
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) {
        messageIndex = (messageIndex + 1) % messages.length;
      }
      setTimeout(type, isDeleting ? 1500 : 500);
    }
  }

  // Start typing animation
  type();
}

// GitHub Projects Fetching for Home and Projects pages
async function fetchGitHubProjects(containerId, limit = null) {
  const projectsGrid = document.getElementById(containerId);
  
  if (!projectsGrid) return;
  
  try {
    const response = await fetch('https://api.github.com/users/xVc323/repos?sort=updated&direction=desc');
    if (!response.ok) throw new Error('Failed to fetch projects');
    
    const projects = await response.json();
    
    // Clear skeleton loading
    projectsGrid.innerHTML = '';
    
    // Process and display projects
    let displayCount = 0;
    projects.forEach(project => {
      if (!project.fork && !project.archived) {
        // Apply limit if specified
        if (limit !== null && displayCount >= limit) return;
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('role', 'listitem');
        
        // Create project card content with proper structure
        projectCard.innerHTML = `
          <h3>${project.name}</h3>
          ${project.description ? `<p>${project.description}</p>` : '<p>No description provided</p>'}
          <div class="project-meta">
            ${project.language ? `<span>${project.language}</span>` : '<span>Other</span>'}
            <a href="${project.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
          </div>
        `;
        
        projectsGrid.appendChild(projectCard);
        displayCount++;
      }
    });
    
    if (projectsGrid.children.length === 0) {
      projectsGrid.innerHTML = '<p>No public projects found.</p>';
    }
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    projectsGrid.innerHTML = '<p>Failed to load projects. Please try again later.</p>';
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  // Fetch GitHub projects for the homepage (limit to 3)
  if (document.getElementById('projectsGrid')) {
    fetchGitHubProjects('projectsGrid', 3);
  }
  
  // Fetch GitHub projects for the projects page (no limit)
  if (document.getElementById('githubProjectsGrid')) {
    fetchGitHubProjects('githubProjectsGrid');
  }
  
  // Add animation to experience items
  const experienceItems = document.querySelectorAll('.experience-item');
  if (experienceItems.length > 0) {
    experienceItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 300 + (index * 200));
    });
  }
});