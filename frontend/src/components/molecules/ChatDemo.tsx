import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Paper, Stack, TextInput, Group, Badge } from '@mantine/core';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';

interface DemoMessage {
  id: string;
  content: string;
  sender: 'user' | 'system' | 'other';
  timestamp: Date;
  type: 'text' | 'system';
}

export const ChatDemo: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Configurar WebSocket de manera simple
  const { socket, isConnected, isConnecting, connect, disconnect } = useSocket({
    onConnect: () => {
      console.log('🔌 WebSocket conectado en ChatDemo');
      setConnectionStatus('connected');
      addSystemMessage('WebSocket conectado exitosamente');
    },
    onDisconnect: (reason) => {
      console.log('🔌 WebSocket desconectado en ChatDemo:', reason);
      setConnectionStatus('disconnected');
      addSystemMessage(`WebSocket desconectado: ${reason}`);
    },
    onError: (error) => {
      console.error('❌ WebSocket error en ChatDemo:', error);
      addSystemMessage(`Error de WebSocket: ${error}`);
    }
  });

  // Actualizar estado de conexión
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else if (isConnecting) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, isConnecting]);

  const addSystemMessage = (content: string) => {
    const newMessage: DemoMessage = {
      id: Date.now().toString(),
      content,
      sender: 'system',
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: DemoMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleConnect = () => {
    if (user) {
      console.log('🔌 Intentando conectar WebSocket...');
      connect();
    } else {
      addSystemMessage('Error: Usuario no autenticado');
    }
  };

  const handleDisconnect = () => {
    console.log('🔌 Desconectando WebSocket...');
    disconnect();
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    
    // Enviar mensaje por WebSocket si está conectado
    if (socket && isConnected) {
      socket.emit('send_message', {
        destinatario: 'test-user',
        contenido: inputValue,
        tipo: 'texto'
      });
      addSystemMessage(`Mensaje enviado por WebSocket: "${inputValue}"`);
    } else {
      addSystemMessage('Mensaje enviado localmente (WebSocket no conectado)');
    }

    setInputValue('');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'connecting': return 'yellow';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'disconnected': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>Chat Demo - WebSocket Test</Text>
          <Badge color={getConnectionStatusColor()}>
            {getConnectionStatusText()}
          </Badge>
        </Group>

        <Group>
          <Button 
            onClick={handleConnect} 
            disabled={isConnected || isConnecting}
            color="green"
          >
            Conectar
          </Button>
          <Button 
            onClick={handleDisconnect} 
            disabled={!isConnected}
            color="red"
          >
            Desconectar
          </Button>
        </Group>

        <Box 
          style={{ 
            height: 300, 
            overflowY: 'auto', 
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: 8,
            backgroundColor: '#f8f9fa'
          }}
        >
          {messages.length === 0 ? (
            <Text c="dimmed" ta="center" size="sm">
              No hay mensajes. Conecta el WebSocket para comenzar.
            </Text>
          ) : (
            messages.map((message) => (
              <Box 
                key={message.id} 
                mb={8}
                style={{
                  padding: 8,
                  backgroundColor: message.sender === 'system' ? '#e3f2fd' : '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  borderLeft: `4px solid ${
                    message.sender === 'system' ? '#2196f3' : 
                    message.sender === 'user' ? '#4caf50' : '#ff9800'
                  }`
                }}
              >
                <Group justify="space-between" mb={4}>
                  <Text size="xs" fw={500} c="dimmed">
                    {message.sender === 'system' ? 'Sistema' : 
                     message.sender === 'user' ? 'Tú' : 'Otro'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
                </Group>
                <Text size="sm">{message.content}</Text>
              </Box>
            ))
          )}
        </Box>

        <Group>
          <TextInput
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            style={{ flex: 1 }}
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected}
          >
            Enviar
          </Button>
        </Group>

        <Box>
          <Text size="xs" c="dimmed">
            Estado del WebSocket: {isConnected ? 'Conectado' : isConnecting ? 'Conectando...' : 'Desconectado'}
          </Text>
          {user && (
            <Text size="xs" c="dimmed">
              Usuario: {user.fullName} ({user._id})
            </Text>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};
