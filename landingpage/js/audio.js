/**
 * オーディオシステム
 * 高品質なサウンド体験の提供
 */

class AudioSystem {
    constructor() {
        this.bgAudio = null;
        this.audioContext = null;
        this.audioEnabled = false;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.5;
        this.musicVolume = 0.6;
        this.currentSection = 0;
        
        this.soundBuffers = new Map();
        this.currentSounds = new Map();
        
        this.init();
    }
    
    async init() {
        try {
            this.setupBackgroundAudio();
            this.setupWebAudio();
            this.setupAudioControl();
            console.log('🎵 オーディオシステム初期化完了');
        } catch (error) {
            console.warn('⚠️ オーディオ初期化エラー:', error);
        }
    }
    
    setupBackgroundAudio() {
        this.bgAudio = document.getElementById('bgAudio');
        if (!this.bgAudio) {
            console.warn('⚠️ 背景音楽要素が見つかりません');
            return;
        }
        
        this.bgAudio.volume = this.musicVolume;
        this.bgAudio.loop = true;
        
        // オーディオイベントリスナー
        this.bgAudio.addEventListener('loadstart', () => {
            console.log('🎵 音楽ファイル読み込み開始');
        });
        
        this.bgAudio.addEventListener('canplaythrough', () => {
            console.log('🎵 音楽ファイル読み込み完了');
        });
        
        this.bgAudio.addEventListener('error', (e) => {
            console.error('❌ 音楽ファイル読み込みエラー:', e);
        });
        
        this.bgAudio.addEventListener('ended', () => {
            if (this.audioEnabled) {
                this.bgAudio.play().catch(e => console.log('再生エラー:', e));
            }
        });
    }
    
    async setupWebAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // マスターゲインノード
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            // エフェクト用のゲインノード
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.sfxVolume;
            
            console.log('🎛️ Web Audio API 初期化完了');
        } catch (error) {
            console.warn('⚠️ Web Audio API 初期化失敗:', error);
        }
    }
    
    setupAudioControl() {
        this.audioControl = document.getElementById('audioControl');
        if (!this.audioControl) return;
        
        this.updateAudioControlVisual();
    }
    
    updateAudioControlVisual() {
        if (!this.audioControl) return;
        
        if (this.audioEnabled) {
            this.audioControl.classList.add('playing');
        } else {
            this.audioControl.classList.remove('playing');
        }
    }
    
    async enable() {
        if (this.audioEnabled) return;
        
        try {
            // Web Audio Context のレジューム
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // 背景音楽開始
            if (this.bgAudio) {
                await this.bgAudio.play();
                this.audioEnabled = true;
                console.log('🎵 オーディオ開始');
            }
            
            this.updateAudioControlVisual();
            this.onAudioEnabled();
            
        } catch (error) {
            console.warn('⚠️ オーディオ開始失敗:', error);
        }
    }
    
    disable() {
        if (!this.audioEnabled) return;
        
        if (this.bgAudio) {
            this.bgAudio.pause();
        }
        
        // 全てのサウンドエフェクトを停止
        this.stopAllSounds();
        
        this.audioEnabled = false;
        this.updateAudioControlVisual();
        console.log('🔇 オーディオ停止');
    }
    
    toggle() {
        if (this.audioEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    onAudioEnabled() {
        // オーディオ有効化時の特別なエフェクト
        this.playWelcomeSound();
    }
    
    async playWelcomeSound() {
        if (!this.audioContext) return;
        
        try {
            // 美しい和音でウェルカムサウンド
            const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createTone(freq, 0.3, 0.8, 'sine');
                }, index * 150);
            });
        } catch (error) {
            console.warn('⚠️ ウェルカムサウンド再生失敗:', error);
        }
    }
    
    createTone(frequency, duration, volume = 0.5, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        // エンベロープ（音の立ち上がりと減衰）
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        return oscillator;
    }
    
    playClick() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // 複層的なクリック音
        this.createTone(800, 0.08, 0.3, 'square');
        setTimeout(() => {
            this.createTone(1200, 0.05, 0.2, 'sine');
        }, 20);
    }
    
    playHover() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        this.createTone(600, 0.1, 0.15, 'triangle');
    }
    
    playSuccess() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // 成功音（上昇する音程）
        const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5-C6
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.2, 0.4, 'sine');
            }, index * 80);
        });
    }
    
    playMagic() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // 魔法的なサウンド
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const freq = 200 + Math.random() * 800;
                this.createTone(freq, 0.3, 0.2, 'sawtooth');
            }, i * 50);
        }
    }
    
    playError() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // エラー音（下降する音程）
        const frequencies = [400, 350, 300, 250];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.15, 0.3, 'square');
            }, index * 60);
        });
    }
    
    playWind() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // 風の音のシミュレーション
        const bufferSize = this.audioContext.sampleRate * 2; // 2秒
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1; // ホワイトノイズ
        }
        
        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        
        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 300; // 低い周波数のみ通す
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start();
        source.stop(this.audioContext.currentTime + 2);
    }
    
    createAmbientPad(frequency, duration = 5) {
        if (!this.audioEnabled || !this.audioContext) return;
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator1.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(frequency * 1.01, this.audioContext.currentTime); // わずかなデチューン
        
        oscillator1.type = 'sawtooth';
        oscillator2.type = 'sawtooth';
        
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 2;
        filter.Q.value = 1;
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(this.sfxGain);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 1);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator1.stop(now + duration);
        oscillator2.stop(now + duration);
    }
    
    onSectionChange(sectionIndex) {
        this.currentSection = sectionIndex;
        
        if (!this.audioEnabled) return;
        
        // セクションに応じた音楽的な変化
        switch(sectionIndex) {
            case 0: // タイトル
                this.adjustMusicFilter('none');
                break;
            case 1: // エピソード1
                this.adjustMusicFilter('mysterious');
                this.playAmbientForSection('shrine');
                break;
            case 2: // エピソード2
                this.adjustMusicFilter('digital');
                this.playAmbientForSection('city');
                break;
            case 3: // キャラクター
                this.adjustMusicFilter('warm');
                break;
            case 4: // 最終
                this.adjustMusicFilter('epic');
                break;
        }
    }
    
    adjustMusicFilter(type) {
        if (!this.bgAudio || !this.audioContext) return;
        
        // 将来的な実装: 音楽にリアルタイムフィルターを適用
        console.log(`🎵 音楽フィルター切り替え: ${type}`);
    }
    
    playAmbientForSection(type) {
        switch(type) {
            case 'shrine':
                // 神社の雰囲気（低い音）
                this.createAmbientPad(110, 8); // A2
                setTimeout(() => this.playWind(), 2000);
                break;
            case 'city':
                // 都市の雰囲気（電子音）
                this.createDigitalAmbient();
                break;
        }
    }
    
    createDigitalAmbient() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // デジタル音の生成
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const freq = [220, 330, 440][i]; // A3, E4, A4
                this.createTone(freq, 0.5, 0.1, 'square');
            }, i * 1000);
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.bgAudio) {
            this.bgAudio.volume = this.musicVolume;
        }
    }
    
    stopAllSounds() {
        this.currentSounds.forEach(sound => {
            if (sound.stop) {
                sound.stop();
            }
        });
        this.currentSounds.clear();
    }
    
    fadeOut(duration = 1000) {
        if (!this.bgAudio) return;
        
        const startVolume = this.bgAudio.volume;
        const fadeInterval = 50;
        const steps = duration / fadeInterval;
        const volumeStep = startVolume / steps;
        
        const fade = setInterval(() => {
            if (this.bgAudio.volume > volumeStep) {
                this.bgAudio.volume -= volumeStep;
            } else {
                this.bgAudio.volume = 0;
                this.bgAudio.pause();
                clearInterval(fade);
            }
        }, fadeInterval);
    }
    
    fadeIn(duration = 1000) {
        if (!this.bgAudio) return;
        
        const targetVolume = this.musicVolume;
        this.bgAudio.volume = 0;
        
        if (this.bgAudio.paused) {
            this.bgAudio.play().catch(e => console.log('再生エラー:', e));
        }
        
        const fadeInterval = 50;
        const steps = duration / fadeInterval;
        const volumeStep = targetVolume / steps;
        
        const fade = setInterval(() => {
            if (this.bgAudio.volume < targetVolume - volumeStep) {
                this.bgAudio.volume += volumeStep;
            } else {
                this.bgAudio.volume = targetVolume;
                clearInterval(fade);
            }
        }, fadeInterval);
    }
    
    // 3D音響効果（将来の拡張用）
    createSpatialAudio(x, y, sound) {
        if (!this.audioContext) return;
        
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 1;
        
        // 3D位置設定
        panner.positionX.setValueAtTime(x, this.audioContext.currentTime);
        panner.positionY.setValueAtTime(y, this.audioContext.currentTime);
        panner.positionZ.setValueAtTime(-1, this.audioContext.currentTime);
        
        return panner;
    }
    
    // エラーハンドリング
    handleAudioError(error) {
        console.error('🔊 オーディオエラー:', error);
        
        // フォールバック処理
        this.audioEnabled = false;
        this.updateAudioControlVisual();
        
        // ユーザーに通知（将来の実装）
        this.showAudioErrorNotification();
    }
    
    showAudioErrorNotification() {
        // 将来の実装: ユーザーフレンドリーな通知
        console.log('🔇 オーディオ機能が利用できません');
    }
    
    // デバッグ用
    getAudioInfo() {
        return {
            enabled: this.audioEnabled,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            currentSection: this.currentSection,
            audioContext: this.audioContext ? this.audioContext.state : 'not available',
            activeSounds: this.currentSounds.size
        };
    }
}

// グローバルインスタンス作成
window.audioSystem = new AudioSystem();

console.log('🎵 オーディオシステム完全初期化');
