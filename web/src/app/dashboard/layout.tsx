"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home, CalendarDays, Monitor, MapPin,
  GraduationCap, BookOpen, Menu, User, LogOut,
  Sun, Moon, Users, CalendarRange, School
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menus = [
    { nome: "Home", href: "/dashboard", icone: Home },
    { nome: "Res. Equipamentos", href: "/dashboard/reservas-equipamentos", icone: CalendarDays },
    { nome: "Res. Locais", href: "/dashboard/reservas-locais", icone: CalendarRange },
    { nome: "Equipamentos", href: "/dashboard/equipamentos", icone: Monitor },
    { nome: "Locais", href: "/dashboard/locais", icone: MapPin },
    { nome: "Aulas", href: "/dashboard/aulas", icone: GraduationCap },
    { nome: "Cursos", href: "/dashboard/cursos", icone: BookOpen },
    { nome: "Usuários", href: "/dashboard/usuarios", icone: Users },
    { nome: "Disciplinas", href: "/dashboard/disciplinas", icone: School },
  ];

  const handleLogout = () => {
    localStorage.removeItem("labcontrol_token");
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <aside className={`bg-[#0f172a] text-slate-300 w-64 flex-shrink-0 flex flex-col transition-transform absolute inset-y-0 left-0 md:relative md:translate-x-0 z-50 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 bg-[#0b1120] font-bold text-xl text-white tracking-wider border-b border-slate-800 flex-shrink-0">
          <span className="text-blue-500 mr-2">UTF</span>PR
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menus.map((menu) => {
            const ativo = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
            const Icone = menu.icone;
            return (
              <Link key={menu.nome} href={menu.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${ativo ? "bg-blue-600 text-white font-medium shadow-sm" : "hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icone className="w-5 h-5 mr-3" />
                {menu.nome}
              </Link>
            );
          })}
        </nav>

        {mounted && (
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? (
                <><Sun className="w-5 h-5 mr-3 text-amber-400" />Modo Claro</>
              ) : (
                <><Moon className="w-5 h-5 mr-3 text-blue-400" />Modo Escuro</>
              )}
            </button>
          </div>
        )}
      </aside>

      {menuAberto && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMenuAberto(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 flex items-center justify-between px-4 sm:px-6 z-10">
          <button onClick={() => setMenuAberto(!menuAberto)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <User className="w-5 h-5" />
              <span className="hidden sm:block">Meu Perfil</span>
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}