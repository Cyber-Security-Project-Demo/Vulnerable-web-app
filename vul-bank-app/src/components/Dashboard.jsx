import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { Home, Send, FileText, Search, User, Wrench, Settings, CreditCard, CheckCircle, Star, LogOut } from 'lucide-react';
import TransferMoney from './TransferMoney';
import TransactionHistory from './TransactionHistory';
import UserSearch from './UserSearch';
import SystemTools from './SystemTools';
import ProfileManager from './ProfileManager';
import AdminPanel from './AdminPanel';
import ConfirmModal from './ConfirmModal';
import AttackerPage from './AttackerPage';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userBalance, setUserBalance] = useState(user?.balance || 0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAttackerPopup, setShowAttackerPopup] = useState(false);

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

  useEffect(() => {
    // Show attacker popup after 5 seconds
    const timer = setTimeout(() => {
      setShowAttackerPopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
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
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-blue-900 via-blue-800 to-indigo-900 shadow-xl z-30 flex flex-col">
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
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
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

      {/* Attacker Popup Advertisement */}
      {showAttackerPopup && (
        <AttackerPage onBack={() => setShowAttackerPopup(false)} />
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