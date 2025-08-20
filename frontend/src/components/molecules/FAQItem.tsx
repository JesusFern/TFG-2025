import React, { useState } from 'react';
import styled from 'styled-components';

// Declara explícitamente la interfaz con el campo isDark
export interface FAQItemProps {
  question: string;
  answer: string;
  isDark?: boolean;
}

const FAQItemContainer = styled.div<{ isDark?: boolean }>`
  margin-bottom: 1.5rem;
  border: 1px solid var(--app-border-color);
  border-radius: 10px;
  overflow: hidden;
  background-color: ${props => props.isDark ? 'var(--app-paper-bg)' : 'white'};
  box-shadow: ${props => props.isDark 
    ? '0 4px 8px rgba(0, 0, 0, 0.2)' 
    : '0 4px 8px rgba(0, 0, 0, 0.05)'};
`;

const Question = styled.div<{ isDark?: boolean, isOpen: boolean }>`
  padding: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${props => props.isOpen 
    ? `1px solid var(--app-border-color)` 
    : 'none'};
  color: ${props => props.isDark ? 'var(--mantine-color-gray-0)' : 'var(--app-text)'};
  background-color: ${props => props.isOpen 
    ? props.isDark ? 'rgba(76, 180, 111, 0.15)' : 'rgba(76, 180, 111, 0.05)'
    : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isDark 
      ? 'rgba(76, 180, 111, 0.1)' 
      : 'rgba(76, 180, 111, 0.03)'};
  }
  
  &::after {
    content: '${props => props.isOpen ? "−" : "+"}';
    font-size: 1.5rem;
    color: var(--app-accent);
  }
`;

const Answer = styled.div<{ isDark?: boolean, isOpen: boolean }>`
  padding: ${props => props.isOpen ? '1.25rem' : '0 1.25rem'};
  height: ${props => props.isOpen ? 'auto' : '0'};
  overflow: hidden;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease-in-out;
  color: ${props => props.isDark ? 'var(--mantine-color-gray-3)' : 'var(--app-text-secondary)'};
  line-height: 1.6;
`;

// Define el componente con la interfaz de props explícita
export const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FAQItemContainer isDark={isDark}>
      <Question 
        onClick={() => setIsOpen(!isOpen)} 
        isOpen={isOpen} 
        isDark={isDark}
      >
        {question}
      </Question>
      <Answer isOpen={isOpen} isDark={isDark}>
        {answer}
      </Answer>
    </FAQItemContainer>
  );
};