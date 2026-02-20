/**
 * Gamification Utilities
 * Lightweight micro-interactions for learning engagement
 */

// Confetti trigger function (uses canvas-confetti library)
export const triggerConfetti = (origin = { x: 0.5, y: 0.5 }, particleCount = 50) => {
  if (typeof window === 'undefined' || !window.confetti) {
    console.warn('Confetti library not loaded');
    return;
  }

  // Subtle confetti burst
  window.confetti({
    particleCount,
    spread: 60,
    origin,
    scalar: 0.8,
    gravity: 1.2,
    decay: 0.92,
    ticks: 80,
    colors: ['#a855f7', '#ec4899', '#F472B6', '#c084fc', '#f9a8d4'],
    disableForReducedMotion: true
  });
};

// Mini celebration for quiz completion
export const celebrateQuizComplete = (score) => {
  if (score >= 90) {
    // Excellence: double burst
    setTimeout(() => triggerConfetti({ x: 0.3, y: 0.6 }, 30), 0);
    setTimeout(() => triggerConfetti({ x: 0.7, y: 0.6 }, 30), 150);
  } else if (score >= 70) {
    // Good: single center burst
    triggerConfetti({ x: 0.5, y: 0.5 }, 40);
  } else if (score >= 50) {
    // Pass: small burst
    triggerConfetti({ x: 0.5, y: 0.5 }, 20);
  }
};

// Lesson completion celebration
export const celebrateLessonComplete = () => {
  triggerConfetti({ x: 0.5, y: 0.4 }, 35);
};

// Streak milestone celebration
export const celebrateStreakMilestone = (days) => {
  if (days % 30 === 0) {
    // Major milestone: epic burst
    setTimeout(() => triggerConfetti({ x: 0.25, y: 0.5 }, 40), 0);
    setTimeout(() => triggerConfetti({ x: 0.5, y: 0.3 }, 40), 100);
    setTimeout(() => triggerConfetti({ x: 0.75, y: 0.5 }, 40), 200);
  } else if (days % 7 === 0) {
    // Week milestone: medium burst
    setTimeout(() => triggerConfetti({ x: 0.4, y: 0.5 }, 25), 0);
    setTimeout(() => triggerConfetti({ x: 0.6, y: 0.5 }, 25), 120);
  }
};

// Count-up animation helper
export const animateValue = (start, end, duration, callback) => {
  const startTime = performance.now();
  const change = end - start;
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (easeOutQuart)
    const easeOut = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(start + change * easeOut);
    
    callback(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

// XP gain animation message
export const showXPGain = (amount, elementId = null) => {
  const container = elementId 
    ? document.getElementById(elementId) 
    : document.body;
    
  if (!container) return;
  
  const xpPopup = document.createElement('div');
  xpPopup.className = 'xp-gain-popup';
  xpPopup.textContent = `+${amount} XP`;
  xpPopup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    font-weight: bold;
    color: #a855f7;
    text-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
    animation: xpGainFly 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    z-index: 9999;
  `;
  
  container.appendChild(xpPopup);
  
  setTimeout(() => {
    xpPopup.remove();
  }, 1200);
};
