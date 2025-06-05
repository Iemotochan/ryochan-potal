/**
 * RYO-CHAN冒険ランディングページ
 * 次世代Web体験のためのインタラクティブスクリプト
 */

class AdventurePage {
    constructor() {
        this.audioEnabled = false;
        this.currentSection = 0;
        this.goldenAuraParticles = [];
        this.isLoading = true;
        
        this.init();
    }
    
    async init() {
        await this.preloadAssets();
        this.setupEventListeners();
        this.initializeComponents();
        this.startGoldenAura();
        this.hideLoadingScreen();
    }
    
    /**
     * アセットのプリロード
     */
    async preloadAssets() {
        const images = [
            './image/background.jpg',
            './image/ryochan.png',
            './image/oldman.png',
            './image/sakura.png',
            './image/shadow.png',
            './image/secret.png'
        ];
        
        const loadPromises = images.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });
        });
        
        try {
            await Promise.all(loadPromises);
            console.log('🎨 すべてのアセットが読み込まれました');
        } catch (error) {
            console.warn('⚠️ 一部のアセットの読み込みに失敗しました:', error);
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
                }, 500);
            }
        }, 3000);
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // スクロールイベント
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // クリック・タッチイベント
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('touchstart', this.handleTouch.bind(this));
        
        // マウスイベント
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // リサイズイベント
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // キーボードイベント
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // オーディオコントロール
        const audioControl = document.getElementById('audioControl');
        if (audioControl) {
            audioControl.addEventListener('click', this.toggleAudio.bind(this));
        }
        
        // CTAボタン
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', this.handleCTAClick.bind(this));
        });
        
        // キャラクターカード
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('mouseenter', this.handleCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleCardLeave.bind(this));
        });
    }
    
    /**
     * コンポーネントの初期化
     */
    initializeComponents() {
        this.setupCustomCursor();
        this.setupParallaxBackground();
        this.setupIntersectionObserver();
        this.setupTypingEffect();
    }
    
    /**
     * カスタムカーソルの設定
     */
    setupCustomCursor() {
        if (window.innerWidth <= 768) return; // モバイルでは無効
        
        const cursor = document.querySelector('.custom-cursor');
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorRing = document.querySelector('.cursor-ring');
        
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        
        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(updateCursor);
        };
        
        updateCursor();
    }
    
    /**
     * パララックス背景の設定
     */
    setupParallaxBackground() {
        this.parallaxBg = document.getElementById('parallaxBg');
        this.bgImage = this.parallaxBg?.querySelector('.bg-image');
    }
    
    /**
     * インターセクションオブザーバーの設定
     */
    setupIntersectionObserver() {
        const sections = document.querySelectorAll('.section');
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleSectionInView(entry.target);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-50px 0px'
        });
        
        sections.forEach(section => this.observer.observe(section));
    }
    
    /**
     * タイピングエフェクトの設定
     */
    setupTypingEffect() {
        this.typingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const text = element.textContent;
                    this.typeText(element, text);
                    this.typingObserver.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('.episode-text').forEach(el => {
            this.typingObserver.observe(el);
        });
    }
    
    /**
     * 金色オーラエフェクトの開始
     */
    startGoldenAura() {
        const canvas = document.getElementById('goldenAuraCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // パーティクルクラス
        class GoldenParticle {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 50;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = -Math.random() * 2 - 1;
                this.size = Math.random() * 3 + 1;
                this.opacity = Math.random() * 0.5 + 0.5;
                this.life = 1.0;
                this.decay = Math.random() * 0.01 + 0.005;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
                
                if (this.life <= 0 || this.y < -50) {
                    this.reset();
                }
            }
            
            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.opacity * this.life;
                
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 2
                );
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.5, '#FFA500');
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
        }
        
        // パーティクル生成
        for (let i = 0; i < 50; i++) {
            this.goldenAuraParticles.push(new GoldenParticle());
        }
        
        // アニメーションループ
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.goldenAuraParticles.forEach(particle => {
                particle.update();
                particle.draw(ctx);
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * スクロールイベントハンドラー
     */
    handleScroll() {
        if (this.isLoading) return;
        
        // プログレスバー更新
        const scrollProgress = (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100;
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${Math.min(scrollProgress, 100)}%`;
        }
        
        // パララックス効果
        if (this.bgImage) {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            this.bgImage.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    }
    
    /**
     * マウス移動イベントハンドラー
     */
    handleMouseMove(e) {
        if (window.innerWidth <= 768) return;
        
        const cursor = document.querySelector('.custom-cursor');
        if (cursor) {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
        
        // ホバー効果
        const isHoverable = e.target.closest('button, .character-card, .audio-control, [data-character]');
        if (isHoverable) {
            cursor?.classList.add('hover');
        } else {
            cursor?.classList.remove('hover');
        }
    }
    
    /**
     * クリックイベントハンドラー
     */
    handleClick(e) {
        this.createRippleEffect(e.clientX, e.clientY);
        
        if (Math.random() > 0.7) { // 30%の確率で花火
            this.createFirework(e.clientX, e.clientY);
        }
        
        this.playClickSound();
        
        // 初回クリックでオーディオ有効化
        if (!this.audioEnabled && !this.hasInteracted) {
            this.hasInteracted = true;
            this.enableAudio();
        }
    }
    
    /**
     * タッチイベントハンドラー
     */
    handleTouch(e) {
        const touch = e.touches[0];
        this.createRippleEffect(touch.clientX, touch.clientY);
        this.playClickSound();
    }
    
    /**
     * リサイズイベントハンドラー
     */
    handleResize() {
        // Canvas リサイズは startGoldenAura 内で処理
    }
    
    /**
     * キーボードイベントハンドラー
     */
    handleKeyDown(e) {
        switch(e.key) {
            case ' ': // スペースキー
                e.preventDefault();
                this.toggleAudio();
                break;
            case 'ArrowDown':
                this.scrollToNextSection();
                break;
            case 'ArrowUp':
                this.scrollToPrevSection();
                break;
        }
    }
    
    /**
     * セクションがビューに入った時の処理
     */
    handleSectionInView(section) {
        const sectionId = section.id;
        
        // セクション固有のエフェクト
        switch(sectionId) {
            case 'episode1':
                this.triggerEpisodeEffects(1);
                break;
            case 'episode2':
                this.triggerEpisodeEffects(2);
                break;
            case 'characters':
                this.animateCharacterCards();
                break;
        }
    }
    
    /**
     * CTAボタンクリックハンドラー
     */
    handleCTAClick(e) {
        const action = e.target.closest('.cta-button').dataset.action;
        
        this.createFirework(e.clientX, e.clientY);
        
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
     * カードホバーハンドラー
     */
    handleCardHover(e) {
        const card = e.target.closest('.character-card');
        const character = card.dataset.character;
        
        // ホバー時のエフェクト
        this.playHoverSound();
    }
    
    handleCardLeave(e) {
        // カードを離れた時の処理
    }
    
    /**
     * リップルエフェクトの生成
     */
    createRippleEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x - 50}px`;
        ripple.style.top = `${y - 50}px`;
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * 花火エフェクトの生成
     */
    createFirework(x, y) {
        const container = document.getElementById('fireworksContainer') || document.body;
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = `${x}px`;
        firework.style.top = `${y}px`;
        
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA500'];
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 50 + Math.random() * 100;
            
            firework.appendChild(particle);
            
            // パーティクルアニメーション
            let posX = 0, posY = 0;
            let velocityX = Math.cos(angle) * velocity;
            let velocityY = Math.sin(angle) * velocity;
            let gravity = 2;
            let life = 1.0;
            
            const animateParticle = () => {
                posX += velocityX * 0.02;
                posY += velocityY * 0.02;
                velocityY += gravity * 0.02;
                velocityX *= 0.98;
                life -= 0.02;
                
                particle.style.transform = `translate(${posX}px, ${posY}px) scale(${life})`;
                particle.style.opacity = life;
                
                if (life > 0) {
                    requestAnimationFrame(animateParticle);
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
        
        container.appendChild(firework);
        
        setTimeout(() => {
            firework.remove();
        }, 2000);
    }
    
    /**
     * タイピングエフェクト
     */
    typeText(element, text, speed = 30) {
        element.textContent = '';
        element.style.maxWidth = '0';
        element.style.whiteSpace = 'nowrap';
        
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                element.style.maxWidth = '100%';
                element.style.whiteSpace = 'normal';
                element.style.borderRight = 'none';
            }
        }, speed);
    }
    
    /**
     * オーディオ制御
     */
    toggleAudio() {
        const audio = document.getElementById('bgAudio');
        const control = document.getElementById('audioControl');
        
        if (this.audioEnabled) {
            audio.pause();
            control.classList.remove('playing');
            this.audioEnabled = false;
        } else {
            audio.play().catch(e => console.log('🎵 オーディオ再生失敗:', e));
            control.classList.add('playing');
            this.audioEnabled = true;
        }
    }
    
    enableAudio() {
        const audio = document.getElementById('bgAudio');
        const control = document.getElementById('audioControl');
        
        audio.play().catch(e => console.log('🎵 自動再生失敗:', e));
        control.classList.add('playing');
        this.audioEnabled = true;
    }
    
    /**
     * サウンドエフェクト
     */
    playClickSound() {
        if (!this.audioEnabled) return;
        
        // Web Audio APIを使用したクリック音生成
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    playHoverSound() {
        if (!this.audioEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
    }
    
    /**
     * エピソードエフェクト
     */
    triggerEpisodeEffects(episodeNumber) {
        // エピソード固有のエフェクトを追加
        console.log(`✨ エピソード${episodeNumber}のエフェクトを開始`);
    }
    
    /**
     * キャラクターカードアニメーション
     */
    animateCharacterCards() {
        const cards = document.querySelectorAll('.character-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(50px)';
                card.style.transition = 'all 0.6s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 200);
        });
    }
    
    /**
     * セクションスクロール
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    scrollToNextSection() {
        const sections = document.querySelectorAll('.section');
        const current = Math.floor(window.pageYOffset / window.innerHeight);
        const next = Math.min(current + 1, sections.length - 1);
        
        sections[next].scrollIntoView({ behavior: 'smooth' });
    }
    
    scrollToPrevSection() {
        const sections = document.querySelectorAll('.section');
        const current = Math.floor(window.pageYOffset / window.innerHeight);
        const prev = Math.max(current - 1, 0);
        
        sections[prev].scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * 外部リンク
     */
    openStory() {
        // 花火エフェクト後にページを開く
        setTimeout(() => {
            window.open('https://ryochan.com/novel/ja/ep1/', '_blank');
        }, 1000);
    }
    
    joinCommunity() {
        // コミュニティページへのリンク（要設定）
        setTimeout(() => {
            window.open('#', '_blank'); // 実際のURLに変更
        }, 1000);
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 RYO-CHANの冒険ページが起動しました');
    new AdventurePage();
});

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('❌ エラーが発生しました:', e.error);
});

// パフォーマンス最適化
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        console.log('⚡ パフォーマンス最適化が完了しました');
    });
}
