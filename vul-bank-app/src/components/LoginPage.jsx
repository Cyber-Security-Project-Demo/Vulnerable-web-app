import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useSQLConsole } from "../contexts/SQLConsoleContext";
import { Database, AlertTriangle } from "lucide-react";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { sqlConsoleOutput, addSQLOutput, clearSQLOutput } = useSQLConsole();
  const navigate = useNavigate();

  // Load saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setFormData((prev) => ({
        ...prev,
        username: savedUsername,
        rememberMe: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simple SQL injection detection
    let detectedPattern = null;
    let injectionField = null;
    const usernameInput = formData.username || '';
    const passwordInput = formData.password || '';
    
    if (usernameInput.includes("' OR 1=1") || usernameInput.includes("'--")) {
      detectedPattern = 'ERROR_BASED';
      injectionField = 'username';
    } else if (passwordInput.includes("' OR 1=1") || passwordInput.includes("'--")) {
      detectedPattern = 'ERROR_BASED';
      injectionField = 'password';
    } else if (usernameInput.includes('UNION SELECT')) {
      detectedPattern = 'UNION_BASED';
      injectionField = 'username';
    } else if (passwordInput.includes('UNION SELECT')) {
      detectedPattern = 'UNION_BASED';
      injectionField = 'password';
    } else if (usernameInput.includes("AND 1=1")) {
      detectedPattern = 'BOOLEAN_BLIND';
      injectionField = 'username';
    } else if (passwordInput.includes("AND 1=1")) {
      detectedPattern = 'BOOLEAN_BLIND';
      injectionField = 'password';
    }
    
    if (detectedPattern) {
      const timestamp = new Date().toLocaleTimeString();
      const payload = injectionField === 'username' ? usernameInput : passwordInput;
      addSQLOutput({
        timestamp,
        type: 'SQL_INJECTION_DETECTED',
        pattern: detectedPattern,
        field: injectionField,
        payload: payload.trim(),
        severity: 'HIGH'
      });
    }

    const result = await login(formData.username, formData.password);

    // Log SQL injection results
    if (result.sqlInjection) {
      const timestamp = new Date().toLocaleTimeString();
      addSQLOutput({
        timestamp,
        type: result.sqlInjection.type,
        details: result.sqlInjection.details,
        query: result.sqlInjection.query,
        success: result.success,
        severity: result.success ? 'CRITICAL' : 'MEDIUM'
      });
    }

    if (result.success) {
      // VULNERABLE: Storing username in localStorage (client-side storage)
      if (formData.rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Left Side - Full Height Image */}
      <div className="hidden lg:block">
        <div className="login-image-container">
          <img src="/src/assets/login-image.png" alt="Secure Banking" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 lg:ml-[50%]">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link to="/" className="flex justify-center lg:justify-start">
              <h2 className="text-3xl font-bold text-white">InsecureBank</h2>
            </Link>
            <h2 className="mt-6 text-center lg:text-left text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center lg:text-left text-sm text-blue-100">
              Or{" "}
              <Link
                to="/register"
                className="font-medium text-blue-300 hover:text-blue-200"
              >
                create a new account
              </Link>
            </p>
            

          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-white"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Try: admin'-- or ' OR 1=1 --"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Try: ' OR 1=1 --"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-white"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-300 hover:text-blue-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
          
          {/* SQL Injection Console */}
          {sqlConsoleOutput.length > 0 && (
            <div className="mt-6 bg-gray-900/90 backdrop-blur-md rounded-xl p-6 border border-red-500/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <Database className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">SQL Injection Console</h3>
                    <p className="text-sm text-red-200">Real-time SQL attack monitoring</p>
                  </div>
                </div>
                <button
                  onClick={clearSQLOutput}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition duration-200"
                >
                  Clear
                </button>
              </div>
              <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {sqlConsoleOutput.map((output, index) => (
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
                    {output.pattern && (
                      <div className="text-cyan-400 mb-1">Pattern: {output.pattern}</div>
                    )}
                    {output.payload && (
                      <div className="text-yellow-400 mb-1">
                        {output.field && `Field: ${output.field} | `}Payload: {output.payload}
                      </div>
                    )}
                    {output.query && (
                      <div className="text-green-400 mb-1">Query: {output.query}</div>
                    )}
                    {output.details && (
                      <div className="text-red-400">{output.details}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
