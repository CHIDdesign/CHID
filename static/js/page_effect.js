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
    // [핵심 로직] 비디오 순차적 로딩 시스템 (Waterfall Loading)
    // -------------------------------------------------------
    const videos = Array.from(document.querySelectorAll('video.locked-video'));

    // 초기 설정: 모든 비디오의 로딩을 JS가 통제하기 위해 꺼둠
    videos.forEach(video => {
        video.muted = true;
        video.playsInline = true;
        video.preload = "none"; 
    });

    // 재귀 함수: index번째 비디오를 로드하고, 완료되면 index+1번째를 호출
    const loadVideoSequence = (index) => {
        if (index >= videos.length) return; // 모든 비디오 로딩 끝

        const video = videos[index];
        
        // 로딩 시작
        video.preload = "auto"; 
        
        // 다음 비디오 로딩 트리거 (loadeddata: 첫 프레임 확보 시점)
        const onLoaded = () => {
            video.removeEventListener('loadeddata', onLoaded); // 리스너 제거
            loadVideoSequence(index + 1); // 다음 타자 호출
        };

        // 이미 로딩되어 있다면 바로 다음으로, 아니면 대기
        if (video.readyState >= 2) {
            loadVideoSequence(index + 1);
        } else {
            video.addEventListener('loadeddata', onLoaded);
            
            // [안전장치] 3초가 지나도 로딩이 안 되면 강제로 다음 비디오 진행 (무한 대기 방지)
            setTimeout(() => {
                if(video.readyState < 2) {
                    console.warn(`Video ${index} loading timeout. Skipping to next.`);
                    loadVideoSequence(index + 1);
                }
            }, 3000); 
        }

        // 모바일 브라우저 강제 로딩 트리거
        video.load();
    };

    // 첫 번째 비디오부터 로딩 시작!
    if (videos.length > 0) {
        loadVideoSequence(0);
    }

    // -------------------------------------------------------
    // [재생 로직] 화면에 보일 때만 재생 (IntersectionObserver)
    // -------------------------------------------------------
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // 화면에 들어오면 재생 시도
                // (순차 로딩 덕분에 이미 로딩되어 있을 확률이 높음)
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // 저전력 모드 등으로 자동 재생이 막힌 경우
                        console.log("Auto-play blocked:", error);
                    });
                }
            } else {
                // 화면 밖으로 나가면 정지 (배터리/데이터 절약)
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { 
        rootMargin: "50% 0px", // 화면에 들어오기 전 미리 감지
        threshold: 0.1 
    });

    videos.forEach(video => {
        videoObserver.observe(video);
    });

    // 4. 스크롤 헤더 제어 (기존 유지)
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

        if (currentScroll > lastScrollTop) {
            header.classList.add('header-hidden');
            if(backNav) backNav.classList.add('nav-up');
        } else {
            header.classList.remove('header-hidden');
            if(backNav) backNav.classList.remove('nav-up');
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    }, { passive: true });
});
