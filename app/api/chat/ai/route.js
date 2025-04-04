export const maxDuration = 60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_API_URL;

export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        const { chatId, prompt } = await req.json();
        
        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }

        // Connect to DB and find the chat
        await connectDB();
        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return NextResponse.json({ success: false, message: "Chat not found" });
        }

        // Save the user's message to DB
        const userMessage = { role: "user", content: prompt, timestamp: Date.now() };
        chat.messages.push(userMessage);
        await chat.save();

        // Send the prompt to FastAPI for AI response
        const response = await fetch(`${FASTAPI_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: prompt }),
        });

        if (!response.ok) throw new Error("AI request failed");

        const data = await response.json();

        // Save AI response to DB
        const aiMessage = { role: "assistant", content: data.response, timestamp: Date.now() };
        chat.messages.push(aiMessage);
        await chat.save();

        return NextResponse.json({ success: true, data: aiMessage });

    } catch (error) {
        console.error("Error in Chat API:", error.message);
        return NextResponse.json({ success: false, error: error.message });
    }
}
