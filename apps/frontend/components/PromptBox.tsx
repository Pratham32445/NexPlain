"use client";
import React, { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from "motion/react";

const PromptBox = () => {
  const [prompt, setPrompt] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className='max-w-2xl mx-auto mt-10 relative'>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className='p-4 resize-none text-md h-[150px]' placeholder='Write your topic...,wait...,Congrats...' />
        <Button className={`absolute ${prompt.length > 0 ? "bg-white" : " bg-transparent"} right-2 bottom-2`}><ArrowRight /></Button>
      </motion.div>
    </motion.div>
  )
}

export default PromptBox;