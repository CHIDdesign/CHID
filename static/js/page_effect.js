document.addEventListener("DOMContentLoaded", function() {
    // 1. 페이지 페이드인 효과
    setTimeout(() => { document.body.classList.add('fade-in'); }, 50);
    
    // 2. 헤더 로고 클릭 시 홈으로 이동
    const backBtn = document.getElementById('back-to-home');
    if(backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '/projects.html'; // 프로젝트 목록으로 이동
        });
    }

    // 3. [핵심 수정] 동영상 자동 재생 최적화 (모바일 대응)
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            // 화면에 들어오기 전(50% 거리)부터 미리 감지
            if (entry.isIntersecting) {
                // 비디오가 멈춰있다면 재생 시도
                if (video.paused) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Auto-play prevented:", error);
                            // 모바일 절전 모드 등으로 자동 재생이 막혔을 경우 처리
                        });
                    }
                }
            } else {
                // 화면 밖으로 완전히 나가면 정지 (배터리/데이터 절약)
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { 
        rootMargin: "50% 0px", // [중요] 스크롤을 내릴 때 미리 로딩/재생 준비를 시킴
        threshold: 0.1 
    });

    // 모든 비디오 태그 감시 시작
    document.querySelectorAll('video.locked-video').forEach(video => {
        video.muted = true;      // 소리 끔 (자동재생 필수 조건)
        video.playsInline = true; // 아이폰 전체화면 방지 (필수)
        videoObserver.observe(video);
    });

    // 4. 스크롤에 따른 헤더 숨김/표시 처리
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    const backNav = document.querySelector('.back-nav-container'); 
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll <= 0) {
            header.classList.remove('header-hidden');
            if(backNav) backNav.classList.remove('nav-up');
            lastScrollTop = 0;
            return; 
        }

        // 스크롤 방향 감지
        if (currentScroll > lastScrollTop) {
            // 아래로 스크롤: 숨김
            header.classList.add('header-hidden');
            if(backNav) backNav.classList.add('nav-up');
        } else {
            // 위로 스크롤: 표시
            header.classList.remove('header-hidden');
            if(backNav) backNav.classList.remove('nav-up');
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    }, { passive: true });
});
