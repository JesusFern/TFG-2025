import mongoose from 'mongoose';

export const PlatoSchema = new mongoose.Schema({
  orden: { type: Number, required: true },
  nombre: { type: String },
  receta: { type: mongoose.Schema.Types.ObjectId, ref: 'Receta' },
  ingredientesPersonalizados: [{
    ingrediente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingrediente',
      required: false // Permitir null para ingredientes de OpenFoodFacts
    },
    peso: { 
      type: Number, 
      required: true,
      min: 0.1,
      validate: {
        validator: function(value: number) {
          return value > 0 && value <= 10000;
        },
        message: 'El peso debe estar entre 0.1g y 10000g'
      }
    }
  }],
  
  // === CAMPOS DE SEGUIMIENTO ===
  
  // Evaluación del gusto/satisfacción (1-5)
  satisfaccion: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Cumplimiento de la pauta (1-5)
  cumplimiento: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Nota personal del usuario
  notaUsuario: {
    type: String,
    maxlength: 500,
    default: null
  }
}, {
  timestamps: true,
  collection: 'platos',
  validate: {
    validator: function(this: mongoose.Document & { receta?: mongoose.Types.ObjectId; ingredientesPersonalizados?: Array<{ ingrediente: mongoose.Types.ObjectId; peso: number }> }) {
      // Un plato debe tener o una receta o al menos un ingrediente personalizado
      return this.receta || (this.ingredientesPersonalizados && this.ingredientesPersonalizados.length > 0);
    },
    message: 'Un plato debe tener una receta asignada o al menos un ingrediente personalizado'
  }
});

// Método para calcular información nutricional del plato
PlatoSchema.methods.calcularInformacionNutricional = async function() {
  if (this.ingredientesPersonalizados.length > 0) {
    // Usar ingredientes personalizados
    await this.populate('ingredientesPersonalizados.ingrediente');
    
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalGrasas = 0;
    let totalHidratosCarbono = 0;
    let pesoTotal = 0;

    for (const item of this.ingredientesPersonalizados) {
      const ingrediente = item.ingrediente;
      const peso = item.peso;
      pesoTotal += peso;

      // Solo calcular si el ingrediente existe (ingredientes locales)
      if (ingrediente) {
        // Calcular valores nutricionales basados en el peso del ingrediente
        const factor = peso / 100; // Los valores nutricionales están por 100g
        
        totalCalorias += ingrediente.calorias * factor;
        totalProteinas += ingrediente.proteinas * factor;
        totalGrasas += ingrediente.grasas * factor;
        totalHidratosCarbono += ingrediente.hidratosCarbono * factor;
      }
      // Los ingredientes de OpenFoodFacts (ingrediente: null) no se calculan aquí
      // porque su información nutricional se maneja en el frontend
    }

    return {
      calorias: Math.round(totalCalorias * 100) / 100,
      proteinas: Math.round(totalProteinas * 100) / 100,
      grasas: Math.round(totalGrasas * 100) / 100,
      hidratosCarbono: Math.round(totalHidratosCarbono * 100) / 100,
      pesoTotal: Math.round(pesoTotal * 100) / 100
    };
  }
  
  return {
    calorias: 0,
    proteinas: 0,
    grasas: 0,
    hidratosCarbono: 0,
    pesoTotal: 0
  };
};

export default mongoose.model('Plato', PlatoSchema);