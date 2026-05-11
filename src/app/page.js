"use client";
import React, { useState } from 'react';

const mockItems = [
  { id: 1, titulo: 'Garrafa de Água Azul', local: 'Biblioteca', data: '16/04/2026', categoria: 'Outros', status: 'Recente', img: '/garrafaAzul.jpeg' },
  { id: 2, titulo: 'Calculadora Científica', local: 'Bloco A', data: '15/04/2026', categoria: 'Eletrônicos', status: 'Recente', img: '/calcCient.jpeg' },
  { id: 3, titulo: 'Caderno de Anotações', local: 'Cantina', data: '14/04/2026', categoria: 'Documentos', status: 'Devolvido', img: '/caderno.jpeg' },
  { id: 4, titulo: 'Casaco Preto', local: 'Laboratório 3', data: '10/04/2026', categoria: 'Vestuário', status: 'Devolvido', img: '/casaco.jpeg' },
];

const categorias = ['Todos', 'Eletrônicos', 'Documentos', 'Vestuário', 'Outros'];

export default function FeedHome() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [abaAtiva, setAbaAtiva] = useState('Recente');

  const itensFiltrados = mockItems.filter(item => {
    const matchCategoria = categoriaAtiva === 'Todos' || item.categoria === categoriaAtiva;
    const matchStatus = item.status === abaAtiva;
    return matchCategoria && matchStatus;
  });

  return (
    <div className="container py-3" style={{ maxWidth: '600px' }}>
      
      <div className="d-flex overflow-auto mb-4 pb-2" style={{ whiteSpace: 'nowrap', gap: '15px' }}>
        {categorias.map(cat => (
          <div 
            key={cat} 
            className="text-center" 
            style={{ cursor: 'pointer', minWidth: '70px' }}
            onClick={() => setCategoriaAtiva(cat)}
          >
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 shadow-sm`}
              style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: categoriaAtiva === cat ? '#1e3a8a' : '#ffffff',
                border: categoriaAtiva === cat ? 'none' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <span className={categoriaAtiva === cat ? 'text-white fw-bold' : 'text-secondary'}>
                {cat.charAt(0)}
              </span>
            </div>
            <small className={`d-block ${categoriaAtiva === cat ? 'fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem', color: categoriaAtiva === cat ? '#1e3a8a' : 'inherit' }}>
              {cat}
            </small>
          </div>
        ))}
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item flex-fill text-center">
          <button 
            className={`nav-link w-100 ${abaAtiva === 'Recente' ? 'active fw-bold text-dark' : 'text-muted'}`}
            onClick={() => setAbaAtiva('Recente')}
            style={{ borderBottom: abaAtiva === 'Recente' ? '3px solid #1e3a8a' : 'none' }}
          >
            Achados Recentes
          </button>
        </li>
        <li className="nav-item flex-fill text-center">
          <button 
            className={`nav-link w-100 ${abaAtiva === 'Devolvido' ? 'active fw-bold text-dark' : 'text-muted'}`}
            onClick={() => setAbaAtiva('Devolvido')}
            style={{ borderBottom: abaAtiva === 'Devolvido' ? '3px solid #1e3a8a' : 'none' }}
          >
            Já Devolvidos
          </button>
        </li>
      </ul>

      <div>
        {itensFiltrados.length > 0 ? (
          itensFiltrados.map(item => (
            <div key={item.id} className="card mb-4 shadow-sm border-0">
              <img 
                src={item.img} 
                className="card-img-top bg-light p-3" 
                alt={item.titulo} 
                style={{ height: '200px', objectFit: 'contain' }} 
              />
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-light text-dark border">{item.categoria}</span>
                  <small className="text-muted">{item.data}</small>
                </div>
                <h5 className="card-title fw-bold mb-1">{item.titulo}</h5>
                <p className="card-text text-muted small mb-3">
                   Encontrado em: {item.local}
                </p>
                <button className="btn btn-outline-primary w-100 fw-bold" style={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}>
                  {abaAtiva === 'Recente' ? 'Reivindicar Objeto' : 'Ver Detalhes'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-5">
            <p>Nenhum item encontrado nesta categoria.</p>
          </div>
        )}
      </div>

    </div>
  );
}