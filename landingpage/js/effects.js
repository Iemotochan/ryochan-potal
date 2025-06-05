/**
 * エフェクトシステム - 桜と金色エフェクト完全版
 */

class EffectsSystem {
    constructor() {
        this.fireworks = [];
        this.ripples = [];
        this.sparkles = [];
        this.sakuraPetals = [];
        this.goldenSparks = [];
        this.isRunning = false;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupContainers();
        this.setupEventListeners();
        this.startRenderLoop();
        this.initializeNatureEffects();
        console.log('🎆🌸 エフェクトシステム初期化完了');
    }
    
    setupContainers() {
        this.fireworksContainer = document.getElementById('fireworksContainer');
        this.rippleContainer = document.getElementById('rippleContainer');
        this.sakuraContainer = document.getElementById('sakuraContainer');
        this.goldenSparksContainer = document.getElementById('goldenSparksContainer');
        
        if (!this.fireworksContainer) {
            this.fireworksContainer = document.createElement('div');
            this.fireworksContainer.id = 'fireworksContainer';
            this.fireworksContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 1000;
                overflow: hidden;
            `;
            document.body.appendChild(this.fireworksContainer);
        }
        
        if (!this.rippleContainer) {
            this.rippleContainer = document.createElement('div');
            this.rippleContainer.id = 'rippleContainer';
            this.rippleContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 999;
                overflow: hidden;
            `;
            document.body.appendChild(this.rippleContainer);
        }
    }
    
    /**
     * 自然エフェクトの初期化
     */
    initializeNatureEffects() {
        this.startSakuraEffect();
        this.startGoldenSparksEffect();
    }
    
    /**
     * 桜の花びらエフェクト開始
     */
    startSakuraEffect() {
        if (!this.sakuraContainer) return;
        
        const createSakuraPetal = () => {
            const petal = document.createElement('div');
            petal.className = 'sakura-petal';
            
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.top = '-20px';
            
            const size = 8 + Math.random() * 8;
            petal.style.width = size + 'px';
            petal.style.height = size + 'px';
            
            const duration = 8 + Math.random() * 12;
            petal.style.animationDuration = duration + 's';
            
            petal.style.animationDelay = Math.random() * 2 + 's';
            
            this.sakuraContainer.appendChild(petal);
            
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.parentNode.removeChild(petal);
                }
            }, (duration + 2) * 1000);
        };
        
        setInterval(createSakuraPetal, 2000);
        
        for (let i = 0; i < 5; i++) {
            setTimeout(createSakuraPetal, i * 400);
        }
    }
    
    /**
     * 金色の火の粉エフェクト開始
     */
    startGoldenSparksEffect() {
        if (!this.goldenSparksContainer) return;
        
        const createGoldenSpark = () => {
            const spark = document.createElement('div');
            spark.className = 'golden-spark';
            
            const sparkType = Math.random();
            if (sparkType > 0.8) {
                spark.classList.add('bright');
            } else if (sparkType < 0.3) {
                spark.classList.add('dim');
            }
            
            spark.style.left = Math.random() * 100 + 'vw';
            spark.style.bottom = '-10px';
            
            const size = 2 + Math.random() * 6;
            spark.style.width = size + 'px';
            spark.style.height = size + 'px';
            
            const duration = 6 + Math.random() * 8;
            spark.style.animationDuration = duration + 's';
            
            spark.style.animationDelay = Math.random() * 1 + 's';
            
            this.goldenSparksContainer.appendChild(spark);
            
            setTimeout(() => {
                if (spark.parentNode) {
                    spark.parentNode.removeChild(spark);
                }
            }, (duration + 1) * 1000);
        };
        
        setInterval(createGoldenSpark, 800);
        
        for (let i = 0; i < 8; i++) {
            setTimeout(createGoldenSpark, i * 200);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const specialElements = e.target.closest('.cta-button, .character-card, .main-title');
            if (specialElements) {
                this.createSparklesBurst(e.clientX, e.clientY);
                this.createSpecialSakuraBurst(e.clientX, e.clientY);
            }
        });
    }
    
    /**
     * 特別な桜の花びら爆発
     */
    createSpecialSakuraBurst(x, y) {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.className = 'sakura-petal';
                petal.style.position = 'fixed';
                petal.style.left = x + 'px';
                petal.style.top = y + 'px';
                petal.style.width = '10px';
                petal.style.height = '10px';
                petal.style.zIndex = '1001';
                
                document.body.appendChild(petal);
                
                const angle = (Math.PI * 2 * i) / 10;
                const velocity = 50 + Math.random() * 100;
                let posX = x;
                let posY = y;
                let vx = Math.cos(angle) * velocity;
                let vy = Math.sin(angle) * velocity;
                let life = 1.0;
                
                const animatePetal = () => {
                    posX += vx * 0.02;
                    posY += vy * 0.02;
                    vy += 30 * 0.02;
                    vx *= 0.99;
                    life -= 0.01;
                    
                    petal.style.left = posX + 'px';
                    petal.style.top = posY + 'px';
                    petal.style.opacity = life;
                    petal.style.transform = `rotate(${(1 - life) * 360}deg)`;
                    
                    if (life > 0) {
                        requestAnimationFrame(animatePetal);
                    } else {
                        if (petal.parentNode) {
                            petal.parentNode.removeChild(petal);
                        }
                    }
                };
                
                requestAnimationFrame(animatePetal);
            }, i * 50);
        }
    }
    
    startRenderLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.render();
    }
    
    stopRenderLoop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    render() {
        if (!this.isRunning) return;
        
        this.updateFireworks();
        this.updateRipples();
        this.updateSparkles();
        
        this.animationId = requestAnimationFrame(() => this.render());
    }
    
    createRipple(x, y, color = 'rgba(255, 215, 0, 0.6)', size = 100) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        ripple.style.cssText = `
            position: absolute;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            pointer-events: none;
            animation: rippleExpand 0.6s ease-out forwards;
        `;
        
        this.rippleContainer.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        this.ripples.push({
            element: ripple,
            startTime: Date.now(),
            duration: 600
        });
    }
    
    createFirework(x, y, colors = null, particleCount = 20) {
        if (!colors) {
            colors = [
                '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
                '#FFA500', '#FF1493', '#00BFFF', '#9370DB'
            ];
        }
        
        const firework = {
            x: x,
            y: y,
            particles: [],
            startTime: Date.now(),
            duration: 2000
        };
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 50 + Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                box-shadow: 0 0 10px ${color};
            `;
            
            this.fireworksContainer.appendChild(particle);
            
            firework.particles.push({
                element: particle,
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.01,
                gravity: 50,
                color: color
            });
        }
        
        this.fireworks.push(firework);
        
        if (window.audioSystem && window.audioSystem.audioEnabled) {
            setTimeout(() => window.audioSystem.playMagic(), 100);
        }
    }
    
    createSparklesBurst(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createSparkle(
                    x + (Math.random() - 0.5) * 100,
                    y + (Math.random() - 0.5) * 100
                );
            }, i * 50);
        }
    }
    
    createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 12px;
            height: 12px;
            background: white;
            pointer-events: none;
            z-index: 1001;
        `;
        
        sparkle.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 12px;
                height: 2px;
                background: linear-gradient(90deg, transparent, white, transparent);
                transform: translate(-50%, -50%);
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 2px;
                height: 12px;
                background: linear-gradient(0deg, transparent, white, transparent);
                transform: translate(-50%, -50%);
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 2px;
                background: linear-gradient(90deg, transparent, white, transparent);
                transform: translate(-50%, -50%) rotate(45deg);
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 2px;
                height: 8px;
                background: linear-gradient(0deg, transparent, white, transparent);
                transform: translate(-50%, -50%) rotate(45deg);
            "></div>
        `;
        
        document.body.appendChild(sparkle);
        
        const animation = sparkle.animate([
            { 
                opacity: 0, 
                transform: 'scale(0) rotate(0deg)' 
            },
            { 
                opacity: 1, 
                transform: 'scale(1) rotate(180deg)' 
            },
            { 
                opacity: 0, 
                transform: 'scale(0) rotate(360deg)' 
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        };
        
        this.sparkles.push({
            element: sparkle,
            animation: animation,
            startTime: Date.now()
        });
    }
    
    updateFireworks() {
        this.fireworks = this.fireworks.filter(firework => {
            const elapsed = Date.now() - firework.startTime;
            const progress = elapsed / firework.duration;
            
            if (progress >= 1) {
                firework.particles.forEach(particle => {
                    if (particle.element.parentNode) {
                        particle.element.parentNode.removeChild(particle.element);
                    }
                });
                return false;
            }
            
            firework.particles = firework.particles.filter(particle => {
                const deltaTime = 16 / 1000;
                
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.vy += particle.gravity * deltaTime;
                
                particle.vx *= 0.99;
                particle.vy *= 0.99;
                
                particle.life -= particle.decay;
                
                if (particle.life <= 0) {
                    if (particle.element.parentNode) {
                        particle.element.parentNode.removeChild(particle.element);
                    }
                    return false;
                }
                
                particle.element.style.left = `${particle.x}px`;
                particle.element.style.top = `${particle.y}px`;
                particle.element.style.opacity = particle.life;
                particle.element.style.transform = `scale(${particle.life})`;
                
                return true;
            });
            
            return firework.particles.length > 0;
        });
    }
    
    updateRipples() {
        this.ripples = this.ripples.filter(ripple => {
            const elapsed = Date.now() - ripple.startTime;
            return elapsed < ripple.duration;
        });
    }
    
    updateSparkles() {
        this.sparkles = this.sparkles.filter(sparkle => {
            if (sparkle.animation.playState === 'finished') {
                return false;
            }
            return true;
        });
    }
    
    optimizePerformance() {
        const now = Date.now();
        
        this.fireworks = this.fireworks.filter(firework => {
            return (now - firework.startTime) < 10000;
        });
        
        this.ripples = this.ripples.filter(ripple => {
            return (now - ripple.startTime) < 5000;
        });
        
        this.cleanupOrphanedElements();
    }
    
    cleanupOrphanedElements() {
        const orphanedRipples = this.rippleContainer.querySelectorAll('.ripple-effect');
        orphanedRipples.forEach(ripple => {
            if (Date.now() - parseInt(ripple.dataset.created || '0') > 5000) {
                ripple.remove();
            }
        });
    }
    
    getEffectInfo() {
        return {
            activeFireworks: this.fireworks.length,
            activeRipples: this.ripples.length,
            activeSparkles: this.sparkles.length,
            isRunning: this.isRunning
        };
    }
}

// グローバルインスタンス作成
window.effectsSystem = new EffectsSystem();

// パフォーマンス監視
setInterval(() => {
    if (window.effectsSystem) {
        window.effectsSystem.optimizePerformance();
    }
}, 30000);

console.log('🎆🌸 エフェクトシステム完全初期化（桜&金色火の粉付き）');
