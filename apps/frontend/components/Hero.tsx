"use client";

import { motion } from "motion/react";
import { Button } from "./ui/button";
import { useState } from "react";
import Navbar from "./landing/Navbar";

export function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  return (
    <div className="min-h-[calc(100vh-4.5rem)] supports-[height:100dvh]:min-h-[calc(100dvh-4.5rem)] flex flex-col justify-between text-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center"
      >
        <Navbar />
        <div className="pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block font-bold tracking-tighter text-4xl md:text-[4rem]"
          >
            <h1>Learn Everything with the Speed of AI</h1>
          </motion.div>

          <motion.p
            className="mt-10 text-base sm:text-xl text-muted-foreground font-light tracking-wide max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            A Platform to generate AI videos with explanation checkout the demo video for more details.
          </motion.p>

          <motion.div
            className="mt-12 flex gap-8 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative mx-auto max-w-4xl w-full mb-8"
            >
              <div className="relative aspect-video bg-black/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                {!isVideoPlaying ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br bg-gray-400/30 backdrop-blur-sm"> 
                    <div className="absolute inset-0 bg-black/40" />
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="relative z-10 group flex items-center justify-center w-24 h-24 bg-white/90 hover:bg-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <svg
                        className="w-8 h-8 text-black ml-1 group-hover:scale-110 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-semibold mb-1">See AI Video Generation in Action</h3>
                      <p className="text-sm text-white/80">Click to watch our demo video</p>
                    </div>
                  </div>
                ) : (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    preload="metadata"
                    onEnded={() => setIsVideoPlaying(false)}
                  >
                    <source src="/final_output.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground justify-center"
          >
            <Button>Generate Now</Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
