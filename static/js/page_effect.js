document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => { document.body.classList.add('fade-in'); }, 50);
    
    const backBtn = document.getElementById('back-to-home');
    if(backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '/index.html'; 
        });
    }

    // -------------------------------------------------------
    // [커스텀 커서 및 리플 효과 시스템 자동 주입 (최적화 버전)]
    // -------------------------------------------------------
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // 프리렌더링 캔버스 (projects.html 최적화 로직 통합)
    const dotCanvasBlack = document.createElement('canvas');
    dotCanvasBlack.width = 24; dotCanvasBlack.height = 24;
    const ctxB = dotCanvasBlack.getContext('2d');
    ctxB.fillStyle = '#111111';
    ctxB.beginPath(); ctxB.arc(12, 12, 12, 0, Math.PI * 2); ctxB.fill();
    
    const dotCanvasWhite = document.createElement('canvas');
    dotCanvasWhite.width = 24; dotCanvasWhite.height = 24;
    const ctxW = dotCanvasWhite.getContext('2d');
    ctxW.fillStyle = '#ffffff';
    ctxW.beginPath(); ctxW.arc(12, 12, 12, 0, Math.PI * 2); ctxW.fill();

    // 현재 페이지 배경색을 자동 감지하여 모드 설정 (전체 페이지 호환)
    let cursorColorMode = 'black'; 
    const checkTheme = () => {
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim().toLowerCase();
        if (bgColor === '#000000' || bgColor === '#000') {
            cursorColorMode = 'white';
        }
    };
    checkTheme();

    const PT_TO_PX = 1.333;
    const baseRadius = (((4 * PT_TO_PX) / 2) / 2) * 1.1; 
    const maxRadius = (((9 * PT_TO_PX) / 2) / 2) * 1.1;  
    const gridStep = ((10 * PT_TO_PX) / 2) * 1.1;        
    const effectRadius = gridStep * 15; 
    const effectRadiusSq = effectRadius * effectRadius;
    const maxRippleRadius = gridStep * 24; 
    const maxRippleRadiusSq = maxRippleRadius * maxRippleRadius;

    let cols, rows;
    let points = [];
    let activePoints = new Set();
    let mouse = { x: -1000, y: -1000 };
    let ripples = [];

    function initPoints() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.ceil(canvas.width / gridStep) + 1;
        rows = Math.ceil(canvas.height / gridStep) + 1;
        points = [];
        activePoints.clear();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                points.push({
                    c, r, x: c * gridStep, y: r * gridStep,
                    size: baseRadius, colorFactor: 0
                });
            }
        }
    }

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });
    window.addEventListener('mousedown', (e) => { if (e.button === 0) triggerRipple(e.clientX, e.clientY); });
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) triggerRipple(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function triggerRipple(x, y) {
        ripples.push({ x: x, y: y, radius: 0, strength: 2.5 });
        setTimeout(() => { ripples.push({ x: x, y: y, radius: 0, strength: 1.0 }); }, 200);
    }
    
    window.addEventListener('resize', initPoints);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let targetC = -100;
        let targetR = -100;

        if (mouse.x >= 0 && mouse.y >= 0) {
            targetC = Math.round(mouse.x / gridStep);
            targetR = Math.round(mouse.y / gridStep);
            const checkRadius = 12; 
            for (let r = targetR - checkRadius; r <= targetR + checkRadius; r++) {
                for (let c = targetC - checkRadius; c <= targetC + checkRadius; c++) {
                    if (c >= 0 && c < cols && r >= 0 && r < rows) activePoints.add(r * cols + c);
                }
            }
        }

        for (let i = ripples.length - 1; i >= 0; i--) {
            let r = ripples[i];
            let progress = Math.min(1, r.radius / maxRippleRadius);
            let speedFactor = 1 - progress; 
            r.radius += gridStep * (1.2 * speedFactor + 0.4); 
            if (r.radius - gridStep * 4 > maxRippleRadius) {
                ripples.splice(i, 1);
                continue;
            }
            let maxDist = r.radius + gridStep * 2;
            let cMin = Math.max(0, Math.floor((r.x - maxDist) / gridStep));
            let cMax = Math.min(cols - 1, Math.ceil((r.x + maxDist) / gridStep));
            let rMin = Math.max(0, Math.floor((r.y - maxDist) / gridStep));
            let rMax = Math.min(rows - 1, Math.ceil((r.y + maxDist) / gridStep));
            for(let col = cMin; col <= cMax; col++) {
                for(let row = rMin; row <= rMax; row++) activePoints.add(row * cols + col);
            }
        }

        const dotImg = cursorColorMode === 'white' ? dotCanvasWhite : dotCanvasBlack;

        for (let index of activePoints) {
            const point = points[index];
            let mouseTargetSize = baseRadius;
            let mouseTargetColorFactor = 0;

            if (point.c === targetC && point.r === targetR) {
                mouseTargetSize = maxRadius;
                mouseTargetColorFactor = 1; 
            } else {
                const dx = point.x - mouse.x;
                const dy = point.y - mouse.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < effectRadiusSq) {
                    const dist = Math.sqrt(distSq);
                    const factor = 1 - (dist / effectRadius);
                    const f2 = factor * factor;
                    const f4 = f2 * f2;
                    mouseTargetSize = baseRadius + (maxRadius - baseRadius) * (f4 * factor);
                    mouseTargetColorFactor = f4 * f4; 
                }
            }

            let rippleEffect = 0;
            for (let r of ripples) {
                const dx = point.x - r.x;
                const dy = point.y - r.y;
                if (Math.abs(dx) > maxRippleRadius || Math.abs(dy) > maxRippleRadius) continue; 
                const distSq = dx * dx + dy * dy;
                if (distSq <= maxRippleRadiusSq) {
                    const dist = Math.sqrt(distSq);
                    const distanceFade = 1 - (dist / maxRippleRadius);
                    const diff = Math.abs(dist - r.radius);
                    const ring = Math.max(0, 1 - (diff / (gridStep * 3.5)));
                    rippleEffect += (ring * r.strength) * distanceFade;
                }
            }

            let targetSize = Math.max(mouseTargetSize, baseRadius + (maxRadius - baseRadius) * Math.min(1, rippleEffect));
            let targetColorFactor = Math.max(mouseTargetColorFactor, Math.min(1, rippleEffect * 1.2));

            const speed = 0.28; 
            point.size += (targetSize - point.size) * speed;
            point.colorFactor += (targetColorFactor - point.colorFactor) * speed;

            if (point.size > baseRadius + 0.01 || point.colorFactor > 0.005) {
                ctx.globalAlpha = point.colorFactor; 
                const drawSize = point.size * 2;
                ctx.drawImage(dotImg, point.x - point.size, point.y - point.size, drawSize, drawSize);
            } else {
                point.size = baseRadius;
                point.colorFactor = 0;
                activePoints.delete(index);
            }
        }
        ctx.globalAlpha = 1.0;
        requestAnimationFrame(draw);
    }
    
    initPoints();
    requestAnimationFrame(draw);

    // -------------------------------------------------------
    // [비디오 처리 및 스크롤 이벤트 유지]
    // -------------------------------------------------------
    const videos = Array.from(document.querySelectorAll('video.locked-video'));

    videos.forEach(video => {
        video.muted = true;
        video.playsInline = true;
        video.preload = "none";
    });

    const preloadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (video.preload !== "auto") {
                    video.preload = "auto";
                    video.load();
                }
                observer.unobserve(video);
            }
        });
    }, { rootMargin: "1500px 0px", threshold: 0 });

    const playObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Play blocked:", error);
                    });
                }
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { rootMargin: "50px 0px", threshold: 0 });

    videos.forEach(video => {
        preloadObserver.observe(video);
        playObserver.observe(video);
    });

    let lastScrollTop = 0;
    let scrollUpDistance = 0;     
    const scrollThreshold = 600;  

    const header = document.querySelector('header');
    const backNav = document.querySelector('.back-nav-container'); 
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll <= 0) {
            header.classList.remove('header-hidden');
            if(backNav) backNav.classList.remove('nav-up');
            lastScrollTop = 0;
            scrollUpDistance = 0; 
            return; 
        }

        if (currentScroll > lastScrollTop) {
            header.classList.add('header-hidden');
            if(backNav) backNav.classList.add('nav-up');
            scrollUpDistance = 0; 
        } else {
            scrollUpDistance += (lastScrollTop - currentScroll);
            
            if (scrollUpDistance > scrollThreshold) {
                header.classList.remove('header-hidden');
                if(backNav) backNav.classList.remove('nav-up');
                scrollUpDistance = scrollThreshold; 
            }
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    }, { passive: true });
});