"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect,useRef } from 'react';

export default function ChatPage({ params }: { params: { Id: string } }) {
    const searchParams = useSearchParams();
    const prompt = searchParams.get('prompt');
    const { Id } = params; 
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const port = localStorage.getItem("wsPort");
        if(!port) {
            return ;
        }
        socketRef.current = new WebSocket(port);

        socketRef.current.onmessage = (event) => {
            const message = event.data;
            console.log(message);
        }
    }, [])

    useEffect(() => {
        if(prompt && socketRef.current) {
            socketRef.current.send(JSON.stringify({
                type : "generate_video",
            }))
        }   
    }, [prompt])
    

    
    return (
        <div className='w-full min-h-screen relative'>

        </div>
    );
}
