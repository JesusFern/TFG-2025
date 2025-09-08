import { useContext } from 'react';
import ChatContext from './ChatContext';

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider');
  }
  return context;
};

export default useChat;


