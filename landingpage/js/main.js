/*
RYO-CHAN冒険ランディングページ
音楽確認ダイアログ + スムーズパララックス版
*/

class AdventurePage {
    constructor() {
        this.isLoading = true;
        this.currentSection = 0;
        this.hasInteracted = false;
        this.audioPermissionRequested = false; // 追加
        this.isMobile = window.innerWidth <= 768;
        this.touchStartY = 0;
        this.touchEndY = 0;

        // パララックス関連（YJさんの調整値）
        this.parallaxConfig = {
            speed: this.isMobile ? 3 : 6, // YJさんの調整値
            maxOffset: 0,
            currentOffset: 0,
            lastScrollY: 0, // スムージング用
            targetOffset: 0 // スムージング用
        };

        this.init();
    }

    async init() {
        console.log('🚀 RYO-CHANの冒険ページが起動開始');
        try {
            await this.preloadAssets();
            this.setupEventListeners();
            this.initializeComponents();
            this.hideLoadingScreen();
            this.startSmoothParallax(); // スムーズパララックス開始
            console.log('✨ 初期化完了 - 冒険の準備が整いました');
        } catch (error) {
            console.error('❌ 初期化エラー:', error);
            this.handleInitError();
        }
    }

    // 前のメソッドは同じなので省略...

    /*
    音楽確認ダイアログの表示
    */
    async showAudioPermissionDialog() {
        return new Promise((resolve) => {
            // 美しいダイアログを作成
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

            // ボタンイベント
            document.getElementById('audioYes').onclick = () => {
                document.body.removeChild(dialogOverlay);
                resolve(true);
            };

            document.getElementById('audioNo').onclick = () => {
                document.body.removeChild(dialogOverlay);
                resolve(false);
            };

            // ホバーエフェクト
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
    スムーズパララックスの開始
    */
    startSmoothParallax() {
        const smoothUpdate = () => {
            if (!this.bgImage) return;

            const scrolled = window.pageYOffset;
            const documentHeight = document.body.scrollHeight - window.innerHeight;
            const scrollProgress = Math.min(scrolled / documentHeight, 1);

            // YJさんの調整値を使用
            const maxMove = 800; // YJさんの設定値
            const targetOffset = scrollProgress * maxMove * this.parallaxConfig.speed;

            // スムージング処理
            this.parallaxConfig.targetOffset = targetOffset;
            this.parallaxConfig.currentOffset += (this.parallaxConfig.targetOffset - this.parallaxConfig.currentOffset) * 0.1;

            // 滑らかな変換を適用
            this.bgImage.style.transform = `translateY(-${this.parallaxConfig.currentOffset}px)`;
            
            this.updateBackgroundEffect(scrollProgress);

            requestAnimationFrame(smoothUpdate);
        };

        smoothUpdate();
    }

    /*
    パララックス更新（スムーズ版）
    */
    updateParallax() {
        // この関数は startSmoothParallax() に置き換えられました
        // スクロールイベントからは呼び出さない
    }

    /*
    イベントハンドラー修正版
    */
    handleScroll() {
        if (this.isLoading) return;
        this.updateScrollProgress();
        // updateParallax() を削除（スムーズ版を使用）
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

    // 残りのメソッドは前回と同じ...
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

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hide');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    this.isLoading = false;
                    this.startIntroAnimations();
                }, 600);
            }
        }, 2000);
    }

    startIntroAnimations() {
        console.log('✨ イントロアニメーション開始');
        this.measurePerformance();
        this.animateVisibleElements();
    }

    measurePerformance() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                console.log(`⚡ ページ読み込み時間: ${loadTime.toFixed(2)}ms`);
            }
        }
    }

    setupEventListeners() {
        // スクロールイベント（軽量化）
        this.throttledScroll = this.throttle(this.handleScroll.bind(this), 16); // 60fps
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

    initializeComponents() {
        this.setupParallaxBackground();
        this.setupIntersectionObserver();
    }

    setupParallaxBackground() {
        this.parallaxBg = document.getElementById('parallaxBg');
        this.bgImage = this.parallaxBg?.querySelector('.bg-image');
        if (this.bgImage) {
            console.log('📐 背景画像が見つかりました - スムーズパララックス開始');
        }
    }

    updateBackgroundEffect(scrollProgress) {
        if (!this.bgImage) return;

        const brightness = 0.8 + (scrollProgress * 0.4);
        const contrast = 1.1;
        const saturation = 1.2;

        this.bgImage.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
    }

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
