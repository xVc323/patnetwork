// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Effet de frappe
    const text = "Hey, this is my website. Stay tuned for more updates :)";
    let index = 0;
    const speed = 100; // Vitesse de frappe (ms)
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

    // Variable pour la couleur des particules
    let particleColor = 'rgba(150, 150, 150, 0.5)';

    // Met à jour la couleur des particules en fonction du thème
    function updateParticleColor() {
        if (html.classList.contains('dark-theme')) {
            particleColor = 'rgba(255, 255, 255, 0.3)';
        } else {
            particleColor = 'rgba(150, 150, 150, 0.5)';
        }
    }

    // Fonction pour définir le thème
    function setTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else {
            html.classList.remove('dark-theme');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
        updateParticleColor();
    }

    // Vérifier si une préférence de thème est stockée
    let storedTheme = localStorage.getItem('theme');

    // Fonction pour obtenir le thème par défaut en fonction de l'heure
    function getDefaultTheme() {
        const hour = new Date().getHours();
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }

    // Définir le thème initial
    if (storedTheme) {
        setTheme(storedTheme);
    } else {
        const defaultTheme = getDefaultTheme();
        setTheme(defaultTheme);
        localStorage.setItem('theme', defaultTheme);
    }

    // Écouter le clic sur le bouton de changement de thème
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});