'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { setUser, clearUser } from '../lib/slices/userSlice';
import { createUserProfile, getUserProfile, updateUserStatus } from '../lib/firestore';

export function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user profile exists, if not create it
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          await createUserProfile(user.uid, {
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || undefined,
          });
          profile = await getUserProfile(user.uid);
        }

        // Update user status to online
        await updateUserStatus(user.uid, 'online');

        dispatch(setUser({
          uid: user.uid,
          email: profile?.email || user.email || '',
          displayName: profile?.displayName || user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: profile?.photoURL || user.photoURL || undefined,
          role: 'User',
        }));
      } else {
        dispatch(clearUser());
      }
    });
    return unsubscribe;
  }, [dispatch]);

  return null;
}