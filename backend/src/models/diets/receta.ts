import mongoose from 'mongoose';

const RecetaSchema = new mongoose.Schema({
  nombreReceta: { type: String, required: true },
  ingredientes: { 
    type: [{
      ingrediente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingrediente',
        required: true
      },
      peso: { 
        type: Number, 
        required: true,
        min: 0.1, // Mínimo 0.1 gramos
        validate: {
          validator: function(value: number) {
            return value > 0 && value <= 10000; // Máximo 10kg por ingrediente
          },
          message: 'El peso debe estar entre 0.1g y 10000g'
        }
      }
    }],
    required: true,
    validate: {
      validator: function(array: Array<{ ingrediente: mongoose.Types.ObjectId; peso: number }>) {
        return array.length > 0;
      },
      message: 'La receta debe tener al menos un ingrediente'
    }
  },
  pasosPreparacion: [{ type: String }],
  tiempoPreparacion: { type: String },
  imagenes: [{ 
    type: String,
    default: ''
  }],
  creador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  },
  publica: { type: Boolean, required: true }
}, {
  timestamps: true,
  collection: 'recetas'
});

// Método para calcular información nutricional total de la receta
RecetaSchema.methods.calcularInformacionNutricional = async function() {
  await this.populate('ingredientes.ingrediente');
  
  let totalCalorias = 0;
  let totalProteinas = 0;
  let totalGrasas = 0;
  let totalHidratosCarbono = 0;
  let pesoTotal = 0;

  for (const item of this.ingredientes) {
    const ingrediente = item.ingrediente;
    const peso = item.peso;
    pesoTotal += peso;

    // Calcular valores nutricionales basados en el peso del ingrediente
    const factor = peso / 100; // Los valores nutricionales están por 100g
    
    totalCalorias += ingrediente.calorias * factor;
    totalProteinas += ingrediente.proteinas * factor;
    totalGrasas += ingrediente.grasas * factor;
    totalHidratosCarbono += ingrediente.hidratosCarbono * factor;
  }

  return {
    calorias: Math.round(totalCalorias * 100) / 100,
    proteinas: Math.round(totalProteinas * 100) / 100,
    grasas: Math.round(totalGrasas * 100) / 100,
    hidratosCarbono: Math.round(totalHidratosCarbono * 100) / 100,
    pesoTotal: Math.round(pesoTotal * 100) / 100
  };
};

// Método para calcular información nutricional por porción
RecetaSchema.methods.calcularPorPorcion = async function(numeroPorciones: number = 1) {
  const infoTotal = await this.calcularInformacionNutricional();
  
  return {
    calorias: Math.round((infoTotal.calorias / numeroPorciones) * 100) / 100,
    proteinas: Math.round((infoTotal.proteinas / numeroPorciones) * 100) / 100,
    grasas: Math.round((infoTotal.grasas / numeroPorciones) * 100) / 100,
    hidratosCarbono: Math.round((infoTotal.hidratosCarbono / numeroPorciones) * 100) / 100,
    pesoPorPorcion: Math.round((infoTotal.pesoTotal / numeroPorciones) * 100) / 100
  };
};

export default mongoose.model('Receta', RecetaSchema);