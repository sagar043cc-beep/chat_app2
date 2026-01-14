'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAllUsers, User, Chat } from '@/lib/firestore';
import {
  Search,
  Users,
  User as UserIcon,
  Clock,
  XCircle,
  Hash,
  Plus,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import GroupCreationModal from '@/components/group-creation-modal';

interface SidebarProps {
  activeChatId?: string | null;
  activeUserId?: string | null;
  onUserSelect: (userId: string) => void;
  onChatSelect: (chatId: string) => void;
  currentUser?: {
    id: string;
    email: string;
    username?: string;
    photoURL?: string;
    status?: string;
  } | null;
  chats?: Chat[];
  onGroupCreated?: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeChatId,
  activeUserId,
  onUserSelect,
  onChatSelect,
  currentUser,
  chats = [],
  onGroupCreated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'online'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'groups'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await getAllUsers();
        
        // Always filter out the current user based on their ID
        const filteredUsers = fetchedUsers.filter(user => {
          if (!currentUser || !currentUser.id) return true;
          return user.id !== currentUser.id;
        });
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleUserClick = async (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await onUserSelect(userId);
    } catch (error) {
      console.error('Error selecting user:', error);
    }
  };

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      
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
      return 'Recently';
    }
  };

  // Filter users and chats based on active tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeTab === 'all' ||
      (activeTab === 'online' && user.status === 'online') ||
      activeTab === 'groups';

    return matchesSearch && matchesFilter && activeTab !== 'groups';
  });

  // Filter group chats
  const filteredGroupChats = chats.filter(chat =>
    chat.type === 'group' && chat.participants.includes(currentUser?.id || '')
  ).filter(chat => {
    const matchesSearch = searchQuery === '' ||
      (chat.name && chat.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getUserInitials = (user: User) => {
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: User) => {
    return user.username || user.displayName || user.email.split('@')[0];
  };

  const getStatusColor = (user: User) => {
    if (user.status === 'online') return 'bg-green-500';
    if (user.lastSeen) {
      const lastSeen = new Date(user.lastSeen);
      const now = new Date();
      const diffHours = (now.getTime() - lastSeen.getTime()) / 3600000;
      if (diffHours < 1) return 'bg-green-400';
      if (diffHours < 24) return 'bg-yellow-500';
    }
    return 'bg-gray-400';
  };

  // Skeleton loading component
  const UserListSkeleton = () => (
    <div className="space-y-3 p-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-80 border-r bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-800">
        {/* Search */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder={activeTab === 'groups' ? "Search groups..." : "Search users..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Filter Tabs - Only showing all, online, groups */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('online')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'online'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
            }`}
          >
            Online ({users.filter(u => u.status === 'online').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'groups'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Groups ({filteredGroupChats.length})
          </button>
        </div>

        {/* Create New Group Button - SIMPLIFIED VERSION */}
        {activeTab === 'groups' && (
          <>
            {currentUser?.id && onGroupCreated ? (
              <GroupCreationModal
                currentUserId={currentUser.id}
                onGroupCreated={onGroupCreated}
                trigger={
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Group
                  </Button>
                }
              />
            ) : (
              // Fallback button if modal fails
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => alert('Create group functionality not available')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Group
              </Button>
            )}
          </>
        )}
      </div>

      {/* User/Group List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <UserListSkeleton />
        ) : activeTab === 'groups' ? (
          // Groups Tab Content - Show all existing groups
          <div className="h-full flex flex-col">
            {/* Groups Header */}
            <div className="p-3 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Groups ({filteredGroupChats.length})
                </h3>
                {filteredGroupChats.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Sorted by recent activity
                  </span>
                )}
              </div>
            </div>

            {/* Groups List */}
            {filteredGroupChats.length > 0 ? (
              <div className="divide-y dark:divide-gray-800">
                {filteredGroupChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => handleChatClick(chat.id)}
                    className={`w-full p-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      activeChatId === chat.id
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 border-l-4 border-l-purple-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Group Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium">
                          {chat.name ? chat.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        {chat.participants?.length > 0 && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                            <span className="text-[10px] font-bold text-white">
                              {chat.participants.length > 9 ? '9+' : chat.participants.length}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {chat.name || 'Unnamed Group'}
                            </h3>
                            {chat.admins?.includes(currentUser?.id || '') && (
                              <Badge 
                                variant="outline" 
                                className="text-xs px-1.5 py-0 border-purple-200 text-purple-700 dark:border-purple-900 dark:text-purple-400"
                              >
                                Admin
                              </Badge>
                            )}
                          </div>
                          {chat.lastMessageTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatTime(chat.lastMessageTime)}
                            </span>
                          )}
                        </div>

                        {chat.lastMessage ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {chat.lastMessage}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            No messages yet
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {chat.participants?.length || 0} members
                          </span>
                          {chat.createdAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Created {formatTime(chat.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // No Groups State
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-4">
                  <Hash className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-lg">
                  No groups yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
                  Create your first group to start collaborating with friends, family, or colleagues.
                </p>
                {currentUser?.id && onGroupCreated && (
                  <GroupCreationModal
                    currentUserId={currentUser.id}
                    onGroupCreated={onGroupCreated}
                    trigger={
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Group
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          // All/Online Tab Content (Users)
          filteredUsers.length > 0 ? (
            <div className="divide-y dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={(e) => handleUserClick(e, user.id)}
                  className={`w-full p-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    activeUserId === user.id
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with Status */}
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-gray-900">
                        {user.photoURL ? (
                          <AvatarImage src={user.photoURL} alt={getDisplayName(user)} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user)} rounded-full ring-2 ring-white dark:ring-gray-900`} />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {getDisplayName(user)}
                          </h3>
                          {user.status === 'online' && (
                            <Badge 
                              variant="outline" 
                              className="text-xs px-1.5 py-0 border-green-200 text-green-700 dark:border-green-900 dark:text-green-400"
                            >
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Joined {formatTime(user.createdAt)}
                        </span>
                        {user.lastSeen && user.status !== 'online' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Last seen: {formatTime(user.lastSeen)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No users found' : 'No other users available'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                {searchQuery 
                  ? 'Try adjusting your search to find what you\'re looking for.'
                  : currentUser 
                    ? 'You are the only user currently.'
                    : 'There are no users available to chat with.'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          )
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{users.filter(u => u.status === 'online').length} online now</span>
          </div>
          <div className="text-xs">
            {activeTab === 'groups' 
              ? `Showing ${filteredGroupChats.length} group${filteredGroupChats.length !== 1 ? 's' : ''}`
              : `Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;