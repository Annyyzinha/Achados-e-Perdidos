import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'Audiovisual | Achados e Perdidos',
  description: 'Sistema Web de Achados e Perdidos da UTFPR-CP',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="bg-light">
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
              <ul className="navbar-nav ms-auto">
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
                <li className="nav-item">
                  <Link href="/perfil" className="nav-link">
                    Meu Perfil
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {children}

        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}