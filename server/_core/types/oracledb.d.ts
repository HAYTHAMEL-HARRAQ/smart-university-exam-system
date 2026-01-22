declare module 'oracledb' {
  export const OUT_FORMAT_OBJECT: number;
  export const OUT_FORMAT_ARRAY: number;
  
  export interface Connection {
    execute(sql: string, binds?: any[], options?: any): Promise<any>;
    close(): Promise<void>;
  }
  
  export interface Pool {
    getConnection(): Promise<Connection>;
    close(): Promise<void>;
  }
  
  export function createPool(config: any): Promise<Pool>;
  
  export default {
    OUT_FORMAT_OBJECT,
    OUT_FORMAT_ARRAY,
    createPool
  };
}