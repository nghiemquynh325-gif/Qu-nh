import React, { useState, useMemo } from 'react';
import { mockChatbotConversations } from '../data/mockData';
import type { Resident, ChatbotConversation, ChatbotMessage } from '../types';
import ChatbotConversationList from './ChatbotConversationList';
import ChatbotWindow from './ChatbotWindow';

interface ChatbotProps {
    allResidents: Resident[];
}

const Chatbot: React.FC<ChatbotProps> = ({ allResidents }) => {
    const [conversations, setConversations] = useState<ChatbotConversation[]>(mockChatbotConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(mockChatbotConversations[0]?.id || null);

    const residents = useMemo(() => {
        const residentMap = new Map<string, Resident>();
        allResidents.forEach(r => residentMap.set(r.id, r));
        return residentMap;
    }, [allResidents]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId) || null;
    }, [selectedConversationId, conversations]);

    const getBotResponse = (message: string, resident: Resident): ChatbotMessage | null => {
        const lowerCaseMessage = message.toLowerCase();
        
        // Intent: Lookup personal information
        if (lowerCaseMessage.includes('thông tin cá nhân') || lowerCaseMessage.includes('thông tin của tôi') || lowerCaseMessage.includes('tra cứu thông tin')) {
            const expiryInfo = resident.expiryDate ? `\n- Hạn tạm trú: ${new Date(resident.expiryDate).toLocaleDateString('vi-VN')}` : '';
            const visaInfo = resident.visaExpiryDate ? `\n- Hạn Visa: ${new Date(resident.visaExpiryDate).toLocaleDateString('vi-VN')}` : '';
            
            return {
                id: `CB_M${Date.now()}`,
                sender: 'bot',
                content: `Chào ${resident.fullName}, dưới đây là thông tin của bạn:\n- Ngày sinh: ${new Date(resident.dateOfBirth).toLocaleDateString('vi-VN')}\n- CCCD/Passport: ${resident.idNumber || resident.passportNumber}\n- Địa chỉ: ${resident.address}\n- Loại cư trú: ${resident.residenceType}\n- Trạng thái: ${resident.status}${expiryInfo}${visaInfo}`,
                timestamp: new Date().toISOString()
            };
        }

        // Intent: Lookup temporary residence info (existing)
        if (lowerCaseMessage.includes('tra cứu tạm trú')) {
            const expiryDate = resident.expiryDate 
                ? new Date(resident.expiryDate).toLocaleDateString('vi-VN') 
                : 'không có thông tin';
            
            return {
                id: `CB_M${Date.now()}`,
                sender: 'bot',
                content: `Thông tin tạm trú của bạn: Ngày hết hạn là ${expiryDate}. Bạn có cần hỗ trợ gì thêm không?`,
                timestamp: new Date().toISOString()
            };
        }

        // Default response for other queries
        if(message.length > 0) {
            return {
                id: `CB_M${Date.now()}`,
                sender: 'bot',
                content: 'Cảm ơn bạn đã liên hệ. Yêu cầu của bạn đã được ghi nhận. Một cán bộ sẽ xem xét và phản hồi sớm nhất có thể.',
                timestamp: new Date().toISOString()
            }
        }

        return null;
    };


    const handleSendMessage = (content: string, residentId: string, as: 'admin' | 'resident') => {
        if (!selectedConversationId) return;

        const newMessage: ChatbotMessage = {
            id: `CB_M${Date.now()}`,
            sender: as,
            content,
            timestamp: new Date().toISOString(),
        };

        let botReply: ChatbotMessage | null = null;
        if (as === 'resident') {
            const resident = residents.get(residentId);
            if (resident) {
                botReply = getBotResponse(content, resident);
            }
        }
        
        setConversations(prev => prev.map(convo => {
            if (convo.id === selectedConversationId) {
                const updatedMessages = [...convo.messages, newMessage];
                if (botReply) {
                    updatedMessages.push(botReply);
                }
                return { ...convo, messages: updatedMessages };
            }
            return convo;
        }));
    };

    return (
        <div className="flex h-[calc(100vh-7.5rem)] gap-6">
            <div className="w-1/3 bg-white rounded-xl shadow-md flex flex-col">
                <ChatbotConversationList
                    conversations={conversations}
                    residents={residents}
                    onSelectConversation={setSelectedConversationId}
                    selectedConversationId={selectedConversationId}
                />
            </div>
            <div className="w-2/3 flex flex-col gap-6">
                <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col">
                    {selectedConversation && residents.has(selectedConversation.residentId) ? (
                        <ChatbotWindow
                            conversation={selectedConversation}
                            resident={residents.get(selectedConversation.residentId)!}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                <p className="mt-2">Chọn một hội thoại để xem chi tiết</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chatbot;