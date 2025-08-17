import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, RefreshCw, Edit2, Check, RotateCcw, Reply, CornerUpLeft } from 'lucide-react';
import { discussionAPI, Message } from '../utils/discussionAPI';
import { getDeviceFingerprint } from '../utils/anonymousUser';
import { useUserStore, validateUsername } from '../utils/userStore';

// Floating button styles
const FloatingButton = styled(motion.button)`
  position: fixed;
  bottom: 130px;
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

// New message notification dot
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

// Discussion panel container
const DiscussionPanel = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 100px;
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

// Panel header
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

// Message list container
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

// Individual message styles
const MessageItem = styled(motion.div)<{ isReply?: boolean }>`
  margin-bottom: 12px;
  padding: 12px;
  background: #3f3f46;
  border-radius: 8px;
  border-left: 3px solid ${props => props.isReply ? '#22c55e' : '#0ea5e9'};
  position: relative;
`;

// Reply message reference content
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

// Message action buttons
const MessageActionButton = styled.button`
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0.7;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  
  &:hover {
    color: #0ea5e9;
    background: rgba(14, 165, 233, 0.1);
    opacity: 1;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// Reply input area indicator
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

// Input area
const InputContainer = styled.div`
  background: #3f3f46;
  border-top: 1px solid #52525b;
`;

// Username area
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

const UsernameWithEdit = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
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

// Input wrapper
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

// Empty state
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

// Loading state
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
  
  // Username management
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
  
  // Reply state management
  const [isReplying, setIsReplying] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
    content: string;
  } | null>(null);
  
  // Store all original message content for reply references
  const [originalMessages, setOriginalMessages] = useState<Map<string, {
    username: string;
    content: string;
  }>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await discussionAPI.getMessages(1, 50);
      if (response.success) {
        console.log('Loaded messages:', response.data.messages);
        // Sort by creation time, newest at bottom
        const sortedMessages = response.data.messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        
        // Build original message mapping
        const messageMap = new Map();
        sortedMessages.forEach(msg => {
          messageMap.set(msg.id, {
            username: msg.username,
            content: msg.content
          });
        });
        setOriginalMessages(messageMap);
        
        // Check for new messages
        if (sortedMessages.length > lastMessageCount && lastMessageCount > 0) {
          setHasNewMessages(true);
        }
        setLastMessageCount(sortedMessages.length);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start replying to a message
  const handleStartReply = async (message: Message) => {
    console.log('Starting reply to message:', message);
    try {
      // If it's a reply message, need to get original message info
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
        
        // Focus on input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to get reply info:', error);
      // Fallback to using current message info
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

  // Cancel reply
  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyingTo(null);
  };

  // Username editing handlers
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

  // Handle username input blur
  const handleUsernameBlur = () => {
    // Auto-save on blur (if there's content)
    if (tempUsername.trim()) {
      handleSaveUsername();
    } else {
      handleCancelEditUsername();
    }
  };

  // Send message
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
        await loadMessages(); // Reload messages
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Format time in English
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Within 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Within 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Within 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Handle Enter key for sending
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle panel opening
  const handleTogglePanel = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setHasNewMessages(false);
      if (messages.length === 0) {
        loadMessages();
      }
    }
  };

  // Auto-adjust textarea height
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 80)}px`;
    }
  };

  // Initial load
  useEffect(() => {
    loadMessages();
    
    // Periodically check for new messages (5-minute interval)
    const interval = setInterval(loadMessages, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  return (
    <>
      {/* Floating button */}
      <FloatingButton
        onClick={handleTogglePanel}
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

      {/* Discussion panel */}
      <AnimatePresence>
        {isOpen && (
          <DiscussionPanel
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            {/* Header */}
            <PanelHeader>
              <PanelTitle>
                <MessageCircle size={16} />
Discussion
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

            {/* Message list */}
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
                    No messages yet. Be the first to start the conversation!
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
                      {/* If it's a reply message, show the replied content */}
                      {message.replyToId && message.replyToUsername && (
                        <ReplyReference>
                          <ReplyToText>
                            <CornerUpLeft size={12} />
                            <ReplyToUsername>Replying to @{message.replyToUsername}</ReplyToUsername>
                          </ReplyToText>
                          <ReplyToContent>
                            {/* Show original replied content */}
                            {(() => {
                              const originalMsg = originalMessages.get(message.replyToId);
                              console.log('Original message for', message.replyToId, ':', originalMsg);
                              if (originalMsg) {
                                const content = originalMsg.content;
                                return content.length > 100 ? content.substring(0, 100) + '...' : content;
                              }
                              return 'Original message not found';
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
                            title="Reply to this message"
                          >
                            <Reply size={12} />
                            <span>Reply</span>
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

            {/* Input area */}
            <InputContainer>
              {/* Reply indicator area */}
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
                      <span>Replying to @{replyingTo.username}: {replyingTo.content.length > 50 ? replyingTo.content.substring(0, 50) + '...' : replyingTo.content}</span>
                    </ReplyingToText>
                    <CancelReplyButton onClick={handleCancelReply} title="Cancel reply">
                      <X size={16} />
                    </CancelReplyButton>
                  </ReplyingToIndicator>
                )}
              </AnimatePresence>
              
              {/* Username area */}
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
                      onBlur={handleUsernameBlur}
                      placeholder="Enter username..."
                      maxLength={20}
                    />
                  ) : (
                    <UsernameWithEdit>
                      <UsernameText>{getDisplayUsername()}</UsernameText>
                      <UsernameButton
                        onClick={handleStartEditUsername}
                        title="Edit username"
                      >
                        <Edit2 size={14} />
                      </UsernameButton>
                    </UsernameWithEdit>
                  )}
                </UsernameDisplay>
                
                {isEditing && (
                  <UsernameActions>
                    <UsernameButton
                      onClick={handleSaveUsername}
                      disabled={!tempUsername.trim()}
                      title="Save"
                    >
                      <Check size={14} />
                    </UsernameButton>
                    <UsernameButton
                      onClick={handleResetUsername}
                      title="Reset to default"
                    >
                      <RotateCcw size={14} />
                    </UsernameButton>
                    <UsernameButton
                      onClick={handleCancelEditUsername}
                      title="Cancel"
                    >
                      <X size={14} />
                    </UsernameButton>
                  </UsernameActions>
                )}
              </UsernameSection>
              
              {/* Error message */}
              {usernameError && (
                <ErrorMessage>{usernameError}</ErrorMessage>
              )}
              
              {/* Message input area */}
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
                    placeholder="Share your thoughts..."
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