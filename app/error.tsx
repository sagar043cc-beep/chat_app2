// app/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, MessageSquare, Shield } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Chat Application Error:', error)
  }, [error])

  const errorType = getErrorType(error.message)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full mx-auto">
        {/* Error Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {getErrorMessage(errorType).title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {getErrorMessage(errorType).description}
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start mb-4">
            <Shield className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Error Details
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Error Type:</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{errorType}</span>
            </div>
            
            <div className="py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Message:</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded">
                {error.message || 'Unknown error occurred'}
              </div>
            </div>
            
            {error.digest && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Error Digest:</span>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {error.digest.substring(0, 8)}...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={reset}
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5 group-hover:animate-spin" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/"
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black dark:bg-gray-800 dark:hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            <span>Go to Home</span>
          </Link>
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-100 dark:border-blue-800/30">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
            Troubleshooting Tips
          </h3>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Check your internet connection and try again
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Clear your browser cache and refresh the page
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Ensure you have the latest version of the app
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Try using a different browser
              </span>
            </li>
          </ul>
        </div>

        {/* Support & Status */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4 sm:mb-0">
            <p className="mb-1">Still having issues?</p>
            <Link 
              href="/support" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact our support team →
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/status" 
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              System Status
            </Link>
            <Link 
              href="/faq" 
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to categorize errors
function getErrorType(errorMessage: string): string {
  const message = errorMessage.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network Error'
  } else if (message.includes('timeout')) {
    return 'Timeout Error'
  } else if (message.includes('auth') || message.includes('permission')) {
    return 'Authentication Error'
  } else if (message.includes('database') || message.includes('db')) {
    return 'Database Error'
  } else if (message.includes('validation')) {
    return 'Validation Error'
  } else if (message.includes('rate limit')) {
    return 'Rate Limit Exceeded'
  } else if (message.includes('server')) {
    return 'Server Error'
  }
  
  return 'Application Error'
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorType: string): { title: string; description: string } {
  const messages: Record<string, { title: string; description: string }> = {
    'Network Error': {
      title: 'Connection Lost',
      description: 'Unable to connect to the chat server. Please check your internet connection.'
    },
    'Timeout Error': {
      title: 'Request Timeout',
      description: 'The server is taking too long to respond. Please try again.'
    },
    'Authentication Error': {
      title: 'Access Denied',
      description: 'You need to be logged in to access this chat.'
    },
    'Database Error': {
      title: 'Data Error',
      description: 'We\'re having trouble accessing chat data. Our team has been notified.'
    },
    'Validation Error': {
      title: 'Invalid Request',
      description: 'There was an issue with your request. Please check and try again.'
    },
    'Rate Limit Exceeded': {
      title: 'Too Many Requests',
      description: 'You\'ve made too many requests. Please wait a moment before trying again.'
    },
    'Server Error': {
      title: 'Server Issue',
      description: 'We\'re experiencing technical difficulties. Please try again shortly.'
    },
    'Application Error': {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred in the chat application.'
    }
  }
  
  return messages[errorType] || messages['Application Error']
}