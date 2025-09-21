import React, { useState, useRef, useEffect } from 'react';
import type { Resident, ChatbotConversation, ChatbotMessage } from '../types';

interface ChatWindowProps {
    resident: Resident;
    conversation: ChatbotConversation;
    onSendMessage: (content: string, residentId: string, as: 'admin' | 'resident') => void;
}

const getSenderStyle = (sender: ChatbotMessage['sender']) => {
    switch(sender) {
        case 'resident':
            return 'bg-slate-200 text-slate-800 self-start';
        case 'admin':
            return 'bg-blue-500 text-white self-end';
        case 'bot':
            return 'bg-green-100 text-green-800 self-start';
        default:
            return 'bg-gray-200 text-gray-800 self-start';
    }
}

const ChatbotWindow: React.FC<ChatWindowProps> = ({ resident, conversation, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [conversation.messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage, resident.id, 'admin');
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center">
                 <img className="h-10 w-10 rounded-full" src={resident.avatarUrl} alt={resident.fullName} />
                 <div className="ml-3">
                    <h3 className="text-lg font-semibold text-slate-800">{resident.fullName}</h3>
                    <p className="text-xs text-slate-500">Zalo ID: {resident.zaloId || 'N/A'}</p>
                 </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                <div className="flex flex-col space-y-4">
                    {conversation.messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-md px-4 py-2 rounded-xl ${getSenderStyle(msg.sender)}`}>
                                {msg.sender === 'bot' && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                        <p className="text-xs font-bold uppercase">Bot</p>
                                    </div>
                                )}
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs mt-1 text-right opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn với tư cách Admin..."
                        className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatbotWindow;
