import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useXSSConsole } from '../contexts/XSSConsoleContext';
import { Search as SearchIcon, User, Send, DollarSign } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const TransferMoney = () => {
  const { user } = useAuth();
  const { xssConsoleOutput, addXSSOutput, clearXSSOutput } = useXSSConsole();
  const [formData, setFormData] = useState({
    toUsername: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // User Search (XSS) State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [hasUserSearched, setHasUserSearched] = useState(false);




  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // User Search Handler (XSS Vulnerability)
  const handleUserSearch = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setHasUserSearched(true);

    // Check for XSS patterns and log to web console
    const xssPatterns = [
      /<script/i, /<img.*onerror/i, /<svg.*onload/i, /<iframe/i, 
      /javascript:/i, /alert\(/i, /document\./i, /window\./i
    ];
    
    const isXssAttempt = xssPatterns.some(pattern => pattern.test(userSearchQuery));
    
    if (isXssAttempt) {
      const timestamp = new Date().toLocaleTimeString();
      const newOutput = {
        timestamp,
        type: 'XSS_DETECTED',
        message: `XSS payload detected: ${userSearchQuery}`,
        severity: 'HIGH'
      };
      addXSSOutput(newOutput);
    }

    try {
      // VULNERABLE: Query parameter not sanitized - XSS vulnerability
      const response = await fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(userSearchQuery)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUserSearchResults(data.results || []);
        
        if (isXssAttempt) {
          const timestamp = new Date().toLocaleTimeString();
          const newOutput = {
            timestamp,
            type: 'XSS_EXECUTED',
            message: 'XSS payload will execute when results are rendered',
            severity: 'CRITICAL'
          };
          addXSSOutput(newOutput);
        }
      } else {
        setUserSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setUserSearchResults([]);
    } finally {
      setUserLoading(false);
    }
  };

  const selectUser = (selectedUser) => {
    setFormData({
      ...formData,
      toUsername: selectedUser.username
    });
  };

  const executeTransfer = async () => {
    setLoading(true);
    setMessage('');

    try {
      // VULNERABLE: No CSRF protection
      const response = await fetch('http://localhost:5000/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fromUserId: user.id,
          toUsername: formData.toUsername,
          amount: parseFloat(formData.amount),
          description: formData.description
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Transfer completed successfully!');
        setFormData({ toUsername: '', amount: '', description: '' });
      } else {
        setMessage(result.message || 'Transfer failed');
      }
    } catch {
      setMessage('Network error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-blue-900">Available Balance</h3>
          <div className="bg-blue-100 p-2 rounded-full">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-800">${user.balance?.toLocaleString() || '0'}</p>
      </div>

      {/* User Search Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Find Recipients</h3>
            </div>
          </div>
          
          <form onSubmit={handleUserSearch}>
            <div className="relative">
              <input
                type="text"
                id="userSearchQuery"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <button
                type="submit"
                disabled={userLoading}
                className="absolute right-2 top-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition duration-200 disabled:opacity-50"
              >
                {userLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>
        </div>

        {hasUserSearched && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                Results ({userSearchResults.length})
              </h4>
            </div>

            {userSearchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <SearchIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No users found</p>
                {/* Display reflected search query - XSS VULNERABLE */}
                {userSearchQuery && (
                  <p className="text-xs text-red-500 mt-2">
                    Searched for: <span dangerouslySetInnerHTML={{ __html: userSearchQuery }} />
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {userSearchResults.map((searchUser) => (
                  <div key={searchUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          <span dangerouslySetInnerHTML={{ __html: searchUser.full_name }} /> {/* VULNERABLE: XSS */}
                        </p>
                        <p className="text-xs text-gray-500">
                          @<span dangerouslySetInnerHTML={{ __html: searchUser.username }} /> {/* VULNERABLE: XSS */}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => selectUser(searchUser)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition duration-200"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* XSS Console Output */}
      {xssConsoleOutput.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center mb-2">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <SearchIcon className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">XSS Detection Console</h3>
                <p className="text-sm text-gray-500">Real-time XSS attack monitoring and execution logs</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">{xssConsoleOutput.length} events</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              {xssConsoleOutput.map((output, index) => (
                <div key={index} className="mb-3 font-mono text-sm border-l-2 border-red-500 pl-3">
                  <div className="flex items-center mb-1">
                    <span className="text-gray-400">[{output.timestamp}]</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      output.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      output.severity === 'HIGH' ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {output.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className={`mt-1 whitespace-pre-wrap ${
                    output.type.includes('ALERT') ? 'text-red-400' :
                    output.type.includes('COOKIE') || output.type.includes('THEFT') ? 'text-yellow-400' :
                    output.type.includes('CONSOLE') || output.type.includes('DATA') ? 'text-cyan-400' :
                    'text-green-400'
                  }`}>
                    {output.message}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={clearXSSOutput}
              className="mt-3 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition duration-200"
            >
              Clear Console
            </button>
          </div>
        </div>
      )}

      {/* Transfer Form */}
      <div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Send Money</h3>
                <p className="text-sm text-gray-500">Transfer funds to another user</p>
              </div>
            </div>
          </div>

          <div className="p-6">

            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.includes('successfully') 
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {message.includes('successfully') ? (
                      <div className="bg-green-100 p-1 rounded-full mr-2">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="bg-red-100 p-1 rounded-full mr-2">
                        <User className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    {message}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="toUsername" className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="toUsername"
                      name="toUsername"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Username or search left"
                      value={formData.toUsername}
                      onChange={handleChange}
                    />
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      step="0.01"
                      min="0.01"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="What's this transfer for?"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !formData.toUsername || !formData.amount}
                className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Transfer Money
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Transfer Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeTransfer}
        title="Confirm Transfer"
        message={`Are you sure you want to transfer $${formData.amount} to ${formData.toUsername}?`}
        confirmText="Transfer"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default TransferMoney;