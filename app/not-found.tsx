// app/not-found.tsx
import Link from 'next/link'
import { Home, MessageSquare, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto text-center">
        {/* Animated chat bubble */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <MessageSquare className="w-16 h-16 text-gray-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">404</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Chat Not Found
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Oops! The conversation you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            What could have happened?
          </h3>
          <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
              <span>The chat might have been deleted</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
              <span>You might not have permission to access this chat</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
              <span>The URL might be incorrect or outdated</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
          
          <Link
            href="/chats"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-5 h-5" />
            View All Chats
          </Link>
        </div>

        {/* Search suggestion */}
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for chats or users..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Quick Links
          </h4>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/chats" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              Recent Chats
            </Link>
            <Link 
              href="/contacts" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              Contacts
            </Link>
            <Link 
              href="/new" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              New Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Need help?{' '}
          <Link 
            href="/support" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}