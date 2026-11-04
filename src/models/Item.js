import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['Eletrônicos', 'Documentos', 'Vestuário', 'Outros']
    },
    locationFound: { type: String, required: true },
    dateFound: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pendente', 'NoDERDI', 'Reivindicado', 'Devolvido', 'Expirado', 'Rejeitado'],
      default: 'Pendente'
    },
    imageUrl: { type: String, default: '/garrafaAzul.jpeg' },
    imageHash: { type: String },
    reportedBy: { type: String, default: 'aluno.teste@alunos.utfpr.edu.br' },
    validatedBy: { type: String },
    auditTrail: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);