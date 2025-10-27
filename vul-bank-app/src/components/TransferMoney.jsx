import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import ConfirmModal from './ConfirmModal';

const TransferMoney = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    toUsername: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Available Balance</h3>
        <p className="text-2xl font-bold text-blue-800">${user.balance?.toLocaleString() || '0'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div>
          <label htmlFor="toUsername" className="block text-sm font-medium text-gray-700">
            Recipient Username
          </label>
          <input
            type="text"
            id="toUsername"
            name="toUsername"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter recipient's username"
            value={formData.toUsername}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0.01"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Transfer Money'}
        </button>
      </form>

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