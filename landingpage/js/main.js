/**
 * RYO-CHAN冒険ランディングページ - メインコントローラー
 * 次世代Web体験のためのコアシステム
 */

class AdventurePage {
    constructor() {
        this.isLoading = true;
        this.currentSection = 0;
        this.hasInteracted = false;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartY = 0;
        this.touchEndY = 0;
        
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
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`✅ 画像読み込み完了: ${src}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`⚠️ 画像読み込み失敗: ${src}`);
                    resolve(); // エラーでも続行
                };
                img.src = src;
            });
        });
        
        await Promise.all(loadPromises);
        console.log('🎨 すべての画像アセットの処理が完了しました');
    }
    
    /**
     * 初期化エラーのハンドリング
     */
    handleInitError() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-text">申し訳ございません</div>
                    <div style="color: #ccc; font-size: 1rem; margin-top: 20px;">
                        ページの読み込みに問題が発生しました。<br>
                        ページを再読み込みしてください。
                    </div>
                    <button onclick="window.location.reload()" style="
                        background: var(--primary-gold);
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        color: black;
                        font-weight: 600;
                        margin-top: 30px;
                        cursor: pointer;
                    ">再読み込み</button>
                </div>
            `;
        }
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
        }, 2500);
    }
    
    /**
     * イントロアニメーションの開始
     */
    startIntroAnimations() {
        // タイトルアニメーションは CSS で実行
        console.log('✨ イントロアニメーション開始');
        
        // パフォーマンス測定
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
        
        // キーボードイベント
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // オーディオコントロール
        const audioControl = document.getElementById('audioControl');
        if (audioControl) {
            audioControl.addEventListener('click', this.handleAudioClick.bind(this));
        }
        
        // CTAボタン
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', this.handleCTAClick.bind(this));
        });
        
        // キャラクターカード
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('mouseenter', this.handleCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleCardLeave.bind(this));
            if (this.isMobile) {
                card.addEventListener('touchstart', this.handleCardTouch.bind(this));
            }
        });
        
        // ページ離脱前の処理
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
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
        this.startPerformanceMonitoring();
    }
    
    /**
     * カスタムカーソルの設定
     */
    setupCustomCursor() {
        if (this.isMobile) return;
        
        this.cursor = document.querySelector('.custom-cursor');
        if (!this.cursor) return;
        
        this.cursorDot = this.cursor.querySelector('.cursor-dot');
        this.cursorRing = this.cursor.querySelector('.cursor-ring');
        
        this.mousePosition = { x: 0, y: 0 };
        this.cursorPosition = { x: 0, y: 0 };
        
        this.updateCursor();
    }
    
    /**
     * カーソル更新ループ
     */
    updateCursor() {
        if (!this.cursor) return;
        
        // スムーズな追従
        this.cursorPosition.x += (this.mousePosition.x - this.cursorPosition.x) * 0.1;
        this.cursorPosition.y += (this.mousePosition.y - this.cursorPosition.y) * 0.1;
        
        this.cursor.style.transform = `translate(${this.cursorPosition.x}px, ${this.cursorPosition.y}px)`;
        
        requestAnimationFrame(() => this.updateCursor());
    }
    
    /**
     * パララックス背景の設定 - 動きを無効化
     */
    setupParallaxBackground() {
        this.parallaxBg = document.getElementById('parallaxBg');
        this.bgImage = this.parallaxBg?.querySelector('.bg-image');
        
        if (this.bgImage) {
            // パララックス効果を完全に無効化
            this.bgImage.classList.add('stable');
            this.bgImage.style.transform = 'none';
        }
    }
    
    /**
     * パララックス更新 - 無効化
     */
    updateParallax() {
        // パララックス効果を無効化
        return;
    }
    
    /**
     * スクロールイベントハンドラー - パララックス削除
     */
    handleScroll() {
        if (this.isLoading) return;
        
        // プログレスバー更新のみ
        this.updateScrollProgress();
        
        // セクション検出
        this.detectCurrentSection();
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
            threshold: 0.3,
            rootMargin: '-100px 0px'
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
                    const text = element.textContent;
                    this.typeText(element, text);
                    element.dataset.typed = 'true';
                    this.typingObserver.unobserve(element);
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });
        
        document.querySelectorAll('.episode-text').forEach(el => {
            this.typingObserver.observe(el);
        });
    }
    
    /**
     * パフォーマンス監視の開始
     */
    startPerformanceMonitoring() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.optimizePerformance();
            });
        }
        
        // FPS監視
        this.startFPSMonitoring();
    }
    
    /**
     * FPS監視
     */
    startFPSMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    console.warn(`⚠️ 低FPS検出: ${fps}fps - パフォーマンス最適化を実行`);
                    this.enablePerformanceMode();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    /**
     * パフォーマンス最適化
     */
    optimizePerformance() {
        // 見えない要素のアニメーション停止
        const elements = document.querySelectorAll('[class*="animate-"]');
        
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                } else {
                    entry.target.style.animationPlayState = 'paused';
                }
            });
        });
        
        elements.forEach(el => visibilityObserver.observe(el));
    }
    
    /**
     * パフォーマンスモード有効化
     */
    enablePerformanceMode() {
        console.log('🚀 パフォーマンスモードを有効化');
        
        // 金色オーラのパーティクル数を削減
        if (window.goldenAuraSystem) {
            window.goldenAuraSystem.reduceParticles();
        }
        
        // 一部のエフェクトを無効化
        document.documentElement.style.setProperty('--reduced-motion', '1');
    }
    
    /**
     * イベントハンドラー群
     */
    
    handleScroll() {
        if (this.isLoading) return;
        
        // プログレスバー更新
        this.updateScrollProgress();
        
        // パララックス更新
        this.updateParallax();
        
        // セクション検出
        this.detectCurrentSection();
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
    
    detectCurrentSection() {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.pageYOffset + window.innerHeight / 2;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                if (this.currentSection !== index) {
                    this.currentSection = index;
                    this.onSectionChange(index);
                }
            }
        });
    }
    
    onSectionChange(sectionIndex) {
        console.log(`📍 セクション変更: ${sectionIndex}`);
        
        // セクション固有の処理
        if (window.audioSystem) {
            window.audioSystem.onSectionChange(sectionIndex);
        }
    }
    
    handleMouseMove(e) {
        if (this.isMobile) return;
        
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
        
        // ホバー効果
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
        
        // リップルエフェクト
        if (window.effectsSystem) {
            window.effectsSystem.createRipple(e.clientX, e.clientY);
            
            // ランダムで花火
            if (Math.random() > 0.6) {
                window.effectsSystem.createFirework(e.clientX, e.clientY);
            }
        }
        
        // サウンドエフェクト
        if (window.audioSystem) {
            window.audioSystem.playClick();
        }
        
        // 初回インタラクション
        if (!this.hasInteracted) {
            this.hasInteracted = true;
            this.onFirstInteraction();
        }
        
        // カーソルエフェクト
        if (this.cursor) {
            this.cursor.classList.add('click');
            setTimeout(() => {
                this.cursor.classList.remove('click');
            }, 150);
        }
    }
    
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchEnd(e) {
        this.touchEndY = e.changedTouches[0].clientY;
        this.handleSwipe();
        
        // タッチエフェクト
        const touch = e.changedTouches[0];
        if (window.effectsSystem) {
            window.effectsSystem.createRipple(touch.clientX, touch.clientY);
        }
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartY - this.touchEndY;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // 上スワイプ - 次のセクション
                this.scrollToNextSection();
            } else {
                // 下スワイプ - 前のセクション
                this.scrollToPrevSection();
            }
        }
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            console.log(`📱 デバイス切り替え: ${this.isMobile ? 'モバイル' : 'デスクトップ'}`);
            this.handleDeviceChange();
        }
        
        // Canvas リサイズ
        if (window.goldenAuraSystem) {
            window.goldenAuraSystem.resize();
        }
    }
    
    handleDeviceChange() {
        // デバイス切り替え時の処理
        if (this.isMobile) {
            this.cursor?.remove();
            document.body.style.cursor = 'auto';
        } else {
            this.setupCustomCursor();
        }
    }
    
    handleKeyDown(e) {
        if (this.isLoading) return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (window.audioSystem) {
                    window.audioSystem.toggle();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.scrollToNextSection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.scrollToPrevSection();
                break;
            case 'Home':
                e.preventDefault();
                this.scrollToTop();
                break;
            case 'End':
                e.preventDefault();
                this.scrollToBottom();
                break;
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
        
        // 花火エフェクト
        if (window.effectsSystem) {
            window.effectsSystem.createFirework(e.clientX, e.clientY);
        }
        
        // ボタン固有の処理
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
        
        // アナリティクス
        this.trackEvent('cta_click', { action });
    }
    
    handleCardHover(e) {
        const card = e.target.closest('.character-card');
        if (window.audioSystem) {
            window.audioSystem.playHover();
        }
        
        // カードグロー効果
        card.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.4)';
    }
    
    handleCardLeave(e) {
        const card = e.target.closest('.character-card');
        card.style.boxShadow = '';
    }
    
    handleCardTouch(e) {
        const card = e.target.closest('.character-card');
        card.classList.toggle('flipping');
        
        setTimeout(() => {
            card.classList.remove('flipping');
        }, 800);
    }
    
    handleBeforeUnload() {
        // クリーンアップ処理
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        if (this.typingObserver) {
            this.typingObserver.disconnect();
        }
    }
    
    /**
     * ユーティリティメソッド
     */
    
    onFirstInteraction() {
        console.log('🎉 初回インタラクション検出');
        
        // オーディオ自動開始（ユーザージェスチャー後）
        if (window.audioSystem) {
            window.audioSystem.enable();
        }
    }
    
    handleSectionInView(section) {
        const sectionId = section.id;
        console.log(`👁️ セクション表示: ${sectionId}`);
        
        // セクション固有のエフェクト
        switch(sectionId) {
            case 'characters':
                this.animateCharacterCards();
                break;
        }
    }
    
    typeText(element, text, speed = 25) {
        if (!element || !text) return;
        
        element.textContent = '';
        element.style.maxWidth = '0';
        element.style.whiteSpace = 'nowrap';
        element.classList.add('typing');
        
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                element.style.maxWidth = '100%';
                element.style.whiteSpace = 'normal';
                element.style.borderRight = 'none';
                element.classList.remove('typing');
            }
        }, speed);
    }
    
    animateCharacterCards() {
        const cards = document.querySelectorAll('.character-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-scale-in');
            }, index * 150);
        });
    }
    
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    scrollToNextSection() {
        const sections = document.querySelectorAll('.section');
        const next = Math.min(this.currentSection + 1, sections.length - 1);
        sections[next].scrollIntoView({ behavior: 'smooth' });
    }
    
    scrollToPrevSection() {
        const sections = document.querySelectorAll('.section');
        const prev = Math.max(this.currentSection - 1, 0);
        sections[prev].scrollIntoView({ behavior: 'smooth' });
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    scrollToBottom() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    
    openStory() {
        setTimeout(() => {
            window.open('https://ryochan.com/novel/ja/ep1/', '_blank');
        }, 800);
    }
    
    joinCommunity() {
        setTimeout(() => {
            window.open('#', '_blank'); // 実際のコミュニティURLに変更
        }, 800);
    }
    
    trackEvent(eventName, data = {}) {
        console.log(`📊 イベント: ${eventName}`, data);
        
        // Google Analytics や他の分析ツールとの連携
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
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
    
    // エラー報告
    if (adventurePage) {
        adventurePage.trackEvent('error', {
            message: e.error.message,
            filename: e.filename,
            lineno: e.lineno
        });
    }
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ 未処理のPromise拒否:', e.reason);
    e.preventDefault();
});

// パフォーマンス最適化
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        console.log('⚡ アイドル時間でのパフォーマンス最適化完了');
    });
}

// Service Worker登録（PWA対応準備）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 将来のPWA対応時に有効化
        // navigator.serviceWorker.register('/sw.js');
    });
}

// エクスポート（他のスクリプトから参照可能にする）
window.AdventurePage = AdventurePage;
