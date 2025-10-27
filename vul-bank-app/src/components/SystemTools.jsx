import React, { useState } from 'react';
import { Wifi } from 'lucide-react';

const SystemTools = () => {
  const [pingHost, setPingHost] = useState('');
  const [pingResult, setPingResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePing = async (e) => {
    e.preventDefault();
    if (!pingHost.trim()) return;

    setLoading(true);
    setPingResult('');

    try {
      // VULNERABLE: Command injection - no input validation
      const response = await fetch('http://localhost:5000/api/system/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ host: pingHost })
      });

      const data = await response.json();

      if (response.ok) {
        setPingResult(data.output || data.error || 'No output received');
      } else {
        setPingResult(data.error || 'Ping failed');
      }
    } catch {
      setPingResult('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Ping Tool</h3>
        
        <form onSubmit={handlePing} className="space-y-4">
          <div>
            <label htmlFor="pingHost" className="block text-sm font-medium text-gray-700">
              Host to Ping
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="pingHost"
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter hostname or IP address (e.g., google.com, 8.8.8.8)"
                value={pingHost}
                onChange={(e) => setPingHost(e.target.value)}
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
                    <Wifi className="w-4 h-4 mr-1" />
                    Ping
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This tool executes: ping -c 4 [your_input]
            </p>
          </div>
        </form>

        {pingResult && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ping Results:</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono">
              {pingResult}
            </pre>
          </div>
        )}
      </div>

      {/* Quick Test Suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Test Suggestions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'localhost',
            '127.0.0.1',
            'google.com',
            '8.8.8.8'
          ].map((host) => (
            <button
              key={host}
              onClick={() => setPingHost(host)}
              className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-100 transition duration-300"
            >
              {host}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemTools;