import React from 'react';
import Hero from '../components/Hero.jsx';
import IntroCard from '../components/IntroCard.jsx';

export default function Inicio() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      <section className="py-12 px-6 text-center bg-gradient-to-b text-white"
        style={{backgroundImage: "linear-gradient(to bottom, #00902f, #62ab44)"}}>
        <h1 className="text-4xl font-bold mb-4">SIFADECO</h1>
        <p className="text-lg max-w-xl mx-auto">
          Sistema de Gestión de Faena & Decomisos.
          <br /></p><br />
          <p className="text-lg max-w-3xl mx-auto">
          Desarrollado por el Área de Sistemas del Ministerio de Producción de Corrientes.
        </p>
      </section>

      <IntroCard />


      <section className="py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-gray-200 p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="font-semibold text-lg mb-2">Faena</h2>
          <p>Registrá las faenas y frigoríficos activos.</p>
        </div>
        <div className="bg-gray-200 p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="font-semibold text-lg mb-2">Decomisos</h2>
          <p>Controlá decomisos realizados con trazabilidad.</p>
        </div>
        <div className="bg-gray-200 p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="font-semibold text-lg mb-2">Remanentes</h2>
          <p>Visualizá los remanentes de cada jornada.</p>
        </div>
      </section>
    </div>
  );
}

