import {
  Github, Mail, Sigma, DollarSign,
  ChevronRight, ExternalLink, Code2, BookOpen, Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { siOnlyfans, siPaypal } from "simple-icons";

export default function Footer() {
  return (
    <footer className="w-full relative z-10 border-t border-slate-200/60 bg-white/60 backdrop-blur-2xl mt-auto overflow-hidden">
      {/* Efecto de luz de fondo sutil en el footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-400/10 blur-[100px] rounded-t-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Columna 1: Branding y Créditos */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-slate-900 p-1.5 rounded-xl text-white shadow-md transform -rotate-6">
                <Sigma size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-800">
                Pseudo<span className="text-indigo-600">Math</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Plataforma interactiva de grado profesional para la generación y validación estadística de números pseudoaleatorios.
            </p>
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Desarrollado por</p>
              <p className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                Ing. Juan Carlos Govea Magaña
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Ing. en Sistemas Computacionales • TecNM
              </p>
            </div>
          </div>

          {/* Columna 2: Herramientas (Enlaces Internos) */}
          <div>
            <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-indigo-500" />
              Herramientas
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Generadores Congruenciales', path: '/generadores' },
                { name: 'Pruebas de Uniformidad', path: '/validadores' },
                { name: 'Pruebas de Independencia', path: '/validadores' },
                { name: 'Monte-Carlo', path: '/generadores' },
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.path} 
                    className="group flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mr-1" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Recursos */}
          <div>
            <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-cyan-500" />
              Recursos
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Apuntes de Teoría', path: '/teoria' },
                { name: 'Fórmulas y Teoremas', path: '/teoria' },
                { name: 'Condiciones de Hull-Dobell', path: '/teoria' },
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.path} 
                    className="group flex items-center text-sm text-slate-500 hover:text-cyan-600 transition-colors"
                  >
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mr-1" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto y Social */}
          <div>
            <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Code2 size={18} className="text-slate-700" />
              Contacta conmigo
            </h4>
            <p className="text-sm text-slate-500 mb-4">
              ¿Tienes sugerencias o encontraste un bug? No lo voy a arreglar pero igual me gustaría saberlo. 
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a 
                href="https://github.com/JCarlos-GM" 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-300"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href="mailto:jgoveamagana@gmail.com" 
                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-[#00aff0] hover:text-white hover:border-[#00aff0] hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300"
                aria-label="OnlyFans"
                title="OnlyFans"
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  dangerouslySetInnerHTML={{ __html: siOnlyfans.svg }}
                />
              </a>
              
              
              {/* Broma: Ouija */}
              <a
                href="#"
                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-[#1a0a2e] hover:text-purple-300 hover:border-[#1a0a2e] hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/40 transition-all duration-300"
                aria-label="Ouija"
                title="Ouija"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* tablero */}
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  {/* sol y luna */}
                  <circle cx="5.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M17 6 Q19 7.5 17 9" strokeWidth="1.2" fill="none" />
                  {/* letras decorativas */}
                  <text x="12" y="13" textAnchor="middle" fontSize="5" fontFamily="serif" fill="currentColor" stroke="none">YES NO</text>
                  {/* planchette */}
                  <ellipse cx="12" cy="17" rx="3" ry="1.5" />
                  <line x1="12" y1="15.5" x2="12" y2="13.5" />
                </svg>
              </a>

              {/* Señales de Humo */}
              <a
                href="#"
                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-[#7c5c3a] hover:text-amber-100 hover:border-[#7c5c3a] hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/30 transition-all duration-300"
                aria-label="Señales de humo"
                title="Señales de humo"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  {/* fogata */}
                  <path d="M8 20 Q10 17 9 14 Q11 16 12 13 Q13 16 15 14 Q14 17 16 20Z" fill="currentColor" stroke="none" opacity="0.5"/>
                  <line x1="6" y1="20" x2="18" y2="20" />
                  {/* columnas de humo */}
                  <path d="M9 13 Q7 10 9 7 Q7 4 9 2" fill="none" />
                  <path d="M12 13 Q14 9 12 6 Q14 3 12 1" fill="none" />
                  <path d="M15 13 Q17 10 15 7 Q17 4 15 2" fill="none" />
                </svg>
              </a>

            </div>
            
            <a 
              href="https://github.com/JCarlos-GM" 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors border border-slate-200"
            >
              Ver código fuente <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
            Proyecto academico con TypeScript y React para la clase de Simulación.
          </p>
          <div className="text-slate-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} PseudoMath. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}