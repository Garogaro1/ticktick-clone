'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface CelebrationProps {
  trigger: boolean;
  type?: 'confetti' | 'sparkles' | 'fireworks' | 'checkmark';
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
}

/**
 * Celebration component for task completion and achievements.
 *
 * Features:
 * - Multiple celebration types
 * - Confetti burst
 * - Sparkle effect
 * - Fireworks animation
 * - Checkmark bounce
 * - Auto cleanup after animation
 */
export function Celebration({
  trigger,
  type = 'confetti',
  duration = 1500,
  onComplete,
  className,
}: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  const colors = [
    '#D97757', // Primary (terracotta)
    '#F59E0B', // Warning/amber
    '#10B981', // Success/emerald
    '#3B82F6', // Info/blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);

      // Generate particles based on type
      let newParticles: Particle[] = [];

      switch (type) {
        case 'confetti':
          newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: Date.now() + i,
            x: 0,
            y: 0,
            vx: (Math.random() - 0.5) * 400,
            vy: (Math.random() - 0.5) * 400 - 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 4,
            rotation: Math.random() * 360,
          }));
          break;

        case 'sparkles':
          newParticles = Array.from({ length: 20 }, (_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            return {
              id: Date.now() + i,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              vx: 0,
              vy: 0,
              color: colors[Math.floor(Math.random() * colors.length)],
              size: Math.random() * 4 + 2,
              rotation: 0,
            };
          });
          break;

        case 'fireworks':
          // Multiple bursts
          newParticles = Array.from({ length: 60 }, (_, i) => {
            const angle = (i / 60) * Math.PI * 2;
            const velocity = 200 + Math.random() * 150;
            return {
              id: Date.now() + i,
              x: 0,
              y: 0,
              vx: Math.cos(angle) * velocity,
              vy: Math.sin(angle) * velocity,
              color: colors[Math.floor(Math.random() * colors.length)],
              size: Math.random() * 5 + 3,
              rotation: Math.random() * 360,
            };
          });
          break;

        case 'checkmark':
          // Minimal particles for checkmark
          newParticles = Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return {
              id: Date.now() + i,
              x: Math.cos(angle) * 40,
              y: Math.sin(angle) * 40,
              vx: Math.cos(angle) * 80,
              vy: Math.sin(angle) * 80,
              color: '#10B981',
              size: 4,
              rotation: 0,
            };
          });
          break;
      }

      setParticles(newParticles);

      // Cleanup after animation
      const timer = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, type, duration, isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                marginLeft: -particle.size / 2,
                marginTop: -particle.size / 2,
              }}
              initial={{
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 1,
              }}
              animate={
                type === 'sparkles'
                  ? {
                      x: particle.x,
                      y: particle.y,
                      scale: [0, 1, 1, 0],
                      opacity: [1, 1, 1, 0],
                    }
                  : {
                      x: particle.x + particle.vx * 0.5,
                      y: particle.y + particle.vy * 0.5 + 100, // Add gravity
                      scale: [0, 1, 0.8],
                      opacity: [1, 1, 0],
                      rotate: particle.rotation,
                    }
              }
              transition={
                type === 'sparkles'
                  ? {
                      duration: 1,
                      times: [0, 0.2, 0.8, 1],
                    }
                  : {
                      duration: duration / 1000,
                      ease: 'easeOut',
                    }
              }
            />
          ))}

          {/* Success checkmark overlay for checkmark type */}
          {type === 'checkmark' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{
                scale: { type: 'spring' as const, stiffness: 300, damping: 15 },
                opacity: { duration: 0.3 },
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-lg"
              >
                <motion.path
                  d="M20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Quick celebration burst that auto-triggers.
 */
export interface CelebrationBurstProps {
  show: boolean;
  position?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onComplete?: () => void;
}

export function CelebrationBurst({ show, position = 'center', onComplete }: CelebrationBurstProps) {
  const positionStyles = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={cn('absolute z-50 pointer-events-none', positionStyles[position])}>
      <Celebration trigger={show} type="sparkles" duration={800} onComplete={onComplete} />
    </div>
  );
}

/**
 * Streak celebration for consecutive completions.
 */
export interface StreakCelebrationProps {
  streak: number;
  show: boolean;
  onComplete?: () => void;
}

export function StreakCelebration({ streak, show, onComplete }: StreakCelebrationProps) {
  if (!show || streak < 3) return null;

  const streakMessages: Record<number, string> = {
    3: '3 in a row!',
    5: '5 in a row! 🔥',
    10: '10 in a row! 💪',
    20: '20 in a row! 🚀',
    50: '50 in a row! 🏆',
  };

  const message =
    streakMessages[
      Math.min(
        ...(Object.keys(streakMessages)
          .map(Number)
          .filter((k) => streak >= Number(k)) as number[])
      )
    ] || `${streak} in a row!`;

  // Call onComplete when animation ends
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500); // Wait for animation to complete
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Celebration trigger={show} type="fireworks" duration={2000} />

          <motion.div
            className="bg-background-card px-8 py-4 rounded-2xl shadow-2xl border-2 border-primary"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{
              type: 'spring' as const,
              stiffness: 300,
              damping: 15,
            }}
          >
            <p className="text-2xl font-bold text-primary">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
