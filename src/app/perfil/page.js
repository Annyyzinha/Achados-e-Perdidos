"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Perfil() {
  const { data: session, status } = useSession();
  const [meusItens, setMeusItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const emailUsuario = session?.user?.email;

  useEffect(() => {
    async function carregarMeusItens() {
      if (!emailUsuario) return;
      try {
        const res = await fetch('/api/items');
        const response = await res.json();
        if (response.success && Array.isArray(response.data)) {
          const filtrados = response.data.filter(item => item.reportedBy === emailUsuario);
          setMeusItens(filtrados);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    if (emailUsuario) {
      carregarMeusItens();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [emailUsuario, status]);

  if (status === 'loading') {
    return (
      <div className="container py-5 text-center text-muted">
        <p>Carregando perfil institucional...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: '500px' }}>
        <div className="card border-0 shadow-sm p-4">
          <h3 className="h5 fw-bold text-primary mb-2">Acesso ao Perfil</h3>
          <p className="text-muted small mb-4">
            Faça login com seu e-mail institucional para visualizar seus itens reportados.
          </p>
          <Link href="/login" className="btn btn-primary fw-bold">
            Entrar com Google
          </Link>
        </div>
      </div>
    );
  }

  const totalReportados = meusItens.length;
  const totalDevolvidos = meusItens.filter(i => i.status === 'Devolvido').length;

  // Badges estilizados com as cores exatas do PagePerfil.png
  const getBadgeStyle = (itemStatus) => {
    switch (itemStatus) {
      case 'NoDERDI':
      case 'No Audiovisual':
        return { backgroundColor: '#f59e0b', color: '#ffffff' }; // Âmbar/Laranja
      case 'Devolvido':
        return { backgroundColor: '#10b981', color: '#ffffff' }; // Verde
      case 'Pendente':
        return { backgroundColor: '#6b7280', color: '#ffffff' }; // Cinza
      case 'Reivindicado':
        return { backgroundColor: '#0284c7', color: '#ffffff' }; // Azul
      case 'Rejeitado':
        return { backgroundColor: '#ef4444', color: '#ffffff' }; // Vermelho
      default:
        return { backgroundColor: '#64748b', color: '#ffffff' };
    }
  };

  const getStatusLabel = (itemStatus) => {
    if (itemStatus === 'NoDERDI') return 'No Audiovisual';
    return itemStatus;
  };

  const getIniciais = (nome) => {
    if (!nome) return 'AV';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  return (
    <div className="container py-4" style={{ maxWidth: '560px' }}>
      {/* Cartão de Identificação (Idêntico ao PagePerfil.png) */}
      <div
        className="card border mb-4 overflow-hidden shadow-sm"
        style={{ borderRadius: '14px', borderColor: '#e2e8f0' }}
      >
        <div className="py-4 text-center" style={{ backgroundColor: '#1e3a8a' }}>
          {session?.user?.image && !imageError ? (
            <img
              src={session.user.image}
              alt={session.user.name}
              referrerPolicy="no-referrer"
              className="rounded-circle mx-auto mb-2 border border-2 border-white shadow-sm d-block"
              style={{ width: '74px', height: '74px', objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm"
              style={{ width: '74px', height: '74px' }}
            >
              <span className="fs-3 fw-bold" style={{ color: '#1e3a8a' }}>
                {getIniciais(session?.user?.name)}
              </span>
            </div>
          )}
          <h2 className="h5 text-white mb-0 fw-bold">{session?.user?.name || 'Anny Vitoria'}</h2>
          <small className="text-white-50" style={{ fontSize: '0.85rem' }}>
            {session?.user?.email}
          </small>
        </div>

        {/* Métricas do Perfil (singular "Devolvido" conforme PagePerfil.png) */}
        <div className="card-body bg-white d-flex justify-content-around text-center py-3">
          <div>
            <div className="fw-bold fs-4 mb-0 text-dark">{totalReportados}</div>
            <small className="text-muted" style={{ fontSize: '0.85rem' }}>Reportados</small>
          </div>
          <div className="vr" style={{ opacity: 0.15 }}></div>
          <div>
            <div className="fw-bold fs-4 mb-0 text-dark">{totalDevolvidos}</div>
            <small className="text-muted" style={{ fontSize: '0.85rem' }}>Devolvido</small>
          </div>
        </div>
      </div>

      {/* Relação de Itens do Usuário */}
      <h3
        className="fw-bold text-uppercase mb-3 px-1"
        style={{ fontSize: '0.82rem', color: '#475569', letterSpacing: '0.5px' }}
      >
        Meus Registros
      </h3>

      <div className="d-flex flex-column gap-3">
        {loading ? (
          <div className="text-center py-4 text-muted">Buscando seus achados...</div>
        ) : meusItens.length === 0 ? (
          <div className="card border-0 shadow-sm p-4 text-center text-muted" style={{ borderRadius: '12px' }}>
            Você ainda não reportou nenhum objeto sob este e-mail.
          </div>
        ) : (
          meusItens.map(item => (
            <div
              key={item._id}
              className="card border bg-white shadow-sm"
              style={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
            >
              <div className="card-body d-flex align-items-center justify-content-between p-3">
                <div>
                  <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '0.98rem' }}>
                    {item.title}
                  </h4>
                  <small className="text-muted d-block" style={{ fontSize: '0.82rem' }}>
                    Registrado em: {new Date(item.dateFound).toLocaleDateString('pt-BR')}
                  </small>
                </div>

                <div className="text-end">
                  <span
                    className="badge mb-1 d-inline-block px-3 py-1 fw-bold"
                    style={{ ...getBadgeStyle(item.status), borderRadius: '6px', fontSize: '0.75rem' }}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                  <div>
                    <button
                      type="button"
                      onClick={() => setItemSelecionado(item)}
                      className="btn btn-link p-0 text-decoration-none fw-bold small"
                      style={{ color: '#1e3a8a', fontSize: '0.82rem' }}
                    >
                      Ver detalhes &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão de Logout */}
      <div className="mt-5 pt-3">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn btn-outline-danger w-100 fw-bold py-2 shadow-sm"
          style={{ borderRadius: '8px' }}
        >
          Sair da Conta Institucional
        </button>
      </div>

      {/* Modal de Detalhes do Objeto e Trilha de Auditoria (LGPD) */}
      {itemSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-bold h6 mb-0">Detalhes do Objeto</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setItemSelecionado(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="text-center mb-3 bg-light rounded p-3 border">
                  <img
                    src={itemSelecionado.imageUrl || '/garrafaAzul.jpeg'}
                    alt={itemSelecionado.title}
                    style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-primary fs-5">{itemSelecionado.title}</h6>
                  <span
                    className="badge px-3 py-1 fw-bold"
                    style={{ ...getBadgeStyle(itemSelecionado.status), borderRadius: '6px' }}
                  >
                    {getStatusLabel(itemSelecionado.status)}
                  </span>
                </div>

                <ul className="list-group list-group-flush small mb-3 border-top border-bottom">
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="text-muted fw-bold">Categoria:</span>
                    <span className="text-dark fw-semibold">{itemSelecionado.category}</span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="text-muted fw-bold">Local Encontrado:</span>
                    <span>{itemSelecionado.locationFound}</span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="text-muted fw-bold">Data do Encontro:</span>
                    <span>{new Date(itemSelecionado.dateFound).toLocaleDateString('pt-BR')}</span>
                  </li>
                  <li className="list-group-item px-0">
                    <span className="text-muted fw-bold d-block mb-1">Descrição:</span>
                    <span>{itemSelecionado.description || 'Sem descrição adicional.'}</span>
                  </li>
                </ul>

                <div className="mt-3">
                  <span className="fw-bold small text-muted text-uppercase d-block mb-2">
                    Histórico de Movimentação (LGPD)
                  </span>
                  <div className="bg-light p-3 rounded border small">
                    {itemSelecionado.auditTrail && itemSelecionado.auditTrail.length > 0 ? (
                      itemSelecionado.auditTrail.map((log, idx) => (
                        <div key={idx} className="mb-2 pb-1 border-bottom last-border-none">
                          <div className="fw-bold text-dark">{log.action.replace(/_/g, ' ')}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Por: {log.performedBy} • {new Date(log.date).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted">Nenhum evento registrado.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary w-100 fw-bold py-2"
                  style={{ borderRadius: '8px' }}
                  onClick={() => setItemSelecionado(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}