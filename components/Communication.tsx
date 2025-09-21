
import React, { useState, useMemo } from 'react';
import { mockNotifications } from '../data/mockData';
import type { Resident, Message, Notification, ToastMessage, Attachment } from '../types';
import ResidentChatList from './ResidentChatList';
import ChatWindow from './ChatWindow';
import NotificationSender from './NotificationSender';

interface CommunicationProps {
  residents: Resident[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  zaloOAConnected: boolean;
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

const Communication: React.FC<CommunicationProps> = ({ residents, messages, setMessages, zaloOAConnected, addToast }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);

  const selectedResident = useMemo(() => {
    return residents.find(r => r.id === selectedResidentId) || null;
  }, [selectedResidentId, residents]);

  const handleSendMessage = (content: string, attachment?: Attachment) => {
    if (!selectedResidentId) return;
    if (!content.trim() && !attachment) return; // Don't send empty messages

    const newMessage: Message = {
      id: `M${Date.now()}`,
      residentId: selectedResidentId,
      sender: 'admin',
      content,
      timestamp: new Date().toISOString(),
      ...(attachment && { attachment }), // Add attachment if it exists
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendNotification = (content: string, viaZalo: boolean) => {
    const newNotification: Notification = {
      id: `N${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    const zaloMessage = viaZalo && zaloOAConnected ? ' qua Zalo' : '';
    addToast(`Thông báo chung đã được gửi${zaloMessage}.`, 'success');
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] gap-6">
      <div className="w-1/3 bg-white rounded-xl shadow-md flex flex-col">
        <ResidentChatList 
          residents={residents} 
          onSelectResident={setSelectedResidentId}
          selectedResidentId={selectedResidentId}
        />
      </div>
      <div className="w-2/3 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-md">
            <NotificationSender onSend={handleSendNotification} notifications={notifications} zaloOAConnected={zaloOAConnected} />
        </div>
        <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col">
           {selectedResident ? (
            <ChatWindow 
              resident={selectedResident}
              messages={messages.filter(m => m.residentId === selectedResident.id)}
              onSendMessage={handleSendMessage}
            />
           ) : (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p className="mt-2">Chọn một cư dân để bắt đầu trò chuyện</p>
                </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Communication;