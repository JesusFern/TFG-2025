import React from 'react';
import styled from 'styled-components';

export interface ButtonProps {
  primary?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

const StyledButton = styled.button<ButtonProps>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid var(--app-accent);
  
  /* Estilo primario (relleno verde) o secundario (outline) */
  background-color: ${props => props.primary 
    ? 'var(--app-accent)' 
    : 'transparent'};
  color: ${props => props.primary 
    ? 'white' 
    : 'var(--app-accent)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.primary 
      ? 'var(--app-accent)' 
      : 'rgba(76, 180, 111, 0.1)'};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  primary = false,
  type = 'button',
  ...props
}) => {
  return (
    <StyledButton
      primary={primary}
      type={type}
      {...props}
    >
      {children}
    </StyledButton>
  );
};