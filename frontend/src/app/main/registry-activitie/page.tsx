"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/apiClient";

import SideBar from "@/components/SideBar";
import Header  from "@/components/Header";


export default function registryActivity() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const LIMITE_CARACTERES = 1000;

  const [tipoAtividadeSelecionado, setTipoAtividadeSelecionado] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const savedUser = localStorage.getItem("usuarioLogado");

    if (!token || !savedUser) {
      router.replace("/auth/login");
    }
  }, [router]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitActivity = async (formData: FormData) => {
    setErrorMessage("");
    setSuccessMessage("");

    const usf = (formData.get("usf") as string ?? "").trim();
    const supervisor = (formData.get("supervisor") as string ?? "").trim();
    const hours = Number(formData.get("hours") ?? 0);
    const details = (formData.get("details") as string ?? "").trim();
    const dataInicio = (formData.get("inicio_atividade") as string ?? "").trim();

    
    const file = formData.get("file") as File | null;

    let tipoFinal = (formData.get("tipo_atividade_select") as string ?? "").trim();
    if (tipoFinal === "Outro") {
      tipoFinal = (formData.get("tipo_atividade_outro") as string ?? "").trim();
    }

    
// Validação de Campos Obrigatórios 
    if (!usf || !supervisor || !details || !dataInicio || !tipoFinal) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }
    if (!file || file.size === 0) {
      setErrorMessage("É obrigatório anexar um documento descritivo comprobatório (RN-03D).");
      return;
    }

    // Validação Lógica de Carga Horária 
    if (hours < 1 || hours > 24) {
      setErrorMessage("Carga horária inválida. O teto regulamentar é de 1 a 24 horas diárias.");
      return;
    }

    setIsSubmitting(true);

    try {
      const arquivoBase64 = await convertFileToBase64(file);
      console.log(arquivoBase64);

      const payloadJSON = {
        usf: usf,
        responsavel_acompanhamento: supervisor,
        tipo_atividade: tipoFinal,
        inicio_atividade: dataInicio,
        carga_horaria: hours,
        detalhes_atividade: details,
        file_base64: arquivoBase64, 
      };
      

      const response = await apiFetch("/api/v1/activities/create",{
          method: "POST",
          body: JSON.stringify(payloadJSON),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao registar dados no servidor.");
      }

      setSuccessMessage("Log de atividade e ficheiro submetidos com sucesso para auditoria!");
      
      const formElement = document.getElementById("registry-form") as HTMLFormElement;
      formElement?.reset();
      setTipoAtividadeSelecionado("");
    } catch (err: any) {
        console.log(`Erro ao contactar o servidor: ${err}`);

    } finally {
      setIsSubmitting(false);
    }
  };

 return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100 font-sans text-gray-800">
      
      {/* REAPROVEITAMENTO DA SIDEBAR COMPONENTIZADA */}
      <SideBar />

      {/* PAINEL DE CONTEÚDO DA DIREITA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Cabeçalho Fixo */}
        <Header 
        title="Regristro de Atividades Práticas"
        subtitle="Residência Integrada em Saúde • Salvador, BA "
        />

        {/* Área Central Isolada para Scroll */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* ALERTAS VISUAIS DE INTERAÇÃO */}
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-xl text-sm font-semibold flex items-center shadow-2xs animate-fade-in">
                <span className="mr-2">⚠️</span> {errorMessage}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-xl text-sm font-semibold flex items-center shadow-2xs animate-fade-in">
                <span className="mr-2">✅</span> {successMessage}
              </div>
            )}

            {/* CARD DO FORMULÁRIO */}
            <section className="bg-white p-8 rounded-2xl shadow-xs border border-gray-200/80">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center">
                  <span className="mr-2">📝</span> Registrar Relátório de Prática
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Qualquer log salvo nascerá com o status <span className="font-bold text-yellow-600">PENDENTE</span> até a homologação da tutoria.
                </p>
              </div>

              {/* Formulário com Action nativa do React 19 */}
              <form action={handleSubmitActivity} id="registry-form" className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Data da Atividade *
                    </label>
                    <input 
                      type="date" 
                      name="inicio_atividade"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50 transition text-sm"
                      required
                    />
                  </div>

                  {/* Campo Carga Horária */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Carga Horária Cumprida *
                    </label>
                    <input 
                      type="number" 
                      name="hours"
                      min="1"
                      max="24"
                      placeholder="Horas (Máx: 24h)"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50 transition text-sm font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Campo Tipo de Atividade */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Tipo de Atividade Realizada *
                  </label>
                  <select
                    name="tipo_atividade_select"
                    value={tipoAtividadeSelecionado}
                    onChange={(e) => setTipoAtividadeSelecionado(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50 transition text-sm cursor-pointer"
                    required
                  >
                    <option value="" disabled>Selecione uma opção...</option>
                    <option value="Atendimento Clínico / Ambulatorial">Atendimento Clínico / Ambulatorial</option>
                    <option value="Acolhimento / Triagem">Acolhimento / Triagem</option>
                    <option value="Visita Domiciliar / Busca Ativa">Visita Domiciliar / Busca Ativa</option>
                    <option value="Ação de Educação em Saúde (Grupos, Palestras)">Ação de Educação em Saúde (Grupos, Palestras)</option>
                    <option value="Reunião de Equipe / Matriciamento">Reunião de Equipe / Matriciamento / Interconsulta</option>
                    <option value="Planejamento e Vigilância em Saúde">Planejamento e Gestão / Vigilância em Saúde</option>
                    <option value="Atividade Teórica / Preceptoria">Atividade Teórica / Preceptoria / Seminário</option>
                    <option value="Pesquisa / Produção Científica">Pesquisa / Produção Científica / TCC</option>
                    <option value="Outro">Outro (Especificar)</option>
                  </select>

                  {/* Renderização Condicional: Só aparece se "Outro" for selecionado */}
                  {tipoAtividadeSelecionado === "Outro" && (
                    <div className="mt-3 animate-fade-in">
                      <input 
                        type="text" 
                        name="tipo_atividade_outro"
                        placeholder="Por favor, especifique qual foi a atividade..."
                        className="w-full px-4 py-2.5 border border-teal-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-teal-50/20 transition text-sm"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Campo USF */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Unidade de Saúde da Família (USF) *
                  </label>
                  <select 
                    name="usf"
                    defaultValue=""
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50 transition text-sm cursor-pointer"
                    required
                  >
                    <option value="" disabled>Selecione a USF onde atuou...</option>
                    <option value="USF Plataforma">USF Plataforma</option>
                    <option value="USF Itapuã">USF Itapuã</option>
                    <option value="USF Cajazeiras">USF Cajazeiras</option>
                    <option value="USF Brotas">USF Brotas</option>
                    <option value="USF Liberdade">USF Liberdade</option>
                    <option value="USF Federação">USF Federação</option>
                    <option value="USF São Marcos">USF São Marcos</option>
                    <option value="USF Boca do Rio">USF Boca do Rio</option>
                    <option value="USF San Martin">USF San Martin</option>
                    <option value="USF Paripe">USF Paripe</option>
                    <option value="USF Periperi">USF Periperi</option>
                    <option value="USF Pirajá">USF Pirajá</option>
                    <option value="USF Mussurunga">USF Mussurunga</option>
                    <option value="USF Cabula">USF Cabula</option>
                    <option value="USF Fazenda Grande">USF Fazenda Grande</option>
                    <option value="USF Castelo Branco">USF Castelo Branco</option>
                    <option value="USF Nordeste de Amaralina">USF Nordeste de Amaralina</option>
                    <option value="USF Valéria">USF Valéria</option>
                    <option value="USF Pau da Lima">USF Pau da Lima</option>
                    <option value="USF Sussuarana">USF Sussuarana</option>
                  </select>
                </div>

                {/* Campo Supervisor */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Tutor ou Preceptor Responsável *
                  </label>
                  <select 
                    name="supervisor"
                    defaultValue=""
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50 transition text-sm cursor-pointer"
                    required
                  >
                    <option value="" disabled>Selecione o orientador responsável...</option>
                    <option value="Dra. Ana Cláudia Souza (Medicina)">Dra. Ana Cláudia Souza (Medicina)</option>
                    <option value="Dr. Marcos Vinícius Oliveira (Enfermagem)">Dr. Marcos Vinícius Oliveira (Enfermagem)</option>
                    <option value="Dra. Beatriz Santos (Nutrição)">Dra. Beatriz Santos (Nutrição)</option>
                    <option value="Dr. Ricardo Almeida (Fisioterapia)">Dr. Ricardo Almeida (Fisioterapia)</option>
                    <option value="Dra. Camila Ferreira (Psicologia)">Dra. Camila Ferreira (Psicologia)</option>
                    <option value="Dr. Eduardo Pires (Saúde Coletiva)">Dr. Eduardo Pires (Saúde Coletiva)</option>
                    <option value="Dra. Fernanda Lima (Odontologia)">Dra. Fernanda Lima (Odontologia)</option>
                    <option value="Dr. Gabriel Costa (Farmácia)">Dr. Gabriel Costa (Farmácia)</option>
                    <option value="Dra. Helena Mendes (Serviço Social)">Dra. Helena Mendes (Serviço Social)</option>
                    <option value="Dr. João Pedro Rocha (Educação Física)">Dr. João Pedro Rocha (Educação Física)</option>
                  </select>
                </div>

                {/* INPUT DE ARQUIVO (RN-03D) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    RELATÓRIO DE ATIVIDADE (.PDF) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/40 hover:bg-gray-50 transition relative">
                    <input 
                      type="file" 
                      name="file"
                      accept=".pdf,.doc,.docx"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">O tamanho máximo recomendado do ficheiro é 5MB.</p>
                </div>

                {/* Campo Detalhes */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Detalhes da Atividade</label>
                  <textarea
                    name="details"
                    value={detalhes}
                    onChange={(e) => setDetalhes(e.target.value)}
                    maxLength={LIMITE_CARACTERES} // 🔒 Trava nativa do navegador
                    rows={5}
                    placeholder="Descreva as atividades realizadas..."
                    className="border border-gray-300 rounded-xl p-3 text-sm text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                  />
                  {/* 🔢 Contador de Caracteres Dinâmico */}
                  <div className="flex justify-end">
                    <span className={`text-xs font-medium ${detalhes.length >= LIMITE_CARACTERES ? "text-red-500" : "text-gray-400"}`}>
                      {detalhes.length} / {LIMITE_CARACTERES} caracteres
                    </span>
                  </div>
                </div>
                {/* Botão de Envio */}
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-sm tracking-wide"
                  >
                    {isSubmitting ? "A processar envio de ficheiro..." : "Enviar para Homologação"}
                  </button>
                </div>

              </form>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}