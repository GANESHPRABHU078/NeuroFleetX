import React from "react";
import { motion } from "framer-motion";
import "./Particles.css";

const Particles = () => {
  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.3 + 0.2,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="particles fixed inset-0 pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            background: `radial-gradient(circle, rgba(139, 92, 246, ${particle.opacity}), transparent)`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [
              particle.opacity,
              particle.opacity * 1.5,
              particle.opacity,
            ],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
