import { envConfig } from './envConfig';

// 讨论板API接口定义
export interface Message {
  id: string;
  userId: string | null;
  username: string;
  content: string;
  replyToId: string | null;
  replyToUsername: string | null;
  metadata?: any;
  createdAt: string;
}

export interface MessageListResponse {
  success: boolean;
  data: {
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export interface CreateMessageRequest {
  username: string;
  content: string;
  replyToId?: string;
  replyToUsername?: string;
  metadata?: any;
}

export interface ReplyInfoResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    content: string;
    createdAt: string;
  };
}

// 讨论板API客户端
class DiscussionAPI {
  private getApiUrl(path: string): string {
    return envConfig.getApiUrl(path);
  }

  // 获取消息列表
  async getMessages(page = 1, limit = 50): Promise<MessageListResponse> {
    const url = this.getApiUrl(`/api/discussion?page=${page}&limit=${limit}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // 创建新消息
  async createMessage(request: CreateMessageRequest): Promise<MessageResponse> {
    const url = this.getApiUrl('/api/discussion');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // 获取单个消息
  async getMessage(id: string): Promise<MessageResponse> {
    const url = this.getApiUrl(`/api/discussion/${id}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // 获取原始消息用于回复
  async getReplyInfo(id: string): Promise<ReplyInfoResponse> {
    const url = this.getApiUrl(`/api/discussion/${id}/reply`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // 删除消息
  async deleteMessage(id: string): Promise<{ success: boolean; message: string }> {
    const url = this.getApiUrl(`/api/discussion/${id}`);
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const discussionAPI = new DiscussionAPI();