'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded"></div>
});

interface DocumentationData {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminDashboardProps {
  onBackToMain: () => void;
}

export default function AdminDashboard({ onBackToMain }: AdminDashboardProps) {
  const [documentation, setDocumentation] = useState<DocumentationData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDocForm, setShowDocForm] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('');

  const fetchDocumentation = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/documentation');

      if (response.ok) {
        const result = await response.json();
        setDocumentation(result);
        setDocTitle(result.title);
        setDocContent(result.content);
      } else {
        setError('Failed to fetch documentation');
      }
    } catch (error) {
      console.error('Failed to fetch documentation:', error);
      setError('Failed to fetch documentation');
    }
  }, []);

  const authenticate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAdminToken(result.token);
        setIsAuthenticated(true);
        setSuccess('Authentication successful!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const result = await response.json().catch(() => ({}));
        setError(response.status === 401 ? 'Wrong username or password.' : result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Authentication failed');
    }
    setLoading(false);
  };

  const openDocForm = () => {
    if (documentation) {
      setDocTitle(documentation.title);
      setDocContent(documentation.content);
    }
    setError('');
    setShowDocForm(true);
  };

  const handleDocumentationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/documentation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: docTitle,
          content: docContent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Documentation updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setDocumentation(result);
        setShowDocForm(false);
      } else {
        const result = await response.json().catch(() => ({}));
        setError(result.error || 'Failed to update documentation');
      }
    } catch (error) {
      console.error('Error updating documentation:', error);
      setError('Failed to update documentation');
    }
    setLoading(false);
  };

  // Escape closes the editor modal (without saving)
  useEffect(() => {
    if (!showDocForm) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDocForm(false);
        setError('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDocForm]);

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchDocumentation();
    }
  }, [isAuthenticated, adminToken, fetchDocumentation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_0_#000] p-6 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl mb-6 text-center" style={{ color: '#000000' }}>
            Admin Login
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-700 text-red-800 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-700 text-green-800 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); authenticate(); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 text-black"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 text-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-md text-black bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToMain}
              className="px-4 py-2 rounded-md text-black bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back to MoonGazers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl" style={{ color: '#000000' }}>
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openDocForm}
              className="px-6 py-2 rounded-md text-black bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Documentation
            </button>
          </div>
        </div>

        <div className="mb-6 text-center">
          <button
            onClick={onBackToMain}
            className="px-4 py-2 rounded-md text-black bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back to MoonGazers
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-700 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-700 text-green-800 rounded-md">
            {success}
          </div>
        )}

        {/* Documentation Form Modal */}
        {showDocForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[6px_6px_0_0_#000]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl" style={{ color: '#000000' }}>
                  Edit Documentation
                </h2>
                <button
                  onClick={() => { setShowDocForm(false); setError(''); }}
                  aria-label="Close without saving"
                  className="w-9 h-9 flex items-center justify-center bg-red-600 text-white font-bold border-2 border-black rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDocumentationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Title</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Content (Markdown)</label>
                  <p className="text-xs text-gray-600 mb-2">Press Enter once for a new line, twice for a new paragraph.</p>
                  <div className="border-2 border-black rounded-md overflow-hidden" style={{ minHeight: '400px' }}>
                    <MDEditor
                      value={docContent}
                      onChange={(value) => setDocContent(value || '')}
                      preview="edit"
                      hideToolbar={false}
                      height={400}
                      data-color-mode="light"
                    />
                  </div>
                </div>

                {/* Next to the Save button so it's seen even after scrolling the form */}
                {error && (
                  <div role="alert" className="p-3 bg-red-50 border-2 border-red-700 text-red-800 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-md text-black bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Update Documentation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDocForm(false)}
                    className="px-6 py-2 rounded-md text-black bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Current Documentation */}
        <div className="space-y-4">
          <h2 className="text-2xl mb-4" style={{ color: '#000000' }}>
            Current Documentation
          </h2>
          
          {!documentation ? (
            <div className="text-center py-8 text-black">
              No documentation found. Click Edit Documentation to create one!
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-black">{documentation.title}</h3>
                    {documentation.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Content Length: {documentation.content.length} characters
                  </p>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-md max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {documentation.content.substring(0, 500)}
                      {documentation.content.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={openDocForm}
                    className="px-4 py-2 rounded-md text-black bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}