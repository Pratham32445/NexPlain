"use client";
import React, { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const PromptBox = () => {
  const [prompt, setPrompt] = useState("");
  return (
    <div className='max-w-2xl mx-auto mt-10 relative'>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className='p-4 resize-none text-md h-[150px]' placeholder='Write your topic...,wait...,Congrats...' />
      <Button className={`absolute ${prompt.length > 0 ? "bg-white" : " bg-transparent"} right-2 bottom-2`}><ArrowRight /></Button>
    </div>
  )
}

export default PromptBox;