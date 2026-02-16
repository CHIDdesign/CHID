
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(() => { document.body.classList.add('fade-in'); }, 50);
            
            document.getElementById('back-to-home').addEventListener('click', function() {
                window.location.href = '/#';
            });

            const videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    if (entry.isIntersecting) {
                        video.preload = "auto";
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.log("Auto-play blocked:", error);
                            });
                        }
                    } else {
                        if (!video.paused) {
                            video.pause();
                        }
                    }
                });
            }, { rootMargin: "200px 0px", threshold: 0.1 });

            document.querySelectorAll('video.locked-video').forEach(video => {
                videoObserver.observe(video);
            });

            let lastScrollTop = 0;
            let scrollUpDistance = 0;
            const scrollThreshold = 400;

            const header = document.querySelector('header');
            const backNav = document.querySelector('.back-nav-container'); 
            
            window.addEventListener('scroll', function() {
                let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                
                if (currentScroll <= 0) {
                    header.classList.remove('header-hidden');
                    backNav.classList.remove('nav-up');
                    lastScrollTop = 0;
                    return; 
                }

                if (currentScroll > lastScrollTop) {
                    header.classList.add('header-hidden');
                    backNav.classList.add('nav-up');
                    scrollUpDistance = 0;
                } else {
                    scrollUpDistance += (lastScrollTop - currentScroll);
                    if (scrollUpDistance > scrollThreshold) {
                        header.classList.remove('header-hidden');
                        backNav.classList.remove('nav-up');
                        scrollUpDistance = scrollThreshold;
                    }
                }
                
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
            }, false);
        });
