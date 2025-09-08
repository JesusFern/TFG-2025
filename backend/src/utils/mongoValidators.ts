import mongoose from 'mongoose';

export const isValidUrl = (url: string): boolean => {
    return /^https?:\/\/.+/.test(url);
  };

  export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    return /^\+?[1-9]\d{1,14}$/.test(phoneNumber);
  };
  
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};