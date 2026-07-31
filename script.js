document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initAvatar();
    initSkillBars();
    initGlitchEffect();
    initAudio();
    initSplashGrid();
    initMainGrid();
    initCardTilt();
    initCRTFlicker();
    initFooterTyping();
    initLeftColumnDots();
    initRandomGlitchLines();
    initScreenTears();
    initCubeGlitch();
    initTextScramble();
    initHexDataStream();
    initHolographicCard();
    initDiscordPulse();
    initBootSequence();
    initSplashCanvas();
    initViewsCounter();
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
        if (Math.random() > 0.85) {
            name.classList.add('name-glitch');
            setTimeout(() => name.classList.remove('name-glitch'), 150);
        }
    }, 2000);
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

    function loadTrack() {
        audioSource.src = 'audio/track1.mp3';
        audio.load();
    }
    loadTrack();
    audio.volume = 0.3;

    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume !== null) {
        audio.volume = parseFloat(savedVolume);
        volumeSlider.value = savedVolume;
        volumeLabel.textContent = Math.round(savedVolume * 100) + '%';
    }

    let isPlaying = false;
    audio.addEventListener('ended', () => {
        loadTrack();
        if (isPlaying) audio.play().catch(() => {});
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
            loadTrack();
            audio.play().then(() => {
                isPlaying = true;
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            }).catch(() => {});
        }
    };
}

function initSplash() {
    document.body.classList.remove('entered');
    const splash = document.getElementById('splashScreen');
    if (!splash) {
        document.body.classList.add('entered');
        return;
    }

    let dismissed = false;
    function dismiss() {
        if (dismissed) return;
        dismissed = true;
        splash.classList.add('hidden');
        if (window.startAudio) window.startAudio();
        setTimeout(() => {
            document.body.classList.add('entered');
        }, 1600);
        setTimeout(() => { splash.remove(); }, 2200);
    }

    splash.addEventListener('click', dismiss);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') dismiss();
    });
}

function initSplashGrid() {
    const grid = document.querySelector('.splash-grid-bg');
    if (!grid) return;
    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0, targetScale = 1.1, currentScale = 1.1;
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
    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0, targetScale = 1, currentScale = 1;
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

function initCardTilt() {
    const card = document.getElementById('profileCard');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -2;
        const rotateY = ((x - centerX) / centerX) * 2;
        card.style.setProperty('--tilt-x', `${rotateX}deg`);
        card.style.setProperty('--tilt-y', `${rotateY}deg`);
        card.classList.add('card-tilt-active');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('card-tilt-active');
    });
}

function initRandomGlitchLines() {
    setInterval(() => {
        if (Math.random() > 0.85) {
            const line = document.createElement('div');
            line.className = 'glitch-line';
            line.style.top = Math.random() * 100 + 'vh';
            line.style.height = (Math.random() * 3 + 1) + 'px';
            line.style.background = `linear-gradient(90deg, transparent ${Math.random() * 20}%, rgba(176, 176, 184, ${Math.random() * 0.15 + 0.05}) ${Math.random() * 30 + 30}%, transparent ${Math.random() * 30 + 70}%)`;
            line.classList.add('active');
            document.body.appendChild(line);
            setTimeout(() => line.remove(), 200);
        }
    }, 800);

    setInterval(() => {
        if (Math.random() > 0.9) {
            const elements = document.querySelectorAll('.skill-name, .category-title, .section-title');
            const el = elements[Math.floor(Math.random() * elements.length)];
            if (el) {
                el.classList.add('random-skew');
                setTimeout(() => { el.classList.remove('random-skew'); }, 300);
            }
        }
    }, 3000);

    setInterval(() => {
        if (Math.random() > 0.88) {
            const card = document.getElementById('profileCard');
            if (card) {
                // card.classList.add('card-glitch');
                // setTimeout(() => { card.classList.remove('card-glitch'); }, 150);
            }
        }
    }, 2500);
}

function initScreenTears() {
    setInterval(() => {
        if (Math.random() > 0.92) {
            const tear = document.createElement('div');
            tear.className = 'screen-tear';
            tear.style.top = Math.random() * 80 + 10 + 'vh';
            tear.style.height = (Math.random() * 8 + 2) + 'px';
            tear.classList.add('active');
            document.body.appendChild(tear);
            setTimeout(() => tear.remove(), 250);
        }
    }, 2000);
    setInterval(() => {
        if (Math.random() > 0.9) {
            document.body.style.filter = `hue-rotate(${Math.random() * 15}deg) brightness(${1 + Math.random() * 0.15})`;
            setTimeout(() => { document.body.style.filter = ''; }, 80);
        }
    }, 4000);
}

function initCRTFlicker() {
    setInterval(() => {
        if (Math.random() > 0.85) {
            const flicker = document.createElement('div');
            flicker.className = 'crt-flicker';
            document.body.appendChild(flicker);
            setTimeout(() => flicker.remove(), 150);
            if (Math.random() > 0.4) {
                setTimeout(() => {
                    const flicker2 = document.createElement('div');
                    flicker2.className = 'crt-flicker-2';
                    document.body.appendChild(flicker2);
                    setTimeout(() => flicker2.remove(), 200);
                }, 30);
            }
        }
    }, 1500);
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
            setTimeout(() => { cursor.style.display = 'none'; }, 2000);
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

function initLeftColumnDots() {
    const canvas = document.getElementById('leftDotCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const column = canvas.parentElement;
    function resize() {
        canvas.width = column.offsetWidth;
        canvas.height = column.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let mouseX = -9999, mouseY = -9999;
    column.addEventListener('mousemove', (e) => {
        const rect = column.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    column.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    const dots = [];
    const dotCount = 50;
    const fleeRadius = 80;
    const fleeForce = 2.5;
    for (let i = 0; i < dotCount; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseX: Math.random() * canvas.width,
            baseY: Math.random() * canvas.height,
            vx: 0, vy: 0,
            size: Math.random() * 2 + 0.8,
            alpha: Math.random() * 0.5 + 0.15,
            pulse: Math.random() * Math.PI * 2,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(dot => {
            dot.pulse += 0.02;
            const dx = dot.x - mouseX;
            const dy = dot.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < fleeRadius && dist > 0) {
                const force = (fleeRadius - dist) / fleeRadius;
                dot.vx += (dx / dist) * fleeForce * force;
                dot.vy += (dy / dist) * fleeForce * force;
            }
            dot.vx += (dot.baseX - dot.x) * 0.015;
            dot.vy += (dot.baseY - dot.y) * 0.015;
            dot.vx *= 0.9;
            dot.vy *= 0.9;
            dot.x += dot.vx;
            dot.y += dot.vy;

            const flicker = 0.6 + Math.sin(dot.pulse) * 0.4;
            const isFleeing = dist < fleeRadius;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
            if (isFleeing) {
                const intensity = 1 - dist / fleeRadius;
                ctx.fillStyle = `rgba(176, 176, 184, ${Math.min(dot.alpha * flicker + intensity * 0.5, 1)})`;
                ctx.shadowBlur = 12;
                ctx.shadowColor = `rgba(176, 176, 184, ${intensity * 0.7})`;
            } else {
                ctx.fillStyle = `rgba(176, 176, 184, ${dot.alpha * flicker * 0.5})`;
                ctx.shadowBlur = 4;
                ctx.shadowColor = `rgba(176, 176, 184, 0.2)`;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const ddx = dots[i].x - dots[j].x;
                const ddy = dots[i].y - dots[j].y;
                const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
                if (ddist < 80) {
                    const opacity = (1 - ddist / 80) * 0.12;
                    const mi1 = mouseX !== -9999 ? Math.sqrt((dots[i].x - mouseX) ** 2 + (dots[i].y - mouseY) ** 2) < fleeRadius : false;
                    const mi2 = mouseX !== -9999 ? Math.sqrt((dots[j].x - mouseX) ** 2 + (dots[j].y - mouseY) ** 2) < fleeRadius : false;
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    if (mi1 || mi2) {
                        ctx.strokeStyle = `rgba(176, 176, 184, ${opacity * 3})`;
                        ctx.lineWidth = 0.8;
                    } else {
                        ctx.strokeStyle = `rgba(176, 176, 184, ${opacity})`;
                        ctx.lineWidth = 0.4;
                    }
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

function initCubeGlitch() {
    const cube = document.querySelector('.cube');
    const container = document.querySelector('.cube-container');
    const glow = document.querySelector('.cube-glow');
    const shadow = document.querySelector('.cube-glitch-shadow');
    if (!cube) return;

    setInterval(() => {
        if (Math.random() > 0.5) {
            const duration = 50 + Math.random() * 250;
            const glitchType = Math.floor(Math.random() * 7);
            switch (glitchType) {
                case 0: cube.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(${1.5 + Math.random() * 1.5})`; break;
                case 1: cube.style.filter = `saturate(${3 + Math.random() * 8}) contrast(${1.5 + Math.random() * 1.5})`; break;
                case 2: cube.style.filter = `invert(${0.1 + Math.random() * 0.3}) brightness(2.5)`; break;
                case 3: cube.style.filter = `blur(${1 + Math.random() * 3}px) brightness(2)`; break;
                case 4: cube.style.filter = `hue-rotate(90deg) saturate(6) brightness(2)`; break;
                case 5: cube.style.filter = `brightness(4) contrast(3) saturate(0)`; break;
                case 6: cube.style.filter = `hue-rotate(270deg) saturate(10) brightness(3)`; break;
            }
            cube.style.transformOrigin = 'center center';
            if (glow) {
                glow.style.background = `radial-gradient(circle, rgba(176, 176, 184, ${0.3 + Math.random() * 0.5}) 0%, transparent 70%)`;
                glow.style.transform = `translate(-50%, -50%) scale(${1.5 + Math.random() * 1.2})`;
            }
            if (shadow) {
                shadow.style.opacity = 0.8;
                shadow.style.transform = `translateX(${(Math.random() - 0.5) * 40}px) translateY(${(Math.random() - 0.5) * 30}px) skewX(${(Math.random() - 0.5) * 20}deg)`;
            }
            if (container) {
                container.style.filter = `drop-shadow(${(Math.random() - 0.5) * 15}px ${(Math.random() - 0.5) * 10}px 10px rgba(176, 176, 184, 0.5))`;
            }
            setTimeout(() => {
                cube.style.filter = '';
                if (glow) { glow.style.background = ''; glow.style.transform = ''; }
                if (shadow) { shadow.style.opacity = ''; shadow.style.transform = ''; }
                if (container) { container.style.filter = ''; }
            }, duration);
        }
    }, 800);

    setInterval(() => {
        if (Math.random() > 0.6) {
            const faces = cube.querySelectorAll('.cube-face');
            const count = 1 + Math.floor(Math.random() * 3);
            for (let n = 0; n < count; n++) {
                const randomFace = faces[Math.floor(Math.random() * faces.length)];
                if (randomFace) {
                    randomFace.style.background = `rgba(176, 176, 184, ${0.2 + Math.random() * 0.5})`;
                    randomFace.style.borderColor = `rgba(176, 176, 184, ${0.6 + Math.random() * 0.4})`;
                    randomFace.style.boxShadow = `inset 0 0 ${20 + Math.random() * 40}px rgba(176, 176, 184, ${0.1 + Math.random() * 0.3})`;
                }
            }
            setTimeout(() => {
                faces.forEach(f => { f.style.background = ''; f.style.borderColor = ''; f.style.boxShadow = ''; });
            }, 60 + Math.random() * 100);
        }
    }, 1200);

    setInterval(() => {
        if (Math.random() > 0.7 && container) {
            container.style.transform = `translateX(${(Math.random() - 0.5) * 20}px) translateY(${(Math.random() - 0.5) * 16}px) skewX(${(Math.random() - 0.5) * 6}deg)`;
            setTimeout(() => { container.style.transform = ''; }, 40 + Math.random() * 60);
        }
    }, 1500);

    setInterval(() => {
        if (Math.random() > 0.75) {
            cube.style.opacity = 0.3 + Math.random() * 0.7;
            setTimeout(() => { cube.style.opacity = ''; }, 50 + Math.random() * 80);
        }
    }, 2000);
}

function initTextScramble() {
    const chars = '!<>-_\\/[]{}—=+*^?#_abcdef0123456789';
    const nameEl = document.querySelector('.name');
    const splashName = document.querySelector('.splash-title');

    function scramble(el, finalText, duration) {
        if (!el) return;
        const length = finalText.length;
        let frame = 0;
        const totalFrames = Math.floor(duration / 30);
        function update() {
            let output = '';
            const progress = frame / totalFrames;
            const charsToReveal = Math.floor(progress * length);
            for (let i = 0; i < length; i++) {
                if (i < charsToReveal) {
                    output += finalText[i];
                } else {
                    output += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            el.textContent = output;
            frame++;
            if (frame <= totalFrames) {
                requestAnimationFrame(() => setTimeout(update, 30));
            } else {
                el.textContent = finalText;
            }
        }
        update();
    }

    if (splashName) {
        setTimeout(() => scramble(splashName, 'V0X5L.3B', 2000), 2800);
    }

    const nameObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scramble(nameEl, 'V0X5L.3B', 1000);
                nameObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    if (nameEl) nameObserver.observe(nameEl);

    const taglineEl = document.querySelector('.tagline');
    if (taglineEl) {
        const tagObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scramble(taglineEl, 'modder // developer', 800);
                    tagObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        tagObserver.observe(taglineEl);
    }
}

function initHexDataStream() {
    const container = document.querySelector('.left-column');
    if (!container) return;
    const hexChars = '0123456789ABCDEF';
    const binChars = '01';
    const stream = document.createElement('div');
    stream.className = 'hex-stream';
    stream.setAttribute('aria-hidden', 'true');
    container.appendChild(stream);

    const columns = 12;
    const lines = 40;
    for (let c = 0; c < columns; c++) {
        const col = document.createElement('div');
        col.className = 'hex-col';
        col.style.left = (c / columns * 100) + '%';
        col.style.animationDuration = (8 + Math.random() * 12) + 's';
        col.style.animationDelay = (Math.random() * 5) + 's';
        let colText = '';
        for (let l = 0; l < lines; l++) {
            if (Math.random() > 0.6) {
                let hexWord = '';
                for (let h = 0; h < 4; h++) hexWord += hexChars[Math.floor(Math.random() * hexChars.length)];
                colText += `<div class="hex-line">${hexWord}</div>`;
            } else if (Math.random() > 0.4) {
                let binWord = '';
                for (let b = 0; b < 8; b++) binWord += binChars[Math.floor(Math.random() * binChars.length)];
                colText += `<div class="hex-line bin">${binWord}</div>`;
            } else {
                const symbols = ['░', '▒', '▓', '█', '▄', '▀', '◆', '◇', '▪', '▫'];
                let symWord = '';
                for (let s = 0; s < 2; s++) symWord += symbols[Math.floor(Math.random() * symbols.length)];
                colText += `<div class="hex-line sym">${symWord}</div>`;
            }
        }
        col.innerHTML = colText;
        stream.appendChild(col);
    }

    setInterval(() => {
        const allCols = stream.querySelectorAll('.hex-col');
        allCols.forEach(col => {
            if (Math.random() > 0.7) {
                const lines = col.querySelectorAll('.hex-line');
                const target = lines[Math.floor(Math.random() * lines.length)];
                if (target) {
                    const isHex = Math.random() > 0.5;
                    let newText = '';
                    const len = isHex ? 4 : 8;
                    const charSet = isHex ? hexChars : binChars;
                    for (let i = 0; i < len; i++) newText += charSet[Math.floor(Math.random() * charSet.length)];
                    target.textContent = newText;
                    target.style.color = `rgba(176, 176, 184, ${0.15 + Math.random() * 0.35})`;
                    target.style.textShadow = `0 0 ${3 + Math.random() * 6}px rgba(176, 176, 184, ${0.2 + Math.random() * 0.3})`;
                    setTimeout(() => { target.style.color = ''; target.style.textShadow = ''; }, 200 + Math.random() * 400);
                }
            }
        });
    }, 150);
}

function initHolographicCard() {}

function initDiscordPulse() {
    const discordBtn = document.querySelector('.social-btn.discord');
    if (!discordBtn) return;
    const label = discordBtn.querySelector('.social-label');
    if (label) {
        const originalText = label.textContent;
        const glitchTexts = ['D1sc0rd', 'Disc0rd', 'Discord', 'd!scord', 'D1sord'];
        let glitchInterval;
        discordBtn.addEventListener('mouseenter', () => {
            let count = 0;
            glitchInterval = setInterval(() => {
                label.textContent = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
                count++;
                if (count > 6) { clearInterval(glitchInterval); label.textContent = originalText; }
            }, 50);
        });
        discordBtn.addEventListener('mouseleave', () => {
            if (glitchInterval) clearInterval(glitchInterval);
            label.textContent = originalText;
        });
    }
}

function initViewsCounter() {
    const countEl = document.getElementById('viewsCount');
    if (!countEl) return;

    const NAMESPACE = 'v0x5l3b';
    const KEY = 'views';
    const STORAGE_KEY = 'v0x5l3b_has_visited';
    const LOCAL_KEY = 'v0x5l3b_local_views';
    const API_URL = 'https://api.countapi.xyz';

    // Sync local count with API on load
    async function syncLocalToApi() {
        const localCount = parseInt(localStorage.getItem(LOCAL_KEY) || '0', 10);
        if (localCount > 0) {
            try {
                const res = await fetch(`${API_URL}/set/${NAMESPACE}/${KEY}?value=${localCount}`);
                if (res.ok) {
                    localStorage.removeItem(LOCAL_KEY);
                }
            } catch {
                // Ignore sync errors
            }
        }
    }

    async function updateCount() {
        const hasVisited = localStorage.getItem(STORAGE_KEY);
        const isNewVisit = !hasVisited;
        const method = hasVisited ? 'get' : 'hit';
        const url = `${API_URL}/${method}/${NAMESPACE}/${KEY}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            countEl.textContent = data.value.toLocaleString();
            if (isNewVisit) localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // Fallback: localStorage-only persistent counter
            let localCount = parseInt(localStorage.getItem(LOCAL_KEY) || '0', 10);
            if (isNewVisit) {
                localCount++;
                localStorage.setItem(STORAGE_KEY, '1');
                localStorage.setItem(LOCAL_KEY, localCount.toString());
            }
            countEl.textContent = localCount.toLocaleString();
        }
    }

    // Try to sync any stale local counts to API
    syncLocalToApi();
    updateCount();
}

function initBootSequence() {
    const bootLines = document.querySelectorAll('.boot-line');
    bootLines.forEach((line) => {
        const delay = parseInt(line.getAttribute('data-delay')) || 0;
        setTimeout(() => {
            line.classList.add('visible');
        }, delay + 200);
    });
}

function initSplashCanvas() {
    const canvas = document.getElementById('splashCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const lines = [];
    const hexChars = '0123456789ABCDEF';

    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.3 + 0.05,
        });
    }

    for (let i = 0; i < 8; i++) {
        lines.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 150 + 50,
            speed: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.15 + 0.02,
        });
    }

    let frame = 0;
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
            ctx.fillStyle = `rgba(176, 176, 184, ${p.alpha})`;
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
                    ctx.strokeStyle = `rgba(176, 176, 184, ${(1 - dist / 120) * 0.06})`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        }

        lines.forEach(l => {
            l.y += l.speed;
            if (l.y > canvas.height + 200) {
                l.y = -200;
                l.x = Math.random() * canvas.width;
            }

            const charSize = 9;
            const charCount = Math.floor(l.length / charSize);
            for (let c = 0; c < charCount; c++) {
                const charY = l.y - c * charSize;
                if (charY < 0 || charY > canvas.height) continue;
                const charAlpha = l.alpha * (1 - c / charCount);
                const char = hexChars[Math.floor(Math.random() * hexChars.length)];
                ctx.font = '8px JetBrains Mono';
                ctx.fillStyle = `rgba(176, 176, 184, ${charAlpha})`;
                ctx.fillText(char, l.x, charY);
            }
        });

        if (frame % 10 === 0) {
            const glitchCount = Math.floor(Math.random() * 3);
            for (let g = 0; g < glitchCount; g++) {
                const gy = Math.random() * canvas.height;
                const gw = Math.random() * 200 + 50;
                const gx = Math.random() * canvas.width;
                ctx.fillStyle = `rgba(176, 176, 184, ${Math.random() * 0.03})`;
                ctx.fillRect(gx, gy, gw, 1);
            }
        }

        frame++;
        requestAnimationFrame(draw);
    }

    draw();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
