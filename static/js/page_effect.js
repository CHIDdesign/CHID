document.addEventListener("DOMContentLoaded", function() {
    // 1. 페이지 페이드인
    setTimeout(() => { document.body.classList.add('fade-in'); }, 50);
    
    // 2. 헤더 로고 클릭 이동
    const backBtn = document.getElementById('back-to-home');
    if(backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '/projects.html'; 
        });
    }

    // -------------------------------------------------------
    // [핵심 로직 개선] 이중 옵저버(Dual Observer) 시스템
    // 기존의 Waterfall 방식은 스크롤 속도를 따라가지 못해 검은 화면을 유발하므로 삭제했습니다.
    // -------------------------------------------------------
    const videos = Array.from(document.querySelectorAll('video.locked-video'));

    // 비디오 설정을 초기화 (소리 끔, 아이폰 전체화면 방지)
    videos.forEach(video => {
        video.muted = true;
        video.playsInline = true;
        video.preload = "none"; // 처음에는 로딩 차단 (데이터 절약)
    });

    // [옵저버 1] 프리로드 옵저버: 화면에 도달하기 1500px 전부터 백그라운드 다운로드 시작
    const preloadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (video.preload !== "auto") {
                    video.preload = "auto";
                    video.load(); // 다운로드 강제 트리거
                }
                // 한 번 다운로드를 시작하면 감시 해제 (리소스 절약)
                observer.unobserve(video);
            }
        });
    }, { 
        rootMargin: "1500px 0px", // 스크롤 1.5~2화면 전에 미리 준비
        threshold: 0 
    });

    // [옵저버 2] 플레이백 옵저버: 실제 화면에 보일 때만 재생하고 벗어나면 정지
    const playObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // 화면에 들어오면 재생
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Play blocked (Low Power Mode?):", error);
                    });
                }
            } else {
                // 화면 밖으로 나가면 정지시켜 메모리 확보
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { 
        rootMargin: "50px 0px", // 살짝 걸쳐도 부드럽게 재생되도록 여유값
        threshold: 0 
    });

    // 모든 비디오에 두 가지 옵저버 부착
    videos.forEach(video => {
        preloadObserver.observe(video);
        playObserver.observe(video);
    });

    // -------------------------------------------------------
    // [헤더 제어] 스크롤 누적 거리 감지
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
