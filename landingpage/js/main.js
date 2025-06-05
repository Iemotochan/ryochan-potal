/*
RYO-CHAN冒険ランディングページ
動画ローディング + 音楽確認ダイアログ + スムーズパララックス版
*/

class AdventurePage {
    constructor() {
        this.isLoading = true;
        this.currentSection = 0;
        this.hasInteracted = false;
        this.audioPermissionRequested = false;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.loadingVideo = null;

        // パララックス関連（YJさんの設定）
        this.parallaxConfig = {
            speed: this.isMobile ? 3 : 6,
            maxOffset: 0,
            currentOffset: 0,
            lastScrollY: 0,
            targetOffset: 0
        };

        this.init();
    }

    async init() {
        console.log('🚀 RYO-CHANの冒険ページが起動開始');
        try {
            this.setupLoadingVideo();
            await this.preloadAssets();
            this.setupEventListeners();
            this.initializeComponents();
            this.startSmoothParallax();
            console.log('✨ 初期化完了 - 冒険の準備が整いました');
        } catch (error) {
            console.error('❌ 初期化エラー:', error);
            this.handleInitError();
        }
    }

    /*
    ローディング動画のセットアップ（jatitle.mp4対応）
    */
    setupLoadingVideo() {
        this.loadingVideo = document.getElementById('loadingVideo');
        if (this.loadingVideo) {
            console.log('🎬 ローディング動画を設定中...');

            // 動画イベントリスナー
            this.loadingVideo.addEventListener('loadeddata', () => {
                console.log('🎬 jatitle.mp4 データ読み込み完了');
            });

            this.loadingVideo.addEventListener('canplaythrough', () => {
                console.log('🎬 jatitle.mp4 再生準備完了');
            });

            this.loadingVideo.addEventListener('ended', () => {
                console.log('🎬 jatitle.mp4 再生終了');
                this.hideLoadingScreen();
            });

            this.loadingVideo.addEventListener('error', (e) => {
                console.warn('⚠️ jatitle.mp4 読み込みエラー:', e);
                console.log('📁 フォールバック表示に切り替え');
                this.showFallbackLoading();
            });

            this.checkVideoFile();
        } else {
            console.warn('⚠️ ローディング動画要素が見つかりません');
            this.showFallbackLoading();
        }
    }

    /*
    jatitle.mp4ファイルの存在確認
    */
    async checkVideoFile() {
        try {
            const response = await fetch('./image/jatitle.mp4', { method: 'HEAD' });
            if (response.ok) {
                console.log('✅ jatitle.mp4 ファイルが見つかりました');
            } else {
                console.warn('⚠️ jatitle.mp4 ファイルが見つかりません');
                this.showFallbackLoading();
            }
        } catch (error) {
            console.error('❌ jatitle.mp4 確認エラー:', error);
            this.showFallbackLoading();
        }
    }

    /*
    フォールバック表示
    */
    showFallbackLoading() {
        const fallback = document.querySelector('.loading-fallback');
        const overlay = document.querySelector('.loading-overlay');
        
        if (fallback) {
            fallback.style.display = 'block';
        }
        if (overlay) {
            overlay.style.display = 'none';
        }

        setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);
    }

    /*
    音楽確認ダイアログの表示
    */
    async showAudioPermissionDialog() {
        return new Promise((resolve) => {
            const dialogOverlay = document.createElement('div');
            dialogOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                backdrop-filter: blur(10px);
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 20, 0.9));
                border: 2px solid rgba(64, 224, 208, 0.4);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 25px 60px rgba(64, 224, 208, 0.3);
                color: #ffffff;
            `;

            dialog.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 20px;">🎵</div>
                <h3 style="font-family: 'Yuji Syuku', serif; color: #E5E4E2; margin-bottom: 15px; font-size: 1.5rem;">音楽で物語を演出</h3>
                <p style="color: #f0f0f0; margin-bottom: 30px; line-height: 1.6;">
                    RYO-CHANの冒険をより深く体験するため、<br>
                    BGMと効果音を再生してもよろしいですか？
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="audioYes" style="
                        background: linear-gradient(45deg, #40E0D0, #00BFFF);
                        border: none;
                        border-radius: 25px;
                        padding: 12px 25px;
                        color: #0a0a0a;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">はい、再生する</button>
                    <button id="audioNo" style="
                        background: transparent;
                        border: 2px solid #40E0D0;
                        border-radius: 25px;
                        padding: 12px 25px;
                        color: #40E0D0;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">いいえ</button>
                </div>
            `;

            dialogOverlay.appendChild(dialog);
            document.body.appendChild(dialogOverlay);

            document.getElementById('audioYes').onclick = () => {
                document.body.removeChild(dialogOverlay);
                resolve(true);
            };

            document.getElementById('audioNo').onclick = () => {
                document.body.removeChild(dialogOverlay);
                resolve(false);
            };

            const buttons = dialog.querySelectorAll('button');
            buttons.forEach(button => {
                button.onmouseover = () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 5px 15px rgba(64, 224, 208, 0.4)';
                };
                button.onmouseout = () => {
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = 'none';
                };
            });
        });
    }

    /*
    スムーズパララックスの開始（YJさんの設定：maxMove=800, speed=3:6）
    */
    startSmoothParallax() {
        const smoothUpdate = () => {
            if (!this.bgImage) return;

            const scrolled = window.pageYOffset;
            const documentHeight = document.body.scrollHeight - window.innerHeight;
            const scrollProgress = Math.min(scrolled / documentHeight, 1);

            const maxMove = 800; // YJさんの設定値
            const targetOffset = scrollProgress * maxMove * this.parallaxConfig.speed;

            this.parallaxConfig.targetOffset = targetOffset;
            this.parallaxConfig.currentOffset += (this.parallaxConfig.targetOffset - this.parallaxConfig.currentOffset) * 0.1;

            this.bgImage.style.transform = `translateY(-${this.parallaxConfig.currentOffset}px)`;
            
            this.updateBackgroundEffect(scrollProgress);

            requestAnimationFrame(smoothUpdate);
        };

        smoothUpdate();
    }

    /*
    ローディングスクリーンを隠す
    */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && !loadingScreen.classList.contains('hide')) {
            console.log('🎬 ローディングスクリーンを隠します');
            
            loadingScreen.classList.add('hide');
            
            if (this.loadingVideo) {
                this.loadingVideo.pause();
                this.loadingVideo.currentTime = 0;
            }

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.isLoading = false;
                this.startIntroAnimations();
            }, 800);
        }
    }

    /*
    アセットのプリロード
    */
    async preloadAssets() {
        const images = [
            './image/background.png',
            './image/ryochan.png',
            './image/oldman.png',
            './image/sakura.png',
            './image/shadow.png',
            './image/secret.png'
        ];

        const loadPromises = images.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`✅ 画像読み込み完了: ${src}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`⚠️ 画像読み込み失敗: ${src}`);
                    resolve();
                };
                img.src = src;
            });
        });

        await Promise.all(loadPromises);
        console.log('🎨 すべての画像アセットの処理が完了しました');
    }

    /*
    イントロアニメーションの開始
    */
    startIntroAnimations() {
        console.log('✨ イントロアニメーション開始');
        this.measurePerformance();
        this.animateVisibleElements();
    }

    /*
    パフォーマンス測定
    */
    measurePerformance() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                console.log(`⚡ ページ読み込み時間: ${loadTime.toFixed(2)}ms`);
            }
        }
    }

    /*
    イベントリスナーの設定
    */
    setupEventListeners() {
        this.throttledScroll = this.throttle(this.handleScroll.bind(this), 16);
        window.addEventListener('scroll', this.throttledScroll, { passive: true });

        document.addEventListener('click', this.handleClick.bind(this));

        if (this.isMobile) {
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }

        this.throttledResize = this.throttle(this.handleResize.bind(this), 250);
        window.addEventListener('resize', this.throttledResize);

        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', this.handleCTAClick.bind(this));
        });

        const audioControl = document.getElementById('audioControl');
        if (audioControl) {
            audioControl.addEventListener('click', this.handleAudioClick.bind(this));
        }
    }

    /*
    スロットル関数
    */
    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    }

    /*
    コンポーネントの初期化
    */
    initializeComponents() {
        this.setupParallaxBackground();
        this.setupIntersectionObserver();
    }

    /*
    パララックス背景の設定
    */
    setupParallaxBackground() {
        this.parallaxBg = document.getElementById('parallaxBg');
        this.bgImage = this.parallaxBg?.querySelector('.bg-image');
        if (this.bgImage) {
            console.log('📐 背景画像が見つかりました - スムーズパララックス開始');
        }
    }

    /*
    背景エフェクト更新
    */
    updateBackgroundEffect(scrollProgress) {
        if (!this.bgImage) return;

        const brightness = 0.8 + (scrollProgress * 0.4);
        const contrast = 1.1;
        const saturation = 1.2;

        this.bgImage.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
    }

    /*
    インターセクションオブザーバーの設定
    */
    setupIntersectionObserver() {
        this.textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    console.log(`💫 テキストアニメーション開始: ${entry.target.className}`);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px 0px'
        });

        document.querySelectorAll('.fade-in-text').forEach(element => {
            this.textObserver.observe(element);
        });

        const sections = document.querySelectorAll('.section');
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleSectionInView(entry.target);
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(section => this.sectionObserver.observe(section));
    }

    /*
    表示可能な要素のアニメーション
    */
    animateVisibleElements() {
        const viewportHeight = window.innerHeight;
        document.querySelectorAll('.fade-in-text').forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < viewportHeight && rect.bottom > 0) {
                setTimeout(() => {
                    element.classList.add('visible');
                }, Math.random() * 500);
            }
        });
    }

    /*
    イベントハンドラー
    */
    handleScroll() {
        if (this.isLoading) return;
        this.updateScrollProgress();
    }

    updateScrollProgress() {
        const scrollProgress = Math.min(
            (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100,
            100
        );

        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${scrollProgress}%`;
        }
    }

    async handleClick(e) {
        if (this.isLoading) return;

        if (window.effectsSystem) {
            window.effectsSystem.createRipple(e.clientX, e.clientY);
        }

        if (!this.hasInteracted) {
            this.hasInteracted = true;
            await this.onFirstInteraction();
        }

        if (window.audioSystem && window.audioSystem.audioEnabled) {
            window.audioSystem.playClick();
        }
    }

    /*
    初回インタラクション処理（音楽確認付き）
    */
    async onFirstInteraction() {
        console.log('🎉 初回インタラクション検出');
        
        if (!this.audioPermissionRequested) {
            this.audioPermissionRequested = true;
            
            const audioPermission = await this.showAudioPermissionDialog();
            
            if (audioPermission && window.audioSystem) {
                await window.audioSystem.enable();
                console.log('🎵 ユーザーが音楽再生を許可しました');
            } else {
                console.log('🔇 ユーザーが音楽再生を拒否しました');
            }
        }
    }

    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        this.touchEndY = e.changedTouches[0].clientY;
        const touch = e.changedTouches[0];

        if (window.effectsSystem) {
            window.effectsSystem.createRipple(touch.clientX, touch.clientY);
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (wasMobile !== this.isMobile) {
            console.log(`📱 デバイス切り替え: ${this.isMobile ? 'モバイル' : 'デスクトップ'}`);
            this.parallaxConfig.speed = this.isMobile ? 3 : 6; // YJさんの設定値
        }

        if (window.platinumAuraSystem) {
            window.platinumAuraSystem.resize();
        }
    }

    handleAudioClick(e) {
        e.stopPropagation();
        if (window.audioSystem) {
            window.audioSystem.toggle();
        }
    }

    handleCTAClick(e) {
        const button = e.target.closest('.cta-button');
        const action = button.dataset.action;

        if (window.effectsSystem) {
            window.effectsSystem.createFirework(e.clientX, e.clientY);
        }

        switch(action) {
            case 'start':
                this.scrollToSection('charactersSection');
                break;
            case 'read':
                this.openStory();
                break;
            case 'join':
                this.joinCommunity();
                break;
        }
    }

    handleSectionInView(section) {
        const sectionId = section.id;
        console.log(`👁️ セクション表示: ${sectionId}`);

        const sectionTexts = section.querySelectorAll('.fade-in-text:not(.visible)');
        sectionTexts.forEach((text, index) => {
            setTimeout(() => {
                text.classList.add('visible');
            }, index * 200);
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    openStory() {
        setTimeout(() => {
            window.open('https://ryochan.com/novel/ja/ep1/', '_blank');
        }, 800);
    }

    joinCommunity() {
        setTimeout(() => {
            window.open('#', '_blank');
        }, 800);
    }

    handleInitError() {
        console.error('初期化に失敗しました');
    }
}

// グローバル変数としてインスタンスを保持
let adventurePage;

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 RYO-CHANの冒険ページが起動しました');
    adventurePage = new AdventurePage();
});

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('❌ エラーが発生しました:', e.error);
});

// エクスポート
window.AdventurePage = AdventurePage;
