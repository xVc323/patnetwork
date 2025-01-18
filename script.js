// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);

// Theme toggle handler
themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
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