
export const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Haptic feedback failed:', e);
    }
  }
};

export const hapticPatterns = {
  success: [10, 30, 10],
  warning: [50, 50, 50],
  error: [100, 50, 100],
  light: 10,
  medium: 30,
  heavy: 60,
};
