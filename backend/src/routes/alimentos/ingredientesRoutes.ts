import { Router } from 'express';
import { guardarIngredienteOpenFoodFacts, obtenerIngredientePorId, obtenerTodosLosIngredientes, buscarIngredientes, obtenerIngredientesPorIds } from '../../controllers/alimentos/ingredientesController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * @route GET /api/ingredientes
 * @desc Obtiene todos los ingredientes
 * @access Private
 */
router.get(
  '/',
  authenticateToken,
  obtenerTodosLosIngredientes
);

/**
 * @route GET /api/ingredientes/buscar
 * @desc Busca ingredientes por término
 * @access Private
 * @query {string} q - Término de búsqueda
 */
router.get(
  '/buscar',
  authenticateToken,
  [
    query('q')
      .notEmpty()
      .withMessage('El término de búsqueda es requerido')
      .isString()
      .withMessage('El término de búsqueda debe ser una cadena de texto')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
  ],
  validateRequest,
  buscarIngredientes
);

/**
 * @route POST /api/ingredientes/por-ids
 * @desc Obtiene ingredientes por sus IDs
 * @access Private
 * @body {string[]} ids - Array de IDs de ingredientes
 */
router.post(
  '/por-ids',
  authenticateToken,
  [
    body('ids')
      .isArray()
      .withMessage('Los IDs deben ser un array')
      .notEmpty()
      .withMessage('Se requiere al menos un ID')
      .custom((ids) => {
        if (!Array.isArray(ids)) return false;
        return ids.every(id => typeof id === 'string' && id.trim().length > 0);
      })
      .withMessage('Todos los IDs deben ser strings válidos')
  ],
  validateRequest,
  obtenerIngredientesPorIds
);

// Validaciones para guardar ingrediente de OpenFoodFacts
const validarGuardarIngrediente = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isString()
    .withMessage('El nombre debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('calorias')
    .isNumeric()
    .withMessage('Las calorías deben ser un número')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Las calorías deben estar entre 0 y 10000'),
  
  body('proteinas')
    .isNumeric()
    .withMessage('Las proteínas deben ser un número')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Las proteínas deben estar entre 0 y 100'),
  
  body('grasas')
    .isNumeric()
    .withMessage('Las grasas deben ser un número')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Las grasas deben estar entre 0 y 100'),
  
  body('hidratosCarbono')
    .isNumeric()
    .withMessage('Los hidratos de carbono deben ser un número')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Los hidratos de carbono deben estar entre 0 y 100'),
  
  body('marca')
    .optional()
    .isString()
    .withMessage('La marca debe ser una cadena de texto')
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca no puede exceder 100 caracteres'),
  
  body('imagen')
    .optional()
    .isURL()
    .withMessage('La imagen debe ser una URL válida'),
  
  body('codigoBarras')
    .optional()
    .isString()
    .withMessage('El código de barras debe ser una cadena de texto')
    .trim()
    .isLength({ max: 50 })
    .withMessage('El código de barras no puede exceder 50 caracteres')
];

/**
 * @route GET /api/ingredientes/:id
 * @desc Obtiene un ingrediente por su ID
 * @access Private
 * @param {string} id - ID del ingrediente
 */
router.get(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isMongoId()
      .withMessage('El ID del ingrediente debe ser válido')
  ],
  validateRequest,
  obtenerIngredientePorId
);

/**
 * @route POST /api/alimentos/ingredientes/guardar-openfoodfacts
 * @desc Guarda un ingrediente de OpenFoodFacts en la base de datos local
 * @access Private
 * @body {string} nombre - Nombre del ingrediente
 * @body {number} calorias - Calorías por 100g
 * @body {number} proteinas - Proteínas por 100g
 * @body {number} grasas - Grasas por 100g
 * @body {number} hidratosCarbono - Hidratos de carbono por 100g
 * @body {string} [marca] - Marca del producto (opcional)
 * @body {string} [imagen] - URL de la imagen (opcional)
 * @body {string} [codigoBarras] - Código de barras (opcional)
 */
router.post(
  '/guardar-openfoodfacts',
  authenticateToken,
  validarGuardarIngrediente,
  validateRequest,
  guardarIngredienteOpenFoodFacts
);

export default router;
