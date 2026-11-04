"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PainelAdmin() {
  const { data: session } = useSession();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarItens = async () => {
    try {
      const res = await fetch('/api/items');
      const response = await res.json();
      if (response.success && Array.isArray(response.data)) {
        setItens(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  const handleStatusChange = async (id, novoStatus) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: novoStatus,
          moderatorEmail: session?.user?.email || 'derdi-cp@utfpr.edu.br'
        })
      });

      if (res.ok) {
        carregarItens();
      } else {
        alert('Erro ao atualizar status do item.');
      }
    } catch (error) {
      alert('Erro na comunicação com a API.');
    }
  };

  // RF13: Exportação oficial do Relatório Gerencial Formatado para o DERDI
  const exportarRelatorio = () => {
    if (itens.length === 0) {
      alert('Não há itens no acervo para exportar.');
      return;
    }

    const total = itens.length;
    const pendentes = itens.filter(i => i.status === 'Pendente').length;
    const noSetor = itens.filter(i => i.status === 'NoDERDI').length;
    const reivindicados = itens.filter(i => i.status === 'Reivindicado').length;
    const devolvidos = itens.filter(i => i.status === 'Devolvido').length;
    const expirados = itens.filter(i => i.status === 'Expirado').length;
    const rejeitados = itens.filter(i => i.status === 'Rejeitado').length;
    const taxa = total > 0 ? ((devolvidos / total) * 100).toFixed(1) + '%' : '0.0%';

    const agora = new Date();
    const dataEmissao = agora.toLocaleDateString('pt-BR');
    const horaEmissao = agora.toLocaleTimeString('pt-BR');
    const operador = session?.user?.name
      ? `${session.user.name} (${session.user.email})`
      : 'derdi-cp@utfpr.edu.br';

    const getBadgeStyle = (status) => {
      switch (status) {
        case 'Pendente': return 'background-color: #fef3c7; color: #92400e; font-weight: bold; border: 1px solid #f59e0b;';
        case 'NoDERDI': return 'background-color: #dbeafe; color: #1e3a8a; font-weight: bold; border: 1px solid #3b82f6;';
        case 'Reivindicado': return 'background-color: #e0f2fe; color: #0369a1; font-weight: bold; border: 1px solid #0284c7;';
        case 'Devolvido': return 'background-color: #dcfce7; color: #166534; font-weight: bold; border: 1px solid #22c55e;';
        case 'Expirado': return 'background-color: #f1f5f9; color: #475569; font-weight: bold; border: 1px solid #94a3b8;';
        case 'Rejeitado': return 'background-color: #fee2e2; color: #991b1b; font-weight: bold; border: 1px solid #ef4444;';
        default: return 'background-color: #f3f4f6; color: #374151;';
      }
    };

    const linhasTabela = itens.map((item, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const dataFmt = item.dateFound ? new Date(item.dateFound).toLocaleDateString('pt-BR') : 'N/D';
      return `
        <tr style="background-color: ${bg}; height: 26px;">
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 500;">${item.title || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">${item.category || 'Outros'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${item.locationFound || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">${dataFmt}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">
            <span style="${getBadgeStyle(item.status)} padding: 3px 8px; border-radius: 4px; font-size: 9pt;">
              ${item.status}
            </span>
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 9pt; color: #334155;">${item.reportedBy || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 9pt; color: #334155;">${item.validatedBy || 'Aguardando Operador'}</td>
        </tr>
      `;
    }).join('');

    const templateHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #0f172a; }
          .title-main { background-color: #1e3a8a; color: #ffffff; font-size: 13pt; font-weight: bold; text-align: center; height: 32px; vertical-align: middle; }
          .title-sub { background-color: #1e3a8a; color: #e2e8f0; font-size: 9.5pt; text-align: center; height: 22px; vertical-align: middle; }
          .section-bar { background-color: #0f172a; color: #ffffff; font-size: 10.5pt; font-weight: bold; padding: 6px 10px; height: 28px; vertical-align: middle; }
          .kpi-header { background-color: #f1f5f9; color: #1e293b; font-weight: bold; font-size: 9pt; text-align: center; border: 1px solid #cbd5e1; padding: 6px; }
          .kpi-value { font-size: 12pt; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 8px; }
          .th-col { background-color: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 9.5pt; text-align: center; border: 1px solid #1e3a8a; padding: 8px 10px; height: 28px; }
        </style>
      </head>
      <body>
        <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%;">
          <tr><td colspan="7" class="title-main">SISTEMA WEB DE ACHADOS E PERDIDOS — UTFPR-CP</td></tr>
          <tr><td colspan="7" class="title-sub">DEPARTAMENTO DE RECURSOS DIDÁTICOS E DISCENTES (DERDI) / AUDIOVISUAL</td></tr>
          <tr><td colspan="7" class="title-sub" style="font-style: italic;">Relatório Gerencial de Acervo e Auditoria LGPD • Emitido em: ${dataEmissao} às ${horaEmissao}</td></tr>
          <tr><td colspan="7" style="height: 14px; background-color: #ffffff;"></td></tr>

          <tr><td colspan="7" class="section-bar">PAINEL DE INDICADORES CONSOLIDADOS</td></tr>
          <tr>
            <td class="kpi-header" style="width: 14%;">Total Geral</td>
            <td class="kpi-header" style="width: 14%;">Pendentes</td>
            <td class="kpi-header" style="width: 14%;">No Setor</td>
            <td class="kpi-header" style="width: 14%;">Reivindicados</td>
            <td class="kpi-header" style="width: 14%;">Devolvidos</td>
            <td class="kpi-header" style="width: 15%;">Expirados / Rejeitados</td>
            <td class="kpi-header" style="width: 15%;">Taxa de Resolução</td>
          </tr>
          <tr>
            <td class="kpi-value" style="background-color: #f8fafc; color: #0f172a;">${total}</td>
            <td class="kpi-value" style="background-color: #fef3c7; color: #92400e;">${pendentes}</td>
            <td class="kpi-value" style="background-color: #dbeafe; color: #1e3a8a;">${noSetor}</td>
            <td class="kpi-value" style="background-color: #e0f2fe; color: #0369a1;">${reivindicados}</td>
            <td class="kpi-value" style="background-color: #dcfce7; color: #166534;">${devolvidos}</td>
            <td class="kpi-value" style="background-color: #f1f5f9; color: #475569;">${expirados} / ${rejeitados}</td>
            <td class="kpi-value" style="background-color: #dcfce7; color: #15803d;">${taxa}</td>
          </tr>
          <tr><td colspan="7" style="height: 18px; background-color: #ffffff;"></td></tr>

          <tr><td colspan="7" class="section-bar">RELAÇÃO NOMINAL DETALHADA DOS OBJETOS EM AUDITORIA</td></tr>
          <tr>
            <td class="th-col" style="text-align: left; width: 22%;">Item / Objeto</td>
            <td class="th-col" style="width: 12%;">Categoria</td>
            <td class="th-col" style="text-align: left; width: 16%;">Local do Encontro</td>
            <td class="th-col" style="width: 11%;">Data Registro</td>
            <td class="th-col" style="width: 13%;">Situação Atual</td>
            <td class="th-col" style="text-align: left; width: 13%;">Reportado Por</td>
            <td class="th-col" style="text-align: left; width: 13%;">Validado / Moderado</td>
          </tr>
          ${linhasTabela}
          <tr><td colspan="7" style="height: 14px;"></td></tr>
          <tr>
            <td colspan="4" style="font-size: 8pt; color: #64748b; font-style: italic;">
              Extraído automaticamente por: ${operador}
            </td>
            <td colspan="3" style="font-size: 8pt; color: #64748b; text-align: right; font-style: italic;">
              Rastreabilidade do ciclo de custódia em conformidade com a LGPD
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + templateHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_gerencial_derdi_${agora.toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    window.print();
  };

  const pendentes = itens.filter(i => i.status === 'Pendente');
  const noSetor = itens.filter(i => i.status === 'NoDERDI');
  const reivindicados = itens.filter(i => i.status === 'Reivindicado');
  const devolvidos = itens.filter(i => i.status === 'Devolvido');

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Pendente': return 'bg-warning text-dark';
      case 'NoDERDI': return 'bg-primary';
      case 'Reivindicado': return 'bg-info text-dark';
      case 'Devolvido': return 'bg-success';
      case 'Expirado': return 'bg-secondary';
      default: return 'bg-dark';
    }
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1000px' }}>
      {/* Cabeçalho com ações de Relatório */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-0" style={{ color: '#1e3a8a' }}>Gestão Audiovisual</h2>
          <span className="text-muted small">Controle de Achados e Perdidos (DERDI)</span>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {/* Botão Único de Exportação com formatação institucional */}
          <button onClick={exportarRelatorio} className="btn btn-success btn-sm fw-bold shadow-sm">
            Exportar Relatório
          </button>
          <button onClick={exportarPDF} className="btn btn-outline-danger btn-sm fw-bold">
            Imprimir / PDF
          </button>
          <Link href="/" className="btn btn-outline-secondary btn-sm">
            Catálogo
          </Link>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="row mb-4">
        <div className="col-3">
          <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
            <div className="card-body text-center p-3">
              <h5 className="fw-bold text-warning mb-0">{pendentes.length}</h5>
              <small className="text-muted fw-bold">Pendentes</small>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
            <div className="card-body text-center p-3">
              <h5 className="fw-bold text-primary mb-0">{noSetor.length}</h5>
              <small className="text-muted fw-bold">No Setor</small>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card border-0 shadow-sm bg-info bg-opacity-10">
            <div className="card-body text-center p-3">
              <h5 className="fw-bold text-info mb-0">{reivindicados.length}</h5>
              <small className="text-muted fw-bold">Reivindicados</small>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10">
            <div className="card-body text-center p-3">
              <h5 className="fw-bold text-success mb-0">{devolvidos.length}</h5>
              <small className="text-muted fw-bold">Devolvidos</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Administrativa */}
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
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">Carregando itens...</td>
                </tr>
              ) : itens.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">Nenhum item registrado.</td>
                </tr>
              ) : (
                itens.map(item => (
                  <tr key={item._id}>
                    <td className="fw-bold">{item.title}</td>
                    <td>
                      <small className="d-block text-muted">Local: {item.locationFound}</small>
                      <small className="d-block text-muted">
                        {item.reportedBy} — {new Date(item.dateFound).toLocaleDateString('pt-BR')}
                      </small>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {item.status === 'Pendente' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item._id, 'NoDERDI')}
                            className="btn btn-sm btn-primary fw-bold me-1"
                          >
                            Receber Item
                          </button>
                          <button
                            onClick={() => handleStatusChange(item._id, 'Rejeitado')}
                            className="btn btn-sm btn-outline-danger fw-bold"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      {item.status === 'NoDERDI' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item._id, 'Devolvido')}
                            className="btn btn-sm btn-success fw-bold me-1"
                          >
                            Marcar Devolvido
                          </button>
                          <button
                            onClick={() => handleStatusChange(item._id, 'Expirado')}
                            className="btn btn-sm btn-outline-secondary fw-bold"
                            title="RF14: Mover item antigo para doação/descarte"
                          >
                            Expirar
                          </button>
                        </>
                      )}
                      {item.status === 'Reivindicado' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item._id, 'Devolvido')}
                            className="btn btn-sm btn-success fw-bold me-1"
                          >
                            Aprovar Entrega
                          </button>
                          <button
                            onClick={() => handleStatusChange(item._id, 'NoDERDI')}
                            className="btn btn-sm btn-outline-danger fw-bold me-1"
                          >
                            Recusar
                          </button>
                        </>
                      )}
                      {item.status === 'Devolvido' && (
                        <span className="text-muted small">Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}