import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['ALUNO', 'DERDI'], default: 'ALUNO' },
    consentDate: { type: Date, default: Date.now },
    auditLog: [
      {
        action: { type: String, required: true },
        date: { type: Date, default: Date.now },
        ip: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);