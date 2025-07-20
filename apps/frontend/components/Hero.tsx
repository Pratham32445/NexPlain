"use client";
import React from 'react'
import { motion } from "motion/react";

const Hero = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div className='mt-32'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}>
        <h1 className='text-6xl font-bold text-center'>Generate Your Next <br />
          <span className='mt-8'>
            <span className='text-[#87CEEB]'>3Blue</span>
            <span className='text-[#A0522D]'>1Brown</span>
          </span>
        </h1>
        <p className='text-center mt-5 text-neutral-500'>A Powerful Video Generator which splits the video similar to <span className='text-[#87CEEB]'>3Blue</span><span className="text-[#A0522D]">1Brown</span>.</p>
      </motion.div>
    </motion.div>
  )
}

export default Hero