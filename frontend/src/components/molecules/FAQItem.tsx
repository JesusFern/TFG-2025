// src/components/molecules/FAQItem.tsx
import React, { useState } from 'react';
import styled from 'styled-components';

const FAQItemContainer = styled.div`
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
`;

const Question = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    transition: transform 0.3s;
  }
`;

interface AnswerProps {
  isOpen: boolean;
}

const Answer = styled.div<AnswerProps>`
  color: #666;
  line-height: 1.6;
  max-height: ${props => (props.isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.5s ease;
`;

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FAQItemContainer>
      <Question onClick={() => setIsOpen(!isOpen)}>
        {question}
        <span style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
      </Question>
      <Answer isOpen={isOpen}>{answer}</Answer>
    </FAQItemContainer>
  );
};
