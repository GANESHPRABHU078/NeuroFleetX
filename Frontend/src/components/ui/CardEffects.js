import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const CardSpotlight = ({ children, className }) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139,92,246,.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

export const HoverBorderGradient = ({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
}) => {
  return (
    <Tag className={cn("relative p-[1px] overflow-hidden", containerClassName)}>
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, #667eea 90deg, #764ba2 180deg, #667eea 270deg, transparent 360deg)`,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div
        className={cn(
          "relative z-10 bg-slate-950 rounded-lg px-6 py-3 text-white flex items-center justify-center gap-2",
          className
        )}
      >
        {children}
      </div>
    </Tag>
  );
};
