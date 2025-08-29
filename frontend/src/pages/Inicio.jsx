import React from 'react';
import IntroCard from '../components/IntroCard';

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/png/portada.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>

        {/* Capa de gradiente encima de la imagen */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-80 z-10"></div>

        {/* Contenido */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 py-20 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            SIFADECO
          </h1>
          <p className="mt-4 text-xl md:text-2xl max-w-2xl mx-auto">
            Sistema Integral de Gestión de Faena & Decomisos
          </p>
          <p className="mt-2 text-base md:text-lg opacity-90">
            Desarrollado por el Área de Sistemas del Ministerio de Producción de
            Corrientes
          </p>
        </div>
      </section>

      <IntroCard />

      {/* Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Faena',
              text: 'Registrá las faenas y frigoríficos activos.',
              icon: '🥩',
            },
            {
              title: 'Decomisos',
              text: 'Controlá decomisos realizados con trazabilidad.',
              icon: '📦',
            },
            {
              title: 'Remanentes',
              text: 'Visualizá los remanentes de cada jornada.',
              icon: '📊',
            },
          ].map(({ title, text, icon }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-3">{icon}</div>
              <h2 className="text-2xl font-semibold text-primary mb-2">
                {title}
              </h2>
              <p className="text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
