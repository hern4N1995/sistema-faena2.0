import React, { useEffect, useRef } from 'react';

/**
 * ModalAccessible.jsx
 * Modal reutilizable accesible con overlay, z-index alto y bloqueo del fondo
 */
export default function ModalAccessible({ children, onClose }) {
  const modalRef = useRef(null);

  // Bloquear scroll del fondo mientras el modal esté abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>

      {/* Contenido */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 p-6 focus:outline-none"
      >
        {children}
      </div>
    </div>
  );
}
