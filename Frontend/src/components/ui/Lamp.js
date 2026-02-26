import React from "react";
import { motion } from "framer-motion";

export const LampContainer = ({ children, className }) => {
  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full pt-16 ${className}`}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.9, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(from 180deg at 50% 30%, rgba(102,126,234,0.88) 0%, rgba(102,126,234,0.6) 30%, rgba(102,126,234,0.35) 60%, transparent 90%)`,
          }}
          className="absolute inset-x-0 top-0 mx-auto h-56 max-w-[60rem] blur-[28px] opacity-90"
        />
        {/** lower these decorative layers so navbar (z-50) appears above them */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl z-10"></div>
        <div className="absolute top-1/2 z-10 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div
          className="absolute inset-auto z-20 h-36 w-[28rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(102,126,234,0.6) 0%, rgba(102,126,234,0.35) 40%, rgba(102,126,234,0.15) 70%, transparent 100%)",
          }}
        />
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(102,126,234,0.55) 0%, rgba(102,126,234,0.25) 60%, transparent 100%)",
          }}
        ></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-20 h-0.5 w-[30rem] -translate-y-[7rem]"
          style={{
            background:
              "linear-gradient(90deg, rgba(102,126,234,0.9), rgba(102,126,234,0.6))",
          }}
        ></motion.div>
        <div className="absolute inset-auto z-10 h-44 w-full -translate-y-[12.5rem] bg-slate-950 "></div>
      </div>
      <div className="relative z-20 flex flex-col items-center px-5 pt-12 page-top-padding">
        {children}
      </div>
    </div>
  );
};
