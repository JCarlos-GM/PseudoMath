import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Dna, CheckSquare, BookOpen, Sigma } from 'lucide-react';
import Footer from './Footer';

export default function MainLayout() {
  const navItems = [
    { path: '/', name: 'Inicio', icon: LayoutDashboard },
    { path: '/generadores', name: 'Laboratorio', icon: Dna },
    { path: '/validadores', name: 'Validación', icon: CheckSquare },
    { path: '/teoria', name: 'Teoría', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen relative font-sans selection:bg-indigo-500/30 bg-slate-50">

      {/* --- FONDO X10: Cuadrícula matemática y luces --- */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center">
        {/* Cuadrícula estilo papel milimétrico */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Gradiente radial para iluminar el centro y oscurecer bordes */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#e0e7ff33,transparent)]"></div>
        {/* Orbes de luz */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000" />
      </div>

      {/* --- NAVEGACIÓN FLOTANTE (DOCK) --- */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <nav className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-4 py-3 flex items-center justify-between transition-all duration-300">

          {/* Logo PseudoMath */}
          <div className="flex items-center gap-2 pl-3">
            <div className="bg-slate-900 p-1.5 rounded-xl text-white shadow-md shadow-slate-900/20 transform -rotate-6">
              <Sigma size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800 hidden sm:block">
              Pseudo<span className="text-indigo-600">Math</span>
            </span>
          </div>

          {/* Links Centrales */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:scale-105'
                  }`
                }
              >
                <item.icon size={16} className="shrink-0" />
                <span className="hidden md:block">{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Switch Didáctico */}
          <div className="pr-2 hidden lg:flex">
            <div className="group flex items-center gap-3 bg-white/50 py-1.5 px-4 rounded-full border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                Modo Didáctico
              </span>
              <div className="w-10 h-5 bg-slate-200 rounded-full flex items-center px-1 transition-colors group-hover:bg-indigo-500 relative shadow-inner">
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform group-hover:translate-x-4"></div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="relative z-10 pt-36 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto">
          <div className="animate-in fade-in zoom-in-95 duration-700 ease-out h-full">
            <Outlet />
          </div>
        </div>

        <Footer />
      </main>
    </div>

  );
}