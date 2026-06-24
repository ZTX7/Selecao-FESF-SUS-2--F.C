"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { apiFetch } from "@/services/apiClient";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState("");

  const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "") // Remove tudo que não é dígito
    .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona ponto após os primeiros 3
    .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona ponto após os segundos 3
    .replace(/(\d{3})(\d{1,2})/, "$1-$2") // Adiciona traço após os terceiros 3
    .replace(/(-\d{2})\d+?$/, "$1"); // Impede mais de 2 dígitos após o traço
};

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCPF(e.target.value));
  };

  const handleRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    
    const payload = {
      email: formData.get("email"),
      senha: formData.get("password"),
      nome_completo: formData.get("nome_completo"),
      cpf: formData.get("cpf"),
      data_nascimento: formData.get("data_nascimento"),
      area_atuacao: formData.get("area_atuacao"),
      inicio_residencia: formData.get("inicio_residencia"),
    };

    // Validação básica
    if (Object.values(payload).some(val => !val || val.toString().trim() === "")) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao realizar cadastro.");
      }

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Falha ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lime-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo-white.png" alt="resiSUS" width={200} height={80} />
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Cadastro de Residente</h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegister}>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input name="nome_completo" 
            type="text" 
            placeholder="seu nome completo"
            className="w-full text-gray-600 border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500" required />
            
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input name="email" 
            type="email" 
            placeholder="Seu e-mail"
            className="w-full border text-gray-600 border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CPF</label>
            <input 
              name="cpf" 
              type="text" 
              value={cpf}
              onChange={handleCpfChange}
              maxLength={14} // Mudamos de 11 para 14 (11 dígitos + 3 caracteres de máscara)
              className="w-full text-gray-600 border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500" 
              placeholder="000.000.000-00" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
            <input name="data_nascimento" type="date" className="w-full text-gray-600 border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Início da Residência</label>
            <input name="inicio_residencia" type="date" className="w-full text-gray-600 border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Área de Atuação</label>
            <input name="area_atuacao" 
            placeholder="Area de atuação"
            type="text" className="w-full text-gray-600 border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
            name="password" 
            placeholder="Sua senha"
             className="w-full text-gray-600 border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500" required />
          </div>

          {error && <div className="md:col-span-2 bg-red-100 text-red-800 p-3 rounded-xl text-sm text-center">{error}</div>}
          {success && <div className="md:col-span-2 bg-green-100 text-green-800 p-3 rounded-xl text-sm text-center">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full bg-teal-600 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Já tem conta? <button onClick={() => router.push('/auth/login')} className="text-teal-600 font-bold hover:underline">Entrar</button>
        </p>
      </div>
    </div>
  );
}