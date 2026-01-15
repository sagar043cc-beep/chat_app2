import { db } from '@/components/firebase';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
  createdAt: string;
  chatBackground?: string;
  themeColor?: string;
}

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: string[];
  admins?: string[]; // Array of user IDs who are admins
  participantDetails?: { [userId: string]: { name: string; photoURL?: string } };
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageTime?: string;
  createdBy: string;
  createdAt: string;
  isArchived?: boolean;
  pinnedBy?: string[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  text: string;
  type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  fileURL?: string;
  fileName?: string;
  sentAt: string;
  editedAt?: string;
  isDeleted?: boolean;
  readBy?: string[];
  reactions?: { [emoji: string]: string[] };
  replyTo?: string;
}

export interface TypingStatus {
  chatId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Group {
  id: string;
  name: string;
  participants: string[];
  admins: string[];
  participantDetails?: { [userId: string]: { name: string; photoURL?: string } };
  createdBy: string;
  createdAt: string;
  isArchived?: boolean;
}

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Create a new user profile in Firestore
 */
export const createUserProfile = async (
  userId: string,
  userData: {
    email: string;
    username?: string;
    displayName?: string;
    photoURL?: string;
    bio?: string;
  }
): Promise<void> => {
  try {
    // Filter out undefined values to avoid Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );

    await setDoc(doc(db, 'users', userId), {
      ...filteredData,
      status: 'online',
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    });
    console.log('✅ User profile created successfully');
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    
    console.log('⚠️ User not found');
    return null;
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    throw error;
  }
};

/**
 * Get all users (with optional search/filter)
 */
export const getAllUsers = async (searchTerm?: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    let users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(user => 
        user.displayName?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    return users;
  } catch (error) {
    console.error('❌ Error getting users:', error);
    throw error;
  }
};

/**
 * Update user status (online/offline/away)
 */
export const updateUserStatus = async (
  userId: string,
  status: 'online' | 'offline' | 'away'
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status,
      lastSeen: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    throw error;
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'bio' | 'username' | 'chatBackground' | 'themeColor'>>
): Promise<void> => {
  try {
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, filteredUpdates);
    console.log('✅ User profile updated');
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

// ============================================
// CHAT MANAGEMENT
// ============================================

/**
 * Create a new chat (direct or group)
 */
export const createChat = async (chatData: {
  name?: string;
  type: 'direct' | 'group';
  participants: string[];
  createdBy: string;
}): Promise<string> => {
  try {
    const chatPayload = {
      ...chatData,
      createdAt: new Date().toISOString(),
      lastMessageTime: new Date().toISOString(),
      isArchived: false,
      pinnedBy: [],
      ...(chatData.type === 'group' && { admins: [chatData.createdBy] }),
    };

    const docRef = await addDoc(collection(db, 'chats'), chatPayload);

    console.log('✅ Chat created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    throw error;
  }
};

/**
 * Get a specific chat by ID
 */
export const getChat = async (chatId: string): Promise<Chat | null> => {
  try {
    const docRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Chat;
    }
    
    console.log('⚠️ Chat not found');
    return null;
  } catch (error) {
    console.error('❌ Error getting chat:', error);
    throw error;
  }
};

/**
 * Get all chats for a user
 */
export const getChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];

    // Sort by lastMessageTime descending
    chats.sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());

    return chats;
  } catch (error) {
    console.error('❌ Error getting chats:', error);
    throw error;
  }
};

/**
 * Update chat details (name, participants, etc.)
 */
export const updateChat = async (
  chatId: string,
  updates: Partial<Pick<Chat, 'name' | 'isArchived' | 'admins'>>
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, updates);
    console.log('✅ Chat updated');
  } catch (error) {
    console.error('❌ Error updating chat:', error);
    throw error;
  }
};

/**
 * Add participant to a chat
 */
export const addParticipantToChat = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      participants: arrayUnion(userId)
    });
    console.log('✅ Participant added to chat');
  } catch (error) {
    console.error('❌ Error adding participant:', error);
    throw error;
  }
};

/**
 * Remove participant from a chat
 */
export const removeParticipantFromChat = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      participants: arrayRemove(userId)
    });
    console.log('✅ Participant removed from chat');
  } catch (error) {
    console.error('❌ Error removing participant:', error);
    throw error;
  }
};

/**
 * Delete a chat and all its messages
 */
export const deleteChatAndMessages = async (chatId: string): Promise<void> => {
  try {
    // Get chat to determine type
    const chat = await getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Determine the collection based on chat type
    const collectionName = chat.type === 'group' ? 'groups' : 'chats';

    // First, delete all messages in the chat's messages subcollection
    const messagesRef = collection(db, collectionName, chatId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Then delete the chat document
    await deleteDoc(doc(db, 'chats', chatId));
    console.log('✅ Chat and its messages deleted');
  } catch (error) {
    console.error('❌ Error deleting chat and messages:', error);
    throw error;
  }
};

/**
 * Delete a chat
 */
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'chats', chatId));
    console.log('✅ Chat deleted');
  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    throw error;
  }
};

/**
 * Pin/Unpin a chat for a user
 */
export const togglePinChat = async (
  chatId: string,
  userId: string,
  isPinned: boolean
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      pinnedBy: isPinned ? arrayUnion(userId) : arrayRemove(userId)
    });
  } catch (error) {
    console.error('❌ Error toggling pin:', error);
    throw error;
  }
};

// ============================================
// GROUP MANAGEMENT
// ============================================

/**
 * Add a user as admin to a group chat
 */
export const addGroupAdmin = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      admins: arrayUnion(userId)
    });
    console.log('✅ User added as admin');
  } catch (error) {
    console.error('❌ Error adding admin:', error);
    throw error;
  }
};

/**
 * Remove a user from admin role in a group chat
 */
export const removeGroupAdmin = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      admins: arrayRemove(userId)
    });
    console.log('✅ User removed from admin');
  } catch (error) {
    console.error('❌ Error removing admin:', error);
    throw error;
  }
};

/**
 * Check if a user is an admin of a group chat
 */
export const isGroupAdmin = async (
  chatId: string,
  userId: string
): Promise<boolean> => {
  try {
    const chat = await getChat(chatId);
    return chat?.admins?.includes(userId) || false;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
};

/**
 * Check if a user is an admin of a group (from groups collection)
 */
export const isGroupAdminForGroup = async (
  groupId: string,
  userId: string
): Promise<boolean> => {
  try {
    const group = await getGroup(groupId);
    return group?.admins?.includes(userId) || false;
  } catch (error) {
    console.error('❌ Error checking admin status for group:', error);
    return false;
  }
};

/**
 * Update group name (admin only)
 */
export const updateGroupName = async (
  chatId: string,
  newName: string
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      name: newName
    });
    console.log('✅ Group name updated');
  } catch (error) {
    console.error('❌ Error updating group name:', error);
    throw error;
  }
};

// ============================================
// SEPARATE GROUP COLLECTION MANAGEMENT
// ============================================

/**
 * Create a new group in the separate 'groups' collection
 */
export const createGroup = async (groupData: {
  name: string;
  participants: string[];
  createdBy: string;
}): Promise<string> => {
  try {
    const groupPayload = {
      ...groupData,
      admins: [groupData.createdBy], // Creator is admin by default
      createdAt: new Date().toISOString(),
      isArchived: false,
    };

    const docRef = await addDoc(collection(db, 'groups'), groupPayload);

    console.log('✅ Group created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating group:', error);
    throw error;
  }
};

/**
 * Get a specific group by ID
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Group;
    }

    console.log('⚠️ Group not found');
    return null;
  } catch (error) {
    console.error('❌ Error getting group:', error);
    throw error;
  }
};

/**
 * Get all groups for a user
 */
export const getGroupsForUser = async (userId: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(
      groupsRef,
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    const groups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];

    return groups;
  } catch (error) {
    console.error('❌ Error getting groups:', error);
    throw error;
  }
};

/**
 * Get all groups (for admin or discovery purposes)
 */
export const getAllGroups = async (): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, 'groups');
    const querySnapshot = await getDocs(groupsRef);

    const groups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];

    return groups;
  } catch (error) {
    console.error('❌ Error getting all groups:', error);
    throw error;
  }
};

/**
 * Update group details
 */
export const updateGroup = async (
  groupId: string,
  updates: Partial<Pick<Group, 'name' | 'isArchived'>>
): Promise<void> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, updates);
    console.log('✅ Group updated');
  } catch (error) {
    console.error('❌ Error updating group:', error);
    throw error;
  }
};

/**
 * Add participant to a group
 */
export const addParticipantToGroup = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      participants: arrayUnion(userId)
    });
    console.log('✅ Participant added to group');
  } catch (error) {
    console.error('❌ Error adding participant:', error);
    throw error;
  }
};

/**
 * Remove participant from a group
 */
export const removeParticipantFromGroup = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      participants: arrayRemove(userId),
      admins: arrayRemove(userId) // Also remove from admins if they were
    });
    console.log('✅ Participant removed from group');
  } catch (error) {
    console.error('❌ Error removing participant:', error);
    throw error;
  }
};

/**
 * Add a user as admin to a group
 */
export const addGroupAdminToGroup = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      admins: arrayUnion(userId)
    });
    console.log('✅ User added as admin to group');
  } catch (error) {
    console.error('❌ Error adding admin:', error);
    throw error;
  }
};

/**
 * Remove a user from admin role in a group
 */
export const removeGroupAdminFromGroup = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      admins: arrayRemove(userId)
    });
    console.log('✅ User removed from admin in group');
  } catch (error) {
    console.error('❌ Error removing admin:', error);
    throw error;
  }
};

/**
 * Delete a group and all its messages (admin only)
 */
export const deleteGroup = async (groupId: string, userId: string): Promise<void> => {
  try {
    // Check if user is admin
    const isAdmin = await isGroupAdminForGroup(groupId, userId);
    if (!isAdmin) {
      throw new Error('Only admins can delete the group');
    }

    // First, delete all messages in the group's messages subcollection
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Then delete the group document
    await deleteDoc(doc(db, 'groups', groupId));
    console.log('✅ Group and its messages deleted');
  } catch (error) {
    console.error('❌ Error deleting group:', error);
    throw error;
  }
};

// ============================================
// MESSAGE MANAGEMENT
// ============================================

/**
 * Send a new message in a chat or group
 */
export const sendMessage = async (
  chatId: string,
  messageData: {
    senderId: string;
    senderName?: string;
    text: string;
    type?: 'text' | 'image' | 'file' | 'audio' | 'video';
    fileURL?: string;
    fileName?: string;
    replyTo?: string;
  }
): Promise<string> => {
  try {
    // Determine the collection based on chat type
    const chat = await getChat(chatId);
    const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

    // Add message to messages subcollection
    const docRef = await addDoc(collection(db, collectionName, chatId, 'messages'), {
      ...messageData,
      sentAt: new Date().toISOString(),
      readBy: [messageData.senderId],
      isDeleted: false,
      reactions: {},
    });

    // Update chat's last message info
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: messageData.text.substring(0, 100),
      lastMessageSenderId: messageData.senderId,
      lastMessageTime: new Date().toISOString(),
    });

    console.log('✅ Message sent with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Get all messages in a chat or group
 */
export const getMessages = async (
  chatId: string,
  limitCount?: number
): Promise<Message[]> => {
  try {
    // Determine the collection based on chat type
    const chat = await getChat(chatId);
    const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

    const messagesRef = collection(db, collectionName, chatId, 'messages');
    let q = query(messagesRef, orderBy('sentAt', 'asc'));

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      chatId,
      ...doc.data()
    })) as Message[];

    return messages;
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    throw error;
  }
};

/**
 * Edit a message
 */
export const editMessage = async (
  chatId: string,
  messageId: string,
  newText: string
): Promise<void> => {
  try {
    // Determine the collection based on chat type
    const chat = await getChat(chatId);
    const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

    const messageRef = doc(db, collectionName, chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      text: newText,
      editedAt: new Date().toISOString(),
    });
    console.log('✅ Message edited');
  } catch (error) {
    console.error('❌ Error editing message:', error);
    throw error;
  }
};

/**
 * Delete a message (soft delete)
 */
export const deleteMessage = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  try {
    // Determine the collection based on chat type
    const chat = await getChat(chatId);
    const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

    const messageRef = doc(db, collectionName, chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      text: 'This message was deleted',
      isDeleted: true,
    });
    console.log('✅ Message deleted');
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw error;
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (
  chatId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    // Determine the collection based on chat type
    const chat = await getChat(chatId);
    const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

    const messageRef = doc(db, collectionName, chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      readBy: arrayUnion(userId)
    });
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    throw error;
  }
};

/**
 * Add reaction to a message
 */
export const addReactionToMessage = async (
  chatId: string,
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> => {
  try {
    // Determine the collection based on chat type
    const chat = await getChat(chatId);
    const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

    const messageRef = doc(db, collectionName, chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: arrayUnion(userId)
    });
  } catch (error) {
    console.error('❌ Error adding reaction:', error);
    throw error;
  }
};

/**
 * Remove reaction from a message
 */
export const removeReactionFromMessage = async (
  chatId: string,
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> => {
  try {
    // Determine the collection based on chat type
    const chat = await getChat(chatId);
    const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

    const messageRef = doc(db, collectionName, chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: arrayRemove(userId)
    });
  } catch (error) {
    console.error('❌ Error removing reaction:', error);
    throw error;
  }
};

// ============================================
// REAL-TIME LISTENERS
// ============================================

/**
 * Subscribe to messages in a chat or group (real-time)
 */
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void,
  limitCount?: number,
  chat?: Chat | null
) => {
  // Determine the collection based on chat type
  const collectionName = chat?.type === 'group' ? 'groups' : 'chats';

  const messagesRef = collection(db, collectionName, chatId, 'messages');
  let q = query(messagesRef, orderBy('sentAt', 'asc'));

  if (limitCount) {
    // To get the most recent messages, we need to order by desc, limit, then reverse
    q = query(messagesRef, orderBy('sentAt', 'desc'), limit(limitCount));
  }

  return onSnapshot(q, (snapshot) => {
    let messages = snapshot.docs.map(doc => ({
      id: doc.id,
      chatId,
      ...doc.data()
    })) as Message[];

    if (limitCount) {
      // Reverse to get chronological order
      messages = messages.reverse();
    }

    callback(messages);
  });
};

/**
 * Subscribe to chats for a user (real-time)
 */
export const subscribeToChats = (
  userId: string,
  callback: (chats: Chat[]) => void
) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];

    // Sort by lastMessageTime descending
    chats.sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());

    callback(chats);
  });
};

/**
 * Subscribe to user status (real-time)
 */
export const subscribeToUserStatus = (
  userId: string,
  callback: (user: User | null) => void
) => {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as User);
    } else {
      callback(null);
    }
  });
};

/**
 * Subscribe to groups for a user (real-time)
 */
export const subscribeToGroups = (
  userId: string,
  callback: (groups: Group[]) => void
) => {
  const groupsRef = collection(db, 'groups');
  const q = query(
    groupsRef,
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];

    callback(groups);
  });
};

/**
 * Subscribe to all groups (real-time)
 */
export const subscribeToAllGroups = (
  callback: (groups: Group[]) => void
) => {
  const groupsRef = collection(db, 'groups');

  return onSnapshot(groupsRef, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];

    callback(groups);
  });
};

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Search for users by name or email
 */
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  return getAllUsers(searchTerm);
};

/**
 * Search messages in a chat or group
 */
export const searchMessagesInChat = async (
  chatId: string,
  searchTerm: string
): Promise<Message[]> => {
  try {
    const messages = await getMessages(chatId);
    const term = searchTerm.toLowerCase();

    return messages.filter(msg =>
      msg.text.toLowerCase().includes(term) && !msg.isDeleted
    );
  } catch (error) {
    console.error('❌ Error searching messages:', error);
    throw error;
  }
};