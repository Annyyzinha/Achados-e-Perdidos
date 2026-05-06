"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const initialItems = [
  { id: 1, titulo: 'Calculadora Científica', local: 'Bloco A', data: '18/04/2026', reportadoPor: 'João P.', status: 'Pendente' },
  { id: 2, titulo: 'Garrafa Azul', local: 'Biblioteca', data: '17/04/2026', reportadoPor: 'Maria S.', status: 'Em Custódia' },
  { id: 3, titulo: 'Caderno Universitário', local: 'Cantina', data: '15/04/2026', reportadoPor: 'Lucas T.', status: 'Devolvido' },
];

export default function PainelAdmin() {
  const [itens, setItens] = useState(initialItems);

  const handleStatusChange = (id, novoStatus) => {
    setItens(itens.map(item => 
      item.id === id ? { ...item, status: novoStatus } : item
    ));
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1000px' }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold mb-0" style={{ color: '#1e3a8a' }}>Gestão Audiovisual</h2>
          <span className="text-muted small">Controlo de Achados e Perdidos</span>
        </div>
        <Link href="/" className="btn btn-outline-secondary btn-sm">
          Sair do Painel
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-4">
          <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
            <div className="card-body text-center">
              <h5 className="fw-bold text-warning mb-0">{itens.filter(i => i.status === 'Pendente').length}</h5>
              <small className="text-muted fw-bold">Pendentes</small>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <h5 className="fw-bold text-primary mb-0">{itens.filter(i => i.status === 'Em Custódia').length}</h5>
              <small className="text-muted fw-bold">No Setor</small>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10">
            <div className="card-body text-center">
              <h5 className="fw-bold text-success mb-0">{itens.filter(i => i.status === 'Devolvido').length}</h5>
              <small className="text-muted fw-bold">Devolvidos</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-uppercase text-muted">Item</th>
                <th className="small text-uppercase text-muted">Detalhes</th>
                <th className="small text-uppercase text-muted">Estado</th>
                <th className="small text-uppercase text-muted text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id}>
                  <td className="fw-bold">{item.titulo}</td>
                  <td>
                    <small className="d-block text-muted">{item.local}</small>
                    <small className="d-block text-muted">{item.reportadoPor} - {item.data}</small>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Pendente' ? 'bg-warning text-dark' : 
                      item.status === 'Em Custódia' ? 'bg-primary' : 'bg-success'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-end">
                    {item.status === 'Pendente' && (
                      <button onClick={() => handleStatusChange(item.id, 'Em Custódia')} className="btn btn-sm btn-primary fw-bold me-1">
                        Receber Item
                      </button>
                    )}
                    {item.status === 'Em Custódia' && (
                      <button onClick={() => handleStatusChange(item.id, 'Devolvido')} className="btn btn-sm btn-success fw-bold me-1">
                        Marcar Devolvido
                      </button>
                    )}
                    <button className="btn btn-sm btn-light border">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}