// Mock oracle adapter for build purposes
// In production, this would connect to actual Oracle database

export const oracleDB = {
  query: async (sql: string, params?: any[]) => {
    console.warn('Oracle DB not configured - using mock response');
    return [];
  },
  
  execute: async (sql: string, params?: any[]) => {
    console.warn('Oracle DB not configured - using mock response');
    return { rowsAffected: 0 };
  }
};

export default oracleDB;