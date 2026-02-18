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

    // 비디오 설정을 초기화 (소리 끔, 아이폰 전체화면 방지, 로딩 차단)
    videos.forEach(video => {
        video.muted = true;
        video.playsInline = true;
        video.preload = "none"; 
    });

    // 순차 로딩 함수: index번째 비디오를 로드하고, 완료되면 index+1번째를 호출
    const loadVideoSequence = (index) => {
        if (index >= videos.length) return; // 더 이상 비디오가 없으면 종료

        const video = videos[index];
        
        // 로딩 시작 (강제)
        video.preload = "auto"; 
        
        // "데이터가 조금이라도 로딩되면" 다음 타자 호출
        // (loadeddata: 첫 프레임이 로딩된 시점)
        const onLoaded = () => {
            // 이벤트 리스너 제거 (중복 실행 방지)
            video.removeEventListener('loadeddata', onLoaded);
            // 다음 비디오 로딩 시작
            loadVideoSequence(index + 1);
        };

        // 이미 로딩이 되어있는 경우 바로 다음으로, 아니면 리스너 등록
        if (video.readyState >= 2) {
            loadVideoSequence(index + 1);
        } else {
            video.addEventListener('loadeddata', onLoaded);
            // 혹시 로딩이 너무 오래 걸릴 경우를 대비해 3초 뒤 강제 다음 진행
            setTimeout(() => {
                if(video.readyState < 2) loadVideoSequence(index + 1);
            }, 3000); 
        }

        // 모바일 브라우저를 깨우기 위해 강제로 load() 호출
        video.load();
    };

    // [시작] 첫 번째 비디오부터 로딩 스타트!
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
                // 화면에 들어옴: 재생 시도
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Play blocked (Low Power Mode?):", error);
                    });
                }
            } else {
                // 화면 밖: 정지
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { 
        rootMargin: "50% 0px", // 미리 재생 준비
        threshold: 0.1 
    });

    videos.forEach(video => {
        videoObserver.observe(video);
    });

    // -------------------------------------------------------
    // [헤더 제어] 스크롤 누적 거리 감지 (projects.html 로직 이식)
    // -------------------------------------------------------
    let lastScrollTop = 0;
    let scrollUpDistance = 0;     // 위로 스크롤한 거리를 누적할 변수
    const scrollThreshold = 600;  // 이만큼(400px) 올려야 메뉴가 나타남

    const header = document.querySelector('header');
    const backNav = document.querySelector('.back-nav-container'); 
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // 1. 페이지 최상단에 도달하면 무조건 메뉴 보임
        if (currentScroll <= 0) {
            header.classList.remove('header-hidden');
            if(backNav) backNav.classList.remove('nav-up');
            lastScrollTop = 0;
            scrollUpDistance = 0; // 누적 거리 초기화
            return; 
        }

        // 2. 스크롤 방향에 따른 동작
        if (currentScroll > lastScrollTop) {
            // [아래로 스크롤] : 즉시 숨김
            header.classList.add('header-hidden');
            if(backNav) backNav.classList.add('nav-up');
            scrollUpDistance = 0; // 내리는 순간, 올린 거리 카운트 리셋
        } else {
            // [위로 스크롤] : 바로 보여주지 않고 거리를 누적함
            scrollUpDistance += (lastScrollTop - currentScroll);
            
            // 누적된 거리가 설정값(400)을 넘었을 때만 메뉴 표시
            if (scrollUpDistance > scrollThreshold) {
                header.classList.remove('header-hidden');
                if(backNav) backNav.classList.remove('nav-up');
                // 한 번 나타나면 거리를 threshold로 유지 (계속 늘어나지 않게)
                scrollUpDistance = scrollThreshold; 
            }
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    }, { passive: true });
});
