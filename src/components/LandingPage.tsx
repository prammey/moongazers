'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const handleLaunch = () => {
    setIsSliding(true);
    // Delay the actual page transition to allow animation to complete
    setTimeout(() => {
      onLaunch();
    }, 800); // 800ms matches the animation duration
  };

  return (
    <div 
      className={`relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 transition-transform duration-700 ease-in-out ${
        isSliding ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Main Content Container */}
      <div className="w-full max-w-3xl mx-auto text-center">
        
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 sm:mb-8" style={{ 
          color: '#000000',
          fontFamily: 'Helvetica Neue, Arial, sans-serif'
        }}>
          MoonGazers – Find the Best Stargazing Nights
        </h1>

        {/* Description */}
        <div className="mb-8 sm:mb-10 max-w-2xl mx-auto">
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed" style={{
            fontFamily: 'Helvetica Neue, Arial, sans-serif'
          }}>
            When I first got interested in stargazing, I kept running into the same problem: the weather app told me if it would rain, but not if the sky would actually be good for astronomy. Moon brightness, wind, and timing all matter. That&apos;s why I built MoonGazers—a tool that helps anyone plan the perfect night under the stars.
          </p>
        </div>

        {/* App Preview Image */}
        <div className="mb-8 sm:mb-10">
          <div className="flex justify-center">
            <div className="relative group max-w-xl w-full cursor-pointer" onClick={() => setShowImageModal(true)}>
              <Image
                src="/launch.png"
                alt="MoonGazers App Preview - Weather, moon, planets, and stars cards"
                width={600}
                height={450}
                className="w-full h-auto rounded-lg border border-gray-200 hover:opacity-90 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="mb-6">
          <button
            onClick={handleLaunch}
            className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg text-black border-2 transition-all duration-300 hover:opacity-70 focus:outline-none cursor-pointer"
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#000000',
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              fontWeight: '500'
            }}
          >
            Launch MoonGazers App
          </button>
        </div>

        {/* Subtle footer decoration */}
        <div className="flex justify-center items-center gap-2 text-gray-400 text-sm">
          <span>✦</span>
          <span>Perfect nights await</span>
          <span>✦</span>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-5xl w-full max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-black text-2xl hover:opacity-70 transition-opacity bg-white border border-gray-300 w-10 h-10 flex items-center justify-center"
              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
            >
              ✕
            </button>
            
            {/* Enlarged Image */}
            <Image
              src="/launch.png"
              alt="MoonGazers App Preview - Full Size"
              width={1200}
              height={900}
              className="w-full h-auto border border-gray-200"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 15px 25px -8px rgba(0, 0, 0, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}