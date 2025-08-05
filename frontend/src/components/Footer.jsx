import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="flex flex-col items-start space-y-10 text-white text-sm mb-4">
          <a href="/privacy">Privacidad</a>
          <a href="/terms">Términos</a>
          <a href="/contact">Contacto</a>
        </div>
        <div className="text-center space-y-8">
          <p className="mb-2 md:mb-0 text-center">
            © 2025 Ministerio de Producción de Corrientes
          </p>
          <div className="space-y-8">
            <p>
              Desarrollado por el Área de Sistemas:
              <span className="font-semibold"> Hernán Alegre & Ivan Nuñez</span>
            </p>
            <p>
              Jefa de Área:
              <span className="font-semibold"> Lic. Ester Kroslak</span>
            </p>
          </div>
        </div>
        <div>
          <a
            href="https://www.facebook.com/ProduccionCorrientes"
            target="_blank"
          >
            <img src="/png/fblogo.png" alt="Facebook" className="h-8 w-auto" />
          </a>
          <a href="https://www.x.com/mp_ctes" target="_blank">
            <img
              src="/png/xlogo.png"
              alt="X (Twitter)"
              className="h-8 w-auto"
            />
          </a>
          <a
            href="https://www.instagram.com/ministerio_produccion"
            target="_blank"
          >
            <img src="/png/iglogo.png" alt="Instagram" className="h-8 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
