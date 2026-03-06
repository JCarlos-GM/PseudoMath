import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Dna, CheckSquare, BookOpen, Sparkles } from 'lucide-react';

export default function MainLayout() {
  const navItems = [
    { path: '/', name: 'Inicio', icon: LayoutDashboard },
    { path: '/generadores', name: 'Laboratorio', icon: Dna },
    { path: '/validadores', name: 'Validación', icon: CheckSquare },
    { path: '/teoria', name: 'Teoría', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen relative font-sans selection:bg-indigo-500/30">
      {/* --- FONDOS AMBIENTALES (BLOBS) --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
        <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-cyan-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* --- NAVEGACIÓN FLOTANTE (DOCK) --- */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <nav className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-500/10 rounded-full px-4 py-3 flex items-center justify-between transition-all duration-300">
          
          {/* Logo */}
          <div className="flex items-center gap-2 pl-2">
            <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-1.5 rounded-full text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 hidden sm:block">
              Simul<span className="text-indigo-600">Tool</span>
            </span>
          </div>

          {/* Links Centrales */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-105'
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" />
                <span className="hidden md:block">{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Switch Didáctico */}
          <div className="pr-2 hidden lg:flex">
            <div className="group flex items-center gap-3 bg-white/50 py-1.5 px-4 rounded-full border border-slate-200/50 hover:bg-white/80 transition-colors cursor-pointer shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                Modo Didáctico
              </span>
              <div className="w-10 h-5 bg-slate-300 rounded-full flex items-center px-1 transition-colors group-hover:bg-indigo-500 relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform group-hover:translate-x-4"></div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="relative z-10 pt-32 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto">
          {/* El Outlet renderiza la página actual con un efecto sutil de entrada */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}