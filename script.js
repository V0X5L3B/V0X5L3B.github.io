document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initAvatar();
    initViewCounter();
    initSkillBars();
    initGlitchEffect();
    initAudio();
    initSplashGrid();
    initMainGrid();
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

function initViewCounter() {
    const viewCountEl = document.getElementById('viewCount');
    if (!viewCountEl) return;

    let viewData = JSON.parse(localStorage.getItem('profileViewData') || '{"times":[],"count":0}');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    viewData.times = viewData.times.filter(t => now - t < oneDay);

    if (viewData.times.length < 2) {
        viewData.times.push(now);
        viewData.count = viewData.times.length;
        localStorage.setItem('profileViewData', JSON.stringify(viewData));
    }

    animateCounter(viewCountEl, viewData.count);
}

function animateCounter(element, target) {
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * eased);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
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

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 80;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 80;
    });

    function animate() {
        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;

        grid.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.1)`;
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

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 60;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 60;
    });

    function animate() {
        currentX += (mouseX - currentX) * 0.06;
        currentY += (mouseY - currentY) * 0.06;

        grid.style.transform = `translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(animate);
    }

    animate();
}
