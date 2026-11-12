/**
 * Motor de Síntesis de Audio Web Audio API - Dimetrodon "La Cabra"
 * Genera efectos de sonido de motor, bocina mandibular y carrera de carga.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.engineOsc = null;
        this.engineGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.init();
            this.playClick();
        } else {
            this.stopEngine();
        }
        return this.enabled;
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playRoar() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';

        osc1.frequency.setValueAtTime(110, now);
        osc1.frequency.linearRampToValueAtTime(145, now + 0.25);
        osc1.frequency.exponentialRampToValueAtTime(52, now + 1.1);

        osc2.frequency.setValueAtTime(82, now);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 1.1);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.15);
        osc2.stop(now + 1.15);
    }

    playRaceLoaderSound(durationSec = 1.6) {
        try {
            this.init();
            const now = this.ctx.currentTime;

            const oscBlue = this.ctx.createOscillator();
            const oscRed = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            oscBlue.type = 'triangle';
            oscRed.type = 'sawtooth';

            oscBlue.frequency.setValueAtTime(90, now);
            oscBlue.frequency.exponentialRampToValueAtTime(310, now + durationSec * 0.85);

            oscRed.frequency.setValueAtTime(60, now);
            oscRed.frequency.exponentialRampToValueAtTime(195, now + durationSec * 0.85);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.14, now + 0.12);
            gain.gain.setValueAtTime(0.14, now + durationSec * 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

            oscBlue.connect(gain);
            oscRed.connect(gain);
            gain.connect(this.ctx.destination);

            oscBlue.start(now);
            oscRed.start(now);
            oscBlue.stop(now + durationSec);
            oscRed.stop(now + durationSec);
        } catch (e) {}
    }

    playFinishChime() {
        try {
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            osc.frequency.setValueAtTime(783.99, now + 0.16);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.38);
        } catch (e) {}
    }

    playEngineMode(mode) {
        if (!this.enabled) return;
        this.init();
        this.stopEngine();

        const now = this.ctx.currentTime;
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();

        this.engineOsc.type = 'sawtooth';

        if (mode === 'idle') {
            this.engineOsc.frequency.setValueAtTime(55, now);
            this.engineGain.gain.setValueAtTime(0.08, now);
        } else if (mode === 'rev') {
            this.engineOsc.frequency.setValueAtTime(65, now);
            this.engineOsc.frequency.exponentialRampToValueAtTime(165, now + 0.8);
            this.engineGain.gain.setValueAtTime(0.14, now);
        } else if (mode === 'nitro') {
            this.engineOsc.frequency.setValueAtTime(95, now);
            this.engineOsc.frequency.exponentialRampToValueAtTime(290, now + 0.6);
            this.engineGain.gain.setValueAtTime(0.18, now);
        }

        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start(now);
    }

    stopEngine() {
        if (this.engineOsc) {
            try {
                this.engineOsc.stop();
                this.engineOsc.disconnect();
            } catch (e) {}
            this.engineOsc = null;
        }
    }
}

window.soundFX = new SoundEngine();
