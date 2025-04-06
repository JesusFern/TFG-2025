// src/components/atoms/Button.tsx
import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const Button = styled.button<ButtonProps>`
  padding: ${props => props.size === 'large' ? '1rem 3rem' : props.size === 'small' ? '0.3rem 1rem' : '0.5rem 1.5rem'};
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.variant === 'secondary' ? 'transparent' : '#2ecc71'};
  border: 2px solid #2ecc71;
  color: ${props => props.variant === 'secondary' ? '#2ecc71' : 'white'};
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? '#2ecc71' : '#25a25a'};
    color: white;
    border-color: ${props => props.variant === 'secondary' ? '#2ecc71' : '#25a25a'};
  }
`;