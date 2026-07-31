document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initAvatar();
    initSkillBars();
    initGlitchEffect();
    initAudio();
    initSplashGrid();
    initMainGrid();
    initTerrain();
    initCardTilt();
    initCRTFlicker();
    initFooterTyping();
    initLeftColumnDots();
    initRandomGlitchLines();
    initScreenTears();
    initCubeGlitch();
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
            name.style.animation = 'none';
            name.offsetHeight;
            name.style.animation = null;
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

    const tracks = ['audio/track3.mp3'];

    function pickRandomTrack() {
        audioSource.src = tracks[0];
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

function initTerrain() {
    const canvas = document.getElementById('terrainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let time = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const gridSize = 30;
    const rows = Math.ceil(canvas.height / gridSize) + 4;
    const cols = Math.ceil(canvas.width / gridSize) + 4;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 0.008;

        const offsetX = (canvas.width - cols * gridSize) / 2;
        const offsetY = (canvas.height - rows * gridSize) / 2;

        const mouseGridX = mouseX / gridSize;
        const mouseGridY = mouseY / gridSize;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const wx = x * gridSize + offsetX;
                const wy = y * gridSize + offsetY;

                const dx = x - mouseGridX;
                const dy = y - mouseGridY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const wave1 = Math.sin(x * 0.3 + time * 2) * 8;
                const wave2 = Math.cos(y * 0.25 + time * 1.5) * 6;
                const wave3 = Math.sin((x + y) * 0.2 + time) * 4;
                const mouseWave = dist < 8 ? Math.sin(dist * 0.8 - time * 4) * (8 - dist) * 2 : 0;

                const elevation = wave1 + wave2 + wave3 + mouseWave;
                const px = wx;
                const py = wy + elevation;

                const brightness = 0.3 + (elevation + 18) / 36 * 0.7;
                const alpha = 0.15 + (dist < 10 ? (10 - dist) / 10 * 0.4 : 0);

                ctx.fillStyle = `rgba(176, 176, 184, ${alpha * brightness})`;
                ctx.fillRect(px - 1, py - 1, 2, 2);

                if (x < cols - 1) {
                    const nx = (x + 1) * gridSize + offsetX;
                    const nWave1 = Math.sin((x + 1) * 0.3 + time * 2) * 8;
                    const nWave2 = Math.cos(y * 0.25 + time * 1.5) * 6;
                    const nWave3 = Math.sin((x + 1 + y) * 0.2 + time) * 4;
                    const nDist = Math.sqrt((x + 1 - mouseGridX) ** 2 + dy ** 2);
                    const nMouseWave = nDist < 8 ? Math.sin(nDist * 0.8 - time * 4) * (8 - nDist) * 2 : 0;
                    const nElevation = nWave1 + nWave2 + nWave3 + nMouseWave;
                    const npx = nx;
                    const npy = wy + nElevation;

                    const lineAlpha = alpha * 0.4 * Math.min(brightness, (0.3 + (nElevation + 18) / 36 * 0.7));
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(npx, npy);
                    ctx.strokeStyle = `rgba(176, 176, 184, ${lineAlpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }

                if (y < rows - 1) {
                    const bx = x * gridSize + offsetX;
                    const bWave1 = Math.sin(x * 0.3 + time * 2) * 8;
                    const bWave2 = Math.cos((y + 1) * 0.25 + time * 1.5) * 6;
                    const bWave3 = Math.sin((x + y + 1) * 0.2 + time) * 4;
                    const bDist = Math.sqrt(dx ** 2 + (y + 1 - mouseGridY) ** 2);
                    const bMouseWave = bDist < 8 ? Math.sin(bDist * 0.8 - time * 4) * (8 - bDist) * 2 : 0;
                    const bElevation = bWave1 + bWave2 + bWave3 + bMouseWave;
                    const bpx = bx;
                    const bpy = wy + gridSize + bElevation;

                    const lineAlpha = alpha * 0.4 * Math.min(brightness, (0.3 + (bElevation + 18) / 36 * 0.7));
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(bpx, bpy);
                    ctx.strokeStyle = `rgba(176, 176, 184, ${lineAlpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        for (let i = 0; i < 3; i++) {
            const sparkleX = (Math.sin(time * 3.7 + i * 2.1) * 0.5 + 0.5) * canvas.width;
            const sparkleY = (Math.cos(time * 2.3 + i * 1.7) * 0.5 + 0.5) * canvas.height;
            const sparkleAlpha = Math.sin(time * 5 + i) * 0.3 + 0.3;

            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(176, 176, 184, ${sparkleAlpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(176, 176, 184, ${sparkleAlpha * 0.5})`;
            ctx.fill();
            ctx.shadowBlur = 0;
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
            const elements = document.querySelectorAll('.name, .tagline, .skill-name, .category-title, .section-title');
            const el = elements[Math.floor(Math.random() * elements.length)];
            if (el) {
                el.style.animation = 'random-skew 0.3s step-end';
                setTimeout(() => { el.style.animation = ''; }, 300);
            }
        }
    }, 3000);

    setInterval(() => {
        if (Math.random() > 0.88) {
            const card = document.getElementById('profileCard');
            if (card) {
                card.style.transform = `perspective(1000px) translateX(${(Math.random() - 0.5) * 6}px) translateY(${(Math.random() - 0.5) * 3}px) skewX(${(Math.random() - 0.5) * 1.5}deg)`;
                setTimeout(() => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                }, 150);
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
            setTimeout(() => {
                document.body.style.filter = '';
            }, 80);
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

    let mouseX = -9999;
    let mouseY = -9999;

    column.addEventListener('mousemove', (e) => {
        const rect = column.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    column.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });

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
            vx: 0,
            vy: 0,
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
        if (Math.random() > 0.7) {
            const duration = 100 + Math.random() * 200;
            const glitchType = Math.floor(Math.random() * 5);

            switch (glitchType) {
                case 0:
                    cube.style.filter = `hue-rotate(${Math.random() * 180}deg) brightness(${1.5 + Math.random()})`;
                    break;
                case 1:
                    cube.style.filter = `saturate(${3 + Math.random() * 5}) contrast(${1.5 + Math.random()})`;
                    break;
                case 2:
                    cube.style.filter = `invert(${0.1 + Math.random() * 0.2}) brightness(2)`;
                    break;
                case 3:
                    cube.style.filter = `blur(${1 + Math.random() * 2}px) brightness(2)`;
                    break;
                case 4:
                    cube.style.filter = `hue-rotate(90deg) saturate(4) brightness(1.8)`;
                    break;
            }

            if (glow) {
                glow.style.background = `radial-gradient(circle, rgba(176, 176, 184, ${0.2 + Math.random() * 0.3}) 0%, transparent 70%)`;
                glow.style.transform = `translate(-50%, -50%) scale(${1.5 + Math.random() * 0.8})`;
            }

            if (shadow) {
                shadow.style.opacity = 0.6;
                shadow.style.transform = `translateX(${(Math.random() - 0.5) * 20}px) translateY(${(Math.random() - 0.5) * 15}px)`;
            }

            if (container) {
                container.style.filter = `drop-shadow(${(Math.random() - 0.5) * 8}px ${(Math.random() - 0.5) * 5}px 6px rgba(176, 176, 184, 0.3))`;
            }

            setTimeout(() => {
                cube.style.filter = '';
                if (glow) {
                    glow.style.background = '';
                    glow.style.transform = '';
                }
                if (shadow) {
                    shadow.style.opacity = '';
                    shadow.style.transform = '';
                }
                if (container) {
                    container.style.filter = '';
                }
            }, duration);
        }
    }, 1500);

    setInterval(() => {
        if (Math.random() > 0.8) {
            const faces = cube.querySelectorAll('.cube-face');
            const randomFace = faces[Math.floor(Math.random() * faces.length)];
            if (randomFace) {
                randomFace.style.background = `rgba(176, 176, 184, ${0.2 + Math.random() * 0.3})`;
                randomFace.style.borderColor = `rgba(176, 176, 184, ${0.6 + Math.random() * 0.4})`;
                randomFace.style.boxShadow = `inset 0 0 ${20 + Math.random() * 30}px rgba(176, 176, 184, ${0.1 + Math.random() * 0.2})`;
                setTimeout(() => {
                    randomFace.style.background = '';
                    randomFace.style.borderColor = '';
                    randomFace.style.boxShadow = '';
                }, 80 + Math.random() * 120);
            }
        }
    }, 2000);

    setInterval(() => {
        if (Math.random() > 0.85 && container) {
            container.style.transform = `translateX(${(Math.random() - 0.5) * 10}px) translateY(${(Math.random() - 0.5) * 8}px)`;
            setTimeout(() => {
                container.style.transform = '';
            }, 60);
        }
    }, 3000);
}
