import Link from 'next/link';
import TestComponent from './components/TestComponent';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Social Media Scheduler</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Schedule Your Social Media Posts with Notion
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Plan, schedule, and publish your social media content directly from your Notion workspace
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Notion Integration</h3>
              <p className="text-gray-600">
                Seamlessly connect with your Notion workspace and manage content
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Multi-Platform Support</h3>
              <p className="text-gray-600">
                Publish to Twitter, Instagram, and LinkedIn from one place
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Smart Scheduling</h3>
              <p className="text-gray-600">
                Schedule posts at optimal times for maximum engagement
              </p>
            </div>
          </div>
        </div>
      </div>

      <TestComponent />
    </div>
  );
} 