"use client";

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  // Verifica se o usuário logado pertence ao DERDI
  const isDerdi =
    session?.user?.role === 'DERDI' ||
    session?.user?.email?.endsWith('@utfpr.edu.br');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold">
          Audiovisual | Achados
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link href="/" className="nav-link">
                Catálogo
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/cadastrar" className="nav-link text-warning fw-bold">
                + Cadastrar Item
              </Link>
            </li>

            {/* Atalho visível EXCLUSIVAMENTE para servidores do DERDI */}
            {isDerdi && (
              <li className="nav-item">
                <Link
                  href="/admin"
                  className="nav-link badge bg-light text-primary px-3 py-2 text-decoration-none fw-bold"
                  style={{ fontSize: '0.85rem' }}
                >
                  Painel DERDI
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link href="/perfil" className="nav-link">
                Meu Perfil
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}