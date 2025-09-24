'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface LandingPageData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  footerText?: string; // Optional footer text
  isActive: boolean;
}

interface LandingPageProps {
  onLaunch: () => void;
  isLaunching?: boolean;
}

export default function LandingPage({ onLaunch, isLaunching = false }: LandingPageProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      // Set default data immediately to prevent loading delay
      const defaultData = {
        id: 'default',
        title: "MoonGazers – Find the Best Stargazing Nights",
        description: "When I first got interested in stargazing, I kept running into the same problem: the weather app told me if it would rain, but not if the sky would actually be good for astronomy. Moon brightness, wind, and timing all matter. That's why I built MoonGazers—a tool that helps anyone plan the perfect night under the stars.",
        imageUrl: "/launch.png",
        imageAlt: "MoonGazers App Preview - Weather, moon, planets, and stars cards",
        buttonText: "Launch MoonGazers App",
        footerText: "", // No default footer text
        isActive: true
      };
      
      setLandingData(defaultData);
      setLoading(false);

      // Then try to fetch real data in background
      try {
        const response = await fetch('/api/landing-page');
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setLandingData(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch landing page data:', error);
        // Keep default data if fetch fails
      }
    };

    fetchLandingData();
  }, []);

  const handleLaunch = () => {
    onLaunch();
  };

  const handleImageClick = useCallback(() => {
    setShowImageModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowImageModal(false);
  }, []);

  // Handle escape key for modal
  useEffect(() => {
    if (!showImageModal) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleModalClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, handleModalClose]);

  // Prevent body scroll only when modal is open, but allow page scroll otherwise
  useEffect(() => {
    if (showImageModal) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [showImageModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica Neue, Arial, sans-serif'
      }}>
        {/* <div className="text-xl" style={{ color: '#000000' }}>
          Loading...
        </div> */}
      </div>
    );
  }

  if (!landingData) return null;

  return (
    <>
      <div 
        className={`w-full overflow-y-auto transition-all ease-out ${
          isLaunching ? '-translate-y-full opacity-90 scale-95' : 'translate-y-0 opacity-100 scale-100'
        }`}
        style={{ 
          backgroundColor: '#ffffff',
          transition: 'transform 2200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1800ms ease-out, transform 2200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          minHeight: '100vh',
          height: '100vh',
          boxShadow: isLaunching ? '0 -20px 40px rgba(0, 0, 0, 0.25)' : 'none',
          willChange: isLaunching ? 'transform, opacity' : 'auto',
          transformOrigin: 'center bottom'
        }}
      >
        {/* Main Content Container - Original vertical layout with proper scrolling */}
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            
            {/* Title */}
            <header>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 sm:mb-8" style={{ 
                color: '#000000',
                fontFamily: 'Helvetica Neue, Arial, sans-serif'
              }}>
                {landingData.title}
              </h1>
            </header>

            {/* Description */}
            <section className="mb-8 sm:mb-10 max-w-2xl mx-auto">
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed" style={{
                fontFamily: 'Helvetica Neue, Arial, sans-serif'
              }}>
                {landingData.description}
              </p>
            </section>

            {/* App Preview Image */}
            <section className="mb-8 sm:mb-10">
              <div className="flex justify-center">
                <div className="relative group max-w-xl w-full cursor-pointer">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg"
                    aria-label="View full size preview"
                  >
                    <Image
                      src={landingData.imageUrl}
                      alt={landingData.imageAlt}
                      width={600}
                      height={450}
                      className="w-full h-auto rounded-lg border border-gray-200 hover:opacity-90 transition-opacity duration-300"
                      priority
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Launch Button */}
            <section className="mb-6">
              <button
                onClick={handleLaunch}
                disabled={isLaunching}
                className={`px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg text-black border-2 transition-all duration-300 focus:outline-none ${
                  isLaunching ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-70 cursor-pointer'
                }`}
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#000000',
                  fontFamily: 'Helvetica Neue, Arial, sans-serif',
                  fontWeight: '500'
                }}
              >
                {isLaunching ? 'Launching...' : landingData.buttonText}
              </button>
              {landingData.footerText && (
                <p className="mt-3 text-xs text-gray-500">
                  {landingData.footerText}
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Image Modal - Simplified */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4"
          onClick={handleModalClose}
        >
          <div className="relative max-w-4xl w-full max-h-full">
            {/* Close Button */}
            <button
              onClick={handleModalClose}
              className="absolute -top-12 right-0 text-black text-2xl hover:opacity-70 transition-opacity bg-white border border-gray-300 w-10 h-10 flex items-center justify-center"
              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
              aria-label="Close modal"
            >
              ✕
            </button>
            
            {/* Enlarged Image - Smaller size */}
            <Image
              src={landingData.imageUrl}
              alt={`${landingData.imageAlt} - Full Size`}
              width={900}
              height={675}
              className="w-full h-auto border border-gray-200"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 15px 25px -8px rgba(0, 0, 0, 0.3)',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}