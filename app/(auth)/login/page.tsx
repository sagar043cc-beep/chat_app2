'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/slices/userSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '@/components/firebase'; // Adjust path if needed
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  AuthError,
} from 'firebase/auth';
import { createUserProfile } from '@/lib/firestore';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
}

export default function AuthPage() {
  const [loginData, setLoginData] = useState<FormData>({ email: '', password: '' });
  const [signupData, setSignupData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [loginError, setLoginError] = useState<string>('');
  const [signupError, setSignupError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const router = useRouter();
  const dispatch = useDispatch();

  const getErrorMessage = (error: AuthError): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      case 'auth/account-exists-with-different-credential':
        return 'An account with this email already exists. Please sign in with the original method.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMessage('');
    setLoginLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      document.cookie = `authToken=${token}; path=/; max-age=3600; secure; samesite=strict`;
      dispatch(setUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
        role: 'User',
      }));
      setSuccessMessage('Login successful! Redirecting...');
      console.log('User logged in:', user);
      router.push('/dashboard');
    } catch (error) {
      setLoginError(getErrorMessage(error as AuthError));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSuccessMessage('');

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    if (signupData.password.length < 6) {
      setSignupError('Password should be at least 6 characters.');
      return;
    }

    setSignupLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      );
      const user = userCredential.user;
      // Store user data in Firestore
      await createUserProfile(user.uid, {
        email: user.email || '',
        username: signupData.username || user.displayName || user.email?.split('@')[0] || 'User',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
      });
      const token = await user.getIdToken();
      document.cookie = `authToken=${token}; path=/; max-age=3600; secure; samesite=strict`;
      dispatch(setUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
        role: 'User',
      }));
      setSuccessMessage('Account created successfully! Redirecting...');
      console.log('User created:', user);
      setSignupData({ email: '', password: '', confirmPassword: '', username: '' });
      router.push('/dashboard');
    } catch (error) {
      setSignupError(getErrorMessage(error as AuthError));
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError('');
    setSuccessMessage('');
    setLoginLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Store user data in Firestore
      await createUserProfile(user.uid, {
        email: user.email || '',
        username: user.displayName || user.email?.split('@')[0] || 'User',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
      });
      const token = await user.getIdToken();
      document.cookie = `authToken=${token}; path=/; max-age=3600; secure; samesite=strict`;
      dispatch(setUser({
        uid: user.uid,
        email: user.email || '',
        displayName: signupData.username || user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
        role: 'User',
      }));
      setSuccessMessage('Logged in with Google! Redirecting...');
      console.log('Google login successful:', user);
      router.push('/dashboard');
    } catch (error) {
      setLoginError(getErrorMessage(error as AuthError));
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successMessage && (
            <Alert className="mb-4 border-green-500 text-green-700 dark:text-green-400">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={loginLoading || signupLoading}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.31-.98 2.42-2.07 3.16v2.63h3.35c1.96-1.81 3.09-4.47 3.09-7.99z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.35-2.63c-1.01.68-2.29 1.08-3.93 1.08-3.02 0-5.58-2.04-6.49-4.79H.96v2.67C2.77 20.39 6.62 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.51 14.21c-.23-.68-.36-1.41-.36-2.21s.13-1.53.36-2.21V7.34H.96C.35 8.85 0 10.39 0 12s.35 3.15.96 4.66l4.55-2.45z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.98c1.64 0 3.11.56 4.27 1.66l3.19-3.19C17.46 1.01 14.97 0 12 0 6.62 0 2.77 2.61 0.96 6.34l4.55 2.45C6.42 6.02 8.98 4.98 12 4.98z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </div>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    disabled={loginLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    disabled={loginLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {signupError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signupError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    required
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({ ...signupData, confirmPassword: e.target.value })
                    }
                    required
                    disabled={signupLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}