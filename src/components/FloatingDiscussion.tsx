import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, RefreshCw, Edit2, Check, RotateCcw, Reply, CornerUpLeft } from 'lucide-react';
import { discussionAPI, Message } from '../utils/discussionAPI';
import { getDeviceFingerprint } from '../utils/anonymousUser';
import { useUserStore, validateUsername } from '../utils/userStore';

// 悬浮按钮样式
const FloatingButton = styled(motion.button)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.3);
  z-index: 1000;
  color: white;
  
  &:hover {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    bottom: 20px;
    right: 20px;
  }
`;

// 新消息红点
const NotificationDot = styled(motion.div)`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
`;

// 讨论面板容器
const DiscussionPanel = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 350px;
  height: 450px;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    height: 400px;
    right: 20px;
    bottom: 90px;
  }
`;

// 面板头部
const PanelHeader = styled.div`
  padding: 16px 20px;
  background: #3f3f46;
  border-bottom: 1px solid #52525b;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelTitle = styled.h3`
  color: #e4e4e7;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #e4e4e7;
    background: #52525b;
  }
`;

// 消息列表容器
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #3f3f46;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #52525b;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #71717a;
  }
`;

// 单条消息样式
const MessageItem = styled(motion.div)<{ isReply?: boolean }>`
  margin-bottom: 12px;
  padding: 12px;
  background: #3f3f46;
  border-radius: 8px;
  border-left: 3px solid ${props => props.isReply ? '#22c55e' : '#0ea5e9'};
  position: relative;
`;

// 回复消息的引用内容
const ReplyReference = styled.div`
  background: #52525b;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-left: 3px solid #71717a;
  opacity: 0.8;
`;

const ReplyToText = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

const ReplyToUsername = styled.span`
  color: #71717a;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ReplyToContent = styled.p`
  color: #a1a1aa;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.3;
  max-height: 3.6rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const MessageHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MessageHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MessageUsername = styled.span`
  color: #0ea5e9;
  font-size: 0.85rem;
  font-weight: 600;
`;

const MessageTime = styled.span`
  color: #71717a;
  font-size: 0.75rem;
`;

const MessageContent = styled.p`
  color: #d4d4d8;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  word-wrap: break-word;
`;

// 消息操作按钮
const MessageActionButton = styled.button`
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.2s ease;
  
  &:hover {
    color: #0ea5e9;
    background: rgba(14, 165, 233, 0.1);
    opacity: 1;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// 回复输入区域提示
const ReplyingToIndicator = styled(motion.div)`
  padding: 8px 16px;
  background: #52525b;
  border-top: 1px solid #71717a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #a1a1aa;
`;

const ReplyingToText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CancelReplyButton = styled.button`
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

// 输入区域
const InputContainer = styled.div`
  background: #3f3f46;
  border-top: 1px solid #52525b;
`;

// 用户名区域
const UsernameSection = styled.div`
  padding: 12px 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const UsernameDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const UsernameText = styled.span`
  color: #0ea5e9;
  font-size: 0.85rem;
  font-weight: 500;
`;

const UsernameInput = styled.input`
  background: #27272a;
  border: 1px solid #52525b;
  border-radius: 6px;
  padding: 4px 8px;
  color: #e4e4e7;
  font-size: 0.85rem;
  width: 150px;
  
  &:focus {
    outline: none;
    border-color: #0ea5e9;
  }
  
  &::placeholder {
    color: #71717a;
  }
`;

const UsernameActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UsernameButton = styled.button`
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #e4e4e7;
    background: #52525b;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
  margin-left: 16px;
`;

// 输入框包装器
const MessageInputSection = styled.div`
  padding: 12px 16px 16px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: #27272a;
  border: 1px solid #52525b;
  border-radius: 8px;
  padding: 8px 12px;
  color: #e4e4e7;
  font-size: 0.9rem;
  resize: none;
  min-height: 36px;
  max-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #0ea5e9;
  }
  
  &::placeholder {
    color: #71717a;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 36px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0284c7 0%, #075985 100%);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 空状态
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
  color: #71717a;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

// 加载状态
const LoadingSpinner = styled(motion.div)`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #52525b;
  border-radius: 50%;
  border-top-color: #0ea5e9;
`;

export const FloatingDiscussion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  
  // 用户名管理
  const { 
    isEditing, 
    setUsername, 
    startEditing, 
    stopEditing, 
    resetToDefault, 
    getDisplayUsername 
  } = useUserStore();
  
  const [tempUsername, setTempUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  // 回复状态管理
  const [isReplying, setIsReplying] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
    content: string;
  } | null>(null);
  
  // 存储所有原始消息的内容，用于显示回复引用
  const [originalMessages, setOriginalMessages] = useState<Map<string, {
    username: string;
    content: string;
  }>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 加载消息
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await discussionAPI.getMessages(1, 50);
      if (response.success) {
        console.log('Loaded messages:', response.data.messages);
        setMessages(response.data.messages);
        
        // 构建原始消息映射
        const messageMap = new Map();
        response.data.messages.forEach(msg => {
          messageMap.set(msg.id, {
            username: msg.username,
            content: msg.content
          });
        });
        setOriginalMessages(messageMap);
        
        // 检查是否有新消息
        if (response.data.messages.length > lastMessageCount && lastMessageCount > 0) {
          setHasNewMessages(true);
        }
        setLastMessageCount(response.data.messages.length);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 开始回复某条消息
  const handleStartReply = async (message: Message) => {
    console.log('Starting reply to message:', message);
    try {
      // 如果是回复消息，需要获取原始消息信息
      const targetId = message.replyToId || message.id;
      console.log('Target message ID:', targetId);
      
      const response = await discussionAPI.getReplyInfo(targetId);
      console.log('Reply info response:', response);
      
      if (response.success) {
        setReplyingTo({
          id: targetId,
          username: response.data.username,
          content: response.data.content
        });
        setIsReplying(true);
        
        // 聚焦到输入框
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to get reply info:', error);
      // 回退到使用当前消息信息
      setReplyingTo({
        id: message.id,
        username: message.username,
        content: message.content
      });
      setIsReplying(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // 取消回复
  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyingTo(null);
  };

  // 用户名编辑处理函数
  const handleStartEditUsername = () => {
    setTempUsername(getDisplayUsername());
    setUsernameError('');
    startEditing();
    setTimeout(() => {
      usernameInputRef.current?.focus();
      usernameInputRef.current?.select();
    }, 0);
  };

  const handleSaveUsername = () => {
    const validation = validateUsername(tempUsername);
    if (!validation.valid) {
      setUsernameError(validation.message || '');
      return;
    }
    
    setUsername(tempUsername);
    setUsernameError('');
    stopEditing();
  };

  const handleCancelEditUsername = () => {
    setTempUsername('');
    setUsernameError('');
    stopEditing();
  };

  const handleResetUsername = () => {
    resetToDefault();
    setUsernameError('');
    stopEditing();
  };

  const handleUsernameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveUsername();
    } else if (e.key === 'Escape') {
      handleCancelEditUsername();
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    try {
      setIsSending(true);
      const currentUsername = getDisplayUsername();
      const metadata = {
        ...getDeviceFingerprint(),
        page: window.location.pathname
      };
      
      const response = await discussionAPI.createMessage({
        username: currentUsername,
        content: newMessage.trim(),
        replyToId: isReplying ? replyingTo?.id : undefined,
        replyToUsername: isReplying ? replyingTo?.username : undefined,
        metadata
      });
      
      if (response.success) {
        setNewMessage('');
        setIsReplying(false);
        setReplyingTo(null);
        await loadMessages(); // 重新加载消息
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 打开面板时的处理
  const handleOpenPanel = () => {
    setIsOpen(true);
    setHasNewMessages(false);
    if (messages.length === 0) {
      loadMessages();
    }
  };

  // 自动调整输入框高度
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 80)}px`;
    }
  };

  // 初始加载
  useEffect(() => {
    loadMessages();
    
    // 定期检查新消息（5分钟间隔）
    const interval = setInterval(loadMessages, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 滚动到底部
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  return (
    <>
      {/* 悬浮按钮 */}
      <FloatingButton
        onClick={handleOpenPanel}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <MessageCircle size={24} />
        <AnimatePresence>
          {hasNewMessages && (
            <NotificationDot
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </AnimatePresence>
      </FloatingButton>

      {/* 讨论面板 */}
      <AnimatePresence>
        {isOpen && (
          <DiscussionPanel
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            {/* 头部 */}
            <PanelHeader>
              <PanelTitle>
                <MessageCircle size={16} />
                讨论区
              </PanelTitle>
              <div style={{ display: 'flex', gap: '8px' }}>
                <HeaderButton onClick={loadMessages} disabled={isLoading}>
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </HeaderButton>
                <HeaderButton onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </HeaderButton>
              </div>
            </PanelHeader>

            {/* 消息列表 */}
            <MessagesContainer>
              {isLoading && messages.length === 0 ? (
                <EmptyState>
                  <LoadingSpinner
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </EmptyState>
              ) : messages.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>💬</EmptyIcon>
                  <EmptyText>
                    还没有人发言，成为第一个发言的人吧！
                  </EmptyText>
                </EmptyState>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageItem
                      key={message.id}
                      isReply={!!message.replyToId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* 如果是回复消息，显示被回复的内容 */}
                      {message.replyToId && message.replyToUsername && (
                        <ReplyReference>
                          <ReplyToText>
                            <CornerUpLeft size={12} />
                            <ReplyToUsername>回复 @{message.replyToUsername}</ReplyToUsername>
                          </ReplyToText>
                          <ReplyToContent>
                            {/* 显示被回复的原始内容 */}
                            {(() => {
                              const originalMsg = originalMessages.get(message.replyToId);
                              console.log('Original message for', message.replyToId, ':', originalMsg);
                              if (originalMsg) {
                                const content = originalMsg.content;
                                return content.length > 100 ? content.substring(0, 100) + '...' : content;
                              }
                              return '原消息内容未找到';
                            })()}
                          </ReplyToContent>
                        </ReplyReference>
                      )}
                      
                      <MessageHeader>
                        <MessageHeaderLeft>
                          <MessageUsername>{message.username}</MessageUsername>
                        </MessageHeaderLeft>
                        <MessageHeaderRight>
                          <MessageTime>{formatTime(message.createdAt)}</MessageTime>
                          <MessageActionButton
                            onClick={() => handleStartReply(message)}
                            title="回复"
                          >
                            <Reply size={14} />
                          </MessageActionButton>
                        </MessageHeaderRight>
                      </MessageHeader>
                      
                      <MessageContent>{message.content}</MessageContent>
                    </MessageItem>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </MessagesContainer>

            {/* 输入区域 */}
            <InputContainer>
              {/* 回复提示区域 */}
              <AnimatePresence>
                {isReplying && replyingTo && (
                  <ReplyingToIndicator
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ReplyingToText>
                      <Reply size={16} />
                      <span>回复 @{replyingTo.username}: {replyingTo.content.length > 50 ? replyingTo.content.substring(0, 50) + '...' : replyingTo.content}</span>
                    </ReplyingToText>
                    <CancelReplyButton onClick={handleCancelReply} title="取消回复">
                      <X size={16} />
                    </CancelReplyButton>
                  </ReplyingToIndicator>
                )}
              </AnimatePresence>
              
              {/* 用户名区域 */}
              <UsernameSection>
                <UsernameDisplay>
                  {isEditing ? (
                    <UsernameInput
                      ref={usernameInputRef}
                      value={tempUsername}
                      onChange={(e) => {
                        setTempUsername(e.target.value);
                        setUsernameError('');
                      }}
                      onKeyDown={handleUsernameKeyPress}
                      placeholder="输入用户名..."
                      maxLength={20}
                    />
                  ) : (
                    <UsernameText>{getDisplayUsername()}</UsernameText>
                  )}
                </UsernameDisplay>
                
                <UsernameActions>
                  {isEditing ? (
                    <>
                      <UsernameButton
                        onClick={handleSaveUsername}
                        disabled={!tempUsername.trim()}
                        title="保存"
                      >
                        <Check size={14} />
                      </UsernameButton>
                      <UsernameButton
                        onClick={handleResetUsername}
                        title="重置为默认"
                      >
                        <RotateCcw size={14} />
                      </UsernameButton>
                      <UsernameButton
                        onClick={handleCancelEditUsername}
                        title="取消"
                      >
                        <X size={14} />
                      </UsernameButton>
                    </>
                  ) : (
                    <UsernameButton
                      onClick={handleStartEditUsername}
                      title="编辑用户名"
                    >
                      <Edit2 size={14} />
                    </UsernameButton>
                  )}
                </UsernameActions>
              </UsernameSection>
              
              {/* 错误提示 */}
              {usernameError && (
                <ErrorMessage>{usernameError}</ErrorMessage>
              )}
              
              {/* 消息输入区域 */}
              <MessageInputSection>
                <InputWrapper>
                  <MessageInput
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      adjustTextareaHeight();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="输入你的想法..."
                    maxLength={500}
                    rows={1}
                  />
                  <SendButton
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <LoadingSpinner
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </SendButton>
                </InputWrapper>
              </MessageInputSection>
            </InputContainer>
          </DiscussionPanel>
        )}
      </AnimatePresence>
    </>
  );
};