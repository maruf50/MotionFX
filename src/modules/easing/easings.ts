import { EasingType } from '@/types/motion';

export const Easings: Record<EasingType, (t: number) => number> = {
  linear: (t: number) => t,

  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),

  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  backOut: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  bounce: (t: number) => {
    let cur = t;
    const n1 = 7.5625;
    const d1 = 2.75;
    if (cur < 1 / d1) return n1 * cur * cur;
    if (cur < 2 / d1) return n1 * (cur -= 1.5 / d1) * cur + 0.75;
    if (cur < 2.5 / d1) return n1 * (cur -= 2.25 / d1) * cur + 0.9375;
    return n1 * (cur -= 2.625 / d1) * cur + 0.984375;
  },
};

export const EASING_OPTIONS: { label: string; value: EasingType }[] = [
  { label: 'Smooth Ease Out', value: 'easeOutCubic' },
  { label: 'Ease In & Out', value: 'easeInOutCubic' },
  { label: 'Linear', value: 'linear' },
  { label: 'Overshoot Pop (Back Out)', value: 'backOut' },
  { label: 'Elastic Spring', value: 'elastic' },
  { label: 'Bounce Drop', value: 'bounce' },
];
