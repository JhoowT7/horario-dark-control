
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const colors = ['#00FF7F', '#00CFFD', '#FFD700', '#FF69B4', '#9370DB'];

export const Confetti: React.FC<ConfettiProps> = ({ active, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setPieces(newPieces);
      
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="fixed pointer-events-none z-50"
          initial={{
            left: `${piece.x}%`,
            top: '-10px',
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            top: '110%',
            rotate: piece.rotation + 720,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2 + Math.random(),
            ease: 'easeOut',
          }}
          style={{ backgroundColor: piece.color }}
        >
          <div 
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: piece.color }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default Confetti;
