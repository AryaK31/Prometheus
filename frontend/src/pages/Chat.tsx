import React, { useState } from "react";
import { ChatWindow } from "../components/ChatWindow";
import { VoiceControls } from "../components/VoiceControls";
import { SidebarProfile } from "../components/SidebarProfile";
import type { Message, FarmerProfile } from "../App";
import "./Chat.css";

const createSessionId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const Chat: React.FC = () => {
  const [sessionId] = useState<string>(createSessionId);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am Prometheus. Tell me where your farm is and what you are growing, and I'll help you optimize your season.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>({});
  const [listening, setListening] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    const profilePayload = {
      name: farmerProfile.name || undefined,
      location: farmerProfile.location || undefined,
      primary_crops: farmerProfile.primaryCrops
        ? farmerProfile.primaryCrops.split(",").map(c => c.trim())
        : undefined,
      notes: farmerProfile.notes || undefined
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          farmer_profile: profilePayload
        })
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = (await res.json()) as { reply: string };
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      speakText(data.reply);
    } catch (err) {
      const assistantMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text: "I could not reach the server. Please check your connection and try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  };

  return (
    <div className="chat-page">
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="logo-block">
            <div className="logo-circle">
              <span className="logo-glyph">🌾</span>
            </div>
            <div>
              <h2 className="app-title">Prometheus</h2>
              <p className="app-subtitle">Your AI farm companion</p>
            </div>
          </div>
          <SidebarProfile profile={farmerProfile} onChange={setFarmerProfile} />
        </aside>
        <main className="chat-main">
          <ChatWindow messages={messages} onSend={sendMessage} />
          <VoiceControls
            onTranscript={sendMessage}
            listening={listening}
            setListening={setListening}
          />
        </main>
      </div>
    </div>
  );
};
