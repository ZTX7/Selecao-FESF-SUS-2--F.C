"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/apiClient";

import SideBar from "@/components/SideBar";
import Header from "@/components/Header";


interface Activity {
  id: number;
  usf: string;
  responsavel_acompanhamento: string;
  detalhes_atividade: string;
  inicio_atividade: string;
  tipo_atividade: string;
  carga_horaria: number;
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
  data_criacao: string;
}

export default function ActivitiesList() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔍 Nomenclatura em Inglês para os Filtros
  const [filterUsf, setFilterUsf] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const savedUser = localStorage.getItem("usuarioLogado");

    if (!token || !savedUser) {
      router.replace("/auth/login");
      return;
    }

    const fetchActivitiesFromServer = async () => {
      
      try {

        const response = await apiFetch("/api/v1/activities/get-activities", {
          method: 'GET',
        });

        if (!response.ok) throw new Error();
        
        const data = await response.json() as Activity[];
        console.log("Dados recebidos da API:", data);
        setActivities(data);

      } catch (err) {
        console.log(`Erro ao listar atividades: ${err}`)

      } finally {
        setIsLoading(false);
      }
    };

    fetchActivitiesFromServer();
  }, [router]);

  const handleDownload = async (activityId: number) => {
    try {

      const response = await apiFetch(`/api/v1/activities/download/${activityId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if(response.status === 404){
          alert("Ficheiro não encontrato para esta atividade.");
        } else {
          throw new Error("Erro ao baixar o arquivo");
        }
        return
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_atividade_${activityId}.pdf`; // Nome padrão do arquivo
      document.body.appendChild(a);
      a.click();
      

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {

      alert("Não foi possível baixar o relatório. Tente novamente.");
      console.error(err);

    }
  };
  
  const checkDeletionWindow = (createdAt: string): boolean => {
    const now = new Date();
    const created = new Date(createdAt);
    const differenceInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return differenceInHours <= 24;
  };

  const handleDeleteRecord = (id: number, createdAt: string) => {
    if (!checkDeletionWindow(createdAt)) {
      alert("Bloqueio de Integridade: Esta atividade possui mais de 24 horas de criação e foi consolidada para a folha bimestral do NUGEP.");
      return;
    }

    if (confirm("Deseja remover este registro do histórico de atividades pendentes?")) {
      setActivities((prev) => prev.filter((act) => act.id !== id));
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesUsf = act.usf.toLowerCase().includes(filterUsf.toLowerCase());
    const matchesStatus = filterStatus === "TODOS" || act.status === filterStatus;
    return matchesUsf && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-teal-600 font-bold animate-pulse text-lg tracking-wide">Buscando histórico de atividades...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gray-100 font-sans text-gray-800 overflow-hidden">
      
      {/* MENU LATERAL ESTÁTICO (FIXO) */}
      <SideBar />

      {/* PAINEL DO CONTEÚDO (FIXO EM RELAÇÃO À VIEWPORT) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* CABEÇALHO SUPERIOR (FIXO) */}
        <Header 
          title="Atividades Realizadas"
          subtitle="Residência Integrada em Saúde • Salvador, BA "
        />

        {/* ÁREA DE TRABALHO INTERNA */}
        <div className="flex-1 flex flex-col min-h-0 p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-xl text-sm font-medium shrink-0 shadow-2xs">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* BARRA DE FILTROS AVANÇADOS (FIXA) */}
          <section className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-end shrink-0">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Filtrar por Unidade de Saúde (USF)</label>
              <input 
                type="text"
                value={filterUsf}
                onChange={(e) => setFilterUsf(e.target.value)}
                placeholder="Digite o nome da USF..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Filtrar por Status de Homologação</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50 text-sm transition font-medium"
              >
                <option value="TODOS">Todos os Lançamentos</option>
                <option value="PENDENTE">🟡 PENDENTE</option>
                <option value="APROVADO">🟢 APROVADO</option>
                <option value="REJEITADO">🔴 REJEITADO</option>
              </select>
            </div>

            <div className="text-right text-xs text-gray-400 font-medium pb-2">
              Exibindo <span className="font-bold text-teal-600">{filteredActivities.length}</span> registro(s) encontrado(s).
            </div>
          </section>

          {/* HISTÓRICO EXPANDIDO (ÚNICO CONTAINER SOB AÇÃO DE SCROLL) */}
          <section className="flex-1 bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-y-auto min-h-0">
            {filteredActivities.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                Nenhum log de atividade corresponde aos filtros selecionados.
              </div>
            ) : (
              <div className="flex flex-col divide-y items-center divide-gray-100">
                {filteredActivities.map((act) => {
                  const isEditable = checkDeletionWindow(act.data_criacao); 
                  
                  return (
                    <div key={act.id} className="p-6 w-9/10 hover:bg-gray-50/40 transition flex flex-col md:flex-row justify-between gap-6 items-center group">
                      
                      {/* Bloco de Informações da Atividade */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-gray-900">{act.usf}</h4>
                          <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded-md">
                            ID: #{act.id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            act.status === "APROVADO" ? "bg-green-100 text-green-800" :
                            act.status === "REJEITADO" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {act.status}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 font-medium">
                          <strong>Acompanhamento:</strong> {act.responsavel_acompanhamento} • 
                          <span className="ml-1">📅 <strong>Data de Envio:</strong> {new Date(act.data_criacao).toLocaleDateString("pt-BR")}</span>
                        </p>

                        <p 
                          className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-white transition leading-relaxed line-clamp-3"
                          title={act.detalhes_atividade}
                        >
                          {act.detalhes_atividade}
                        </p>
                      </div>

                      {/* Bloco Lateral de Métricas e Ações de Controle */}
                      <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Carga Horária</span>
                          <span className="text-2xl font-black text-gray-700 font-mono">{act.carga_horaria}h</span>
                        </div>

                        {/* GRUPO DE BOTÕES */}
                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                          
                          {/* Botão de Redirecionamento Dinâmico para Detalhes */}
                          <button
                            onClick={() => router.push(`/main/activities/${act.id}`)}
                            className="inline-flex flex-1 md:flex-none items-center justify-center text-xs font-bold text-white bg-lime-600 hover:bg-teal-900 px-4 py-2.5 rounded-xl shadow-sm transition text-center cursor-pointer"
                          >
                            Detalhes
                          </button>

                          {/* Botão de Download Existente */}
                          <button
                            onClick={() => handleDownload(act.id)}
                            className="inline-flex flex-1 md:flex-none items-center justify-center text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl border border-teal-200 transition text-center cursor-pointer"
                          >
                            Baixar Relatório
                          </button>
                        </div>
                        
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}