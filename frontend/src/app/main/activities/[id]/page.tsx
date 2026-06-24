"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";
import { apiFetch } from "@/services/apiClient";

// 📐 Interface Alinhada ao Contrato do Banco de Dados
interface Activity {
  id: number;
  usf: string;
  responsavel_acompanhamento: string;
  detalhes_atividade: string;
  inicio_atividade?: string;
  tipo_atividade?: string;
  carga_horaria: number;
  url_relatorio?: string;
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
  data_criacao: string;
}



export default function ActivityDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (activityId: number) => {
      try {
        setIsDownloading(true);
        const response = await apiFetch(`/api/v1/activities/download/${activityId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          if(response.status === 404){
            alert("Ficheiro não encontrado para esta atividade.");
          } else {
            throw new Error("Erro ao baixar o arquivo");
          }
          return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_atividade_${activityId}.pdf`; 
        document.body.appendChild(a);
        a.click();
        
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert("Não foi possível baixar o relatório. Tente novamente.");
        console.error(err);
      } finally {
        setIsDownloading(false);
      }
    };

    
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
  
    const fetchActivityDetails = async () => {
      try {
        setIsLoading(true);
        // 📞 Consome a rota GET por ID no seu Backend FastAPI
        const response = await apiFetch(`/api/v1/activities/${id}`, {
          method: "GET",
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Atividade não encontrada no servidor.");
          throw new Error("Falha ao carregar detalhes da atividade.");
        }

        const data = (await response.json()) as Activity;
        setActivity(data);
      } catch (err: any) {
        setErrorMessage(err.message || "Erro de conexão.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchActivityDetails();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-teal-800 font-semibold animate-pulse">
        Carregando dados estruturados da atividade...
      </div>
    );
  }

  if (errorMessage || !activity) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SideBar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center max-w-md shadow-sm">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold mt-2">Ocorreu um problema</h3>
            <p className="text-sm mt-1 text-red-600">{errorMessage || "Registro não localizado."}</p>
            <button
              onClick={() => router.push("/main/activities")}
              className="mt-4 bg-red-700 hover:bg-red-800 text-white text-xs px-4 py-2 rounded-xl transition font-medium"
            >
              Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normalização de nomenclatura de campos para evitar quebras visuais
  const nomeUSF = activity.usf || "Não informada";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Menu Lateral Unificado */}
      <SideBar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Customizado com o Monitor de Sessão JWT Ativo */}
        <Header 
          title="Auditoria Interna de Registro" 
          subtitle={`Atividade ID: #${activity.id} • Controle de Frequência`} 
        />

        {/* Área de Conteúdo com Scroll */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Botão de Retorno Rápido */}
          <button
            onClick={() => router.push("/main/activities")}
            className="flex items-center space-x-2 text-sm text-teal-800 hover:text-teal-900 font-semibold transition group bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm cursor-pointer"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Voltar para Minhas Atividades</span>
          </button>

          {/* Card Principal de Informações */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Topo do Card com Status Dinâmico */}
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50/50 gap-4">
              <div>
                <span className="text-xs text-gray-400 font-mono">Unidade de Atuação</span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">📍 {nomeUSF}</h2>
              </div>
              <div>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm ${
                    activity.status === "APROVADO"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : activity.status === "REJEITADO"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {activity.status === "PENDENTE" ? "⏳ EM ANÁLISE" : `● ${activity.status}`}
                </span>
              </div>
            </div>

            {/* Metadados Básicos em Grade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 border-b border-gray-100 bg-white">
              
              <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">⏱️ Carga Horária Declarada</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{activity.carga_horaria} horas</p>
              </div>

              <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">👤 Responsável Acompanhamento</p>
                <p className="text-base font-bold text-gray-800 mt-2 truncate" title={activity.responsavel_acompanhamento}>
                  {activity.responsavel_acompanhamento}
                </p>
              </div>

              <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">📅 Data de Submissão</p>
                <p className="text-base font-bold text-gray-800 mt-2">
                  {new Date(activity.data_criacao).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>

            </div>

            {/* Grande Descritivo da Atividade Realizada */}
            <div className="p-8 space-y-3 bg-white">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">📝 Relato Detalhado das Atividades</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono min-h-37.5">
                {activity.detalhes_atividade}
              </div>
            </div>

            {/* Rodapé do Card com Anexo PDF / Relatório (Requisito Avançado API) */}
            {activity.url_relatorio && (
              <div className="px-8 py-5 bg-teal-950 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-bold">Documentação Comprobatória Anexada</p>
                    <p className="text-xs text-teal-300">Evidência binária protegida recuperada via API.</p>
                  </div>
                </div>
                
                {/* Botão de Download Atualizado */}
                <button
                  onClick={() => handleDownload(activity.id)}
                  disabled={isDownloading}
                  className={`bg-white text-teal-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition text-center cursor-pointer ${
                    isDownloading ? "opacity-70 cursor-wait" : "hover:bg-teal-50"
                  }`}
                >
                  {isDownloading ? "⏳ Processando Download..." : "📥 Baixar Relatório Técnico"}
                </button>
                
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}