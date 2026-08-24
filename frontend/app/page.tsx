"use client";

import { useState } from 'react';
import { Send, Shield, Activity, Lock } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Welcome to CyberCISO. I am your Virtual CISO. To begin your audit, could you briefly describe your business?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 1. Add user message to screen
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    // 2. Send message to Python Backend in Colab
    try {
      // Notice the /api/chat at the very end of your URL!
      const response = await fetch("https://mean-hotels-draw.loca.lt/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      // THIS is the line that went missing! It translates the server response.
      const data = await response.json();
      
      // 3. Add AI response to screen
      const aiText = data.response || data.detail || JSON.stringify(data);
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection Error: Make sure your Colab server is running!' }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e2e8f0] flex flex-col items-center font-sans">
      <header className="w-full max-w-4xl p-6 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Shield className="text-[#b14eff] w-8 h-8" />
          <h1 className="text-2xl font-bold">Cyber<span className="text-[#00f6ff]">CISO</span></h1>
        </div>
        <div className="flex gap-4 text-sm hidden md:flex">
          <span className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full"><Activity className="w-4 h-4 text-[#00ff9d]" /> System Online</span>
          <span className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full"><Lock className="w-4 h-4 text-[#b14eff]" /> Connected</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl p-6 overflow-y-auto flex flex-col gap-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[#b14eff] text-white rounded-br-none' : 'bg-gray-800 border border-gray-700 rounded-bl-none shadow-lg'}`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </main>

      <div className="w-full max-w-4xl p-6">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type business details..." 
            className="w-full bg-gray-900 border border-gray-700 rounded-full py-4 pl-6 pr-16 text-white focus:outline-none focus:border-[#b14eff] transition-colors" 
          />
          <button type="submit" className="absolute right-2 bg-[#b14eff] hover:bg-[#9a3ee0] p-3 rounded-full transition-colors">
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}