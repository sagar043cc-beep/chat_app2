'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createChat, sendMessage, getChats, getChat, Chat, Message, getAllUsers, subscribeToMessages, getUserProfile } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Smile, Paperclip, Phone, Video, Info } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { RootState } from '@/lib/store';
import { useSidebar } from './layout';
import GroupMembersModal from '@/components/group-members-modal';

// Available chat background images from public folder
const CHAT_BACKGROUNDS = [
  { id: 'none', name: 'No Background', path: '' },
  { id: 'gradient1', name: 'Blue Gradient', path: '/bg1.jpg' },
  { id: 'gradient2', name: 'Purple Gradient', path: '/bg2.jpg' },
  { id: 'abstract1', name: 'Abstract 1', path: '/bg3.jpg' },
  { id: 'abstract2', name: 'Abstract 2', path: '/bg4.jpg' },
];

const DashboardPage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const { setOnUserSelect, setOnGroupCreated, setOnChatSelect, chats, setChats, setActiveChatId } = useSidebar();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentChatUser, setCurrentChatUser] = useState<{ id: string; email: string; username?: string; displayName?: string; photoURL?: string; status?: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userProfile, setUserProfile] = useState<{ chatBackground?: string; themeColor?: string } | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Format timestamp for display
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Now';
    }
  };

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setActiveChatId(chatId);
  }, [chatId, setActiveChatId]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile({
              chatBackground: profile.chatBackground,
              themeColor: profile.themeColor,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user?.uid]);

  // Load last active chat on mount
  useEffect(() => {
    if (user?.uid) {
      const lastChatId = localStorage.getItem(`lastChat_${user.uid}`);
      if (lastChatId) {
        const loadLastChat = async () => {
          try {
            const userChats = await getChats(user.uid);
            const lastChat = userChats.find(c => c.id === lastChatId);
            if (lastChat) {
              setCurrentChat(lastChat);
              setIsCurrentUserAdmin(lastChat.admins?.includes(user.uid) || false);

              if (lastChat.type === 'direct') {
                const otherParticipantId = lastChat.participants.find(p => p !== user.uid);
                if (otherParticipantId) {
                  const allUsers = await getAllUsers();
                  const otherUser = allUsers.find(u => u.id === otherParticipantId);
                  if (otherUser) {
                    setCurrentChatUser({
                      id: otherUser.id,
                      email: otherUser.email,
                      username: otherUser.username,
                      displayName: otherUser.displayName,
                      photoURL: otherUser.photoURL,
                      status: otherUser.status
                    });
                  }
                }
              } else {
                // For group chats, clear currentChatUser
                setCurrentChatUser(null);
              }
              setChatId(lastChatId);
            }
          } catch (error) {
            console.error('Error loading last chat:', error);
          }
        };
        loadLastChat();
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.uid) return;
      try {
        const fetchedChats = await getChats(user.uid);
        setChats(fetchedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user?.uid, setChats]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(chatId, (updatedMessages) => {
      setMessages(updatedMessages);
    }, 50);

    return () => unsubscribe();
  }, [chatId]);

  const handleGroupCreated = async (chatId: string) => {
    if (!user?.uid) return;

    try {
      // Fetch the newly created chat
      const newChat = await getChat(chatId);
      if (newChat) {
        setChats([newChat, ...chats]);
        setChatId(chatId);
        setCurrentChat(newChat);
        setIsCurrentUserAdmin(newChat.admins?.includes(user.uid) || false);
        setCurrentChatUser(null); // Clear for group chat
        localStorage.setItem(`lastChat_${user.uid}`, chatId);
      }
    } catch (error) {
      console.error('Error loading new group:', error);
    }
  };

  const handleChatSelect = useCallback(async (selectedChatId: string) => {
    if (!user?.uid) return;
    try {
      const selectedChat = chats.find(c => c.id === selectedChatId);
      if (selectedChat) {
        setChatId(selectedChatId);
        setCurrentChat(selectedChat);
        setIsCurrentUserAdmin(selectedChat.admins?.includes(user.uid) || false);
        localStorage.setItem(`lastChat_${user.uid}`, selectedChatId);

        if (selectedChat.type === 'direct') {
          const otherParticipantId = selectedChat.participants.find(p => p !== user.uid);
          if (otherParticipantId) {
            const allUsers = await getAllUsers();
            const otherUser = allUsers.find(u => u.id === otherParticipantId);
            if (otherUser) {
              setCurrentChatUser({
                id: otherUser.id,
                email: otherUser.email,
                username: otherUser.username,
                displayName: otherUser.displayName,
                photoURL: otherUser.photoURL,
                status: otherUser.status
              });
            }
          }
        } else {
          setCurrentChatUser(null);
        }
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  }, [user?.uid, chats]);

  useEffect(() => {
    setOnUserSelect(() => handleUserSelect);
    setOnGroupCreated(() => handleGroupCreated);
    setOnChatSelect(() => handleChatSelect);
  }, [handleChatSelect]);

  const handleUserSelect = async (selectedUserId: string) => {
    if (!user?.uid) return;
    try {
      const allUsers = await getAllUsers();
      const selectedUser = allUsers.find(u => u.id === selectedUserId);
      if (selectedUser) {
        setCurrentChatUser({
          id: selectedUser.id,
          email: selectedUser.email,
          username: selectedUser.username,
          displayName: selectedUser.displayName,
          photoURL: selectedUser.photoURL,
          status: selectedUser.status
        });
      }

      const existingChats = await getChats(user.uid);
      const chat = existingChats.find((c: Chat) => c.participants.includes(selectedUserId) && c.participants.length === 2);
      if (chat) {
        setChatId(chat.id);
        setCurrentChat(chat);
        setIsCurrentUserAdmin(chat.admins?.includes(user.uid) || false);
        localStorage.setItem(`lastChat_${user.uid}`, chat.id);
      } else {
        const chatId = await createChat({
          type: 'direct',
          participants: [user.uid, selectedUserId],
          createdBy: user.uid
        });
        setChatId(chatId);
        localStorage.setItem(`lastChat_${user.uid}`, chatId);
        const newChat: Chat = {
          id: chatId,
          type: 'direct',
          participants: [user.uid, selectedUserId],
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          createdBy: user.uid,
          createdAt: new Date().toISOString()
        };
        setChats([newChat, ...chats]);
        setCurrentChat(newChat);
        setIsCurrentUserAdmin(false); // Direct chats don't have admins
      }
    } catch (error) {
      console.error('Error selecting user:', error);
    }
  };

  // Enhanced send message with trim validation
  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    
    // Prevent sending empty or whitespace-only messages
    if (!chatId || !trimmedMessage || !user?.uid) {
      return;
    }

    try {
      await sendMessage(chatId, {
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'User',
        text: trimmedMessage
      });
      
      // Clear input after successful send
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  // Handle key press with validation
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedMessage = newMessage.trim();
      if (trimmedMessage && chatId && user?.uid) {
        handleSendMessage();
      }
    }
  };

  // Check if send button should be disabled
  const isSendDisabled = !newMessage.trim() || !chatId;

  const getSelectedBackground = () => {
    return CHAT_BACKGROUNDS.find(bg => bg.id === userProfile?.chatBackground);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex flex-col h-full flex-1 backdrop-blur-sm">
        {/* Header - Responsive */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
          <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {chatId && currentChat
                      ? currentChat.type === 'group'
                        ? `${currentChat.name || 'Group Chat'} (${currentChat.participants.length} members)`
                        : `Chat with ${currentChatUser?.displayName || currentChatUser?.username || currentChatUser?.email.split('@')[0]}`
                      : 'Messages'}
                  </h1>
                  {currentChat?.type === 'group' && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {isCurrentUserAdmin ? 'You are an admin' : 'Group chat'}
                    </p>
                  )}
                </div>
              </div>
              
              {chatId && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                  </Button>
                  {currentChat?.type === 'group' && (
                    <GroupMembersModal
                      chatId={chatId}
                      chat={currentChat}
                      currentUserId={user?.uid || ''}
                      isAdmin={isCurrentUserAdmin}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                        </Button>
                      }
                    />
                  )}
                  {currentChat?.type === 'direct' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area - Responsive */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            backgroundImage: getSelectedBackground()?.path ? `url(${getSelectedBackground()?.path})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {chatId ? (
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 sm:h-96 text-center px-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-6 sm:p-8 shadow-2xl mb-4 sm:mb-6">
                      <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3">Start the conversation</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-sm">
                    Send your first message and begin chatting
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div
                        className={`group max-w-[85%] sm:max-w-[75%] md:max-w-[70%] px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-3xl ${
                          msg.senderId === user?.uid
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-lg hover:shadow-xl'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-md shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700'
                        } transition-all duration-300`}
                      >
                        <p className="text-sm sm:text-[15px] leading-relaxed break-words">{msg.text}</p>
                        <div className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 flex items-center gap-1 ${msg.senderId === user?.uid ? 'text-blue-100 justify-end' : 'text-gray-400 dark:text-gray-500'}`}>
                          <span>{formatMessageTime(msg.sentAt)}</span>
                          {msg.senderId === user?.uid && (
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="max-w-xl text-center">
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-full blur-3xl"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full p-8 sm:p-10 md:p-12 shadow-2xl inline-flex">
                    <MessageSquare className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Welcome to Your Inbox
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed px-4">
                  Select a conversation from the sidebar or create a new group to start connecting with others
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Responsive */}
        {chatId && (
          <div className="sticky bottom-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 relative">
              <div className="flex items-end gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all mb-1 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                </Button>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl px-3 sm:px-4 md:px-5 py-1 shadow-inner">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full py-2 sm:py-2.5 md:py-3 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-[15px]"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all mb-1 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 hidden sm:flex"
                >
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={isSendDisabled}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed p-0 flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-20">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setNewMessage(prev => prev + emojiObject.emoji);
                      setShowEmojiPicker(false);
                    }}
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;