/**
 * Utilidades para construir pipelines de MongoDB reutilizables
 */
export const createGratuitoPlanPipeline = (planTypeStr?: string) => [
  { $match: { suscripcion: { $exists: true } } },
  {
    $lookup: {
      from: 'usersuscriptions',
      localField: 'suscripcion',
      foreignField: '_id',
      as: 'userSuscription'
    }
  },
  {
    $unwind: {
      path: '$userSuscription',
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $lookup: {
      from: 'suscriptionplans',
      localField: 'userSuscription.planId',
      foreignField: '_id',
      as: 'planInfo'
    }
  },
  {
    $unwind: {
      path: '$planInfo',
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $match: { 
      'planInfo.tipoPrecio': 'Gratuito',
      ...(planTypeStr ? { 'planInfo.tipoPlan': planTypeStr } : {})
    }
  }
];

/**
 * Pipeline base para usuarios sin suscripción
 */
export const createNoSubscriptionPipeline = () => [
  { $match: { suscripcion: { $exists: false } } }
];

/**
 * Pipeline base para lookup de suscripciones
 */
export const createSubscriptionLookupPipeline = () => [
  {
    $lookup: {
      from: 'usersuscriptions',
      localField: 'suscripcion',
      foreignField: '_id',
      as: 'userSuscription'
    }
  },
  {
    $unwind: {
      path: '$userSuscription',
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $lookup: {
      from: 'suscriptionplans',
      localField: 'userSuscription.planId',
      foreignField: '_id',
      as: 'planInfo'
    }
  },
  {
    $unwind: {
      path: '$planInfo',
      preserveNullAndEmptyArrays: false
    }
  }
];
