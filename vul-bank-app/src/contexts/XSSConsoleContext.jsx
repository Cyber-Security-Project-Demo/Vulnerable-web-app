import React, { createContext, useContext, useState, useEffect } from 'react';

const XSSConsoleContext = createContext();

export const useXSSConsole = () => {
  const context = useContext(XSSConsoleContext);
  if (!context) {
    throw new Error('useXSSConsole must be used within XSSConsoleProvider');
  }
  return context;
};

export const XSSConsoleProvider = ({ children }) => {
  const [xssConsoleOutput, setXssConsoleOutput] = useState([]);
  const loggedMessages = React.useRef(new Set());

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalAlert = window.alert;

    // Global console.log interception
    console.log = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('[XSS]')) {
        const messageKey = message.substring(0, 100);
        if (loggedMessages.current.has(messageKey)) {
          return;
        }
        loggedMessages.current.add(messageKey);
        setTimeout(() => loggedMessages.current.delete(messageKey), 2000);

        const timestamp = new Date().toLocaleTimeString();
        let logType = 'XSS_CONSOLE';
        let cleanMessage = message;
        
        if (message.includes('cookie=')) {
          logType = 'XSS_COOKIE_THEFT';
          // Get the actual cookie data from args
          const cookieData = args.length > 1 ? args.slice(1).join(' ') : 'No cookie data';
          cleanMessage = `Cookie stolen:\n${cookieData}`;
        } else if (message.includes('users:')) {
          logType = 'XSS_DATA_THEFT';
          // Find the user array in the arguments
          const userData = args.find(arg => Array.isArray(arg));
          if (userData && userData.length > 0) {
            const userList = userData.map(user => 
              `ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Password: ${user.password}`
            ).join('\n');
            cleanMessage = `Complete database stolen (${userData.length} users):\n${userList}`;
          } else {
            // Fallback - show raw data if array not found
            const rawData = args.slice(1).join(' ');
            cleanMessage = `Database accessed:\n${rawData}`;
          }
        } else {
          cleanMessage = message.replace('[XSS] ', '');
        }
        
        const newOutput = {
          timestamp,
          type: logType,
          message: cleanMessage,
          severity: 'CRITICAL'
        };
        setXssConsoleOutput(prev => [...prev, newOutput]);
        return;
      }
      
      // Call original console.log for non-XSS logs
      originalConsoleLog(...args);
    };

    // Global alert interception
    window.alert = (message) => {
      const timestamp = new Date().toLocaleTimeString();
      const newOutput = {
        timestamp,
        type: 'XSS_ALERT',
        message: `Alert executed: ${message}`,
        severity: 'CRITICAL'
      };
      setXssConsoleOutput(prev => [...prev, newOutput]);
      originalAlert(message);
    };

    return () => {
      console.log = originalConsoleLog;
      window.alert = originalAlert;
    };
  }, []);

  const addXSSOutput = (output) => {
    // Prevent duplicate XSS_RENDERED messages
    setXssConsoleOutput(prev => {
      const isDuplicate = prev.some(item => 
        item.type === output.type && 
        item.message === output.message && 
        Math.abs(new Date(`1970-01-01T${item.timestamp}Z`).getTime() - new Date(`1970-01-01T${output.timestamp}Z`).getTime()) < 2000
      );
      return isDuplicate ? prev : [...prev, output];
    });
  };

  const clearXSSOutput = () => {
    setXssConsoleOutput([]);
  };

  return (
    <XSSConsoleContext.Provider value={{
      xssConsoleOutput,
      addXSSOutput,
      clearXSSOutput
    }}>
      {children}
    </XSSConsoleContext.Provider>
  );
};