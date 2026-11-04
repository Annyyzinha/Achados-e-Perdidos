"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CadastrarItem() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    local: '',
    data: '',
    descricao: ''
  });
  const [arquivoFoto, setArquivoFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivoFoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.email) {
      alert('Você precisa estar autenticado com e-mail institucional para cadastrar.');
      return;
    }
    setCarregando(true);
    try {
      let imageUrl = '/garrafaAzul.jpeg';
      let imageHash = '';

      if (arquivoFoto) {
        const dataUpload = new FormData();
        dataUpload.append('file', arquivoFoto);
        const resUpload = await fetch('/api/upload', {
          method: 'POST',
          body: dataUpload
        });

        if (!resUpload.ok) {
          throw new Error('Falha ao enviar a fotografia.');
        }

        const dadosUpload = await resUpload.json();
        imageUrl = dadosUpload.imageUrl;
        imageHash = dadosUpload.imageHash;
      }

      const payloadItem = {
        ...formData,
        imageUrl,
        imageHash,
        reportedBy: session.user.email
      };

      const resItem = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadItem)
      });

      if (resItem.ok) {
        alert('Item cadastrado com sucesso e associado ao seu e-mail institucional!');
        window.location.href = '/';
      } else {
        const err = await resItem.json();
        alert('Erro ao cadastrar objeto: ' + err.error);
      }
    } catch (error) {
      alert(error.message || 'Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container py-5 text-center text-muted">
        <p>Verificando credenciais institucionais...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: '500px' }}>
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
          <h3 className="h5 fw-bold text-danger mb-2">Autenticação Necessária</h3>
          <p className="text-muted small mb-4">
            Em conformidade com as regras do câmpus, apenas usuários logados com e-mail institucional podem cadastrar achados.
          </p>
          <Link href="/login" className="btn btn-primary fw-bold">
            Fazer Login com Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '560px' }}>
      <div className="d-flex align-items-center mb-4">
        <Link href="/" className="btn btn-light border me-3 fw-semibold" style={{ borderRadius: '8px' }}>
          ← Voltar
        </Link>
        <div>
          <h2 className="h4 mb-0 fw-bold">Novo Achado</h2>
          <small className="text-muted">Reportando como: {session.user.email}</small>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-3 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase text-dark">O que encontrou? *</label>
          <input
            type="text"
            name="nome"
            className="form-control py-2"
            placeholder="Ex: Chaves, Calculadora, Casaco"
            required
            onChange={handleChange}
            style={{ borderRadius: '8px' }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase text-dark">Categoria *</label>
          <select name="categoria" className="form-select py-2" required onChange={handleChange} style={{ borderRadius: '8px' }}>
            <option value="">Selecione...</option>
            <option value="Eletrônicos">Eletrônicos</option>
            <option value="Documentos">Documentos</option>
            <option value="Vestuário">Vestuário</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold small text-uppercase text-dark">Onde? *</label>
            <input
              type="text"
              name="local"
              className="form-control py-2"
              placeholder="Ex: Bloco A, Cantina"
              required
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold small text-uppercase text-dark">Quando? *</label>
            <input
              type="date"
              name="data"
              className="form-control py-2"
              required
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase text-dark">Descrição detalhada</label>
          <textarea
            name="descricao"
            className="form-control"
            rows="3"
            placeholder="Cor, marca ou alguma marca específica..."
            onChange={handleChange}
            style={{ borderRadius: '8px' }}
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-uppercase text-dark">Fotografia do Objeto</label>
          <div className="border rounded-3 p-3 text-center bg-light" style={{ borderColor: '#e2e8f0' }}>
            {previewUrl && (
              <div className="mb-2">
                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  className="img-thumbnail"
                  style={{ maxHeight: '180px', objectFit: 'contain' }}
                />
              </div>
            )}
            <input
              type="file"
              className="form-control mb-2"
              accept="image/*"
              onChange={handleFotoChange}
              style={{ borderRadius: '8px' }}
            />
            <small className="text-muted d-block" style={{ fontSize: '0.82rem' }}>
              Pode tirar uma foto ou escolher da galeria.
            </small>
          </div>
        </div>

        <div
          className="p-3 mb-4 rounded-3 small"
          style={{ backgroundColor: '#e0f7fa', border: '1px solid #b2ebf2', color: '#006064' }}
        >
          Após o registro, o objeto deve ser entregue no <strong>Audiovisual</strong> conforme as normas do câmpus.
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
          disabled={carregando}
          style={{ backgroundColor: '#1e3a8a', borderColor: '#1e3a8a', borderRadius: '8px' }}
        >
          {carregando ? 'Enviando e Processando Foto...' : 'Publicar no Catálogo'}
        </button>
      </form>
    </div>
  );
}