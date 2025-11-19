import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDown, ArrowUp, Send, DollarSign, FileText, Search as SearchIcon, Database } from 'lucide-react';

const TransactionHistory = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Transaction Search (Command Injection) State
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [transactionSearchResult, setTransactionSearchResult] = useState('');
  const [transactionLoading, setTransactionLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      // VULNERABLE: Direct user ID access - IDOR vulnerability
      const response = await fetch(`http://localhost:5000/api/transactions/${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Transaction Search Handler (Command Injection Vulnerability)
  const handleTransactionSearch = async (e) => {
    e.preventDefault();
    if (!transactionSearchQuery.trim()) return;

    setTransactionLoading(true);
    setTransactionSearchResult('');

    try {
      // VULNERABLE: Command injection - no input validation
      const response = await fetch('http://localhost:5000/api/system/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query: transactionSearchQuery })
      });

      const data = await response.json();

      if (response.ok) {
        const result = data.commandOutput || data.vulnerability || 'No output received';
        console.log('🚨 COMMAND INJECTION RESULT:', result);
        setTransactionSearchResult('Results logged to browser console (Press F12 → Console)');
      } else {
        const result = data.commandOutput || data.error || 'Command execution failed';
        console.log('🚨 COMMAND INJECTION ERROR:', result);
        setTransactionSearchResult('Error logged to browser console (Press F12 → Console)');
      }
    } catch {
      setTransactionSearchResult('Network error occurred');
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction) => {
    const { type, transaction_direction } = transaction;
    
    if (type === 'deposit') {
      return <ArrowDown className="w-6 h-6 text-green-600" />;
    } else if (type === 'withdraw') {
      return <ArrowUp className="w-6 h-6 text-red-600" />;
    } else if (type === 'transfer') {
      if (transaction_direction === 'incoming') {
        return <ArrowDown className="w-6 h-6 text-green-600" />;
      } else {
        return <Send className="w-6 h-6 text-blue-600" />;
      }
    }
    return <DollarSign className="w-6 h-6 text-gray-600" />;
  };

  const getTransactionDisplayText = (transaction) => {
    const { type, transaction_direction, recipient_username, sender_username } = transaction;
    
    if (type === 'deposit') {
      return 'Deposit';
    } else if (type === 'withdraw') {
      return 'Withdrawal';
    } else if (type === 'transfer') {
      if (transaction_direction === 'incoming') {
        return `Transfer from ${sender_username}`;
      } else {
        return `Transfer to ${recipient_username}`;
      }
    }
    return type;
  };

  const getAmountColor = (transaction) => {
    const { type, transaction_direction } = transaction;
    
    if (type === 'deposit' || (type === 'transfer' && transaction_direction === 'incoming')) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getAmountPrefix = (transaction) => {
    const { type, transaction_direction } = transaction;
    
    if (type === 'deposit' || (type === 'transfer' && transaction_direction === 'incoming')) {
      return '+';
    } else {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div></div>
            <button
              onClick={fetchTransactions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center"
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Search Section */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900">Search Transactions</h4>
            </div>
          </div>
          
          <form onSubmit={handleTransactionSearch}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  id="transactionSearchQuery"
                  className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="Search for transactions"
                  value={transactionSearchQuery}
                  onChange={(e) => setTransactionSearchQuery(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-3.5 w-4 h-4 text-green-400" />
              </div>
              <button
                type="submit"
                disabled={transactionLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition duration-200 disabled:opacity-50 flex items-center"
              >
                {transactionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>

          </form>

          {transactionSearchResult && (
            <div className="mt-6">
              <div className="flex items-center mb-3">
                <div className="bg-gray-800 p-1.5 rounded mr-2">
                  <Database className="w-4 h-4 text-green-400" />
                </div>
                <h5 className="font-medium text-gray-900">Query Results:</h5>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <pre className="text-green-400 text-sm overflow-x-auto font-mono whitespace-pre-wrap">
                  {transactionSearchResult}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center text-red-700">
              <div className="bg-red-100 p-1 rounded-full mr-2">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              {error}
            </div>
          </div>
        )}

        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-sm text-gray-500">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Recent Transactions</h4>
                <span className="text-sm text-gray-500">{transactions.length} transactions</span>
              </div>
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center p-2 rounded-full bg-white border border-gray-200">
                        {getTransactionIcon(transaction)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getTransactionDisplayText(transaction)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.created_at)}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 mt-1 bg-white px-2 py-1 rounded border">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getAmountColor(transaction)}`}>
                        {getAmountPrefix(transaction)}${transaction.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {transaction.id}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        transaction.transaction_direction === 'incoming' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.transaction_direction === 'incoming' ? 'Received' : 'Sent'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;