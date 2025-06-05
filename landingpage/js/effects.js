/**
 * エフェクトシステム
 * 高度な視覚エフェクトとインタラクション
 */

class EffectsSystem {
    constructor() {
        this.fireworks = [];
        this.ripples = [];
        this.sparkles = [];
        this.isRunning = false;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupContainers();
        this.setupEventListeners();
        this.startRenderLoop();
        console.log('🎆 エフェクトシステム初期化完了');
    }
    
    setupContainers() {
        this.fireworksContainer = document.getElementById('fireworksContainer');
        this.rippleContainer = document.getElementById('rippleContainer');
        
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
    
    setupEventListeners() {
        // 特別な場所でのクリック時に追加エフェクト
        document.addEventListener('click', (e) => {
            const specialElements = e.target.closest('.cta-button, .character-card, .main-character');
            if (specialElements) {
                this.createSparklesBurst(e.clientX, e.clientY);
            }
        });
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
        
        // エフェクトの更新
        this.updateFireworks();
        this.updateRipples();
        this.updateSparkles();
        
        // 次のフレーム
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
        
        // クリーンアップ
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        // リップル配列に追加（アニメーション管理用）
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
        
        // パーティクル生成
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
        
        // サウンドエフェクト
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
        
        // 星形の作成
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
        
        // アニメーション
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
        
        // クリーンアップ
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
                // 花火終了 - パーティクルを削除
                firework.particles.forEach(particle => {
                    if (particle.element.parentNode) {
                        particle.element.parentNode.removeChild(particle.element);
                    }
                });
                return false;
            }
            
            // パーティクルを更新
            firework.particles = firework.particles.filter(particle => {
                const deltaTime = 16 / 1000; // 60fps想定
                
                // 物理演算
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.vy += particle.gravity * deltaTime;
                
                // 抵抗
                particle.vx *= 0.99;
                particle.vy *= 0.99;
                
                // 生命力減少
                particle.life -= particle.decay;
                
                if (particle.life <= 0) {
                    if (particle.element.parentNode) {
                        particle.element.parentNode.removeChild(particle.element);
                    }
                    return false;
                }
                
                // 位置とスタイルを更新
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
    
    createLightBeam(startX, startY, endX, endY, color = '#FFD700', duration = 1000) {
        const beam = document.createElement('div');
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        beam.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: ${distance}px;
            height: 4px;
            background: linear-gradient(90deg, ${color}, transparent);
            transform-origin: 0 50%;
            transform: rotate(${angle}deg);
            pointer-events: none;
            z-index: 998;
            box-shadow: 0 0 10px ${color};
        `;
        
        document.body.appendChild(beam);
        
        // アニメーション
        const animation = beam.animate([
            { opacity: 0, transform: `rotate(${angle}deg) scaleX(0)` },
            { opacity: 1, transform: `rotate(${angle}deg) scaleX(1)` },
            { opacity: 0, transform: `rotate(${angle}deg) scaleX(1)` }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            if (beam.parentNode) {
                beam.parentNode.removeChild(beam);
            }
        };
    }
    
    createFloatingText(x, y, text, color = '#FFD700', duration = 2000) {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        
        textElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-size: 24px;
            font-weight: bold;
            font-family: 'Yuji Syuku', serif;
            pointer-events: none;
            z-index: 1002;
            text-shadow: 0 0 10px ${color};
            white-space: nowrap;
        `;
        
        document.body.appendChild(textElement);
        
        // アニメーション
        const animation = textElement.animate([
            { 
                opacity: 0, 
                transform: 'translateY(0px) scale(0.5)' 
            },
            { 
                opacity: 1, 
                transform: 'translateY(-50px) scale(1)', 
                offset: 0.3 
            },
            { 
                opacity: 0, 
                transform: 'translateY(-100px) scale(0.8)' 
            }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
            }
        };
    }
    
    createPortal(x, y, size = 100, duration = 3000) {
        const portal = document.createElement('div');
        
        portal.style.cssText = `
            position: absolute;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: conic-gradient(
                from 0deg,
                #FFD700,
                #FF6B6B,
                #4ECDC4,
                #8A2BE2,
                #FFD700
            );
            pointer-events: none;
            z-index: 997;
            animation: portalSpin 2s linear infinite;
        `;
        
        // 内側のエフェクト
        const inner = document.createElement('div');
        inner.style.cssText = `
            position: absolute;
            top: 10%;
            left: 10%;
            width: 80%;
            height: 80%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0,0,0,0.8) 30%, transparent 70%);
        `;
        
        portal.appendChild(inner);
        document.body.appendChild(portal);
        
        // CSS アニメーション追加
        if (!document.getElementById('portalAnimation')) {
            const style = document.createElement('style');
            style.id = 'portalAnimation';
            style.textContent = `
                @keyframes portalSpin {
                    from { transform: rotate(0deg) scale(0); }
                    10% { transform: rotate(36deg) scale(1); }
                    90% { transform: rotate(324deg) scale(1); }
                    to { transform: rotate(360deg) scale(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // クリーンアップ
        setTimeout(() => {
            if (portal.parentNode) {
                portal.parentNode.removeChild(portal);
            }
        }, duration);
    }
    
    createEnergyWave(centerX, centerY, maxRadius = 300, color = '#FFD700', duration = 1500) {
        const wave = document.createElement('div');
        
        wave.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 0;
            height: 0;
            border: 3px solid ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 996;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px ${color};
        `;
        
        document.body.appendChild(wave);
        
        const animation = wave.animate([
            { 
                width: '0px', 
                height: '0px', 
                opacity: 1,
                borderWidth: '3px'
            },
            { 
                width: `${maxRadius * 2}px`, 
                height: `${maxRadius * 2}px`, 
                opacity: 0,
                borderWidth: '1px'
            }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        };
    }
    
    createScreenShake(intensity = 10, duration = 500) {
        const body = document.body;
        const originalTransform = body.style.transform;
        
        let startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                body.style.transform = originalTransform;
                return;
            }
            
            const currentIntensity = intensity * (1 - progress);
            const x = (Math.random() - 0.5) * currentIntensity;
            const y = (Math.random() - 0.5) * currentIntensity;
            
            body.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
            
            requestAnimationFrame(shake);
        };
        
        requestAnimationFrame(shake);
    }
    
    // パフォーマンス最適化
    optimizePerformance() {
        // 古いエフェクトを強制削除
        const now = Date.now();
        
        this.fireworks = this.fireworks.filter(firework => {
            return (now - firework.startTime) < 10000; // 10秒以上古いものは削除
        });
        
        this.ripples = this.ripples.filter(ripple => {
            return (now - ripple.startTime) < 5000; // 5秒以上古いものは削除
        });
        
        // DOM要素のクリーンアップ
        this.cleanupOrphanedElements();
    }
    
    cleanupOrphanedElements() {
        // 孤立したエフェクト要素を削除
        const orphanedRipples = this.rippleContainer.querySelectorAll('.ripple-effect');
        orphanedRipples.forEach(ripple => {
            if (Date.now() - parseInt(ripple.dataset.created || '0') > 5000) {
                ripple.remove();
            }
        });
    }
    
    // エフェクト設定
    setEffectIntensity(level) {
        // low, medium, high
        this.effectIntensity = level;
        
        switch(level) {
            case 'low':
                this.defaultParticleCount = 10;
                break;
            case 'medium':
                this.defaultParticleCount = 20;
                break;
            case 'high':
                this.defaultParticleCount = 30;
                break;
        }
    }
    
    // デバッグ情報
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
}, 30000); // 30秒ごとにクリーンアップ

console.log('🎆 エフェクトシステム完全初期化');
