
'use client';

import React, { useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../lib/slices/userSlice';
import { RootState } from '../../lib/store';
import { signOut } from 'firebase/auth';
import { auth } from '../../components/firebase';
import Navbar from '../../components/navbar';
import Sidebar from '../../components/sidebar';
import { Chat } from '../../lib/firestore';

interface SidebarContextType {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  onUserSelect: (userId: string) => void;
  setOnUserSelect: (fn: (userId: string) => void) => void;
  onGroupCreated?: (chatId: string) => void;
  setOnGroupCreated: (fn: (chatId: string) => void) => void;
  onChatSelect: (chatId: string) => void;
  setOnChatSelect: (fn: (chatId: string) => void) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [onUserSelect, setOnUserSelect] = useState<(userId: string) => void>(() => {});
  const [onGroupCreated, setOnGroupCreated] = useState<(chatId: string) => void>(() => {});
  const [onChatSelect, setOnChatSelect] = useState<(chatId: string) => void>(() => {});
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Message',
      description: 'You have a new message from Jane Doe',
      time: '2 minutes ago',
      read: false,
      type: 'message' as const,
    },
    {
      id: '2',
      title: 'System Update',
      description: 'Scheduled maintenance tonight at 2 AM',
      time: '1 hour ago',
      read: true,
      type: 'system' as const,
    },
    {
      id: '3',
      title: 'New Team Member',
      description: 'John Smith has joined your team',
      time: '3 hours ago',
      read: false,
      type: 'alert' as const,
    },
  ]);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search logic here
  };

  const handleNotificationClick = (id: string) => {
    console.log('Notification clicked:', id);
    // Mark as read or navigate
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'authToken=; path=/; max-age=0; secure; samesite=strict';
      dispatch(clearUser());
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SidebarContext.Provider value={{
      sidebarVisible,
      setSidebarVisible,
      onUserSelect,
      setOnUserSelect,
      onGroupCreated,
      setOnGroupCreated,
      onChatSelect,
      setOnChatSelect,
      chats,
      setChats,
      activeChatId,
      setActiveChatId
    }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar
          user={user ? {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            avatar: user.photoURL,
            role: user.role || 'User',
          } : undefined}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          sidebarVisible={sidebarVisible}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        />

        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          {sidebarVisible && (
            <Sidebar
              activeChatId={activeChatId}
              activeUserId={user?.uid}
              onUserSelect={onUserSelect}
              onChatSelect={onChatSelect}
              onGroupCreated={onGroupCreated}
              currentUser={user ? {
                id: user.uid,
                email: user.email,
                username: user.displayName?.split(' ')[0] || user.email.split('@')[0],
                photoURL: user.photoURL,
                status: 'online'
              } : undefined}
              chats={chats}
            />
          )}

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}