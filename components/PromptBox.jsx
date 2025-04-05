"use client";
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAIResponse } from "@/utils/api";

const PromptBox = ({ setIsLoading, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(e);
        }
    };

    const sendPrompt = async (e) => {
        e.preventDefault();
        const promptCopy = prompt.trim();

        if (!user) return toast.error('Login to send a message');
        if (isLoading) return toast.error('Wait for the previous response');
        if (!selectedChat) return toast.error("No chat selected");
        if (!promptCopy) return toast.error("Prompt cannot be empty");

        setIsLoading(true);
        setPrompt("");

        // Save user message locally
        const userMessage = {
            role: "user",
            content: promptCopy,
            timestamp: Date.now(),
        };

        setChats(prevChats =>
            prevChats.map(chat =>
                chat._id === selectedChat._id
                    ? { ...chat, messages: [...(chat.messages || []), userMessage] }
                    : chat
            )
        );

        setSelectedChat(prev => ({
            ...prev,
            messages: [...(prev?.messages || []), userMessage],
        }));

        try {
            // Fetch AI response from FastAPI backend
            const aiResponse = await fetchAIResponse(promptCopy);
            console.log("AI Response received:", aiResponse);

            if (!aiResponse || !aiResponse.response) {
                throw new Error("AI response failed");
            }

            const assistantMessage = {
                role: "assistant",
                content: aiResponse.response,
                timestamp: Date.now(),
            };

            // Save both user + assistant message to MongoDB via /api/chat
            const saveRes = await fetch("/api/chat/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId: selectedChat._id,
                    prompt: promptCopy,
                    response: aiResponse.response,
                }),
            });

            const saved = await saveRes.json();
            if (!saved.success) throw new Error(saved.error || "Failed to save chat");

            // Update local chat state with assistant message
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat._id === selectedChat._id
                        ? { ...chat, messages: [...chat.messages, assistantMessage] }
                        : chat
                )
            );

            setSelectedChat(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
            }));

        } catch (error) {
            console.error("Chat Error:", error);
            toast.error(error.message);
            setPrompt(promptCopy); // Restore prompt to try again
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={sendPrompt} className={`w-full ${selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
            <textarea
                onKeyDown={handleKeyDown}
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                rows={2}
                className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
                placeholder="Message BlockSensei"
                required
            />
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                        <Image src={assets.deepthink_icon} alt="" className="h-5"/>
                        DeepThink (R1)
                    </p>
                    <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                        <Image src={assets.search_icon} alt="" className="h-5"/>
                        Search
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Image src={assets.pin_icon} alt="" className="w-4 cursor-pointer"/>
                    <button className={`${prompt ? 'bg-primary' : 'bg-[#71717a]'} rounded-full p-2 cursor-pointer`}>
                        <Image src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} alt="" className="w-3.5 aspect-square"/>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PromptBox;
