"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const categorias = ['Todos', 'Eletrônicos', 'Documentos', 'Vestuário', 'Outros'];

export default function FeedHome() {
  const { data: session } = useSession();
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [abaAtiva, setAbaAtiva] = useState('Recente');
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros de busca (RF05)
  const [busca, setBusca] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);

  // Estado do modal de reivindicação (RF06)
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function fetchItems() {
    try {
      const res = await fetch('/api/items');
      const response = await res.json();
      if (response.success && Array.isArray(response.data)) {
        setItens(response.data);
      }
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const handleReivindicar = async () => {
    if (!itemSelecionado) return;
    if (!session?.user?.email) {
      alert('Você precisa estar autenticado com seu e-mail institucional para reivindicar um item.');
      window.location.href = '/login';
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/items/${itemSelecionado._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Reivindicado',
          moderatorEmail: session.user.email
        })
      });

      if (res.ok) {
        alert('Solicitação enviada ao DERDI! Compareça ao setor para comprovar a posse.');
        setItemSelecionado(null);
        fetchItems();
      } else {
        alert('Erro ao enviar solicitação.');
      }
    } catch (error) {
      alert('Erro na comunicação com o servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroLocal('');
    setDataInicio('');
    setDataFim('');
    setCategoriaAtiva('Todos');
  };

  const filtrosAtivos = busca || filtroLocal || dataInicio || dataFim || categoriaAtiva !== 'Todos';

  // Lógica multicritério de filtragem (RF05)
  const itensFiltrados = itens.filter(item => {
    const matchCategoria = categoriaAtiva === 'Todos' || item.category === categoriaAtiva;
    const matchStatus =
      abaAtiva === 'Recente'
        ? (item.status === 'NoDERDI' || item.status === 'Reivindicado')
        : item.status === 'Devolvido';

    const termoBusca = busca.trim().toLowerCase();
    const matchBusca =
      !termoBusca ||
      (item.title && item.title.toLowerCase().includes(termoBusca)) ||
      (item.description && item.description.toLowerCase().includes(termoBusca)) ||
      (item.locationFound && item.locationFound.toLowerCase().includes(termoBusca));

    const termoLocal = filtroLocal.trim().toLowerCase();
    const matchLocal =
      !termoLocal ||
      (item.locationFound && item.locationFound.toLowerCase().includes(termoLocal));

    let matchData = true;
    if (item.dateFound) {
      const dataItem = new Date(item.dateFound);
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        if (dataItem < inicio) matchData = false;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        if (dataItem > fim) matchData = false;
      }
    }

    return matchCategoria && matchStatus && matchBusca && matchLocal && matchData;
  });

  return (
    <div className="container py-4" style={{ maxWidth: '580px' }}>
      {/* Barra de Pesquisa e Filtros (RF05) */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-0 text-muted ps-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </span>
            <input
              type="text"
              className="form-control border-0 ps-2"
              placeholder="Buscar por título, descrição ou local..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ boxShadow: 'none', fontSize: '0.92rem' }}
            />
            <button
              className={`btn btn-sm ${mostrarFiltrosAvancados ? 'btn-primary' : 'btn-outline-secondary'} border-0 px-3 fw-semibold`}
              type="button"
              onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
              style={{ fontSize: '0.85rem' }}
            >
              Filtros
            </button>
          </div>

          {mostrarFiltrosAvancados && (
            <div className="border-top pt-3 mt-2 px-2">
              <div className="mb-2">
                <label className="form-label small fw-bold text-muted text-uppercase mb-1">Filtrar por Local</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: Bloco A, Biblioteca..."
                  value={filtroLocal}
                  onChange={(e) => setFiltroLocal(e.target.value)}
                />
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-1">Data Inicial</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-1">Data Final</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>
              {filtrosAtivos && (
                <button
                  onClick={limparFiltros}
                  className="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-bold"
                  style={{ fontSize: '0.8rem' }}
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Círculos de Categorias (Idêntico ao PageMenu.png) */}
      <div className="d-flex justify-content-center mb-4 pb-2" style={{ gap: '18px' }}>
        {categorias.map(cat => (
          <div
            key={cat}
            className="text-center"
            style={{ cursor: 'pointer', minWidth: '64px' }}
            onClick={() => setCategoriaAtiva(cat)}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 shadow-sm"
              style={{
                width: '62px',
                height: '62px',
                backgroundColor: categoriaAtiva === cat ? '#1e3a8a' : '#ffffff',
                border: categoriaAtiva === cat ? 'none' : '1px solid #cbd5e1',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <span
                className={`fs-5 ${categoriaAtiva === cat ? 'text-white fw-bold' : 'text-secondary'}`}
              >
                {cat.charAt(0)}
              </span>
            </div>
            <small
              className="d-block text-center"
              style={{
                fontSize: '0.75rem',
                fontWeight: categoriaAtiva === cat ? '700' : '500',
                color: categoriaAtiva === cat ? '#1e3a8a' : '#64748b'
              }}
            >
              {cat}
            </small>
          </div>
        ))}
      </div>

      {/* Caixa de Abas Segmentada (Idêntico ao PageMenu.png) */}
      <div className="d-flex justify-content-center mb-4">
        <div
          className="bg-white border d-flex p-1 shadow-sm w-100"
          style={{ borderRadius: '8px', maxWidth: '580px' }}
        >
          <button
            type="button"
            className={`btn flex-fill py-2 fw-bold text-center border-0 ${
              abaAtiva === 'Recente' ? 'text-dark' : 'text-muted'
            }`}
            style={{
              borderBottom: abaAtiva === 'Recente' ? '3px solid #1e3a8a' : '3px solid transparent',
              borderRadius: '0',
              backgroundColor: 'transparent',
              fontSize: '0.92rem'
            }}
            onClick={() => setAbaAtiva('Recente')}
          >
            Achados Recentes
          </button>
          <button
            type="button"
            className={`btn flex-fill py-2 fw-bold text-center border-0 ${
              abaAtiva === 'Devolvido' ? 'text-dark' : 'text-muted'
            }`}
            style={{
              borderBottom: abaAtiva === 'Devolvido' ? '3px solid #1e3a8a' : '3px solid transparent',
              borderRadius: '0',
              backgroundColor: 'transparent',
              fontSize: '0.92rem'
            }}
            onClick={() => setAbaAtiva('Devolvido')}
          >
            Já Devolvidos
          </button>
        </div>
      </div>

      {/* Feed de Itens (Cards Estilizados conforme PageMenu.png) */}
      <div>
        {loading ? (
          <div className="text-center text-muted py-5">
            <p>Carregando catálogo...</p>
          </div>
        ) : itensFiltrados.length > 0 ? (
          itensFiltrados.map(item => (
            <div
              key={item._id}
              className="card mb-4 border bg-white shadow-sm"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <div
                className="text-center bg-white p-3 d-flex align-items-center justify-content-center"
                style={{ height: '210px' }}
              >
                <img
                  src={item.imageUrl || '/garrafaAzul.jpeg'}
                  className="img-fluid"
                  alt={item.title}
                  style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <div className="card-body p-4 pt-1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    className="badge bg-light text-dark border px-3 py-1 fw-bold"
                    style={{ borderRadius: '20px', fontSize: '0.75rem' }}
                  >
                    {item.category}
                  </span>
                  <small className="text-muted" style={{ fontSize: '0.82rem' }}>
                    {new Date(item.dateFound).toLocaleDateString('pt-BR')}
                  </small>
                </div>

                <h5 className="card-title fw-bold text-dark mb-1" style={{ fontSize: '1.2rem' }}>
                  {item.title}
                </h5>
                <p className="card-text text-muted small mb-3">
                  Encontrado em: {item.locationFound}
                </p>

                {abaAtiva === 'Recente' ? (
                  item.status === 'Reivindicado' ? (
                    <button
                      className="btn btn-secondary w-100 fw-bold py-2"
                      disabled
                      style={{ borderRadius: '8px' }}
                    >
                      Reivindicação em Análise pelo DERDI
                    </button>
                  ) : (
                    <button
                      onClick={() => setItemSelecionado(item)}
                      className="btn btn-outline-primary w-100 fw-bold py-2"
                      style={{
                        borderColor: '#1e3a8a',
                        color: '#1e3a8a',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}
                    >
                      Reivindicar Objeto
                    </button>
                  )
                ) : (
                  <button
                    className="btn btn-outline-secondary w-100 fw-bold py-2"
                    disabled
                    style={{ borderRadius: '8px' }}
                  >
                    Item já Devolvido ao Dono
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-5">
            <p>Nenhum item encontrado para os filtros selecionados.</p>
            {filtrosAtivos && (
              <button onClick={limparFiltros} className="btn btn-sm btn-outline-primary mt-2">
                Limpar Filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Reivindicação (RF06) */}
      {itemSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-bold h6 mb-0">Reivindicar Objeto</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setItemSelecionado(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-1 text-muted small">Você está reivindicando a posse do item:</p>
                <h6 className="fw-bold text-primary fs-5 mb-1">{itemSelecionado.title}</h6>
                <small className="text-muted d-block mb-3">Local de encontro: {itemSelecionado.locationFound}</small>
                <div className="alert alert-warning small mb-0">
                  <strong>Instruções:</strong> Para evitar fraudes, dirija-se ao <strong>Audiovisual (DERDI)</strong> portando documento de identificação com foto e forneça características específicas do objeto para comprovar a posse.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light border px-4"
                  onClick={() => setItemSelecionado(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-bold px-4"
                  onClick={handleReivindicar}
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : 'Confirmar Solicitação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}