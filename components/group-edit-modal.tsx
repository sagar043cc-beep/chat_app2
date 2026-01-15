'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, X, Edit } from 'lucide-react';
import { getAllUsers, User, Chat, updateChat, addParticipantToChat, removeParticipantFromChat } from '@/lib/firestore';

interface GroupEditModalProps {
  chatId: string;
  chat: Chat;
  currentUserId: string;
  onGroupUpdated?: () => void;
  trigger?: React.ReactNode;
}

const GroupEditModal: React.FC<GroupEditModalProps> = ({
  chatId,
  chat,
  currentUserId,
  onGroupUpdated,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState(chat.name || '');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(chat.participants || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        // Filter out current user if not already in participants
        const filteredUsers = fetchedUsers.filter(user => user.id !== currentUserId || selectedUsers.includes(user.id));
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, currentUserId, selectedUsers]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveChanges = async () => {
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      // Update group name if changed
      if (groupName.trim() !== (chat.name || '')) {
        await updateChat(chatId, { name: groupName.trim() });
      }

      // Add new participants
      const currentParticipants = chat.participants || [];
      const newParticipants = selectedUsers.filter(id => !currentParticipants.includes(id));
      for (const userId of newParticipants) {
        await addParticipantToChat(chatId, userId);
      }

      // Remove participants (except current user)
      const removedParticipants = currentParticipants.filter(id => !selectedUsers.includes(id) && id !== currentUserId);
      for (const userId of removedParticipants) {
        await removeParticipantFromChat(chatId, userId);
      }

      onGroupUpdated?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group');
    } finally {
      setLoading(false);
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
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              maxLength={50}
            />
          </div>

          {/* Selected Users Count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
            </Badge>
          </div>

          {/* Users List */}
          <div className="space-y-2">
            <Label>Manage Members</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleUserToggle(user.id)}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    disabled={user.id === currentUserId} // Can't remove self
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photoURL} alt={getDisplayName(user)} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getDisplayName(user)}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {user.status === 'online' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!groupName.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupEditModal;