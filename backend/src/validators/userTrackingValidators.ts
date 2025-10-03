import { Request, Response, NextFunction } from 'express';

// Validador para crear seguimiento
export const validateUserTrackingCreate = (req: Request, res: Response, next: NextFunction): void => {
  // No se requieren campos adicionales, solo autenticación
  next();
};

// Validador para actualizar seguimiento
export const validateUserTrackingUpdate = (req: Request, res: Response, next: NextFunction): void => {
  // No se requieren campos adicionales, solo autenticación
  next();
};

// Validador para verificar que al menos un campo esté presente en el seguimiento
export const validateAlMenosUnCampo = (req: Request, res: Response, next: NextFunction): void => {
  const { 
    pesoCorporal, 
    porcentajeGrasaCorporal, 
    porcentajeMasaMuscular,
    perimetroCintura, 
    perimetroCadera, 
    perimetroPecho, 
    perimetroBrazoIzquierdo, 
    perimetroBrazoDerecho, 
    perimetroMusloIzquierdo, 
    perimetroMusloDerecho 
  } = req.body;

  const tieneCampos = 
    (pesoCorporal !== undefined && pesoCorporal !== null && pesoCorporal !== '') ||
    (porcentajeGrasaCorporal !== undefined && porcentajeGrasaCorporal !== null && porcentajeGrasaCorporal !== '') ||
    (porcentajeMasaMuscular !== undefined && porcentajeMasaMuscular !== null && porcentajeMasaMuscular !== '') ||
    (perimetroCintura !== undefined && perimetroCintura !== null && perimetroCintura !== '') ||
    (perimetroCadera !== undefined && perimetroCadera !== null && perimetroCadera !== '') ||
    (perimetroPecho !== undefined && perimetroPecho !== null && perimetroPecho !== '') ||
    (perimetroBrazoIzquierdo !== undefined && perimetroBrazoIzquierdo !== null && perimetroBrazoIzquierdo !== '') ||
    (perimetroBrazoDerecho !== undefined && perimetroBrazoDerecho !== null && perimetroBrazoDerecho !== '') ||
    (perimetroMusloIzquierdo !== undefined && perimetroMusloIzquierdo !== null && perimetroMusloIzquierdo !== '') ||
    (perimetroMusloDerecho !== undefined && perimetroMusloDerecho !== null && perimetroMusloDerecho !== '');

  if (!tieneCampos) {
    res.status(400).json({
      success: false,
      message: 'Debes proporcionar al menos un campo de seguimiento'
    });
    return;
  }

  next();
};

// Validador para agregar peso
export const validateAgregarPeso = (req: Request, res: Response, next: NextFunction): void => {
  const { valor, fecha } = req.body;

  if (!valor) {
    res.status(400).json({
      success: false,
      message: 'El valor del peso es obligatorio'
    });
    return;
  }

  if (typeof valor !== 'number' || valor <= 0) {
    res.status(400).json({
      success: false,
      message: 'El valor del peso debe ser un número positivo'
    });
    return;
  }

  if (valor > 1000) {
    res.status(400).json({
      success: false,
      message: 'El valor del peso no puede ser mayor a 1000 kg'
    });
    return;
  }

  if (fecha && isNaN(Date.parse(fecha))) {
    res.status(400).json({
      success: false,
      message: 'La fecha debe ser válida'
    });
    return;
  }

  next();
};

// Validador para agregar grasa corporal
export const validateAgregarGrasaCorporal = (req: Request, res: Response, next: NextFunction): void => {
  const { valor, fecha } = req.body;

  if (!valor) {
    res.status(400).json({
      success: false,
      message: 'El valor del porcentaje de grasa corporal es obligatorio'
    });
    return;
  }

  if (typeof valor !== 'number' || valor < 0 || valor > 100) {
    res.status(400).json({
      success: false,
      message: 'El porcentaje de grasa corporal debe ser un número entre 0 y 100'
    });
    return;
  }

  if (fecha && isNaN(Date.parse(fecha))) {
    res.status(400).json({
      success: false,
      message: 'La fecha debe ser válida'
    });
    return;
  }

  next();
};

// Validador para agregar perímetro
export const validateAgregarPerimetro = (req: Request, res: Response, next: NextFunction): void => {
  const { tipo, valor, fecha } = req.body;

  if (!tipo) {
    res.status(400).json({
      success: false,
      message: 'El tipo de perímetro es obligatorio'
    });
    return;
  }

  if (!['cintura', 'cadera', 'pecho'].includes(tipo)) {
    res.status(400).json({
      success: false,
      message: 'El tipo de perímetro debe ser: cintura, cadera o pecho'
    });
    return;
  }

  if (!valor) {
    res.status(400).json({
      success: false,
      message: 'El valor del perímetro es obligatorio'
    });
    return;
  }

  if (typeof valor !== 'number' || valor <= 0) {
    res.status(400).json({
      success: false,
      message: 'El valor del perímetro debe ser un número positivo'
    });
    return;
  }

  if (valor > 200) {
    res.status(400).json({
      success: false,
      message: 'El valor del perímetro no puede ser mayor a 200 cm'
    });
    return;
  }

  if (fecha && isNaN(Date.parse(fecha))) {
    res.status(400).json({
      success: false,
      message: 'La fecha debe ser válida'
    });
    return;
  }

  next();
};

// Validador para agregar perímetro bilateral
export const validateAgregarPerimetroBilateral = (req: Request, res: Response, next: NextFunction): void => {
  const { tipo, izquierdo, derecho, fecha } = req.body;

  if (!tipo) {
    res.status(400).json({
      success: false,
      message: 'El tipo de perímetro bilateral es obligatorio'
    });
    return;
  }

  if (!['brazos', 'muslos'].includes(tipo)) {
    res.status(400).json({
      success: false,
      message: 'El tipo de perímetro bilateral debe ser: brazos o muslos'
    });
    return;
  }

  if (!izquierdo && !derecho) {
    res.status(400).json({
      success: false,
      message: 'Debe proporcionar al menos un valor (izquierdo o derecho)'
    });
    return;
  }

  if (izquierdo && (typeof izquierdo !== 'number' || izquierdo <= 0)) {
    res.status(400).json({
      success: false,
      message: 'El valor izquierdo debe ser un número positivo'
    });
    return;
  }

  if (derecho && (typeof derecho !== 'number' || derecho <= 0)) {
    res.status(400).json({
      success: false,
      message: 'El valor derecho debe ser un número positivo'
    });
    return;
  }

  if (izquierdo && izquierdo > 200) {
    res.status(400).json({
      success: false,
      message: 'El valor izquierdo no puede ser mayor a 200 cm'
    });
    return;
  }

  if (derecho && derecho > 200) {
    res.status(400).json({
      success: false,
      message: 'El valor derecho no puede ser mayor a 200 cm'
    });
    return;
  }

  if (fecha && isNaN(Date.parse(fecha))) {
    res.status(400).json({
      success: false,
      message: 'La fecha debe ser válida'
    });
    return;
  }

  next();
};

