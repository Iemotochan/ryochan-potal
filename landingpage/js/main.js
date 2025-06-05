/*
RYO-CHAN冒険ランディングページ
パララックス強化 + 文字浮上エフェクト版
*/

class AdventurePage {
    constructor() {
        this.isLoading = true;
        this.currentSection = 0;
        this.hasInteracted = false;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartY = 0;
        this.touchEndY = 0;

        // パララックス関連（10倍強化）
        this.parallaxConfig = {
            speed: this.isMobile ? 8 : 15, // 10倍にアップ
            maxOffset: 0,
            currentOffset: 0
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
            console.log('✨ 初期化完了 - 冒険の準備が整いました');
        } catch (error) {
            console.error('❌ 初期化エラー:', error);
            this.handleInitError();
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
    ローディングスクリーンを隠す
    */
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

    /*
    イントロアニメーションの開始
    */
    startIntroAnimations() {
        console.log('✨ イントロアニメーション開始');
        this.measurePerformance();
        // 初期表示要素のアニメーション開始
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
        // スクロールイベント
        this.throttledScroll = this.throttle(this.handleScroll.bind(this), 5); // より頻繁に更新
        window.addEventListener('scroll', this.throttledScroll, { passive: true });

        // クリック・タッチイベント
        document.addEventListener('click', this.handleClick.bind(this));

        if (this.isMobile) {
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }

        // リサイズイベント
        this.throttledResize = this.throttle(this.handleResize.bind(this), 250);
        window.addEventListener('resize', this.throttledResize);

        // CTAボタン
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', this.handleCTAClick.bind(this));
        });

        // オーディオコントロール
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
    パララックス背景の設定（強化版）
    */
    setupParallaxBackground() {
        this.parallaxBg = document.getElementById('parallaxBg');
        this.bgImage = this.parallaxBg?.querySelector('.bg-image');
        if (this.bgImage) {
            console.log('📐 背景画像が見つかりました - 強化パララックス開始');
            this.updateParallax();
        }
    }

    /*
    パララックス更新（10倍強化版）
    */
    updateParallax() {
        if (!this.bgImage) return;

        const scrolled = window.pageYOffset;
        const documentHeight = document.body.scrollHeight - window.innerHeight;
        const scrollProgress = Math.min(scrolled / documentHeight, 1);

        // 大幅に移動量を増加（最大移動距離を10倍に）
        const maxMove = 2000; // 2000pxの移動距離
        const parallaxOffset = scrollProgress * maxMove * this.parallaxConfig.speed;

        // 直接transformを適用
        this.bgImage.style.transform = `translateY(-${parallaxOffset}px)`;

        // デバッグ用ログ
        if (scrolled % 200 < 10) { // 200pxごとにログ出力
            console.log(`🌅 スクロール進行: ${(scrollProgress * 100).toFixed(0)}% | オフセット: ${parallaxOffset.toFixed(0)}px`);
        }

        // 背景の明るさ調整
        this.updateBackgroundEffect(scrollProgress);
    }

    /*
    背景エフェクト更新
    */
    updateBackgroundEffect(scrollProgress) {
        if (!this.bgImage) return;

        // スクロールに応じて背景を明るく
        const brightness = 0.8 + (scrollProgress * 0.4); // 0.8から1.2へ
        const contrast = 1.1;
        const saturation = 1.2;

        this.bgImage.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
    }

    /*
    インターセクションオブザーバーの設定（文字浮上エフェクト）
    */
    setupIntersectionObserver() {
        // 文字浮上エフェクト用オブザーバー
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

        // すべての fade-in-text 要素を監視
        document.querySelectorAll('.fade-in-text').forEach(element => {
            this.textObserver.observe(element);
        });

        // セクション切り替え用オブザーバー
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
        // 初期表示時に見える要素を即座にアニメーション
        const viewportHeight = window.innerHeight;
        document.querySelectorAll('.fade-in-text').forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < viewportHeight && rect.bottom > 0) {
                setTimeout(() => {
                    element.classList.add('visible');
                }, Math.random() * 500); // ランダムな遅延でより自然に
            }
        });
    }

    /*
    イベントハンドラー
    */
    handleScroll() {
        if (this.isLoading) return;

        this.updateScrollProgress();
        this.updateParallax();
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

    handleClick(e) {
        if (this.isLoading) return;

        if (window.effectsSystem) {
            window.effectsSystem.createRipple(e.clientX, e.clientY);
        }

        if (window.audioSystem) {
            window.audioSystem.playClick();
        }

        if (!this.hasInteracted) {
            this.hasInteracted = true;
            this.onFirstInteraction();
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
            this.parallaxConfig.speed = this.isMobile ? 8 : 15; // 新しい速度設定
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

    /*
    ユーティリティメソッド
    */
    onFirstInteraction() {
        console.log('🎉 初回インタラクション検出');
        if (window.audioSystem) {
            window.audioSystem.enable();
        }
    }

    handleSectionInView(section) {
        const sectionId = section.id;
        console.log(`👁️ セクション表示: ${sectionId}`);

        // セクション固有のアニメーション
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
