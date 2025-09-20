import React from 'react';
import { Text, Title } from '@mantine/core';

interface MarkdownContentProps {
  title?: string;
  content: string;
  titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
  textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'right';
  titleColor?: string;
  textColor?: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({
  title,
  content,
  titleOrder = 2,
  textSize = 'md',
  textAlign = 'left',
  titleColor = 'nutroos-green.6',
  textColor = 'dimmed'
}) => {
  // Función mejorada para parsear markdown
  const parseMarkdown = (text: string) => {
    // Dividir en líneas y procesar cada una
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Títulos (##)
      if (trimmedLine.startsWith('## ')) {
        const titleText = trimmedLine.replace('## ', '');
        elements.push(
          <Title 
            key={`title-${index}`}
            order={4} 
            ta={textAlign} 
            c={titleColor}
            mb="xs"
            mt="md"
          >
            {titleText}
          </Title>
        );
      }
      // Texto en negrita (**texto**)
      else if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
        const formattedParts = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        
        elements.push(
          <Text 
            key={`text-${index}`}
            size={textSize} 
            c={textColor}
            ta={textAlign}
            mb="xs"
          >
            {formattedParts}
          </Text>
        );
      }
      // Texto normal
      else if (trimmedLine) {
        elements.push(
          <Text 
            key={`text-${index}`}
            size={textSize} 
            c={textColor}
            ta={textAlign}
            mb="xs"
          >
            {trimmedLine}
          </Text>
        );
      }
    });
    
    return elements;
  };

  const parsedElements = parseMarkdown(content);

  return (
    <>
      {title && (
        <Title 
          order={titleOrder} 
          ta={textAlign} 
          c={titleColor}
          mb="md"
        >
          {title}
        </Title>
      )}
      {parsedElements}
    </>
  );
};

export default MarkdownContent;
