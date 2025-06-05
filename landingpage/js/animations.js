/**
 * アニメーションシステム
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
        
        const targetParticleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        this.adjustParticleCount(targetParticleCount);
    }
    
    createParticleSystem() {
        const particleCount = window.innerWidth <= 768 ? 15 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            this.goldenParticles.push(new GoldenParticle(this.canvas));
        }
    }
    
    adjustParticleCount(targetCount) {
        const currentCount = this.goldenParticles.length;
        
        if (currentCount < targetCount) {
            for (let i = currentCount; i < targetCount; i++) {
                this.goldenParticles.push(new GoldenParticle(this.canvas));
            }
        } else if (currentCount > targetCount) {
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
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.goldenParticles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });
        
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
        this.y = this.canvas.height + 50;
        
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -Math.random() * 2.5 - 0.5;
        this.size = Math.random() * 3 + 1;
        this.maxSize = this.size;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.maxOpacity = this.opacity;
        this.life = 1.0;
        this.decay = Math.random() * 0.008 + 0.003;
        
        this.glowIntensity = Math.random() * 0.5 + 0.5;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
        
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }
    
    setupGradient() {
        const goldVariations = [
            ['#FFD700', '#FFA500'],
            ['#FFEF94', '#FFD700'],
            ['#FFF8DC', '#F0E68C'],
            ['#FFE135', '#FFA500']
        ];
        
        this.colorSet = goldVariations[Math.floor(Math.random() * goldVariations.length)];
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        this.vy += 0.01;
        this.vx *= 0.999;
        
        this.life -= this.decay;
        
        this.size = this.maxSize * this.life;
        this.opacity = this.maxOpacity * this.life;
        
        this.pulsePhase += this.pulseSpeed;
        this.glowIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3;
        
        this.rotation += this.rotationSpeed;
        
        if (this.life <= 0 || this.y < -50 || this.x < -50 || this.x > this.canvas.width + 50) {
            this.reset();
        }
    }
    
    draw(ctx) {
        if (!ctx || this.opacity <= 0) return;
        
        ctx.save();
        
        ctx.globalAlpha = this.opacity * this.glowIntensity;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
        gradient.addColorStop(0, this.colorSet[0]);
        gradient.addColorStop(0.3, this.colorSet[1]);
        gradient.addColorStop(0.7, this.colorSet[1] + '80');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = this.opacity;
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.3, this.colorSet[0]);
        coreGradient.addColorStop(1, this.colorSet[1]);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
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
        
        ctx.fillRect(-sparkleSize * 2, -sparkleSize * 0.2, sparkleSize * 4, sparkleSize * 0.4);
        ctx.fillRect(-sparkleSize * 0.2, -sparkleSize * 2, sparkleSize * 0.4, sparkleSize * 4);
        
        ctx.restore();
    }
}

// グローバルインスタンス作成
window.goldenAuraSystem = new AnimationSystem();

// リサイズイベント
window.addEventListener('resize', () => {
    if (window.goldenAuraSystem) {
        window.goldenAuraSystem.resize();
    }
});

console.log('✨ アニメーションシステム完全初期化');
