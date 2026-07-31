document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initAvatar();
    initTypewriter();
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

function initTypewriter() {
    const el = document.getElementById('aboutText');
    if (!el) return;

    const text = "Modder and developer who mostly lives in Frida scripts, IL2CPP dumps, and whatever game I've broken this week. I build mod menus, tear them apart, and rebuild them better (or at least try to). I spend a lot of time experimenting with hooks, patches, and random ideas that usually start as 'what if…' and end in a working exploit or something actually useful. Debugging is basically part of the hobby at this point. I like understanding how things work under the hood — APIs, anti-cheat, game logic, all of it. Outside of modding, I'm usually still thinking about code, or gaming, or tweaking projects that probably didn't need more tweaking. Just building, breaking, and shipping things when they're ready.";
    const cursor = el.querySelector('.typewriter-cursor');
    let i = 0;

    function type() {
        if (i < text.length) {
            el.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
            setTimeout(type, 25 + Math.random() * 15);
        }
    }

    type();
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
