document.addEventListener("DOMContentLoaded", function() {
    // 1. 페이지 페이드인
    setTimeout(() => { document.body.classList.add('fade-in'); }, 50);
    
    // 2. 헤더 로고 클릭 이동
    const backBtn = document.getElementById('back-to-home');
    if(backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '/index.html'; 
        });
    }

    // -------------------------------------------------------
    // [커스텀 커서 및 리플 효과 시스템 자동 주입]
    // -------------------------------------------------------
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    // plus-darker 블렌드 컴포지션 명시적 적용
    ctx.globalCompositeOperation = 'plus-darker';

    const PT_TO_PX = 1.333;
    // 요구사항 반영: 크기와 간격을 기존의 1/2로 축소
    const baseRadius = ((4 * PT_TO_PX) / 2) / 2; 
    const maxRadius = ((9 * PT_TO_PX) / 2) / 2;  
    const gridStep = (10 * PT_TO_PX) / 2;        

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

        // 평소 기본 점들은 완전 투명 상태로 시작
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * gridStep;
                const y = r * gridStep;
                
                points.push({
                    c, r, x, y,
                    size: baseRadius,
                    colorFactor: 0
                });
            }
        }
    }

    // 데스크톱 마우스 이동 이벤트
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // 데스크톱 클릭 이벤트
    window.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            triggerRipple(e.clientX, e.clientY);
        }
    });

    // 모바일 터치 이벤트 (터치 시 리플 효과 작동)
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            triggerRipple(touchX, touchY);
        }
    }, { passive: true });

    function triggerRipple(x, y) {
        ripples.push({ x: x, y: y, radius: 0, strength: 2.0 });
        setTimeout(() => {
            ripples.push({ x: x, y: y, radius: 0, strength: 0.8 });
        }, 150);
    }

    window.addEventListener('resize', initPoints);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let targetC = -100;
        let targetR = -100;

        if (mouse.x >= 0 && mouse.y >= 0) {
            targetC = Math.round(mouse.x / gridStep);
            targetR = Math.round(mouse.y / gridStep);

            const checkRadius = 8; 
            for (let r = targetR - checkRadius; r <= targetR + checkRadius; r++) {
                for (let c = targetC - checkRadius; c <= targetC + checkRadius; c++) {
                    if (c >= 0 && c < cols && r >= 0 && r < rows) {
                        activePoints.add(r * cols + c);
                    }
                }
            }
        }

        const maxRippleRadius = gridStep * 16;

        for (let i = ripples.length - 1; i >= 0; i--) {
            let r = ripples[i];
            
            let progress = Math.min(1, Math.max(0, r.radius / maxRippleRadius));
            let speedFactor = Math.pow(1 - progress, 1.2);
            
            r.radius += gridStep * (0.2 * speedFactor + 0.03); 

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
                for(let row = rMin; row <= rMax; row++) {
                    activePoints.add(row * cols + col);
                }
            }
        }

        for (let index of activePoints) {
            const point = points[index];
            
            let mouseTargetSize = baseRadius;
            let mouseTargetColorFactor = 0;

            if (point.c === targetC && point.r === targetR) {
                mouseTargetSize = maxRadius;
                mouseTargetColorFactor = 1; 
            } 
            else {
                const dx = point.x - mouse.x;
                const dy = point.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const effectRadius = gridStep * 10; 

                if (dist < effectRadius) {
                    const factor = 1 - (dist / effectRadius);
                    mouseTargetSize = baseRadius + (maxRadius - baseRadius) * Math.pow(factor, 5);
                    mouseTargetColorFactor = Math.pow(factor, 8); 
                }
            }

            let rippleEffect = 0;
            for (let r of ripples) {
                const dx = point.x - r.x;
                const dy = point.y - r.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= maxRippleRadius) {
                    const distanceFade = Math.pow(1 - (dist / maxRippleRadius), 1.2);
                    const diff = Math.abs(dist - r.radius);
                    const ring = Math.max(0, 1 - (diff / (gridStep * 1.2)));

                    rippleEffect += (ring * 1.0 * r.strength) * distanceFade;
                }
            }

            let targetSize = Math.max(mouseTargetSize, baseRadius + (maxRadius - baseRadius) * Math.min(1, rippleEffect));
            let targetColorFactor = Math.max(mouseTargetColorFactor, Math.min(1, rippleEffect * 1.2));

            const speed = 0.05;
            point.size += (targetSize - point.size) * speed;
            point.colorFactor += (targetColorFactor - point.colorFactor) * speed;

            // 커서가 닿거나 리플이 발생할 때만 알파(투명도)가 0에서 부드럽게 증가하도록 설정
            if (point.size > baseRadius + 0.01 || point.colorFactor > 0.005) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(17, 17, 17, ${point.colorFactor})`;
                ctx.fill();
            } else {
                point.size = baseRadius;
                point.colorFactor = 0;
                activePoints.delete(index);
            }
        }

        requestAnimationFrame(draw);
    }

    initPoints();
    requestAnimationFrame(draw);

    // -------------------------------------------------------
    // [기존 유지] 비디오 옵저버 시스템
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

    // -------------------------------------------------------
    // [기존 유지] 헤더 제어 시스템
    // -------------------------------------------------------
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