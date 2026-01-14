'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, X } from 'lucide-react';
import { getAllUsers, User, createChat } from '@/lib/firestore';

interface GroupCreationModalProps {
  currentUserId: string;
  onGroupCreated: (chatId: string) => void;
  trigger?: React.ReactNode;
}

const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  currentUserId,
  onGroupCreated,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        // Filter out current user
        const filteredUsers = fetchedUsers.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, currentUserId]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const chatId = await createChat({
        name: groupName.trim(),
        type: 'group',
        participants: [currentUserId, ...selectedUsers],
        createdBy: currentUserId
      });

      onGroupCreated(chatId);
      setIsOpen(false);
      setGroupName('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
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
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 sm:px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-1 sm:gap-2">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Group</span>
            <span className="sm:hidden">Group</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create New Group
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
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-2">
            <Label>Select Members</Label>
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
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0 || loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationModal;