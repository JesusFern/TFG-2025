import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaDesdeExistente, CrearDietaDesdeExistenteDTO } from '../../service/diets/dietCopyService';
import {
  validateAuthentication,
  validateCommonDietFields,
  validateOriginDietId,
  createCommonDietDTO,
  handleDietCreationSuccess,
  handleError
} from '../../helpers/dietValidationHelper';
import mongoose from 'mongoose';

// Crear dieta desde una dieta existente
export const crearDietaDesdeExistenteController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dietaOrigenId } = req.body;
    const creador = req.user?.id;

    // Validar autenticación
    if (!validateAuthentication(creador, res)) return;

    // Validar campos comunes
    if (!validateCommonDietFields({ ...req.body, dietaOrigenId }, res, true)) return;

    // Validar ObjectId de dieta origen
    if (!validateOriginDietId(dietaOrigenId, res)) return;

    // Crear DTO común
    const commonDTO = createCommonDietDTO(req.body, creador!, new Date(req.body.fechaInicio));
    
    // Crear DTO específico para copia
    const dto: CrearDietaDesdeExistenteDTO = {
      ...commonDTO,
      dietaOrigenId: new mongoose.Types.ObjectId(dietaOrigenId)
    };

    // Crear la dieta
    const dieta = await crearDietaDesdeExistente(dto);

    // Manejar éxito
    await handleDietCreationSuccess(dieta, creador!, res, 'Dieta creada exitosamente desde dieta existente');

  } catch (error) {
    handleError(error, res, 'crear dieta desde existente');
  }
};
