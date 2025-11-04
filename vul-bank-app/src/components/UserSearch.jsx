import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { Search as SearchIcon, User } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const UserSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
  // Allow empty searches to list ALL users (server returns LIKE '%%')
  // This makes stored XSS easier to demonstrate when a malicious name exists in DB.

    setLoading(true);
    setHasSearched(true);

    try {
      // VULNERABLE: Query parameter not sanitized - XSS vulnerability
      const response = await fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMoney = (recipient) => {
    setSelectedUser(recipient);
    setShowTransferModal(true);
    setTransferMessage('');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setShowTransferConfirm(true);
  };

  const executeTransfer = async () => {
    
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
          toUsername: selectedUser.username,
          amount: parseFloat(transferAmount),
          description: `Transfer to ${selectedUser.full_name}`
        })
      });

      const result = await response.json();

      if (response.ok) {
        setTransferMessage('Transfer completed successfully!');
        setTransferAmount('');
        setTimeout(() => {
          setShowTransferModal(false);
          setTransferMessage('');
        }, 2000);
      } else {
        setTransferMessage(result.message || 'Transfer failed');
      }
    } catch {
      setTransferMessage('Network error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">
            Search by username or name
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="searchQuery"
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter username or name to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <SearchIcon className="w-4 h-4 mr-1" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length})
            </h3>
            {searchQuery && (
              <div className="text-sm text-gray-500">
                Searched for: "<span 
                  className="font-mono bg-gray-100 px-2 py-1 rounded"
                  dangerouslySetInnerHTML={{ __html: searchQuery }} // VULNERABLE: XSS
                />"
              </div>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              No users found matching your search
            </div>
          ) : (
            <div className="grid gap-4">
              {searchResults.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          <span dangerouslySetInnerHTML={{ __html: user.full_name }} /> {/* VULNERABLE: XSS */}
                        </h4>
                        <p className="text-sm text-gray-600">
                          @<span dangerouslySetInnerHTML={{ __html: user.username }} /> {/* VULNERABLE: XSS */}
                        </p>
                        <p className="text-xs text-gray-500">
                          User ID: {user.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <button 
                        onClick={() => handleSendMoney(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-300"
                      >
                        Send Money
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Search Suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Search Suggestions</h3>
        <div className="flex flex-wrap gap-2">
          {['admin', 'john', 'jane', 'bob', 'smith', 'doe'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setSearchQuery(suggestion)}
              className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-100 transition duration-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Send Money</h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Recipient:</p>
              <p className="font-semibold text-gray-900">{selectedUser.full_name}</p>
              <p className="text-sm text-gray-500">@{selectedUser.username}</p>
            </div>

            {transferMessage && (
              <div className={`mb-4 p-3 rounded ${
                transferMessage.includes('successfully')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {transferMessage}
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0.01"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Confirmation Modal */}
      <ConfirmModal
        isOpen={showTransferConfirm}
        onClose={() => setShowTransferConfirm(false)}
        onConfirm={executeTransfer}
        title="Confirm Money Transfer"
        message={`Are you sure you want to send $${transferAmount} to ${selectedUser?.full_name} (@${selectedUser?.username})?`}
        confirmText="Send"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default UserSearch;