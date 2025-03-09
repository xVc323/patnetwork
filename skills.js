// Skills page interactive elements

document.addEventListener('DOMContentLoaded', () => {
    // Animate skill bars on page load
    animateSkillBars();
    
    // Command line interaction
    setupTerminalInteraction();
    
    // Make skill badges interactive
    setupSkillBadges();
});

function animateSkillBars() {
    // Start with all skill levels at 0 width
    const skillLevels = document.querySelectorAll('.skill-level');
    skillLevels.forEach(level => {
        const originalWidth = level.style.width;
        level.style.width = '0%';
        
        // Trigger animation after a small delay
        setTimeout(() => {
            level.style.width = originalWidth;
        }, 300);
    });
}

function setupTerminalInteraction() {
    const terminalBody = document.querySelector('.terminal-body');
    const promptLine = document.querySelector('.terminal-line:last-child');
    const cursor = document.querySelector('.cursor');
    
    // List of possible commands
    const commands = {
        'help': 'Available commands: help, clear, ls, about, contact',
        'clear': function() {
            const terminal = document.querySelector('.terminal-body');
            const skillsOutput = document.getElementById('skills-output');
            const allLines = terminal.querySelectorAll('.terminal-line');
            
            // Remove all lines except the last one (prompt)
            Array.from(allLines).forEach((line, index) => {
                if (index < allLines.length - 1) {
                    line.remove();
                }
            });
            
            // Remove skills output
            if (skillsOutput) {
                skillsOutput.remove();
            }
            
            return '';
        },
        'ls': 'skills.json  interests.txt  projects.md  README.md',
        'about': 'I am a creative technologist passionate about building innovative solutions at the intersection of technology and human experience.',
        'contact': 'Email: hello@pat.network | GitHub: @xVc323'
    };
    
    // Handle terminal input
    terminalBody.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terminal-input';
        input.style.background = 'transparent';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.color = 'inherit';
        input.style.font = 'inherit';
        input.style.width = '100%';
        
        // Replace cursor with input field
        promptLine.appendChild(input);
        cursor.style.display = 'none';
        input.focus();
        
        // Handle command execution
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim().toLowerCase();
                
                // Create new line with the command
                const commandLine = document.createElement('div');
                commandLine.className = 'terminal-line';
                commandLine.innerHTML = `<span class="prompt">$ </span><span class="command">${command}</span>`;
                terminalBody.insertBefore(commandLine, promptLine);
                
                // Process command and show output
                if (commands[command]) {
                    const output = typeof commands[command] === 'function' 
                        ? commands[command]() 
                        : commands[command];
                    
                    if (output) {
                        const outputLine = document.createElement('div');
                        outputLine.className = 'terminal-line';
                        outputLine.textContent = output;
                        terminalBody.insertBefore(outputLine, promptLine);
                    }
                } else if (command === 'cat skills.json') {
                    // Recreate skills output if it was removed
                    if (!document.getElementById('skills-output')) {
                        const skillsOutput = document.createElement('div');
                        skillsOutput.id = 'skills-output';
                        skillsOutput.className = 'skills-output';
                        skillsOutput.innerHTML = document.getElementById('skills-output').innerHTML;
                        terminalBody.insertBefore(skillsOutput, promptLine);
                        animateSkillBars();
                    }
                } else if (command) {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-line';
                    outputLine.textContent = `Command not found: ${command}. Type 'help' for available commands.`;
                    terminalBody.insertBefore(outputLine, promptLine);
                }
                
                // Reset prompt
                promptLine.innerHTML = '<span class="prompt">$ </span><span class="cursor"></span>';
                cursor.style.display = 'inline-block';
                
                // Auto-scroll to bottom
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        });
    });
}

function setupSkillBadges() {
    const badges = document.querySelectorAll('.skill-badge');
    
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            // Get current skill name
            const skillName = badge.textContent.trim();
            
            // Generate a unique random fact about this skill
            const facts = [
                `${skillName} is being used in cutting-edge research across multiple domains.`,
                `Recent advancements in ${skillName} have revolutionized how we approach complex problems.`,
                `I've spent over 500 hours mastering ${skillName} techniques and best practices.`,
                `${skillName} continues to evolve rapidly, with new frameworks emerging regularly.`,
                `The job market for ${skillName} specialists has grown 40% in the last year.`
            ];
            
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'skill-tooltip';
            tooltip.textContent = randomFact;
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = 'var(--color-surface)';
            tooltip.style.color = 'var(--color-text)';
            tooltip.style.padding = 'var(--space-sm)';
            tooltip.style.borderRadius = '4px';
            tooltip.style.boxShadow = 'var(--shadow-md)';
            tooltip.style.maxWidth = '250px';
            tooltip.style.zIndex = '100';
            tooltip.style.fontSize = '0.85rem';
            tooltip.style.border = '1px solid var(--color-border)';
            
            // Position tooltip near the badge
            const rect = badge.getBoundingClientRect();
            document.body.appendChild(tooltip);
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.bottom + 8}px`;
            
            // Remove tooltip after a delay
            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 300);
            }, 3000);
        });
    });
} 