import { SoundEffectType } from '@/types/motion';

// Global singleton AudioContext (lazy-initialized to obey browser autoplay rules)
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('Web Audio is only available in the browser.');
  }
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Sound effect catalog metadata
export interface SoundEffectMeta {
  type: SoundEffectType;
  label: string;
  category: 'motion' | 'ui' | 'impact' | 'ambient';
  duration: number; // in seconds
  description: string;
}

export const SOUND_EFFECTS_CATALOG: SoundEffectMeta[] = [
  {
    type: 'whoosh',
    label: 'Whoosh',
    category: 'motion',
    duration: 0.45,
    description: 'Dynamic air swoosh for fast motion, zooms, and wipes',
  },
  {
    type: 'click',
    label: 'Click',
    category: 'ui',
    duration: 0.05,
    description: 'Crisp mechanical tap for buttons, toggles, and switches',
  },
  {
    type: 'jump',
    label: 'Jump',
    category: 'motion',
    duration: 0.35,
    description: 'Playful bouncy pitch slide for pops, springs, and hops',
  },
  {
    type: 'fade',
    label: 'Fade & Swell',
    category: 'ambient',
    duration: 1.2,
    description: 'Smooth harmonic pad swell for scene ins and outs',
  },
  {
    type: 'grow',
    label: 'Grow & Rise',
    category: 'motion',
    duration: 0.6,
    description: 'Harmonic rising power-up for scaling up elements',
  },
  {
    type: 'pop',
    label: 'Pop',
    category: 'ui',
    duration: 0.09,
    description: 'Snappy bubble pop for spawns, pills, and badges',
  },
  {
    type: 'chime',
    label: 'Chime',
    category: 'ui',
    duration: 0.85,
    description: 'Clear metallic bell chime for success and toasts',
  },
  {
    type: 'impact',
    label: 'Impact',
    category: 'impact',
    duration: 0.65,
    description: 'Cinematic sub-bass thud for heavy arrivals and slams',
  },
  {
    type: 'laser',
    label: 'Laser',
    category: 'motion',
    duration: 0.25,
    description: 'Sci-fi energy beam sweep for laser paths and crosshairs',
  },
  {
    type: 'swish',
    label: 'Swish',
    category: 'motion',
    duration: 0.22,
    description: 'Fast crisp whip for snappy typography and micro-moves',
  },
];

// Cache for decoded custom audio buffers
const customAudioCache = new Map<string, AudioBuffer>();

/**
 * Procedurally synthesizes a sound effect using Web Audio API nodes.
 * @param type Sound effect name
 * @param volume 0 to 100
 * @param pitch 0.5 to 2.0 (1.0 = normal)
 * @param destination Optional specific AudioNode to route into (e.g. for video recording)
 */
export function playSoundEffect(
  type: SoundEffectType,
  volume = 80,
  pitch = 1.0,
  destination?: AudioNode
): { stop: () => void } {
  try {
    const ctx = getAudioContext();
    const dest = destination || ctx.destination;
    const now = ctx.currentTime;
    const gainVal = Math.max(0, Math.min(1.5, (volume / 100) * 0.9));
    const safePitch = Math.max(0.2, Math.min(4.0, pitch || 1.0));

    // Master gain for this specific playback instance
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(gainVal, now);
    masterGain.connect(dest);

    const activeNodes: (AudioScheduledSourceNode | AudioNode)[] = [masterGain];

    switch (type) {
      case 'whoosh': {
        // Air swoosh: Bandpass-filtered white noise with dynamic sweep + sub punch
        const duration = 0.45 / safePitch;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(2.8, now);
        // Sweep frequency up then down
        const midTime = now + duration * 0.38;
        filter.frequency.setValueAtTime(280 * safePitch, now);
        filter.frequency.exponentialRampToValueAtTime(1750 * safePitch, midTime);
        filter.frequency.exponentialRampToValueAtTime(220 * safePitch, now + duration);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.exponentialRampToValueAtTime(1.0, midTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);

        // Low-end rumble body
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120 * safePitch, now);
        sub.frequency.exponentialRampToValueAtTime(45 * safePitch, now + duration);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.35, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        sub.connect(subGain);
        subGain.connect(masterGain);

        noise.start(now);
        sub.start(now);
        noise.stop(now + duration);
        sub.stop(now + duration);
        activeNodes.push(noise, sub);
        break;
      }

      case 'click': {
        // Crisp tactile UI click: 4kHz highpass transient burst + 1.4kHz ping
        const duration = 0.045;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400 * safePitch, now);
        osc.frequency.exponentialRampToValueAtTime(300 * safePitch, now + duration);

        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(1.0, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(clickGain);
        clickGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
        activeNodes.push(osc);
        break;
      }

      case 'jump': {
        // Playful cartoon spring / jump: Rising pitch slide from 160Hz to 620Hz
        const duration = 0.35 / safePitch;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160 * safePitch, now);
        osc.frequency.exponentialRampToValueAtTime(620 * safePitch, now + duration * 0.85);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.1, now);
        oscGain.gain.linearRampToValueAtTime(0.9, now + 0.04);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
        activeNodes.push(osc);
        break;
      }

      case 'fade': {
        // Warm ambient swell / chord pad: C4 + G4 + C5 harmonic swell
        const duration = 1.25 / safePitch;
        const freqs = [261.63, 392.0, 523.25];
        const fadeGain = ctx.createGain();
        fadeGain.gain.setValueAtTime(0.001, now);
        fadeGain.gain.linearRampToValueAtTime(0.7, now + duration * 0.4);
        fadeGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(750 * safePitch, now);

        fadeGain.connect(lpf);
        lpf.connect(masterGain);

        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f * safePitch, now);
          osc.connect(fadeGain);
          osc.start(now);
          osc.stop(now + duration);
          activeNodes.push(osc);
        });
        break;
      }

      case 'grow': {
        // Power-up harmonic rise: Ascending frequency from 220Hz to 880Hz with resonant filter opening
        const duration = 0.55 / safePitch;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220 * safePitch, now);
        osc.frequency.exponentialRampToValueAtTime(880 * safePitch, now + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(5.0, now);
        filter.frequency.setValueAtTime(400 * safePitch, now);
        filter.frequency.exponentialRampToValueAtTime(3200 * safePitch, now + duration);

        const growGain = ctx.createGain();
        growGain.gain.setValueAtTime(0.01, now);
        growGain.gain.linearRampToValueAtTime(0.75, now + 0.08);
        growGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(growGain);
        growGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
        activeNodes.push(osc);
        break;
      }

      case 'pop': {
        // Snappy bubble pop: Rapid pitch drop 950Hz to 110Hz in 50ms
        const duration = 0.08;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950 * safePitch, now);
        osc.frequency.exponentialRampToValueAtTime(110 * safePitch, now + duration);

        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.9, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(popGain);
        popGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
        activeNodes.push(osc);
        break;
      }

      case 'chime': {
        // Metallic bell chime: 880Hz, 1760Hz, 2640Hz with ring decay
        const duration = 0.85 / safePitch;
        const partials = [
          { f: 880, g: 0.6, d: duration },
          { f: 1760, g: 0.35, d: duration * 0.75 },
          { f: 2793, g: 0.2, d: duration * 0.5 },
        ];

        partials.forEach((p) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.f * safePitch, now);

          const pGain = ctx.createGain();
          pGain.gain.setValueAtTime(p.g, now);
          pGain.gain.exponentialRampToValueAtTime(0.0001, now + p.d);

          osc.connect(pGain);
          pGain.connect(masterGain);

          osc.start(now);
          osc.stop(now + p.d);
          activeNodes.push(osc);
        });
        break;
      }

      case 'impact': {
        // Heavy cinematic sub-bass thud & slam
        const duration = 0.65;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 * safePitch, now);
        osc.frequency.exponentialRampToValueAtTime(32 * safePitch, now + duration * 0.7);

        const impGain = ctx.createGain();
        impGain.gain.setValueAtTime(1.0, now);
        impGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(impGain);
        impGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
        activeNodes.push(osc);
        break;
      }

      case 'laser': {
        // Sci-fi zap / laser sweep: 1800Hz to 120Hz fast sweep
        const duration = 0.22 / safePitch;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800 * safePitch, now);
        osc.frequency.exponentialRampToValueAtTime(120 * safePitch, now + duration);

        const lFilter = ctx.createBiquadFilter();
        lFilter.type = 'lowpass';
        lFilter.frequency.setValueAtTime(2800 * safePitch, now);
        lFilter.frequency.exponentialRampToValueAtTime(400 * safePitch, now + duration);

        const lGain = ctx.createGain();
        lGain.gain.setValueAtTime(0.8, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(lFilter);
        lFilter.connect(lGain);
        lGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
        activeNodes.push(osc);
        break;
      }

      case 'swish': {
        // Snappy short whip / swish for swift kinetic cuts
        const duration = 0.2 / safePitch;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.5, now);
        filter.frequency.setValueAtTime(600 * safePitch, now);
        filter.frequency.exponentialRampToValueAtTime(2400 * safePitch, now + duration * 0.4);
        filter.frequency.exponentialRampToValueAtTime(400 * safePitch, now + duration);

        const sGain = ctx.createGain();
        sGain.gain.setValueAtTime(0.01, now);
        sGain.gain.linearRampToValueAtTime(0.9, now + duration * 0.35);
        sGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.connect(filter);
        filter.connect(sGain);
        sGain.connect(masterGain);

        noise.start(now);
        noise.stop(now + duration);
        activeNodes.push(noise);
        break;
      }
    }

    return {
      stop: () => {
        try {
          masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
          masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
          setTimeout(() => {
            activeNodes.forEach((node) => {
              if ('stop' in node && typeof node.stop === 'function') {
                try {
                  node.stop();
                } catch {}
              }
              try {
                node.disconnect();
              } catch {}
            });
          }, 60);
        } catch {}
      },
    };
  } catch (err) {
    console.warn('Audio playback error:', err);
    return { stop: () => {} };
  }
}

/**
 * Plays custom uploaded audio (MP3/WAV/OGG)
 */
export async function playCustomAudio(
  dataUrl: string,
  volume = 80,
  pitch = 1.0,
  offsetSec = 0,
  loop = false,
  destination?: AudioNode
): Promise<{ stop: () => void }> {
  try {
    const ctx = getAudioContext();
    const dest = destination || ctx.destination;
    let audioBuffer = customAudioCache.get(dataUrl);

    if (!audioBuffer) {
      const res = await fetch(dataUrl);
      const arrayBuffer = await res.arrayBuffer();
      audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      customAudioCache.set(dataUrl, audioBuffer);
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.setValueAtTime(Math.max(0.2, Math.min(4.0, pitch || 1.0)), ctx.currentTime);
    source.loop = loop;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1.5, volume / 100)), ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(dest);

    const safeOffset = Math.max(0, Math.min(audioBuffer.duration, offsetSec));
    source.start(ctx.currentTime, safeOffset);

    return {
      stop: () => {
        try {
          gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
          setTimeout(() => {
            try {
              source.stop();
              source.disconnect();
            } catch {}
          }, 60);
        } catch {}
      },
    };
  } catch (err) {
    console.warn('Custom audio playback error:', err);
    return { stop: () => {} };
  }
}

/**
 * Returns procedural normalized waveform peaks (0..1) for timeline and inspector rendering.
 */
export function getWaveformPreview(type: SoundEffectType, samples = 36): number[] {
  const peaks: number[] = [];
  switch (type) {
    case 'whoosh':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = Math.sin(t * Math.PI) * Math.exp(-Math.pow(t - 0.4, 2) * 8);
        peaks.push(Math.max(0.08, Math.min(1.0, envelope + (Math.sin(i * 1.5) * 0.15))));
      }
      break;

    case 'click':
      for (let i = 0; i < samples; i++) {
        const envelope = i < 4 ? 0.95 - i * 0.2 : 0.05;
        peaks.push(Math.max(0.05, Math.min(1.0, envelope)));
      }
      break;

    case 'jump':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = Math.pow(t, 0.7) * (1 - t * 0.4);
        peaks.push(Math.max(0.1, Math.min(1.0, envelope * (0.8 + Math.sin(i * 0.8) * 0.2))));
      }
      break;

    case 'fade':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = Math.sin(t * Math.PI) * 0.85;
        peaks.push(Math.max(0.08, Math.min(1.0, envelope)));
      }
      break;

    case 'grow':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = 0.2 + 0.8 * Math.pow(t, 1.4);
        peaks.push(Math.max(0.1, Math.min(1.0, envelope)));
      }
      break;

    case 'pop':
      for (let i = 0; i < samples; i++) {
        const envelope = i < 6 ? Math.exp(-i * 0.6) : 0.05;
        peaks.push(Math.max(0.06, Math.min(1.0, envelope)));
      }
      break;

    case 'chime':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = Math.exp(-t * 2.8) * (0.7 + Math.sin(i * 2.1) * 0.3);
        peaks.push(Math.max(0.08, Math.min(1.0, envelope)));
      }
      break;

    case 'impact':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = i === 0 ? 1.0 : Math.exp(-t * 3.5) * 0.95;
        peaks.push(Math.max(0.08, Math.min(1.0, envelope)));
      }
      break;

    case 'laser':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = (1 - t * 0.8) * (0.6 + Math.abs(Math.sin(i * 1.8)) * 0.4);
        peaks.push(Math.max(0.08, Math.min(1.0, envelope)));
      }
      break;

    case 'swish':
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const envelope = Math.sin(t * Math.PI * 1.2) * 0.9;
        peaks.push(Math.max(0.05, Math.min(1.0, envelope)));
      }
      break;

    default:
      for (let i = 0; i < samples; i++) {
        peaks.push(0.3 + Math.sin(i * 0.5) * 0.2);
      }
  }
  return peaks;
}

