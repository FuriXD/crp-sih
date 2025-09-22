import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Users, Clock, X, 
  ChevronDown, Image, Mic, MoreVertical 
} from 'lucide-react';
import { ChatGroup as ChatGroupType, ChatMessage, Farmer } from '../types/farmer';
import { chatService } from '../services/chatService';

interface ChatGroupProps {
  farmer: Farmer;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatGroup({ farmer, isOpen, onClose }: ChatGroupProps) {
  const [chatGroups, setChatGroups] = useState<ChatGroupType[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroupType | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedGroup?.messages]);

  const loadChatGroups = async () => {
    setIsLoading(true);
    try {
      const groups = await chatService.getLocalChatGroups(farmer);
      setChatGroups(groups);
      if (groups.length > 0) {
        setSelectedGroup(groups[0]);
      }
    } catch (error) {
      console.error('Failed to load chat groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const message = await chatService.sendMessage(selectedGroup.id, newMessage, farmer);
      
      // Update local state
      setSelectedGroup(prev => prev ? {
        ...prev,
        messages: [message, ...prev.messages],
        lastActivity: message.timestamp
      } : null);

      setChatGroups(prev => prev.map(group => 
        group.id === selectedGroup.id 
          ? { ...group, messages: [message, ...group.messages], lastActivity: message.timestamp }
          : group
      ));

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Groups Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="mr-2 text-green-500" size={20} />
              Community Chat
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm text-gray-600">Loading groups...</div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chatGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'bg-green-50 border border-green-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {group.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {chatService.formatTimeAgo(group.lastActivity)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Users size={12} className="mr-1" />
                      {group.memberCount} members
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Users size={14} className="mr-1" />
                      {selectedGroup.memberCount} members • {selectedGroup.location}
                    </p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedGroup.messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  selectedGroup.messages.slice().reverse().map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === farmer.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === farmer.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.senderId !== farmer.id && (
                          <div className="text-xs font-medium mb-1 opacity-75">
                            {message.senderName}
                            {message.cropType && (
                              <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded text-xs">
                                {message.cropType}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <div className={`text-xs mt-1 opacity-75 ${
                          message.senderId === farmer.id ? 'text-right' : 'text-left'
                        }`}>
                          {chatService.formatTimeAgo(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Image size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Mic size={18} className="text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Select a group to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}