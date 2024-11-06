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
    const body = document.body;

    // Variable pour la couleur des particules
    let particleColor = 'rgba(150, 150, 150, 0.5)';

    // Met à jour la couleur des particules en fonction du thème
    function updateParticleColor() {
        if (body.classList.contains('dark-theme')) {
            particleColor = 'rgba(255, 255, 255, 0.3)'; // Couleur claire pour le thème sombre
        } else {
            particleColor = 'rgba(150, 150, 150, 0.5)'; // Couleur plus foncée pour le thème clair
        }
    }

    // Fonction pour définir le thème
    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else {
            body.classList.remove('dark-theme');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
        updateParticleColor(); // Appel de la fonction pour mettre à jour la couleur des particules
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
            const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Effet de tempête de sable
    const canvas = document.getElementById('sandstorm');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray = [];
        const numberOfParticles = 200; // Ajustez le nombre pour plus ou moins de particules

        // Créer les particules
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5; // Taille des particules
                this.speedX = Math.random() * 0.5 - 0.25; // Vitesse horizontale
                this.speedY = Math.random() * 1 + 0.5; // Vitesse verticale
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Réapparaître en haut si sort en bas
                if (this.y > canvas.height) {
                    this.y = 0 - this.size;
                    this.x = Math.random() * canvas.width;
                }

                // Réapparaître à gauche si sort à droite
                if (this.x > canvas.width) {
                    this.x = 0 - this.size;
                }

                // Réapparaître à droite si sort à gauche
                if (this.x < 0 - this.size) {
                    this.x = canvas.width + this.size;
                }
            }

            draw() {
                ctx.fillStyle = particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialiser les particules
        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        initParticles();

        // Animer les particules
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesArray.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animateParticles);
        }

        animateParticles();

        // Ajuster la taille du canvas lors du redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });
    }
});