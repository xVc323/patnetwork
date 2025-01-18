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
typingText.style.display = 'block';
const messages = [
  "Turning ideas into reality",
  "Exploring the synergy between data and innovation",
  "Exploring creative solutions",
  "Transforming data into actionable insights",
  "Building meaningful projects",
  "Designing solutions at the intersection of AI and strategy",
  "Simplifying complex problems",
  "Simplifying the complex with data-driven approaches",
  "Experimenting with new technologies",
  "Turning raw information into meaningful narratives",
  "Sharing knowledge and insights",
  "Experimenting with AI to solve real-world problems",
  "Blending analytics and creativity for impactful results",
  "Crafting intuitive tools for modern challenges",
  "Unlocking potential through technology and data",
  "Sharing the journey of discovery and growth"
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

// GitHub Projects Fetching
async function fetchGitHubProjects() {
  const projectsGrid = document.getElementById('projectsGrid');
  
  try {
    const response = await fetch('https://api.github.com/users/xVc323/repos?sort=updated&direction=desc');
    if (!response.ok) throw new Error('Failed to fetch projects');
    
    const projects = await response.json();
    
    // Clear skeleton loading
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
      if (!project.fork && !project.archived) {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('role', 'listitem');
        
        projectCard.innerHTML = `
          <h3>${project.name}</h3>
          ${project.description ? `<p>${project.description}</p>` : ''}
          <div class="project-meta">
            ${project.language ? `<span>${project.language}</span>` : ''}
            <a href="${project.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
          </div>
        `;
        
        projectsGrid.appendChild(projectCard);
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
  // Fetch GitHub projects
  fetchGitHubProjects();
  
  // Start typing animation
  type();
});