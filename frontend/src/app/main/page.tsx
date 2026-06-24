"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";
import { apiFetch } from "@/services/apiClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";


interface LoggedUser {
  id: number;
  nome_completo: string;
  area_atuacao: string;
}

interface Activity {
  id: number;
  usf: string;
  responsavel_acompanhamento: string;
  detalhes_atividade: string;
  carga_horaria: number;
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
  data_criacao: string;
}

interface RecentReport {
  id: number;
  usf: string;
  detalhes_atividade: string;
  data_submissao: string;
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
}


interface ChartDataPeriod {
  periodo: string;
  quantidade: number;
}

interface ReportSummary {
  totalReports: number;
  approved: number;
  rejected: number;
  pending: number;
  totalHoursInputted: number;
  totalHoursApproved: number;
  totalHoursPending: number;
  recentReports: RecentReport[];
  chartDataPeriod: ChartDataPeriod[]; 
}


const PIE_COLORS = {
  APROVADO: "#15803d", 
  PENDENTE: "#eab308", 
  REJEITADO: "#b91c1c", 
};

export default function MainDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusStyles: Record<string, string> = {
  APROVADO: "bg-green-100 text-green-800 border border-green-200",
  REJEITADO: "bg-red-100 text-red-800 border border-red-200",
  REPROVADO: "bg-red-100 text-red-800 border border-red-200",
  PENDENTE: "bg-yellow-100 text-yellow-800 border border-yellow-200"
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const savedUser = localStorage.getItem("usuarioLogado");

    if (!token || !savedUser) {
      router.replace("/auth/login");
      return;
    }

    const userObj = JSON.parse(savedUser) as LoggedUser;
    setUser(userObj);

    const fetchDashboardMetrics = async () => {
      try {
        const response = await apiFetch("/api/v1/activities/get-activities", {
          method: "GET",
        });

        if (!response.ok) throw new Error("Erro ao buscar dados do servidor");

        const rawData = (await response.json()) as Activity[];

        // Transformação de Dados e Cálculos de Agregação
        const totalReports = rawData.length;
        const approved = rawData.filter((a) => a.status === "APROVADO").length;
        const rejected = rawData.filter((a) => a.status === "REJEITADO" || a.status === "REPROVADO" as any).length;
        const pending = rawData.filter((a) => a.status === "PENDENTE").length;

        const totalHoursInputted = rawData.reduce((acc, act) => acc + act.carga_horaria, 0);
        const totalHoursApproved = rawData.filter((a) => a.status === "APROVADO").reduce((acc, act) => acc + act.carga_horaria, 0);
        const totalHoursPending = rawData.filter((a) => a.status === "PENDENTE").reduce((acc, act) => acc + act.carga_horaria, 0);

        // Agrupamento de dados para o Gráfico de Torre (Por Período)
        const periodCounts: Record<string, number> = {};
        rawData.forEach((act) => {
          const date = new Date(act.data_criacao);

          const period = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
          periodCounts[period] = (periodCounts[period] || 0) + 1;
        });


        const chartDataPeriod = Object.keys(periodCounts).map((key) => ({
          periodo: key,
          quantidade: periodCounts[key],
        })).reverse(); 

        const sortedActivities = [...rawData].sort(
          (a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
        );

        const recentReports: RecentReport[] = sortedActivities.slice(0, 5).map((act) => ({
          id: act.id,
          usf: act.usf,
          detalhes_atividade: act.detalhes_atividade,
          data_submissao: act.data_criacao,
          status: act.status,
        }));

        setSummary({
          totalReports,
          approved,
          rejected,
          pending,
          totalHoursInputted,
          totalHoursApproved,
          totalHoursPending,
          recentReports,
          chartDataPeriod,
        });
      } catch (err) {
        console.log(`Erro ao consultar informações: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [router]);

  if (isLoading || !user || !summary) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-teal-800 font-semibold">
        Processando métricas do painel e desenhando gráficos...
      </div>
    );
  }


  const pieData = [
    { name: "Aprovados", value: summary.approved, color: PIE_COLORS.APROVADO },
    { name: "Em Análise", value: summary.pending, color: PIE_COLORS.PENDENTE },
    { name: "Rejeitados", value: summary.rejected, color: PIE_COLORS.REJEITADO },
  ].filter(data => data.value > 0); 

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <SideBar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
        title="Painel de Monitoramento Gerencial"
        subtitle="Residência Integrada em Saúde • Salvador, BA "
        />

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="bg-linear-to-r from-teal-800 to-teal-700 rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Olá, {user.nome_completo}!</h2>
              <p className="text-teal-100 mt-1">
                Acompanhe abaixo o status dos seus relatórios consolidados e logs de frequência.
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
              <span className="text-sm font-medium">Segmento: {user.area_atuacao}</span>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className="bg-gray-100 p-3 rounded-xl text-xl">📋</div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Enviado</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalReports}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className="bg-green-50 p-3 rounded-xl text-xl">✅</div>
              <div>
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Aprovados</p>
                <p className="text-2xl font-bold text-green-700">{summary.approved}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className="bg-yellow-50 p-3 rounded-xl text-xl">⏳</div>
              <div>
                <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wider">Em Análise</p>
                <p className="text-2xl font-bold text-yellow-700">{summary.pending}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className="bg-red-50 p-3 rounded-xl text-xl">❌</div>
              <div>
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Reprovados</p>
                <p className="text-2xl font-bold text-red-700">{summary.rejected}</p>
              </div>
            </div>
          </div>

          {/* SESSÃO DE GRÁFICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico de Torre (Barras) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Entregas por Período</h3>
              <p className="text-sm text-gray-500 mb-6">Volume de relatórios submetidos mensalmente.</p>
              <div className="flex-1 w-full min-h-62.5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.chartDataPeriod}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="periodo" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="quantidade" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={40} name="Relatórios" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Pizza */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Distribuição de Status</h3>
              <p className="text-sm text-gray-500 mb-6">Proporção de aprovação dos logs submetidos.</p>
              <div className="flex-1 w-full min-h-62.5 flex items-center justify-center">
                {summary.totalReports === 0 ? (
                   <span className="text-gray-400 text-sm">Sem dados suficientes para o gráfico.</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* TABELA DE ÚLTIMOS LANÇAMENTOS E BALANÇO HORAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">📋 Últimos 5 Lançamentos</h3>
                <p className="text-sm text-gray-500">Histórico cronológico recente de entregas regulamentares para a preceptoria.</p>
              </div>
            <div className="flex-1 bg-amber-200 overflow-hidden"> {/* Container pai seguro */}
              {summary.recentReports.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">Nenhuma atividade submetida até o momento.</div>
              ) : (
                /* Contêiner de rolagem: A mágica acontece aqui */
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-150 text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-5 font-semibold">Local & Detalhes</th>
                        <th className="px-4 py-3 font-semibold">Data</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y  divide-gray-100 bg-white">
                      {summary.recentReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-4">
                            <div className="flex flex-col w-9/10">
                              <span className="text-sm font-bold text-gray-900 truncate">📍 {report.usf}</span>
                              <span className="text-xs text-gray-500 mt-1 line-clamp-2" title={report.detalhes_atividade}>
                                {report.detalhes_atividade}
                              </span>
                              <span className="text-[10px] text-gray-400 mt-1.5 font-mono">ID: #{report.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(report.data_submissao).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">                           
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                              statusStyles[report.status] || statusStyles["PENDENTE"]
                            }`}>
                              {report.status === "PENDENTE" ? "EM ANÁLISE" : report.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">Balanço de Carga Horária</h3>
                <p className="text-sm text-gray-500">Resumo auditável para bolsa.</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                  <span className="text-sm text-gray-600 font-medium">⏱️ Declarado (Entrada)</span>
                  <span className="text-lg font-bold text-gray-900">{summary.totalHoursInputted}h</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                  <span className="text-sm text-yellow-600 font-medium">⏳ Pendente (Análise)</span>
                  <span className="text-lg font-bold text-yellow-700">{summary.totalHoursPending}h</span>
                </div>
                <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl shadow-inner border border-green-100">
                  <span className="text-sm text-green-800 font-bold uppercase tracking-wider">✅ Horas Validadas</span>
                  <span className="text-2xl font-extrabold text-green-700">{summary.totalHoursApproved}h</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}