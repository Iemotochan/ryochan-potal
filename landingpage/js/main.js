/**
 * RYO-CHAN冒険ランディングページ - パララックス修正版
 */

class AdventurePage {
    constructor() {
        this.isLoading = true;
        this.currentSection = 0;
        this.hasInteracted = false;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartY = 0;
        this.touchEndY = 0;
        
        // パララックス関連
        this.parallaxConfig = {
            speed: this.isMobile ? 0.5 : 0.8,
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
    
    /**
     * アセットのプリロード
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
    
    /**
     * ローディングスクリーンを隠す
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
    
    /**
     * イントロアニメーションの開始
     */
    startIntroAnimations() {
        console.log('✨ イントロアニメーション開始');
        this.measurePerformance();
    }
    
    /**
     * パフォーマンス測定
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
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // スクロールイベント
        this.throttledScroll = this.throttle(this.handleScroll.bind(this), 10);
        window.addEventListener('scroll', this.throttledScroll, { passive: true });
        
        // クリック・タッチイベント
        document.addEventListener('click', this.handleClick.bind(this));
        
        if (this.isMobile) {
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }
        
        // マウスイベント（デスクトップのみ）
        if (!this.isMobile) {
            this.throttledMouseMove = this.throttle(this.handleMouseMove.bind(this), 16);
            document.addEventListener('mousemove', this.throttledMouseMove, { passive: true });
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
    
    /**
     * スロットル関数
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
    
    /**
     * コンポーネントの初期化
     */
    initializeComponents() {
        this.setupCustomCursor();
        this.setupParallaxBackground();
        this.setupIntersectionObserver();
        this.setupTypingObserver();
    }
    
    /**
     * カスタムカーソルの設定
     */
    setupCustomCursor() {
        if (this.isMobile) return;
        
        this.cursor = document.querySelector('.custom-cursor');
        if (!this.cursor) return;
        
        this.mousePosition = { x: 0, y: 0 };
        this.cursorPosition = { x: 0, y: 0 };
        
        this.updateCursor();
    }
    
    /**
     * カーソル更新ループ
     */
    updateCursor() {
        if (!this.cursor || this.isMobile) return;
        
        this.cursorPosition.x += (this.mousePosition.x - this.cursorPosition.x) * 0.1;
        this.cursorPosition.y += (this.mousePosition.y - this.cursorPosition.y) * 0.1;
        
        this.cursor.style.transform = `translate(${this.cursorPosition.x}px, ${this.cursorPosition.y}px)`;
        
        requestAnimationFrame(() => this.updateCursor());
    }
    
    /**
     * パララックス背景の設定 - 簡易版
     */
    setupParallaxBackground() {
        this.parallaxBg = document.getElementById('parallaxBg');
        this.bgImage = this.parallaxBg?.querySelector('.bg-image');
        
        if (this.bgImage) {
            console.log('📐 背景画像が見つかりました');
            // 即座にパララックスを開始
            this.updateParallax();
        }
    }
    
    /**
     * パララックス更新 - 簡単な計算
     */
    updateParallax() {
        if (!this.bgImage) return;
        
        const scrolled = window.pageYOffset;
        const scrollProgress = scrolled / (document.body.scrollHeight - window.innerHeight);
        
        // 簡単なパララックス計算
        const maxMove = 500; // 最大移動距離
        const parallaxOffset = scrollProgress * maxMove * this.parallaxConfig.speed;
        
        // 直接transformを適用
        this.bgImage.style.transform = `translateY(-${parallaxOffset}px)`;
        
        // デバッグ用ログ
        if (scrolled % 100 < 10) { // 100pxごとにログ出力
            console.log(`🌅 スクロール位置: ${scrolled}px | オフセット: ${parallaxOffset.toFixed(0)}px`);
        }
        
        // 背景の明るさ調整
        this.updateBackgroundEffect(scrollProgress);
    }
    
    /**
     * 背景エフェクト更新
     */
    updateBackgroundEffect(scrollProgress) {
        if (!this.bgImage) return;
        
        // スクロールに応じて背景を明るく
        const brightness = 0.8 + (scrollProgress * 0.4); // 0.8から1.2へ
        const contrast = 1.1;
        const saturation = 1.2;
        
        this.bgImage.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
    }
    
    /**
     * インターセクションオブザーバーの設定
     */
    setupIntersectionObserver() {
        const sections = document.querySelectorAll('.section');
        
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleSectionInView(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        sections.forEach(section => this.sectionObserver.observe(section));
    }
    
    /**
     * タイピングオブザーバーの設定
     */
    setupTypingObserver() {
        this.typingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.typed) {
                    const element = entry.target;
                    const text = element.dataset.text || element.textContent;
                    this.typeText(element, text);
                    element.dataset.typed = 'true';
                    this.typingObserver.unobserve(element);
                }
            });
        }, { 
            threshold: 0.5
        });
        
        document.querySelectorAll('.episode-text').forEach(el => {
            this.typingObserver.observe(el);
        });
    }
    
    /**
     * タイピングエフェクト - 完全修正版
     */
    typeText(element, text, speed = 30) {
        if (!element || !text) return;
        
        console.log(`⌨️ タイピング開始: "${text.substring(0, 20)}..."`);
        
        // 元のテキストを保存してクリア
        element.textContent = '';
        element.classList.add('typing');
        
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                element.classList.remove('typing');
                element.classList.add('typing-complete');
                console.log('⌨️ タイピング完了');
            }
        }, speed);
    }
    
    /**
     * イベントハンドラー
     */
    
    handleScroll() {
        if (this.isLoading) return;
        
        // プログレスバー更新
        this.updateScrollProgress();
        
        // パララックス更新
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
    
    handleMouseMove(e) {
        if (this.isMobile) return;
        
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
        
        const isHoverable = e.target.closest('button, .character-card, .audio-control, [data-character]');
        if (this.cursor) {
            if (isHoverable) {
                this.cursor.classList.add('hover');
            } else {
                this.cursor.classList.remove('hover');
            }
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
            this.parallaxConfig.speed = this.isMobile ? 0.5 : 0.8;
        }
        
        if (window.goldenAuraSystem) {
            window.goldenAuraSystem.resize();
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
                this.scrollToSection('episode1');
                break;
            case 'read':
                this.openStory();
                break;
            case 'join':
                this.joinCommunity();
                break;
        }
    }
    
    /**
     * ユーティリティメソッド
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
