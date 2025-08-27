import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-sm">
          {/* Enlaces centrados horizontalmente en móvil */}
          <div className="flex justify-center md:justify-start items-center gap-6 flex-wrap">
            <a href="/privacy" className="hover:text-white transition">
              Privacidad
            </a>
            <a href="/terms" className="hover:text-white transition">
              Términos
            </a>
            <a href="/contact" className="hover:text-white transition">
              Contacto
            </a>
          </div>

          {/* Centro de texto */}
          <div className="text-center">
            <p className="mb-1">
              © 2025 Ministerio de Producción de Corrientes
            </p>
            <p className="mb-1">
              Desarrollado por el Área de Sistemas:{' '}
              <span className="font-semibold text-white">
                Hernán Alegre & Iván Nuñez
              </span>
            </p>
            <p>
              Jefa de Área:{' '}
              <span className="font-semibold text-white">
                Lic. Ester Kroslak
              </span>
            </p>
          </div>

          {/* Redes sociales */}
          <div className="flex justify-center md:justify-end space-x-6">
            <a
              href="https://www.facebook.com/ProduccionCorrientes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition"
            >
              <FaFacebookF size={24} />
            </a>
            <a
              href="https://www.x.com/mp_ctes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-white transition"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://www.instagram.com/ministerio_produccion"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
