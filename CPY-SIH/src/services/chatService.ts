import { ChatGroup, ChatMessage, Farmer } from '../types/farmer';
import { storageService } from './storage';

export class ChatService {
  async getLocalChatGroups(farmer: Farmer): Promise<ChatGroup[]> {
    // Simulate loading local chat groups based on farmer's location
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const groups: ChatGroup[] = [
      {
        id: 'group_1',
        name: `${farmer.location.district} Farmers Network`,
        description: 'Local farming community for sharing insights and experiences',
        location: `${farmer.location.district}, ${farmer.location.state}`,
        memberCount: 127,
        lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        messages: [
          {
            id: 'msg_1',
            senderId: 'farmer_123',
            senderName: 'Rajesh Kumar',
            message: 'Good morning everyone! Just applied fertilizer to my wheat crop. Expecting good results this season.',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            type: 'text',
            cropType: 'wheat'
          },
          {
            id: 'msg_2',
            senderId: 'farmer_456',
            senderName: 'Priya Sharma',
            message: 'Has anyone noticed aphid infestation in their crops? I found some on my cotton plants yesterday.',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            type: 'text',
            cropType: 'cotton'
          },
          {
            id: 'msg_3',
            senderId: 'farmer_789',
            senderName: 'Suresh Patel',
            message: 'Weather forecast shows rain in next 2 days. Planning to delay irrigation accordingly.',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            type: 'text'
          }
        ]
      },
      {
        id: 'group_2',
        name: `${farmer.cropDetails[0]?.cropType || 'Crop'} Specialists`,
        description: `Expert advice and tips for ${farmer.cropDetails[0]?.cropType || 'crop'} cultivation`,
        location: farmer.location.state,
        memberCount: 89,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        messages: [
          {
            id: 'msg_4',
            senderId: 'expert_1',
            senderName: 'Dr. Agricultural Expert',
            message: `For optimal ${farmer.cropDetails[0]?.cropType || 'crop'} yield, maintain soil pH between 6.0-7.5 and ensure adequate drainage.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            type: 'text',
            cropType: farmer.cropDetails[0]?.cropType
          }
        ]
      }
    ];
    
    return groups;
  }

  async sendMessage(groupId: string, message: string, farmer: Farmer): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: farmer.id,
      senderName: farmer.name,
      message,
      timestamp: new Date().toISOString(),
      type: 'text',
      cropType: farmer.cropDetails[0]?.cropType
    };

    // Store message locally
    await storageService.store(`chat_${groupId}`, newMessage);
    await storageService.setSyncStatus(`chat_${newMessage.id}`, false);

    return newMessage;
  }

  async getGroupMessages(groupId: string): Promise<ChatMessage[]> {
    try {
      const messages = await storageService.getAll(`chat_${groupId}`);
      return messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      return [];
    }
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
}

export const chatService = new ChatService();