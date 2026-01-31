import React, { useState, useRef, useEffect } from "react";
import type { Message } from "../App";

interface Props {
  messages: Message[];
  onSend: (text: string) => void;
}

export const ChatWindow: React.FC<Props> = ({ messages, onSend }) => {
  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="chat-window">
      <div className="chat-history" ref={containerRef}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`chat-message chat-message-${message.role}`}
          >
            <div className="chat-bubble">
              <p>{message.text}</p>
              <span className="chat-timestamp">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask about irrigation, pests, or yields..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <button type="submit" className="primary-button">
          Send
        </button>
      </form>
    </div>
  );
};

