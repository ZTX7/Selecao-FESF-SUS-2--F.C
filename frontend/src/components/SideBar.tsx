"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image"

// 1. Interface atualizada com a nova coluna do banco
interface UsuarioLogado {
  id: number;
  nome_completo: string;
  area_atuacao: string;
  inicio_residencia: string; // Formato esperado: "YYYY-MM-DD" ou ISO
}

// 2. Lógica de Negócio: Cálculo de R1, R2, R3
const calcularClassificacao = (dataInicioStr?: string): string => {
  if (!dataInicioStr) return ""; // Retorna vazio se a data não existir
  
  const dataInicio = new Date(dataInicioStr);
  const hoje = new Date();

  // Cálculo preciso de diferença de anos considerando mês e dia
  let anosPassados = hoje.getFullYear() - dataInicio.getFullYear();
  const diferencaMeses = hoje.getMonth() - dataInicio.getMonth();

  if (diferencaMeses < 0 || (diferencaMeses === 0 && hoje.getDate() < dataInicio.getDate())) {
    anosPassados--;
  }

  // Define a classificação (R1 = ano 0, R2 = ano 1, R3 = ano 2+)
  if (anosPassados === 0) return "R1";
  if (anosPassados === 1) return "R2";
  if (anosPassados >= 2) return "R3";
  
  return "R1"; // Fallback de segurança
};

export default function SideBar() {
  const router = useRouter();
  const pathname = usePathname(); 
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [isOpen, setIsOpen] = useState(false); 
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    
    if (!usuarioSalvo) {
      router.replace("/auth/login");
      return;
    }

    const userObj = JSON.parse(usuarioSalvo) as UsuarioLogado;
    setUsuario(userObj);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("usuarioLogado");
    router.replace("/auth/login");
  };

  const isActive = (path: string) => {
    return pathname === path 
      ? "bg-teal-800 text-white" 
      : "text-teal-100 hover:bg-teal-800/50 hover:text-white";
  };

  return (
    <>
        <button 
          className="lg:hidden p-4 text-teal-900 fixed top-0 left-0 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsOpen(false)}
          />
        )}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-teal-900 text-white flex flex-col justify-between shadow-xl h-full shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}> 
        <div onClick={() => setIsOpen(false)}> 
          {/* Logo, Identificação e Navegação... */}
          {/* Dica: Adicione onClick={() => setIsOpen(false)} nos botões da nav para fechar ao clicar */}
          
          <div className="p-6 border-b border-teal-800 flex items-center justify-center">
             <Image src="/images/resisus-bgteal.png" alt="resiSUS" width={150} height={70} priority className="mx-auto" />
          </div>

          {/* 3. Dados do Residente Logado (Identificação Atualizada) */}
          <div className="p-5 bg-teal-950/40 border-b border-teal-800/60 flex flex-col">
            <p className="text-xs text-teal-400 uppercase tracking-widest font-bold">Residente Conectado</p>
            <p className="font-semibold text-white mt-1 truncate" title={usuario?.nome_completo}>
              {usuario?.nome_completo || "Carregando..."}
            </p>
            
            <div className="flex items-center space-x-2 mt-1.5">
              {/* Tag da Área de Atuação */}
              <span className="text-xs text-teal-300 bg-teal-900/50 px-1.5 py-0.5 rounded-md truncate">
                {usuario?.area_atuacao || "..."}
              </span>
              
              {/* Nova Tag de Classificação R1/R2/R3 Dinâmica */}
              {usuario?.inicio_residencia && (
                <span className="text-[10px] font-extrabold bg-yellow-400 text-teal-950 px-1.5 py-0.5 rounded-md shadow-sm">
                  {calcularClassificacao(usuario.inicio_residencia)}
                </span>
              )}
            </div>
          </div>

          {/* Links Organizacionais de Navegação */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => router.push("/main")} 
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-left transition cursor-pointer ${isActive("/main")}`}
            >
              <span>🏠</span> <span>Início</span>
            </button>
            
            <button 
              onClick={() => router.push("/main/registry-activitie")} 
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-left transition cursor-pointer ${isActive("/main/registry-activitie")}`}
            >
              <span>📝</span> <span>Registrar Atividade</span>
            </button>

            <button 
              onClick={() => router.push("/main/activities")} 
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-left transition cursor-pointer ${isActive("/main/activities")}`}
            >
              <span>📒</span> <span>Minhas Atividades</span>
            </button>
          </nav>
        </div>

        {/* Botão de Logout de Segurança */}
        <div className="p-4 border-t border-teal-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-teal-950 hover:bg-red-700 text-teal-200 hover:text-white rounded-xl text-sm font-semibold transition shadow-inner cursor-pointer"
          >
            <span>🚪</span> <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}