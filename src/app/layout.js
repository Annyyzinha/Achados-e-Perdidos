import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Script from 'next/script';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Audiovisual | Achados e Perdidos',
  description: 'Sistema Web de Achados e Perdidos da UTFPR-CP',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="bg-light">
        <Providers>
          <Navbar />
          {children}
        </Providers>

        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}