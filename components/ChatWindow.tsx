import React, { useState, useRef, useEffect } from 'react';
import type { Resident, Message, Attachment } from '../types';

interface ChatWindowProps {
    resident: Resident;
    messages: Message[];
    onSendMessage: (content: string, attachment?: Attachment) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ resident, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) {
            return; // Don't send if everything is empty
        }

        if (attachment) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const attachmentData: Attachment = {
                    name: attachment.name,
                    type: attachment.type,
                    url: event.target?.result as string,
                };
                onSendMessage(newMessage, attachmentData);
                setNewMessage('');
                setAttachment(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
            };
            reader.readAsDataURL(attachment);
        } else {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const renderAttachment = (msg: Message) => {
        if (!msg.attachment) return null;

        const { name, type, url } = msg.attachment;

        if (type.startsWith('image/')) {
            return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                    <img src={url} alt={name} className="max-w-xs rounded-lg max-h-48" />
                </a>
            );
        }

        // Generic file attachment view
        return (
            <a 
                href={url} 
                download={name}
                className="mt-2 flex items-center p-2 rounded-lg bg-black bg-opacity-20 text-inherit no-underline"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium truncate">{name}</span>
            </a>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center">
                 <img className="h-10 w-10 rounded-full" src={resident.avatarUrl} alt={resident.fullName} />
                 <div className="ml-3">
                    <h3 className="text-lg font-semibold text-slate-800">{resident.fullName}</h3>
                    <p className="text-xs text-slate-500">ID: {resident.id}</p>
                 </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                                msg.sender === 'admin' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-slate-200 text-slate-800'
                            }`}>
                                {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                                {renderAttachment(msg)}
                                <p className={`text-xs mt-1 text-right ${
                                    msg.sender === 'admin' ? 'text-blue-100' : 'text-slate-500'
                                }`}>{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 bg-white border-t">
                {attachment && (
                    <div className="mb-2 p-2 bg-slate-100 rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-sm text-slate-700 truncate">{attachment.name}</span>
                        </div>
                        <button
                            onClick={() => {
                                setAttachment(null);
                                if(fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1 rounded-full hover:bg-slate-200"
                            aria-label="Remove attachment"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-100 text-slate-600 font-semibold px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center"
                        title="Đính kèm file"
                        aria-label="Attach file"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                         </svg>
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
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

export default ChatWindow;