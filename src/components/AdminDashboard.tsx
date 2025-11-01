'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded"></div>
});

interface LandingPageData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  footerText?: string; // Optional footer text
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  const [landingPage, setLandingPage] = useState<LandingPageData | null>(null);
  const [documentation, setDocumentation] = useState<DocumentationData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [showLandingPageEnabled, setShowLandingPageEnabled] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imageAlt: '',
    buttonText: '',
    footerText: '',
    imageFile: ''
  });

  const [imagePreview, setImagePreview] = useState('');

  const fetchLandingPage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/landing-page', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const pages = result.data || [];
        // Get the active landing page (should be only one)
        const activePage = pages.find((p: LandingPageData) => p.isActive) || pages[0] || null;
        setLandingPage(activePage);
        if (activePage) {
          setFormData({
            title: activePage.title,
            description: activePage.description,
            imageUrl: activePage.imageUrl,
            imageAlt: activePage.imageAlt,
            buttonText: activePage.buttonText,
            footerText: activePage.footerText || '',
            imageFile: ''
          });
          setImagePreview(activePage.imageUrl);
        }
      } else {
        setError('Failed to fetch landing page');
      }
    } catch (error) {
      console.error('Failed to fetch landing page:', error);
      setError('Failed to fetch landing page');
    }
    setLoading(false);
  }, [adminToken]);

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

  const fetchSiteConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/site-config', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const config = await response.json();
        setShowLandingPageEnabled(config.showLandingPage ?? true);
      }
    } catch (error) {
      console.error('Failed to fetch site config:', error);
    }
  }, [adminToken]);

  const toggleLandingPage = async () => {
    try {
      const newValue = !showLandingPageEnabled;
      const response = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          showLandingPage: newValue
        }),
      });

      if (response.ok) {
        setShowLandingPageEnabled(newValue);
        setSuccess(`Landing page ${newValue ? 'enabled' : 'disabled'} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update landing page setting');
      }
    } catch (error) {
      console.error('Failed to toggle landing page:', error);
      setError('Failed to update landing page setting');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, imageFile: result }));
    };
    reader.readAsDataURL(file);
  };

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
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Authentication failed');
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setShowForm(true);
  };

  const resetForm = () => {
    if (landingPage) {
      setFormData({
        title: landingPage.title,
        description: landingPage.description,
        imageUrl: landingPage.imageUrl,
        imageAlt: landingPage.imageAlt,
        buttonText: landingPage.buttonText,
        footerText: landingPage.footerText || '',
        imageFile: ''
      });
      setImagePreview(landingPage.imageUrl);
    }
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = landingPage ? 'PUT' : 'POST';
      const body = landingPage 
        ? { ...formData, id: landingPage.id }
        : formData;

      const response = await fetch('/api/admin/landing-page', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        const action = landingPage ? 'updated' : 'created';
        setSuccess(`Landing page ${action} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
        setLandingPage(result.data);
        fetchLandingPage();
        setShowForm(false);
      } else {
        const result = await response.json();
        setError(result.error || `Failed to ${landingPage ? 'update' : 'create'} landing page`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(`Failed to ${landingPage ? 'update' : 'create'} landing page`);
    }
    setLoading(false);
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
        const result = await response.json();
        setError(result.error || 'Failed to update documentation');
      }
    } catch (error) {
      console.error('Error updating documentation:', error);
      setError('Failed to update documentation');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchLandingPage();
      fetchDocumentation();
      fetchSiteConfig();
    }
  }, [isAuthenticated, adminToken, fetchLandingPage, fetchDocumentation, fetchSiteConfig]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl mb-6 text-center" style={{ color: '#000000' }}>
            Admin Login
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
              style={{ backgroundColor: '#ffffff' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToMain}
              className="px-4 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
              style={{ backgroundColor: '#ffffff' }}
            >
              ← Back to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl" style={{ color: '#000000' }}>
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
              style={{ backgroundColor: '#ffffff' }}
            >
              Edit Landing Page
            </button>
            <button
              onClick={() => setShowDocForm(true)}
              className="px-6 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
              style={{ backgroundColor: '#ffffff' }}
            >
              Edit Documentation
            </button>
          </div>
        </div>

        {/* Landing Page Toggle */}
        <div className="mb-6 p-6 bg-white border border-gray-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Landing Page Visibility</h2>
              <p className="text-sm text-gray-600">
                {showLandingPageEnabled 
                  ? 'Landing page is currently enabled. New visitors will see the landing page first.' 
                  : 'Landing page is currently disabled. Users will go directly to the main app.'}
              </p>
            </div>
            <button
              onClick={toggleLandingPage}
              className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors ${
                showLandingPageEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block w-6 h-6 transform rounded-full bg-white transition-transform ${
                  showLandingPageEnabled ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mb-6 text-center">
          <button
            onClick={onBackToMain}
            className="px-4 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
            style={{ backgroundColor: '#ffffff' }}
          >
            ← Back to Landing Page
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-300 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl" style={{ color: '#000000' }}>
                  Edit Landing Page
                </h2>
                <button
                  onClick={resetForm}
                  className="text-black hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black h-32 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Footer Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.footerText}
                    onChange={(e) => setFormData(prev => ({ ...prev, footerText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
                    placeholder="Enter optional footer text (e.g., disclaimer, note, etc.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={150}
                        className="rounded border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Image Alt Text</label>
                  <input
                    type="text"
                    value={formData.imageAlt}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageAlt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    {loading ? 'Saving...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Documentation Form Modal */}
        {showDocForm && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-300 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl" style={{ color: '#000000' }}>
                  Edit Documentation
                </h2>
                <button
                  onClick={() => setShowDocForm(false)}
                  className="text-black hover:text-gray-600 text-2xl"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Content (Markdown)</label>
                  <div className="border border-gray-300 rounded" style={{ minHeight: '400px' }}>
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

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    {loading ? 'Saving...' : 'Update Documentation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDocForm(false)}
                    className="px-6 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Current Landing Page */}
        <div className="space-y-4">
          <h2 className="text-2xl mb-4" style={{ color: '#000000' }}>
            Current Landing Page
          </h2>
          
          {loading && !landingPage ? (
            <div className="text-center py-8" style={{ color: '#000000' }}>Loading...</div>
          ) : !landingPage ? (
            <div className="text-center py-8 text-black">
              No landing page found. Click Edit Landing Page to create one!
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-black">{landingPage.title}</h3>
                    {landingPage.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-black mb-4">{landingPage.description}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={landingPage.imageUrl}
                      alt={landingPage.imageAlt}
                      width={120}
                      height={80}
                      className="rounded border border-gray-200"
                    />
                    <div>
                      <p className="text-sm text-black mb-1">Button Text:</p>
                      <p className="font-medium text-black">{landingPage.buttonText}</p>
                      <p className="text-sm text-black mb-1 mt-2">Footer Text:</p>
                      <p className="font-medium text-xs text-black">{landingPage.footerText || '(None)'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Documentation */}
        <div className="space-y-4 mt-8">
          <h2 className="text-2xl mb-4" style={{ color: '#000000' }}>
            Current Documentation
          </h2>
          
          {!documentation ? (
            <div className="text-center py-8 text-black">
              No documentation found. Click Edit Documentation to create one!
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
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
                  <div className="bg-gray-50 p-4 rounded max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {documentation.content.substring(0, 500)}
                      {documentation.content.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setShowDocForm(true)}
                    className="px-4 py-2 text-black border border-gray-300 transition-all duration-300 hover:opacity-70"
                    style={{ backgroundColor: '#ffffff' }}
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