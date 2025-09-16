import { useState, useEffect } from 'react';

interface MarkdownContent {
  title: string;
  content: string;
}

export const useMarkdownContent = (filePath: string): MarkdownContent | null => {
  const [content, setContent] = useState<MarkdownContent | null>(null);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        // Importar el archivo markdown como texto
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Error loading markdown: ${response.statusText}`);
        }
        
        const markdownText = await response.text();
        
        // Parsear el markdown básico
        const lines = markdownText.split('\n');
        const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || '';
        const content = lines
          .filter(line => !line.startsWith('# '))
          .join('\n')
          .trim();
        
        setContent({ title, content });
      } catch (err) {
        console.error('Error loading markdown:', err);
      }
    };

    loadMarkdown();
  }, [filePath]);

  return content;
};
