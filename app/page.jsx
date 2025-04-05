"use client";
import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";


export default function Home() {

  const [ expand, setExpand ] = useState(false);
  const [ messages, setMessages ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const { selectedChat } = useAppContext()
  const containerRef = useRef(null)


  useEffect(()=>{
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  },[selectedChat])

  useEffect(()=>{
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  },[messages])

  return (
    <div>
      <div className="flex h-screen">
        {/* --sidebar */}
        <Sidebar expand={expand} setExpand={setExpand}/>
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          <div className="md:hidden absolute top-6 px-4 flex items-center justify-between w-full">
            <Image onClick={()=> (expand ? setExpand(false) : setExpand(true))} className="rotate-180" src={assets.menu_icon} alt=""/>
            <Image className="opacity-70" src={assets.chat_icon} alt=""/>
          </div>


          {messages.length === 0 ? (
            <>
            <div className="flex item-center gap-3">
              <Image className="h-16" src={assets.logo_icon} alt=""/>
              <p className="text-2xl font-medium">Hi, I'm the BlockSensei</p>
            </div>
            <p className="text-sm mt-2">How can I help you today?</p>
            </>
          ):(
            <div className="relative flex flex-col items-center justify-start w-full mt-20 mac-h-screen overflow-y-auto" ref={containerRef}>
              <p className="fixed top-8 border border-transparent hover:border-gray-500/50 py-1 px-2 rounded-lg font-semibold mb-6">{selectedChat.name}</p>
              {messages.map((msg, index)=>(
                <Message role={msg.role} key={index} content={msg.content}/>
              ))}
              {
                isLoading && (
                  <div className="flex gap-4 max-w-3xl w-full py-3">
                    <Image src={assets.logo_icon} alt='Logo' className='w-9 h-9 p-1 border border-white/15 rounded-full'/>
                    <div className="loader flex justify-center items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-white animate-bounce">

                      </div>
                      <div className="w-1 h-1 rounded-full bg-white animate-bounce">

                      </div>
                      <div className="w-1 h-1 rounded-full bg-white animate-bounce">

                      </div>
                    </div>
                  </div>
                )
              }
            </div>
          )
        
        }
        {/* prompt box */}
        <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
        <p className="text-xs absolute bottom-1 text-gray-500">AI-generated, for reference only</p>

        </div>
      </div>
    </div>
  );
}
