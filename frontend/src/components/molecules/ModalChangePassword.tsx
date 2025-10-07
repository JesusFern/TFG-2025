import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Button,
  PasswordInput,
  Alert,
  Text
} from '@mantine/core';
import {
  IconAlertCircle,
  IconLock,
  IconCheck
} from '@tabler/icons-react';

interface ModalChangePasswordProps {
  opened: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ModalChangePassword: React.FC<ModalChangePasswordProps> = ({
  opened,
  onClose,
  onSave
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave(currentPassword, newPassword);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Cambiar Contraseña"
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              variant="light"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Requisitos de seguridad"
            color="blue"
            variant="light"
          >
            <Stack gap={4}>
              <Text size="sm">• La contraseña debe tener al menos 6 caracteres</Text>
              <Text size="sm">• Debe ser diferente a tu contraseña actual</Text>
              <Text size="sm">• Usa una combinación de letras, números y símbolos</Text>
            </Stack>
          </Alert>

          <PasswordInput
            label="Contraseña Actual"
            placeholder="Ingresa tu contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            leftSection={<IconLock size={16} />}
            disabled={isLoading}
          />

          <PasswordInput
            label="Nueva Contraseña"
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            leftSection={<IconLock size={16} />}
            disabled={isLoading}
            error={newPassword.length > 0 && newPassword.length < 6 ? 'Mínimo 6 caracteres' : null}
          />

          <PasswordInput
            label="Confirmar Nueva Contraseña"
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            leftSection={<IconLock size={16} />}
            disabled={isLoading}
            error={
              confirmPassword.length > 0 && confirmPassword !== newPassword
                ? 'Las contraseñas no coinciden'
                : null
            }
          />

          <Stack gap="sm" mt="md">
            <Button
              type="submit"
              variant="filled"
              color="nutroos-green"
              loading={isLoading}
              leftSection={<IconCheck size={16} />}
              fullWidth
            >
              Cambiar Contraseña
            </Button>
            
            <Button
              variant="light"
              color="gray"
              onClick={handleClose}
              disabled={isLoading}
              fullWidth
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
};

export default ModalChangePassword;

