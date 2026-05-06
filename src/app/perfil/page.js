"use client";
import React from 'react';
import Link from 'next/link';

const myItems = [
  { id: 1, titulo: 'Chave de Carro', data: '10/04/2026', status: 'No Audiovisual', corStatus: 'warning' },
  { id: 2, titulo: 'Cartão de Estudante', data: '12/04/2026', status: 'Devolvido', corStatus: 'success' },
  { id: 3, titulo: 'Estojo Preto', data: '14/04/2026', status: 'Pendente', corStatus: 'secondary' },
];

export default function Perfil() {
  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      
      <div className="card border-0 shadow-sm mb-4 overflow-hidden">
        <div className="py-4 text-center" style={{ backgroundColor: '#1e3a8a' }}>
          <div 
            className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm"
            style={{ width: '80px', height: '80px' }}
          >
            <span className="fs-2 fw-bold" style={{ color: '#1e3a8a' }}>AV</span>
          </div>
          <h2 className="h5 text-white mb-0 fw-bold">Anny Vitoria</h2>
          <small className="text-white-50">anny.costa@alunos.utfpr.edu.br</small>
        </div>
        <div className="card-body d-flex justify-content-around text-center py-3">
          <div>
            <div className="fw-bold h5 mb-0">3</div>
            <small className="text-muted">Reportados</small>
          </div>
          <div className="vr"></div>
          <div>
            <div className="fw-bold h5 mb-0">1</div>
            <small className="text-muted">Devolvido</small>
          </div>
        </div>
      </div>

      <h3 className="h6 fw-bold text-uppercase text-muted mb-3 px-1">Meus Registos</h3>
      
      <div className="d-flex flex-column gap-3">
        {myItems.map(item => (
          <div key={item.id} className="card border-0 shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <h4 className="h6 fw-bold mb-1">{item.titulo}</h4>
                <small className="text-muted d-block">Registado em: {item.data}</small>
              </div>
              <div className="text-end">
                <span className={`badge bg-${item.corStatus} mb-2 d-block`}>
                  {item.status}
                </span>
                <button className="btn btn-sm text-primary p-0 fw-bold" style={{ fontSize: '0.75rem' }}>
                  Ver detalhes ›
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-3">
        <button className="btn btn-outline-danger w-100 fw-bold py-2 shadow-sm" style={{ borderRadius: '0.6rem' }}>
          Sair da Conta
        </button>
      </div>

    </div>
  );
}