'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
    id: string;
    senderId: string;
    name: string;
    avatar: string;
    text: string;
    time: string;
    isBot?: boolean;
    stake?: number;
};

const DUMMY_MESSAGES: Message[] = [
    {
        id: '1',
        senderId: 'bot1',
        name: 'BotGreen',
        avatar: '🤖',
        text: "Let's do this!",
        time: '24:52',
        isBot: true,
    },
    {
        id: '2',
        senderId: 'bot1',
        name: 'BotGreen',
        avatar: '🤖',
        text: '🤪 💰:10',
        time: '20:53',
        isBot: true,
    },
    {
        id: '3',
        senderId: 'player1',
        name: 'Ninjak',
        avatar: '🥷',
        text: 'Lucky roll 😆',
        time: '18:10',
        stake: 1.0,
    },
    {
        id: '4',
        senderId: 'player2',
        name: 'Oxed...8a16',
        avatar: '🦊',
        text: 'Nice move! 👍',
        time: '12:05',
        stake: 1.0,
    }
];

const QUICK_CHATS = ["Good game!", "Lucky shot!", "Let's do this!"];
const EMOJIS = ["😀", "😂", "😎", "👍", "👎", "🤬", "😭"];

export default function LiveChat() {
    const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
    const [inputText, setInputText] = useState("");
    const [showEmojis, setShowEmojis] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            name: 'You',
            avatar: '😎',
            text: text,
            time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
            stake: 2.0, // example
        };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        setShowEmojis(false);
    };

    return (
        <div className="flex flex-col h-[450px] w-full rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.5)] bg-[#0f0c1a]">
            {/* Dark Galaxy Background Simulation */}
            <div className="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1b153a]/90 via-[#0f0c1a]/95 to-[#0a0520]/95 pointer-events-none" />

                {/* Header Container overlay */}
                <div className="relative flex-1 flex flex-col z-10 w-full h-full">
                    {/* Header: Icons */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polyline points="15 18 9 12 15 6" /></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" x2="12" y1="8" y2="8" /><line x1="3.95" x2="8.54" y1="6.06" y2="14" /><line x1="10.88" x2="15.46" y1="21.94" y2="14" /></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                        <div className="flex items-center gap-2 text-lg drop-shadow-lg opacity-80 cursor-pointer">
                            <span className="hover:scale-110 transition">🤩</span>
                            <span className="hover:scale-110 transition">🤑</span>
                            <span className="hover:scale-110 transition">🤬</span>
                            <span className="hover:scale-110 transition">👺</span>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex items-start gap-3 p-2 rounded-2xl hover:bg-white/5 transition group animate-in flex-col">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="relative shrink-0 mt-1">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-lg text-2xl">
                                            {msg.avatar}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5 mt-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-[15px] truncate drop-shadow-md">{msg.name}</span>
                                                {msg.stake && <span className="text-orange-400 text-xs font-black drop-shadow-md">${msg.stake.toFixed(2)}</span>}
                                            </div>
                                            <span className="text-[11px] text-indigo-200/50 font-medium group-hover:text-indigo-200/80 transition ml-2">{msg.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {msg.isBot && (
                                                <span className="flex items-center gap-1 opacity-70">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
                                                    <span className="text-[11px] text-white">Bot</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-indigo-100/90 text-sm mt-1 mb-1 leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} className="h-2" />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white/[0.03] border-t border-white/10 backdrop-blur-xl relative z-20">
                        {/* Quick Chat Popover */}
                        {showEmojis && (
                            <div className="absolute bottom-full left-0 right-0 p-3 mb-2 mx-3 bg-[#1b153a]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-3 border-b border-white/10">
                                    {QUICK_CHATS.map(chat => (
                                        <button
                                            key={chat}
                                            onClick={() => handleSend(chat)}
                                            className="shrink-0 px-4 py-2 rounded-full bg-white/10 text-white text-[13px] font-bold tracking-wide hover:bg-white/20 transition whitespace-nowrap border border-white/5"
                                        >
                                            {chat}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                                    {EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleSend(emoji)}
                                            className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-b from-[#1E3A8A] to-[#1e1b4b] flex items-center justify-center text-xl shadow-lg border border-indigo-400/50 hover:-translate-y-1 hover:brightness-125 hover:border-indigo-300 transition-all"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 bg-white/10 rounded-full pr-1.5 pl-4 py-1.5 border border-white/20 focus-within:border-indigo-400 focus-within:bg-white/15 transition-all shadow-inner">
                            <button
                                onClick={() => setShowEmojis(!showEmojis)}
                                className="text-indigo-300/80 hover:text-white transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
                            </button>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-white placeholder:text-indigo-200/50 h-10 px-2"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                            />
                            <button
                                onClick={() => handleSend(inputText)}
                                disabled={!inputText.trim()}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-40 disabled:bg-white/10 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
