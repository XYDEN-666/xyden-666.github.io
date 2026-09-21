document.addEventListener('DOMContentLoaded', () => {
    // Spider animation setup
    const canvas = document.getElementById('spiderCanvas');
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    // Circle boundary settings
    const circleRadius = 150; // Radius of the cursor circle
    
    // Background dot class
    class BackgroundDot {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = 2;
            this.baseOpacity = 0.15; // Reduced base opacity
            this.offset = Math.random() * Math.PI * 2; // Random offset for wave effect
        }

        draw(mouseX, mouseY) {
            let opacity = this.baseOpacity;
            let glow = false;
            
            // Check if dot is inside cursor circle
            if (mouseX !== null && mouseY !== null) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < circleRadius) {
                    // Calculate opacity based on distance from cursor
                    opacity = this.baseOpacity + (1 - this.baseOpacity) * (1 - distance / circleRadius);
                    glow = true;
                }
            }

            // Draw dot with conditional glow
            if (glow) {
                ctx.save();
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 5;
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${opacity})`;
            ctx.fill();
            
            if (glow) {
                ctx.restore();
            }
        }
    }

    // Spider dot class
    class SpiderDot {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = 0;
            this.vy = 0;
            this.size = 4.5;
            this.connections = []; // Back to array for multiple connections
            this.maxConnections = 5; // Increased number of connections
            this.baseOpacity = 0.15;
        }

        update(mouseX, mouseY, backgroundDots) {
            // Move towards cursor
            if (mouseX !== null && mouseY !== null) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                this.vx += dx * 0.005;
                this.vy += dy * 0.005;
            }

            // Add some smooth movement
            this.vx *= 0.95;
            this.vy *= 0.95;
            
            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Keep within bounds
            this.x = Math.max(0, Math.min(w, this.x));
            this.y = Math.max(0, Math.min(h, this.y));

            // Update connections with background dots
            this.updateConnections(backgroundDots);
        }

        updateConnections(backgroundDots) {
            this.connections = [];
            const maxDistance = 120; // Increased connection distance

            // Sort background dots by distance
            const sortedDots = backgroundDots
                .map(dot => {
                    const dx = dot.x - this.x;
                    const dy = dot.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return { dot, distance };
                })
                .filter(({ distance }) => distance < maxDistance)
                .sort((a, b) => a.distance - b.distance);

            // Take the closest dots up to maxConnections
            for (let i = 0; i < Math.min(this.maxConnections, sortedDots.length); i++) {
                this.connections.push(sortedDots[i].dot);
            }
        }

        draw(mouseX, mouseY) {
            let opacity = this.baseOpacity;
            let glow = false;
            
            if (mouseX !== null && mouseY !== null) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < circleRadius) {
                    opacity = this.baseOpacity + (1 - this.baseOpacity) * (1 - distance / circleRadius);
                    glow = true;
                }
            }

            if (glow) {
                ctx.save();
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 10;
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${opacity})`;
            ctx.fill();
            
            if (glow) {
                ctx.restore();
            }

            // Draw multiple straight connections
            for (let connectedDot of this.connections) {
                const dx = connectedDot.x - this.x;
                const dy = connectedDot.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const opacity = 1 - (distance / 120); // Adjusted to match new maxDistance

                // Draw main connection line
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(connectedDot.x, connectedDot.y);
                ctx.stroke();

                // Add subtle glow
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.1})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(connectedDot.x, connectedDot.y);
                ctx.stroke();
            }
        }
    }

    // Create background dots
    const backgroundDots = Array(800).fill().map(() => new BackgroundDot());
    
    // Create spider dots
    const spiderDots = Array(5).fill().map(() => new SpiderDot());
    
    let mouseX = null;
    let mouseY = null;

    // Handle mouse movement
    document.addEventListener('pointermove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener('pointerleave', () => {
        mouseX = null;
        mouseY = null;
    });

    // Animation loop
    function drawCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function anim(t) {
        if (w !== window.innerWidth) w = canvas.width = window.innerWidth;
        if (h !== window.innerHeight) h = canvas.height = window.innerHeight;
        
        // Clear canvas with less trail effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        drawCircle(0, 0, w * 10);
        
        // Draw background dots
        backgroundDots.forEach(dot => dot.draw(mouseX, mouseY));
        
        // Update and draw spider dots
        spiderDots.forEach(dot => {
            dot.update(mouseX, mouseY, backgroundDots);
            dot.draw(mouseX, mouseY);
        });

        requestAnimationFrame(anim);
    }

    requestAnimationFrame(anim);

    const bgMusic = document.getElementById("bg-music");
    const navLinks = document.querySelectorAll("nav a");
    const yearSpan = document.getElementById("year");
    const musicControl = document.getElementById("music-control");
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");
    const nav = document.querySelector("nav");

    // Set current year
    yearSpan.textContent = new Date().getFullYear();

    // Initialize navigation
    nav.style.display = 'block';

    // Handle scroll behavior for navigation
    let lastScroll = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when scrolling down
        if (currentScroll > scrollThreshold) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Audio management
    const AudioManager = {
        sounds: {},
        bgMusic: null,
        currentVolume: 0.1,
        effectsVolume: 0.2,
    
        init() {
            try {
                this.bgMusic = document.getElementById("bg-music");
                if (!this.bgMusic) {
                    console.error("Background music element not found");
                    return;
                }
                this.bgMusic.volume = this.currentVolume;
                this.preloadSounds();
            } catch (error) {
                console.error("Error initializing audio:", error);
            }
        },
    
        preloadSounds() {
            const soundEffects = {
                select: 'audio/select.mp3'
            };
    
            for (const [key, path] of Object.entries(soundEffects)) {
                const audio = new Audio(path);
                audio.volume = this.effectsVolume;
                this.sounds[key] = audio;
            }
        },
    
        playSound(soundKey) {
            if (this.sounds[soundKey]) {
                const sound = this.sounds[soundKey].cloneNode();
                sound.volume = this.effectsVolume;
                sound.play().catch(error => console.error("Error playing sound:", error));
            }
        }
    };

    // Initialize audio
    AudioManager.init();

    // Music controls
    function fadeVolume(from, to, duration = 1000) {
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = (to - from) / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                return;
            }
            bgMusic.volume = from + (volumeStep * currentStep);
            currentStep++;
        }, stepTime);
    }

    function playMusic() {
        try {
            bgMusic.play()
                .then(() => {
                    fadeVolume(0, AudioManager.currentVolume);
                    playIcon.style.display = "none";
                    pauseIcon.style.display = "inline-block";
                })
                .catch(error => {
                    console.error("Error playing music:", error);
                    // Reset icons in case of error
                    playIcon.style.display = "inline-block";
                    pauseIcon.style.display = "none";
                });
        } catch (error) {
            console.error("Error in playMusic:", error);
        }
    }

    function pauseMusic() {
        try {
            fadeVolume(AudioManager.currentVolume, 0);
            setTimeout(() => {
                bgMusic.pause();
                pauseIcon.style.display = "none";
                playIcon.style.display = "inline-block";
            }, 1000);
        } catch (error) {
            console.error("Error in pauseMusic:", error);
        }
    }

    // Add click event listener to music control button
    if (musicControl) {
        musicControl.addEventListener("click", () => {
            if (bgMusic.paused) {
                playMusic();
            } else {
                pauseMusic();
            }
        });
    }

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            if (link.getAttribute('href').startsWith('#')) {
                event.preventDefault();
                AudioManager.playSound('select');
        
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const navHeight = nav.offsetHeight;
                    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                    const offset = window.innerWidth <= 480 ? 100 : navHeight + 40;
                    
                    window.scrollTo({
                        top: targetPosition - offset,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Smooth scroll for all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Section animations
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });

    // Side Navigation Scroll Behavior
    const sideNav = document.getElementById('side-nav');
    const header = document.querySelector('header');
    let headerHeight = header.offsetHeight;

    // Update header height on window resize
    window.addEventListener('resize', () => {
        headerHeight = header.offsetHeight;
    });

    // Handle scroll behavior
    window.addEventListener('scroll', () => {
        if (!sideNav) return;
        if (window.scrollY > headerHeight) {
            sideNav.classList.add('visible');
        } else {
            sideNav.classList.remove('visible');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('#main-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            const targetPosition = targetSection.offsetTop - 20; // 20px offset for better positioning

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
});
