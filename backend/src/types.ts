export interface MongoError extends Error {
    code?: number;
    keyValue?: Record<string, string | number | boolean>;
  }