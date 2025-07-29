"use client";

import { FONT_CLASS_MAP } from '@/lib/font-config';
import { Textarea } from "@/components/ui/textarea"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { ArrowUp } from "lucide-react";
import { useStartChatSession } from '@/hooks/use-chat-session';
import {useRouter} from "next/navigation";

const Chat = () => {
  const font = "Roboto";
  const [prompt, setPrompt] = useState("");
  const mutation = useStartChatSession();
  const router = useRouter();
  const startSession = async () => {
    try {
      const res = await mutation.mutateAsync();
      localStorage.setItem("wsPort", res.port);
      router.push(`/chat/${res.projectId}?prompt=${encodeURIComponent(prompt)}`)
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className={`${FONT_CLASS_MAP[font]} w-full flex justify-center`}>
      <div className='w-3xl pt-32'>
        <p className='text-4xl mb-5 text-center'>What to Learn Today ?</p>
        <div className='relative'>
          <Textarea onChange={(e) => setPrompt(e.target.value)} placeholder="Explain system design in detail for beginners." className='resize-none h-36 text-2xl' />
          <Button onClick={startSession} className={`absolute right-2 bottom-2 ${prompt.length > 0 ? "bg-white" : "bg-transparent"}`}><ArrowUp /></Button>
        </div>
      </div>
    </div>
  )
}

export default Chat