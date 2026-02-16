
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(() => { document.body.classList.add('fade-in'); }, 50);
            
            document.getElementById('back-to-home').addEventListener('click', function() {
                window.location.href = '../index.html';
            });

            const videos = document.querySelectorAll('video.locked-video');
            videos.forEach(video => {
                video.muted = true;
                video.playsInline = true;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log("Video Autoplay Started");
                    }).catch(error => {
                        console.log("Autoplay failed:", error);
                        video.style.pointerEvents = "auto";
                    });
                }
            });

            let lastScrollTop = 0;
            const header = document.querySelector('header');
            const backNav = document.querySelector('.back-nav-container'); 
            
            window.addEventListener('scroll', function() {
                let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                
                if (currentScroll <= 0) {
                    return; 
                }

                if (currentScroll > lastScrollTop) {
                    header.classList.add('header-hidden');
                    backNav.classList.add('nav-up');
                } else {
                    header.classList.remove('header-hidden');
                    backNav.classList.remove('nav-up');
                }
                
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
            }, false);
        });
