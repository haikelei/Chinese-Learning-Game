import { api } from './httpClient';

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

  // 获取消息列表
  async getMessages(page = 1, limit = 50): Promise<MessageListResponse> {
    return api.get(`/api/discussion?page=${page}&limit=${limit}`);
  }

  // 创建新消息
  async createMessage(request: CreateMessageRequest): Promise<MessageResponse> {
    return api.post('/api/discussion', request);
  }

  // 获取单个消息
  async getMessage(id: string): Promise<MessageResponse> {
    return api.get(`/api/discussion/${id}`);
  }

  // 获取原始消息用于回复
  async getReplyInfo(id: string): Promise<ReplyInfoResponse> {
    return api.get(`/api/discussion/${id}/reply`);
  }

  // 删除消息
  async deleteMessage(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/api/discussion/${id}`);
  }
}

export const discussionAPI = new DiscussionAPI();