import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Dna, CheckSquare, BookOpen, Sigma, AppWindow } from 'lucide-react';
import Footer from './Footer';

export default function MainLayout() {
  // Enlaces de navegacion principal
  const navItems = [
    { path: '/', name: 'Inicio', icon: LayoutDashboard },
    { path: '/generadores', name: 'Laboratorio', icon: Dna },
    { path: '/validadores', name: 'Validación', icon: CheckSquare },
    { path: '/teoria', name: 'Teoría', icon: BookOpen },
    { path: '/herramientas', name: 'Ecosistema', icon: AppWindow },
  ];

  return (
    <div className="min-h-screen relative font-sans flex flex-col bg-slate-50">
      
      {/* Fondo estatico con patron de cuadricula */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-50"></div>

      {/* Barra de Navegacion Superior (Flat y Solida) */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Branding del software */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-1.5 text-white">
                <Sigma size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                Pseudo<span className="text-accent">Math</span>
              </span>
            </div>

            {/* Navegacion Central */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                      isActive
                        ? 'border-accent text-accent bg-accent-muted'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <item.icon size={16} strokeWidth={2} />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Selector de Modo */}
            <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Modo Estricto
              </span>
              <div className="w-10 h-5 bg-slate-200 flex items-center p-1 cursor-not-allowed">
                <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Contenedor del Area de Trabajo (Main) */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Pie de pagina global */}
      <Footer />
    </div>
  );
}