"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="card shadow-lg border-0 p-4 p-md-5 text-center" style={{ maxWidth: '420px', width: '90%', borderRadius: '1rem' }}>
      <div className="mb-4">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
          style={{ width: '80px', height: '80px', backgroundColor: '#1e3a8a' }}
        >
          <span className="text-white fs-1 fw-bold">A</span>
        </div>
        <h1 className="h3 fw-bold mb-0" style={{ color: '#1e3a8a' }}>Audiovisual</h1>
        <p className="text-muted small">Achados e Perdidos — UTFPR-CP</p>
      </div>

      {error === 'AccessDenied' && (
        <div className="alert alert-danger text-start mb-3 small" role="alert">
          <strong>Acesso Negado:</strong> É obrigatório utilizar uma conta institucional com domínio <strong>@alunos.utfpr.edu.br</strong> ou <strong>@utfpr.edu.br</strong>.
        </div>
      )}

      <div className="alert alert-warning text-start mb-4" style={{ fontSize: '0.85rem' }}>
        <strong>Acesso Restrito:</strong> É obrigatório o uso do e-mail institucional da universidade para reportar ou reivindicar itens.
      </div>

      <button 
        onClick={handleGoogleLogin}
        className="btn btn-outline-dark w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 mb-4"
        style={{ borderRadius: '0.6rem', transition: 'all 0.2s' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
        </svg>
        Entrar com Google
      </button>

      <Link href="/" className="text-decoration-none fw-bold" style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>
        ← Voltar para o catálogo
      </Link>
    </div>
  );
}

export default function Login() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light" style={{ marginTop: '-76px' }}>
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}