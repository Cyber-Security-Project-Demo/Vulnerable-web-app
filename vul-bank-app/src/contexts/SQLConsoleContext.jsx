import React, { createContext, useContext, useState } from 'react';

const SQLConsoleContext = createContext();

export const useSQLConsole = () => {
  const context = useContext(SQLConsoleContext);
  if (!context) {
    throw new Error('useSQLConsole must be used within SQLConsoleProvider');
  }
  return context;
};

export const SQLConsoleProvider = ({ children }) => {
  const [sqlConsoleOutput, setSqlConsoleOutput] = useState([]);

  const addSQLOutput = (output) => {
    setSqlConsoleOutput(prev => [...prev, output]);
  };

  const clearSQLOutput = () => {
    setSqlConsoleOutput([]);
  };

  return (
    <SQLConsoleContext.Provider value={{
      sqlConsoleOutput,
      addSQLOutput,
      clearSQLOutput
    }}>
      {children}
    </SQLConsoleContext.Provider>
  );
};