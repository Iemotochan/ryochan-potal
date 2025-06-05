/**
 * アニメーションシステム
 * 高度なアニメーション制御とGolden Auraエフェクト
 */

class AnimationSystem {
    constructor() {
        this.goldenParticles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createParticleSystem();
        this.startAnimationLoop();
        console.log('✨ アニメーションシステム初期化完了');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('goldenAuraCanvas');
        if (!this.canvas) {
            console.warn('⚠️ Golden Aura Canvas が見つかりません');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // ハイDPI対応
        this.setupHighDPI();
    }
    
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // パーティクル数をスクリーンサイズに応じて調整
        const targetParticleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        this.adjustParticleCount(targetParticleCount);
    }
    
    createParticleSystem() {
        const particleCount = window.innerWidth <= 768 ? 30 : 60;
        
        for (let i = 0; i < particleCount; i++) {
            this.goldenParticles.push(new GoldenParticle(this.canvas));
        }
    }
    
    adjustParticleCount(targetCount) {
        const currentCount = this.goldenParticles.length;
        
        if (currentCount < targetCount) {
            // パーティクル追加
            for (let i = currentCount; i < targetCount; i++) {
                this.goldenParticles.push(new GoldenParticle(this.canvas));
            }
        } else if (currentCount > targetCount) {
            // パーティクル削除
            this.goldenParticles.splice(targetCount);
        }
    }
    
    startAnimationLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }
    
    stopAnimationLoop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isRunning || !this.ctx) return;
        
        // 高パフォーマンスのクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パーティクル更新・描画
        this.goldenParticles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });
        
        // 次フレーム予約
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    reduceParticles() {
        const newCount = Math.floor(this.goldenParticles.length * 0.5);
        this.goldenParticles.splice(newCount);
        console.log(`🚀 パフォーマンス向上のためパーティクル数を${newCount}に削減`);
    }
    
    resize() {
        if (this.canvas) {
            this.resizeCanvas();
            this.setupHighDPI();
        }
    }
}

/**
 * ゴールデンパーティクルクラス
 */
class GoldenParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        this.setupGradient();
    }
    
    reset() {
        if (!this.canvas) return;
        
        this.x = Math.random() * this.canvas.width;
        this.y = this.canvas.height + Math.random() * 100;
        
        // より自然な動きのための設定
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -Math.random() * 2.5 - 0.5;
        this.size = Math.random() * 4 + 1;
        this.maxSize = this.size;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.maxOpacity = this.opacity;
        this.life = 1.0;
        this.decay = Math.random() * 0.008 + 0.003;
        
        // 輝き効果用
        this.glowIntensity = Math.random() * 0.5 + 0.5;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
        
        // 回転
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }
    
    setupGradient() {
        // パーティクルごとの色バリエーション
        const goldVariations = [
            ['#FFD700', '#FFA500'],
            ['#FFEF94', '#FFD700'],
            ['#FFF8DC', '#F0E68C'],
            ['#FFE135', '#FFA500']
        ];
        
        this.colorSet = goldVariations[Math.floor(Math.random() * goldVariations.length)];
    }
    
    update() {
        // 位置更新
        this.x += this.vx;
        this.y += this.vy;
        
        // 重力と抵抗
        this.vy += 0.01; // 軽い重力
        this.vx *= 0.999; // 空気抵抗
        
        // 生命力減少
        this.life -= this.decay;
        
        // サイズとオパシティの更新
        this.size = this.maxSize * this.life;
        this.opacity = this.maxOpacity * this.life;
        
        // 輝きの脈動
        this.pulsePhase += this.pulseSpeed;
        this.glowIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3;
        
        // 回転
        this.rotation += this.rotationSpeed;
        
        // 画面外または消滅時にリセット
        if (this.life <= 0 || this.y < -50 || this.x < -50 || this.x > this.canvas.width + 50) {
            this.reset();
        }
    }
    
    draw(ctx) {
        if (!ctx || this.opacity <= 0) return;
        
        ctx.save();
        
        // 透明度設定
        ctx.globalAlpha = this.opacity * this.glowIntensity;
        
        // 位置移動と回転
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // グラデーション作成
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
        gradient.addColorStop(0, this.colorSet[0]);
        gradient.addColorStop(0.3, this.colorSet[1]);
        gradient.addColorStop(0.7, this.colorSet[1] + '80'); // 透明度追加
        gradient.addColorStop(1, 'transparent');
        
        // 外側のグロー
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 内側のコア
        ctx.globalAlpha = this.opacity;
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.3, this.colorSet[0]);
        coreGradient.addColorStop(1, this.colorSet[1]);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // キラキラ効果
        if (Math.random() > 0.95) {
            this.drawSparkle(ctx);
        }
        
        ctx.restore();
    }
    
    drawSparkle(ctx) {
        const sparkleSize = this.size * 0.5;
        
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.8;
        ctx.fillStyle = '#FFFFFF';
        
        // 十字の形のキラキラ
        ctx.fillRect(-sparkleSize * 2, -sparkleSize * 0.2, sparkleSize * 4, sparkleSize * 0.4);
        ctx.fillRect(-sparkleSize * 0.2, -sparkleSize * 2, sparkleSize * 0.4, sparkleSize * 4);
        
        ctx.restore();
    }
}

/**
 * テキストアニメーションクラス
 */
class TextAnimations {
    static typeWriter(element, text, speed = 50, callback = null) {
        if (!element) return;
        
        element.textContent = '';
        element.style.borderRight = '2px solid var(--primary-gold)';
        
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                setTimeout(() => {
                    element.style.borderRight = 'none';
                    if (callback) callback();
                }, 1000);
            }
        }, speed);
        
        return timer;
    }
    
    static fadeInUp(element, delay = 0, duration = 600) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }
    
    static slideIn(element, direction = 'left', delay = 0, duration = 600) {
        if (!element) return;
        
        const transforms = {
            left: 'translateX(-100px)',
            right: 'translateX(100px)',
            up: 'translateY(-100px)',
            down: 'translateY(100px)'
        };
        
        element.style.opacity = '0';
        element.style.transform = transforms[direction];
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translate(0, 0)';
        }, delay);
    }
    
    static morphText(element, newText, duration = 800) {
        if (!element) return;
        
        const originalText = element.textContent;
        const maxLength = Math.max(originalText.length, newText.length);
        
        let frame = 0;
        const totalFrames = duration / 16; // 60fps想定
        
        const animate = () => {
            let scrambledText = '';
            const progress = frame / totalFrames;
            
            for (let i = 0; i < maxLength; i++) {
                if (progress * maxLength > i) {
                    scrambledText += newText[i] || '';
                } else {
                    // ランダム文字でスクランブル効果
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZあいうえおかきくけこ01010101';
                    scrambledText += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            
            element.textContent = scrambledText;
            frame++;
            
            if (frame <= totalFrames) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = newText;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    static glowPulse(element, intensity = 1) {
        if (!element) return;
        
        const animation = element.animate([
            { textShadow: `0 0 5px rgba(255, 215, 0, ${0.5 * intensity})` },
            { textShadow: `0 0 20px rgba(255, 215, 0, ${1 * intensity})` },
            { textShadow: `0 0 5px rgba(255, 215, 0, ${0.5 * intensity})` }
        ], {
            duration: 2000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
        
        return animation;
    }
}

/**
 * 3Dアニメーションクラス
 */
class Transform3D {
    static flipCard(element, direction = 'horizontal') {
        if (!element) return;
        
        const axis = direction === 'horizontal' ? 'Y' : 'X';
        
        element.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.transform = `rotate${axis}(180deg)`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.transform = `rotate${axis}(0deg)`;
                setTimeout(resolve, 600);
            }, 300);
        });
    }
    
    static float(element, amplitude = 20, duration = 3000) {
        if (!element) return;
        
        const animation = element.animate([
            { transform: 'translateY(0px
