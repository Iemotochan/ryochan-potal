/*
オーディオシステム（デバッグ強化版）
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

        // デバッグ情報を追加
        console.log('🎵 音楽ファイルのソース:', this.bgAudio.src);
        console.log('🎵 音楽ファイルの準備状態:', this.bgAudio.readyState);

        this.bgAudio.volume = this.musicVolume;
        this.bgAudio.loop = true;

        this.bgAudio.addEventListener('loadstart', () => {
            console.log('🎵 音楽ファイル読み込み開始');
        });

        this.bgAudio.addEventListener('canplaythrough', () => {
            console.log('🎵 音楽ファイル読み込み完了 - 再生可能');
        });

        this.bgAudio.addEventListener('loadeddata', () => {
            console.log('🎵 音楽データ読み込み完了');
        });

        this.bgAudio.addEventListener('error', (e) => {
            console.error('❌ 音楽ファイル読み込みエラー:', e);
            console.error('❌ エラー詳細:', this.bgAudio.error);
        });

        this.bgAudio.addEventListener('ended', () => {
            if (this.audioEnabled) {
                console.log('🔄 音楽終了 - ループ再生中');
                this.bgAudio.play().catch(e => console.log('再生エラー:', e));
            }
        });

        // ファイルパスの存在確認
        this.checkAudioFile();
    }

    // 音楽ファイルの存在確認
    async checkAudioFile() {
        try {
            const response = await fetch('./audio/countdown.m4a');
            if (response.ok) {
                console.log('✅ countdown.m4a ファイルが見つかりました');
            } else {
                console.error('❌ countdown.m4a ファイルが見つかりません (404)');
            }
        } catch (error) {
            console.error('❌ 音楽ファイル確認エラー:', error);
        }
    }

    async setupWebAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;

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
            console.log('🎵 オーディオ有効化を試行中...');

            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('🎛️ AudioContext を再開しました');
            }

            if (this.bgAudio) {
                console.log('🎵 音楽再生を開始中...');
                console.log('🎵 音楽ファイル準備状態:', this.bgAudio.readyState);
                
                await this.bgAudio.play();
                this.audioEnabled = true;
                console.log('✅ 音楽再生開始成功');
            }

            this.updateAudioControlVisual();
            this.onAudioEnabled();
        } catch (error) {
            console.error('❌ オーディオ開始失敗:', error);
            console.error('❌ エラー詳細:', error.message);
        }
    }

    disable() {
        if (!this.audioEnabled) return;

        if (this.bgAudio) {
            this.bgAudio.pause();
            console.log('⏸️ 音楽を一時停止しました');
        }

        this.stopAllSounds();
        this.audioEnabled = false;
        this.updateAudioControlVisual();
        console.log('🔇 オーディオ停止');
    }

    toggle() {
        console.log('🎵 オーディオトグル:', this.audioEnabled ? '停止' : '開始');
        if (this.audioEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    onAudioEnabled() {
        this.playWelcomeSound();
    }

    async playWelcomeSound() {
        if (!this.audioContext) return;

        try {
            const frequencies = [523.25, 659.25, 783.99];
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createTone(freq, 0.3, 0.8, 'sine');
                }, index * 150);
            });
            console.log('🎶 ウェルカムサウンド再生');
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

        const frequencies = [523.25, 659.25, 783.99, 1046.5];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.2, 0.4, 'sine');
            }, index * 80);
        });
    }

    playMagic() {
        if (!this.audioEnabled || !this.audioContext) return;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const freq = 200 + Math.random() * 800;
                this.createTone(freq, 0.3, 0.2, 'sawtooth');
            }, i * 50);
        }
    }

    // 残りのメソッドは前回と同じ...
    onSectionChange(sectionIndex) {
        this.currentSection = sectionIndex;
        if (!this.audioEnabled) return;

        switch(sectionIndex) {
            case 0:
                this.adjustMusicFilter('none');
                break;
            case 1:
                this.adjustMusicFilter('mysterious');
                break;
            case 2:
                this.adjustMusicFilter('digital');
                break;
            case 3:
                this.adjustMusicFilter('warm');
                break;
            case 4:
                this.adjustMusicFilter('epic');
                break;
        }
    }

    adjustMusicFilter(type) {
        if (!this.bgAudio || !this.audioContext) return;
        console.log(`🎵 音楽フィルター切り替え: ${type}`);
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

    getAudioInfo() {
        return {
            enabled: this.audioEnabled,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            currentSection: this.currentSection,
            audioContext: this.audioContext ? this.audioContext.state : 'not available',
            activeSounds: this.currentSounds.size,
            bgAudioSrc: this.bgAudio ? this.bgAudio.src : 'not found',
            bgAudioReadyState: this.bgAudio ? this.bgAudio.readyState : 'not found'
        };
    }
}

// グローバルインスタンス作成
window.audioSystem = new AudioSystem();

console.log('🎵 オーディオシステム完全初期化');
