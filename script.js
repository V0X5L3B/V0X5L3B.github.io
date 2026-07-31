document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initAvatar();
    initSkillBars();
    initGlitchEffect();
    initAudio();
    initSplashGrid();
    initMainGrid();
    initParticles();
    initSplashParticles();
    initCardTilt();
    initMouseGlow();
    initCRTFlicker();
    initFooterTyping();
});

function initAvatar() {
    const avatar = document.getElementById('avatar');
    const placeholder = document.getElementById('avatarPlaceholder');

    if (avatar) {
        avatar.onerror = () => {
            avatar.style.display = 'none';
            placeholder.classList.add('visible');
        };

        avatar.onload = () => {
            placeholder.classList.remove('visible');
        };
    }
}

function initSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const percent = fill.getAttribute('data-percent');
                setTimeout(() => {
                    fill.style.width = percent + '%';
                }, 200);
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.5 });

    skillFills.forEach(fill => observer.observe(fill));
}

function initGlitchEffect() {
    const name = document.querySelector('.name');
    if (!name) return;

    setInterval(() => {
        if (Math.random() > 0.95) {
            name.style.animation = 'none';
            name.offsetHeight;
            name.style.animation = null;
        }
    }, 3000);
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: var(--accent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: particle-fade 0.8s forwards;
    `;
    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 50;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;

    particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
    }).onfinish = () => particle.remove();
}

document.addEventListener('click', (e) => {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createParticle(e.clientX, e.clientY), i * 50);
    }
});

function initAudio() {
    const audio = document.getElementById('bgMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeLabel = document.getElementById('volumeLabel');

    if (!audio || !playPauseBtn) return;

    audio.volume = 0.3;

    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume !== null) {
        audio.volume = parseFloat(savedVolume);
        volumeSlider.value = savedVolume;
        volumeLabel.textContent = Math.round(savedVolume * 100) + '%';
    }

    let isPlaying = false;

    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            audio.play().catch(() => {});
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
        isPlaying = !isPlaying;
    });

    volumeSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const vol = parseFloat(e.target.value);
        audio.volume = vol;
        volumeLabel.textContent = Math.round(vol * 100) + '%';
        localStorage.setItem('audioVolume', vol.toString());
    });

    window.startAudio = () => {
        if (!isPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            }).catch(() => {});
        }
    };
}

function initSplash() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;

    splash.addEventListener('click', () => {
        splash.classList.add('hidden');
        if (window.startAudio) window.startAudio();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            splash.classList.add('hidden');
            if (window.startAudio) window.startAudio();
        }
    });
}

function initSplashGrid() {
    const grid = document.querySelector('.splash-bg-grid');
    if (!grid) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScale = 1.1;
    let currentScale = 1.1;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 120;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 120;
        targetScale = 1.1 + Math.abs(e.clientX - window.innerWidth/2) / window.innerWidth * 0.1;
    });

    function animate() {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        currentScale += (targetScale - currentScale) * 0.05;

        grid.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
        requestAnimationFrame(animate);
    }

    animate();
}

function initMainGrid() {
    const grid = document.getElementById('mainGrid');
    if (!grid) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScale = 1;
    let currentScale = 1;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 100;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 100;
        targetScale = 1 + Math.abs(e.clientX - window.innerWidth/2) / window.innerWidth * 0.15;
    });

    function animate() {
        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;
        currentScale += (targetScale - currentScale) * 0.04;

        grid.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
        requestAnimationFrame(animate);
    }

    animate();
}

function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.4 + 0.1,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 136, ${p.alpha})`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
}

function initSplashParticles() {
    const canvas = document.getElementById('splashParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.02;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            const flicker = 0.5 + Math.sin(p.pulse) * 0.5;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 136, ${p.alpha * flicker})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 136, ${p.alpha * flicker * 0.15})`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.08 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
}

function initCardTilt() {
    const card = document.getElementById('profileCard');
    if (!card) return;

    const tracker = document.getElementById('cardGlowTracker');

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -2;
        const rotateY = ((x - centerX) / centerX) * 2;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        if (tracker) {
            tracker.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 255, 136, 0.08) 0%, transparent 60%)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        if (tracker) {
            tracker.style.background = 'none';
        }
    });
}

function initMouseGlow() {
    const glow = document.getElementById('mouseGlow');
    if (!glow) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function animate() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(animate);
    }

    animate();
}

function initCRTFlicker() {
    setInterval(() => {
        if (Math.random() > 0.92) {
            const flicker = document.createElement('div');
            flicker.className = 'crt-flicker';
            document.body.appendChild(flicker);
            setTimeout(() => flicker.remove(), 150);

            if (Math.random() > 0.5) {
                setTimeout(() => {
                    const flicker2 = document.createElement('div');
                    flicker2.className = 'crt-flicker-2';
                    document.body.appendChild(flicker2);
                    setTimeout(() => flicker2.remove(), 200);
                }, 50);
            }
        }
    }, 2000);
}

function initFooterTyping() {
    const footerText = document.querySelector('.footer-text');
    if (!footerText) return;

    const text = '> built with caffeine and bad decisions';
    footerText.innerHTML = '';

    const span = document.createElement('span');
    span.className = 'footer-type';
    footerText.appendChild(span);

    const cursor = document.createElement('span');
    cursor.className = 'footer-cursor';
    footerText.appendChild(cursor);

    let i = 0;
    function type() {
        if (i < text.length) {
            span.textContent += text.charAt(i);
            i++;
            setTimeout(type, 40 + Math.random() * 30);
        } else {
            setTimeout(() => {
                cursor.style.display = 'none';
            }, 2000);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(type, 800);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(footerText);
}
