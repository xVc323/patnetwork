// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Effet de frappe
    const text = "Hey, this is my website. Stay tuned for more updates :)";
    let index = 0;
    const speed = 100;
    const typingText = document.getElementById('typingText');

    function typeWriter() {
        if (typingText && index < text.length) {
            typingText.innerHTML += text.charAt(index);
            index++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();

    // Changement de thème
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    function setTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else {
            html.classList.remove('dark-theme');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
    }

    let storedTheme = localStorage.getItem('theme');

    function getDefaultTheme() {
        const hour = new Date().getHours();
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }

    if (storedTheme) {
        setTheme(storedTheme);
    } else {
        const defaultTheme = getDefaultTheme();
        setTheme(defaultTheme);
        localStorage.setItem('theme', defaultTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});