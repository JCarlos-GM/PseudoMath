export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-800 animate-fade-in">
      <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        Laboratorio de Simulación
      </h2>
      <p className="text-lg text-slate-600 max-w-2xl text-center">
        Una herramienta interactiva y didáctica para comprender, generar y validar números pseudoaleatorios.
      </p>
    </div>
  );
}