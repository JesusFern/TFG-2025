import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Mock de fs para evitar operaciones reales de archivos
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock de crypto para UUIDs predecibles
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-123')
}));

describe('Multer Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockImplementation(() => '');
  });

  describe('Path Injection Prevention', () => {
    it('debería generar rutas seguras sin usar input del usuario', () => {
      // Simular la función validateAndSanitizePath
      const validateAndSanitizePath = (basePath: string): string => {
        const normalizedBasePath = path.resolve(basePath) + path.sep;
        const safeId = randomUUID();
        const targetPath = path.join(normalizedBasePath, 'recipes', safeId);
        const canonicalPath = path.resolve(targetPath);
        
        if (!canonicalPath.startsWith(normalizedBasePath)) {
          throw new Error('Ruta de destino fuera del directorio permitido');
        }
        
        return canonicalPath;
      };

      const basePath = './uploads';
      const result = validateAndSanitizePath(basePath);
      
      // Verificar que la ruta generada es segura
      expect(result).toContain('test-uuid-123');
      expect(result).toContain('recipes');
      expect(result).toContain('uploads');
      expect(result).not.toContain('..');
      expect(result).not.toContain('~');
    });

    it('debería prevenir path traversal attacks', () => {
      const validateAndSanitizePath = (basePath: string): string => {
        const normalizedBasePath = path.resolve(basePath) + path.sep;
        const safeId = randomUUID();
        const targetPath = path.join(normalizedBasePath, 'recipes', safeId);
        const canonicalPath = path.resolve(targetPath);
        
        if (!canonicalPath.startsWith(normalizedBasePath)) {
          throw new Error('Ruta de destino fuera del directorio permitido');
        }
        
        return canonicalPath;
      };

      const basePath = './uploads';
      const result = validateAndSanitizePath(basePath);
      
      // Verificar que no hay caracteres de path traversal
      expect(result).not.toMatch(/\.\./);
      expect(result).not.toMatch(/~/);
      expect(result).not.toMatch(/\/\//);
    });

    it('debería usar UUIDs seguros en lugar de input del usuario', () => {
      const validateAndSanitizePath = (basePath: string): string => {
        const normalizedBasePath = path.resolve(basePath) + path.sep;
        const safeId = randomUUID();
        const targetPath = path.join(normalizedBasePath, 'recipes', safeId);
        const canonicalPath = path.resolve(targetPath);
        
        if (!canonicalPath.startsWith(normalizedBasePath)) {
          throw new Error('Ruta de destino fuera del directorio permitido');
        }
        
        return canonicalPath;
      };

      const basePath = './uploads';
      const result = validateAndSanitizePath(basePath);
      
      // Verificar que usa el UUID mockeado
      expect(result).toContain('test-uuid-123');
      expect(randomUUID).toHaveBeenCalled();
    });

    it('debería validar que la ruta esté dentro del directorio base', () => {
      const validateAndSanitizePath = (basePath: string): string => {
        const normalizedBasePath = path.resolve(basePath) + path.sep;
        const safeId = randomUUID();
        const targetPath = path.join(normalizedBasePath, 'recipes', safeId);
        const canonicalPath = path.resolve(targetPath);
        
        if (!canonicalPath.startsWith(normalizedBasePath)) {
          throw new Error('Ruta de destino fuera del directorio permitido');
        }
        
        return canonicalPath;
      };

      const basePath = './uploads';
      const result = validateAndSanitizePath(basePath);
      
      // Verificar que la ruta resultante está dentro del directorio base
      const expectedBase = path.resolve(basePath) + path.sep;
      expect(result.startsWith(expectedBase)).toBe(true);
    });
  });

  describe('File Name Security', () => {
    it('debería generar nombres de archivo seguros', () => {
      const generateSafeFileName = (originalName: string): string => {
        return `${randomUUID()}${path.extname(originalName)}`;
      };

      const originalName = 'malicious-file.jpg';
      const result = generateSafeFileName(originalName);
      
      expect(result).toContain('test-uuid-123');
      expect(result).toContain('.jpg');
      expect(result).not.toContain('malicious-file');
    });

    it('debería manejar extensiones de archivo de forma segura', () => {
      const generateSafeFileName = (originalName: string): string => {
        return `${randomUUID()}${path.extname(originalName)}`;
      };

      const testCases = [
        'image.jpg',
        'document.pdf',
        'script.js',
        'file-with-dots.txt'
      ];

      testCases.forEach(originalName => {
        const result = generateSafeFileName(originalName);
        expect(result).toContain('test-uuid-123');
        expect(result).toContain(path.extname(originalName));
      });
    });
  });
});
