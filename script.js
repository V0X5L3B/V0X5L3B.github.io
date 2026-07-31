document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initAvatar();
    initSkillBars();
    initGlitchEffect();
    initAudio();
    initSplashGrid();
    initMainGrid();
    initMatrixRain();
    initSplashMatrix();
    initCardTilt();
    initCRTFlicker();
    initFooterTyping();
    initKeyboardGlitch();
    initInteractiveDots();
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
    const audioSource = document.getElementById('audioSource');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeLabel = document.getElementById('volumeLabel');

    if (!audio || !playPauseBtn) return;

    const tracks = ['audio/track1.mp3', 'audio/track3.mp3'];
    let currentTrack = 0;

    function pickRandomTrack() {
        let next = Math.floor(Math.random() * tracks.length);
        if (next === currentTrack && tracks.length > 1) {
            next = (next + 1) % tracks.length;
        }
        currentTrack = next;
        audioSource.src = tracks[currentTrack];
        audio.load();
    }

    pickRandomTrack();

    audio.volume = 0.3;

    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume !== null) {
        audio.volume = parseFloat(savedVolume);
        volumeSlider.value = savedVolume;
        volumeLabel.textContent = Math.round(savedVolume * 100) + '%';
    }

    let isPlaying = false;

    audio.addEventListener('ended', () => {
        pickRandomTrack();
        if (isPlaying) {
            audio.play().catch(() => {});
        }
    });

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
            pickRandomTrack();
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

function initMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 12, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#b0b0b8';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        requestAnimationFrame(draw);
    }

    draw();
}

function initSplashMatrix() {
    const canvas = document.getElementById('splashMatrix');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = 'V0X5L3Bアイウエオカキクケコ0123456789';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 12, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#b0b0b8';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
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
            tracker.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(176, 176, 184, 0.08) 0%, transparent 60%)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        if (tracker) {
            tracker.style.background = 'none';
        }
    });
}

function initKeyboardGlitch() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'g' || e.key === 'G') {
            triggerMegaGlitch();
        }
    });
}

function triggerMegaGlitch() {
    const card = document.getElementById('profileCard');
    if (!card) return;

    card.style.animation = 'none';
    card.offsetHeight;
    card.style.filter = 'hue-rotate(90deg) saturate(2) brightness(1.3)';
    card.style.transform = `skewX(${(Math.random() - 0.5) * 5}deg)`;

    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const flicker = document.createElement('div');
            flicker.className = Math.random() > 0.5 ? 'crt-flicker' : 'crt-flicker-2';
            document.body.appendChild(flicker);
            setTimeout(() => flicker.remove(), 150);
        }, i * 50);
    }

    document.querySelectorAll('.skill-fill').forEach(fill => {
        const original = fill.style.width;
        fill.style.transition = 'none';
        fill.style.width = Math.random() * 100 + '%';
        setTimeout(() => {
            fill.style.transition = 'width 0.3s ease';
            fill.style.width = original;
        }, 200);
    });

    document.querySelectorAll('.name, .tagline, .section-title, .footer-text').forEach(el => {
        el.style.textShadow = `0 0 20px rgba(176, 176, 184, 0.8), ${(Math.random()-0.5)*10}px ${(Math.random()-0.5)*5}px 0 rgba(255, 107, 53, 0.5)`;
        setTimeout(() => {
            el.style.textShadow = '';
        }, 300);
    });

    setTimeout(() => {
        card.style.filter = '';
        card.style.transform = '';
    }, 400);
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

function initInteractiveDots() {
    const canvas = document.getElementById('dotCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let mouseX = -9999;
    let mouseY = -9999;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    const dots = [];
    const dotCount = 120;
    const fleeRadius = 150;
    const fleeForce = 3;

    for (let i = 0; i < dotCount; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseX: Math.random() * canvas.width,
            baseY: Math.random() * canvas.height,
            vx: 0,
            vy: 0,
            size: Math.random() * 2.5 + 1,
            alpha: Math.random() * 0.6 + 0.2,
            pulse: Math.random() * Math.PI * 2,
            hue: Math.random() > 0.85 ? 160 : 140,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dots.forEach(dot => {
            dot.pulse += 0.015;

            const dx = dot.x - mouseX;
            const dy = dot.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < fleeRadius && dist > 0) {
                const force = (fleeRadius - dist) / fleeRadius;
                dot.vx += (dx / dist) * fleeForce * force;
                dot.vy += (dy / dist) * fleeForce * force;
            }

            dot.vx += (dot.baseX - dot.x) * 0.01;
            dot.vy += (dot.baseY - dot.y) * 0.01;

            dot.vx *= 0.92;
            dot.vy *= 0.92;

            dot.x += dot.vx;
            dot.y += dot.vy;

            const flicker = 0.7 + Math.sin(dot.pulse) * 0.3;
            const isFleeing = dist < fleeRadius;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);

            if (isFleeing) {
                const intensity = 1 - dist / fleeRadius;
                ctx.fillStyle = `rgba(176, 176, 184, ${Math.min(dot.alpha * flicker + intensity * 0.5, 1)})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = `rgba(176, 176, 184, ${intensity * 0.8})`;
            } else {
                ctx.fillStyle = `rgba(176, 176, 184, ${dot.alpha * flicker * 0.6})`;
                ctx.shadowBlur = 5;
                ctx.shadowColor = `rgba(176, 176, 184, 0.3)`;
            }

            ctx.fill();
            ctx.shadowBlur = 0;
        });

        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const ddx = dots[i].x - dots[j].x;
                const ddy = dots[i].y - dots[j].y;
                const ddist = Math.sqrt(ddx * ddx + ddy * ddy);

                if (ddist < 100) {
                    const opacity = (1 - ddist / 100) * 0.15;

                    const mi1 = mouseX !== -9999 ? Math.sqrt((dots[i].x - mouseX) ** 2 + (dots[i].y - mouseY) ** 2) < fleeRadius : false;
                    const mi2 = mouseX !== -9999 ? Math.sqrt((dots[j].x - mouseX) ** 2 + (dots[j].y - mouseY) ** 2) < fleeRadius : false;

                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);

                    if (mi1 || mi2) {
                        ctx.strokeStyle = `rgba(176, 176, 184, ${opacity * 3})`;
                        ctx.lineWidth = 1;
                    } else {
                        ctx.strokeStyle = `rgba(176, 176, 184, ${opacity})`;
                        ctx.lineWidth = 0.5;
                    }

                    ctx.stroke();
                }
            }
        }

        if (mouseX !== -9999) {
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(176, 176, 184, 0.4)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(mouseX, mouseY, fleeRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(176, 176, 184, 0.05)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }

    draw();
}
