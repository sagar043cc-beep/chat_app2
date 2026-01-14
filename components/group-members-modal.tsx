'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, X, Shield } from 'lucide-react';
import { User, getAllUsers, removeParticipantFromChat, Chat } from '@/lib/firestore';

interface GroupMembersModalProps {
  chatId: string;
  chat: Chat;
  currentUserId: string;
  isAdmin: boolean;
  onMemberRemoved?: (userId: string) => void;
  trigger?: React.ReactNode;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  chatId,
  chat,
  currentUserId,
  isAdmin,
  onMemberRemoved,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<(User & { isAdmin?: boolean })[]>([]);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const allUsers = await getAllUsers();
        const memberList = chat.participants.map(participantId => {
          const user = allUsers.find(u => u.id === participantId);
          return {
            ...user,
            isAdmin: chat.admins?.includes(participantId)
          } as User & { isAdmin?: boolean };
        });
        setMembers(memberList.filter(m => m)); // Filter out undefined members
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, chat]);

  const handleRemoveMember = async (userId: string) => {
    if (!isAdmin || userId === currentUserId) return;

    setRemovingUserId(userId);
    try {
      await removeParticipantFromChat(chatId, userId);
      setMembers(prev => prev.filter(m => m.id !== userId));
      onMemberRemoved?.(userId);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    } finally {
      setRemovingUserId(null);
    }
  };

  const getUserInitials = (user: User) => {
    if (user.username) return user.username.charAt(0).toUpperCase();
    if (user.displayName) return user.displayName.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: User) => {
    return user.username || user.displayName || user.email.split('@')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Members ({members.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={member.photoURL} alt={getDisplayName(member)} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                    {getUserInitials(member)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{getDisplayName(member)}</p>
                    {member.isAdmin && (
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              </div>

              {isAdmin && member.id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingUserId === member.id}
                  className="ml-2 flex-shrink-0 h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No members found</p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          {isAdmin ? 'You can remove members from this group' : 'Only admins can manage members'}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersModal;
