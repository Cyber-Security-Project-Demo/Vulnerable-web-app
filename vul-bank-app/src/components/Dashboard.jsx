import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { Home, Send, FileText, Search, User, Wrench, Settings, CreditCard, CheckCircle, Star, LogOut, X, Gift } from 'lucide-react';
import TransferMoney from './TransferMoney';
import TransactionHistory from './TransactionHistory';
import UserSearch from './UserSearch';
import SystemTools from './SystemTools';
import ProfileManager from './ProfileManager';
import AdminPanel from './AdminPanel';
import ConfirmModal from './ConfirmModal';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userBalance, setUserBalance] = useState(user?.balance || 0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Popup advertisement state
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [adShowCount, setAdShowCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(478); // 7:58 in seconds
  const [showAdContent, setShowAdContent] = useState(false); // For showing ad content popup
  const [showFinalSuccess, setShowFinalSuccess] = useState(false); // Final success page

  const refreshUserData = useCallback(async () => {
    try {
      // VULNERABLE: Direct user ID access - IDOR
      const response = await fetch(`http://localhost:5000/api/user/${user.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserBalance(userData.balance);
        updateUser({
          ...user,
          balance: userData.balance
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [user, updateUser]);

  useEffect(() => {
    // Refresh user data when dashboard loads
    refreshUserData();
  }, [refreshUserData]);

  // Separate useEffect for popup logic to avoid dependency issues
  useEffect(() => {
    console.log('Dashboard mounted, setting up popup timer...');
    // Show first popup after 2 seconds (for demo purposes)
    const initialTimeout = setTimeout(() => {
      console.log('Showing first popup...');
      setShowAdPopup(true);
      setAdShowCount(prev => prev + 1);
    }, 2000); // Reduced to 2 seconds for faster testing

    return () => {
      clearTimeout(initialTimeout);
    };
  }, []); // Only run once on mount

  // Popup interval logic
  useEffect(() => {
    if (adShowCount >= 3) return; // Stop if already shown 3 times

    const adInterval = setInterval(() => {
      if (adShowCount < 3) {
        setShowAdPopup(true);
        setAdShowCount(prev => prev + 1);
      }
    }, 60000); // 60 seconds = 60000ms

    return () => {
      clearInterval(adInterval);
    };
  }, [adShowCount]);

  // Countdown timer for the ad
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 478; // Reset to 7:58
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const closeAdPopup = () => {
    setShowAdPopup(false);
  };

  const claimGift = () => {
    setShowAdPopup(false);
    setShowAdContent(true);
  };

  const claimFinalGift = async () => {
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
      // Show final success page
      setShowAdContent(false);
      setShowFinalSuccess(true);
    } catch (error) {
      // Show final success page even on error
      setShowAdContent(false);
      setShowFinalSuccess(true);
    }
  };

  const closeAdContent = () => {
    setShowAdContent(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'transfer', name: 'Transfer Money', icon: Send },
    { id: 'history', name: 'Transaction History', icon: FileText },
    { id: 'search', name: 'Search Users', icon: Search },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'system', name: 'System Tools', icon: Wrench }
  ];

  // Add admin tab for admin users
  if (user?.username === 'admin') {
    tabs.push({ id: 'admin', name: 'Admin Panel', icon: Settings });
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user.fullName}!</h2>
              <p className="text-blue-100 mb-4">Account Balance</p>
              <div className="text-4xl font-bold">${userBalance?.toLocaleString() || '0'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Account Number</p>
                    <p className="text-2xl font-bold text-gray-900">****{user.id.toString().padStart(4, '0')}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Account Type</p>
                    <p className="text-2xl font-bold text-gray-900">Checking</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'transfer':
        return <TransferMoney onTransferComplete={refreshUserData} />;
      case 'history':
        return <TransactionHistory userId={user.id} />;
      case 'search':
        return <UserSearch />;
      case 'profile':
        return <ProfileManager />;
      case 'system':
        return <SystemTools />;
      case 'admin':
        return user?.username === 'admin' ? <AdminPanel /> : null;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-blue-900 via-blue-800 to-indigo-900 shadow-xl z-40 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold text-white">InsecureBank</h1>
          <p className="text-blue-200 text-sm mt-1">Dashboard Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-900 shadow-lg'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <span>{tab.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition duration-300 shadow-lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'overview' && 'Your account overview and quick stats'}
                  {activeTab === 'transfer' && 'Send money to other users securely'}
                  {activeTab === 'history' && 'View all your past transactions'}
                  {activeTab === 'search' && 'Find and connect with other users'}
                  {activeTab === 'profile' && 'Manage your account information'}
                  {activeTab === 'system' && 'System utilities and diagnostic tools'}
                  {activeTab === 'admin' && 'Administrative controls and user management'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Temporary test button - remove in production
                <button 
                  onClick={() => {setShowAdPopup(true); setAdShowCount(prev => prev + 1);}} 
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition duration-200"
                  title="Test Popup (Remove in production)"
                >
                  🎁 Test Ad
                </button> */}
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition duration-200"
                >
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[calc(100vh-180px)]">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Advertisement Popup Modal */}
      {showAdPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeAdPopup}
              className="absolute top-3 right-3 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition duration-300"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Popup Content */}
            <div className="bg-linear-to-b from-purple-500 via-pink-500 to-orange-500 text-white p-6 text-center">
              {/* Trophy Animation */}
              <div className="mb-4">
                <div className="bg-white rounded-full p-3 inline-block">
                  <Gift className="w-10 h-10 text-yellow-500" />
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
                <div className="flex items-center justify-center space-x-1 text-yellow-200">
                  <span className="text-sm">⏰</span>
                  <span className="text-sm font-medium">Offer expires in:</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-xs text-yellow-200 mt-1">Limited time only!</p>
              </div>
              
              {/* CTA Button */}
              <button
                onClick={claimGift}
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
      )}

      {/* Advertisement Content Popup */}
      {showAdContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowAdContent(false)}
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
                onClick={claimFinalGift}
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
      )}

      {/* Final Success Page (Image 4) */}
      {showFinalSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white rounded-t-lg p-4 border-b border-gray-100 z-10">
              <button
                onClick={() => setShowFinalSuccess(false)}
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
                  onClick={() => setShowFinalSuccess(false)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-full font-bold text-lg hover:bg-blue-700 transition duration-300"
                >
                  🏦 Return to Banking
                </button>
                
                <button
                  onClick={() => {
                    setShowFinalSuccess(false);
                    setShowAdContent(true);
                  }}
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
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;