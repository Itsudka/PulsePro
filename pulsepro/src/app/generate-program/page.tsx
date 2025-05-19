"use client"

import { vapi } from '@/lib/vapi';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'

const GenerateProgrampage = () => {

  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [callEnded, setCallEnded] = useState(false);

  const {user} = useUser();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null)
  
  // auto-scroll messages

  useEffect(() => {
    if (messageContainerRef.current){
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  
  }, [messages])
  
  // navigate user to profile page after the call ends

  useEffect(() => {
    if(callEnded){
      const redirectTimer = setTimeout(() => {
        router.push("/profile")
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router])
  



  // setup event listeners for vapi
  useEffect(() => {

    const handleCallStart = () => {
      console.log("Call Started");
      setConnecting(false)
      setCallActive(true)
      setCallEnded(false)
    }

    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false)
      setConnecting(false)
      setIsSpeaking(false)
      setCallEnded(true);
    }

    const handleSpeechStart = () => {
      console.log("AI start speaking")
      setIsSpeaking (true)
    }    
    const handleSpeechEnd = () => {
      console.log("AI stop speaking")
      setIsSpeaking (false)
    }
    const handleMessage = () => {

    }
    const handleError = (error: any) => {
      console.log("Vapi Error", error);
      setConnecting(false)
      setCallActive(false)

    }

    vapi.on("call-start", handleCallStart)
        .on("call-end", handleCallEnd)
        .on("speech-start", handleSpeechStart)
        .on("speech-end", handleSpeechEnd)
        .on("message", handleMessage)
        .on("error", handleError)
  }, [])
  
    const toggleCall = async () => {
    if (callActive) vapi.stop();
    else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);

        const fullName = user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "There";

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            full_name: fullName,
            user_id: user?.id,
          },
          clientMessages: [], 
          serverMessages: [], 
        });
      } catch (error) {
        console.log("Failed to start call", error);
        setConnecting(false);
      }
    }
  };
  
 
  return (
    <div>GenerateProgram</div>
  )
}

export default GenerateProgrampage