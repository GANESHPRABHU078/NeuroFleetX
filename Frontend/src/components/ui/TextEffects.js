import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const TextGenerateEffect = ({ words, className }) => {
  const wordsArray = words.split(" ");
  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text leading-snug tracking-wide">
          {wordsArray.map((word, idx) => (
            <motion.span
              key={word + idx}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
              }}
              className="text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text"
            >
              {word}{" "}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TypewriterEffect = ({ words, className, cursorClassName }) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => (
          <div key={`word-${idx}`} className="inline-block">
            {word.text.map((char, index) => (
              <span
                key={`char-${index}`}
                className={cn(`dark:text-white text-black `, word.className)}
              >
                {char}
              </span>
            ))}
            &nbsp;
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      <motion.div
        className="inline-block"
        initial={{
          width: "0%",
        }}
        whileInView={{
          width: "fit-content",
        }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text:3xl xl:text-5xl font-bold inline-block"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {renderWords()}{" "}
        </div>{" "}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
