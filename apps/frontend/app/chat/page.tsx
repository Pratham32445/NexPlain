"use client";

import { FONT_CLASS_MAP } from '@/lib/font-config';
import { Textarea } from "@/components/ui/textarea"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import {ArrowUp} from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import axios from "axios";
import {useAuth} from "@clerk/nextjs";

const Chat = () => {
  const font = "Roboto";
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const {getToken} = useAuth();
  const [prompt, setPrompt] = useState("");
  const mutation = useMutation({  
    mutationFn :async () => { 
      console.log("hello");
      const token = await getToken();
      const res = await axios.post(`${BACKEND_URL}/get-container-url`,{},{headers : {
        Authorization : `Bearer ${token}`
      }})
      return res.data;
    },
    onSuccess : (data) => {
      console.log(data);
    },  
    onError : (error) => {
      console.log(error);
    }
  })
  return (
    <div className={`${FONT_CLASS_MAP[font]} w-full flex justify-center`}>
      <div className='w-3xl pt-32'>
        <p className='text-4xl mb-5 text-center'>What to Learn Today ?</p>
        <div className='relative'>
          <Textarea onChange={(e)=>setPrompt(e.target.value)} placeholder="Explain system design in detail for beginners." className='resize-none h-36' />
          <Button onClick={()=>mutation.mutate()} className={`absolute right-2 bottom-2 ${prompt.length > 0 ? "bg-white" : "bg-transparent"}`}><ArrowUp/></Button>
        </div>
      </div>
    </div>
  )
}

export default Chat