"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function CadastrarItem() {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    local: '',
    data: '',
    descricao: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payload:", formData);
    alert("Simulação: Item registado com sucesso!");
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <div className="d-flex align-items-center mb-4">
        <Link href="/" className="btn btn-light border me-3">
          ←
        </Link>
        <h2 className="h4 mb-0 fw-bold">Novo Achado</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm border">
        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase">O que encontrou? *</label>
          <input 
            type="text" 
            name="nome"
            className="form-control" 
            placeholder="Ex: Chaves, Garrafa, Casaco" 
            required 
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase">Categoria *</label>
          <select name="categoria" className="form-select" required onChange={handleChange}>
            <option value="">Selecione...</option>
            <option value="Eletrónicos">Eletrónicos</option>
            <option value="Documentos">Documentos</option>
            <option value="Vestuário">Vestuário</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold small text-uppercase">Onde? *</label>
            <input 
              type="text" 
              name="local"
              className="form-control" 
              placeholder="Ex: Bloco A, Cantina" 
              required 
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold small text-uppercase">Quando? *</label>
            <input 
              type="date" 
              name="data"
              className="form-control" 
              required 
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase">Descrição detalhada</label>
          <textarea 
            name="descricao"
            className="form-control" 
            rows="3" 
            placeholder="Cor, marca ou alguma característica específica..."
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-uppercase">Fotografia do Objeto</label>
          <div className="border border-dashed rounded p-4 text-center bg-light">
            <input type="file" className="form-control mb-2" accept="image/*" />
            <small className="text-muted d-block">Pode tirar uma foto ou escolher da galeria.</small>
          </div>
        </div>

        <div className="alert alert-info small mb-4">
           Após o registo, o objeto deve ser entregue no <strong>Audiovisual</strong> conforme as normas do campus.
        </div>

        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold">
          Publicar no Catálogo
        </button>
      </form>
    </div>
  );
}