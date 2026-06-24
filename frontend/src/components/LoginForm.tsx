"use client";

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { type SubmitEvent, useState, useEffect } from "react"


import { apiFetch } from "@/services/apiClient";


export default function Login(){
    const router = useRouter();
    const searchParams = useSearchParams();

    const [erro, setError] = useState("");
    const [loading, setLoading] = useState(false);
    


    useEffect(() => {
        if (searchParams.get("error") === "session_expired") {
            setError("Sua sessão expirou por inatividade. Digite suas credenciais novamente.");
        }
        }, [searchParams]);


    const handleLogin = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const residentCode = formData.get("resident-code") as string;
        const password = formData.get("password") as string;

           
        if (!password.trim() || residentCode.trim() === ''){
            setError("Preencha o campo vazio.");
            setLoading(false);
            return;
        }  

        try{

            const response = await apiFetch("/api/v1/auth/login",{
                method: "POST",
                body: JSON.stringify({

                    resident_code: residentCode.trim(),
                    password: password.trim()

                }),
            })

            if(!response.ok) {
                setError("Credênciais inválidas, acesso negado.")
                
            } else {
                const data = await response.json();
                localStorage.setItem("jwt_token", data.access_token);
  
                if(data.user){
                    localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
                }
                router.push("/main");
            }

        } catch {
           
            console.log("Erro ao contactar o servidor.");

        } finally {
            setLoading(false);
        }
    }


    return (
        <main className="relative h-auto min-h-screen w-full overflow-x-hidden bg-[#c4dcdc] lg:h-screen lg:max-h-screen lg:overflow-hidden">
            <div className="min-h-screen bg-lime-600 flex flex-col items-center justify-center px-4">

            {/* Card Login */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

                {/* Logo */}
                <div className="flex justify-center m-8">
                    <Image
                        src="/images/logo-white.png"
                        alt="resiSUS"
                        width={350}
                        height={200}
                        className="mx-auto lg:mx-0 mb-4"
                    />
                </div>

                {/* Form */}
                <form
                    className="space-y-5"
                    onSubmit={handleLogin}>

                {/* Código do Residente */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Residente
                    </label>

                    <div className="relative">
                    <input
                        name="resident-code"
                        type="text"
                        placeholder="12345678"
                        className="w-full text-gray-400 border border-gray-300 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 22"
                        stroke="currentColor"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12H8m8 0L8 6m8 6L8 18"
                        />
                    </svg>
                    </div>
                </div>

                {/* Senha */}
                <div>

                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">
                            Senha
                        </label>
                    </div>

                    <div className="relative">
                    <input
                        name={"password"}
                        type="password"
                        placeholder="••••••••"
                        className="w-full text-gray-400 border border-gray-300 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 22"
                        stroke="currentColor"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 0h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V6a5 5 0 00-10 0v1H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                    </svg>
                    </div>

                    {erro && (
                        <div className="bg-red-100 mt-5 text-red-800 p-3 rounded-xl text-sm text-center font-medium">
                        {erro}
                        </div>
                    )}

                </div>


                {/* Botão */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 bg-teal-600 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition"
                > {loading ? "Entrando..." : "Entrar"}
                </button>

                </form>

                {/* Cadastro */}
                <div className="text-center mt-8 text-gray-600">
                Não é cadastrado?
                    <button
                        type="button"
                        onClick={() => router.push('/auth/register')}
                        className="ml-2 text-teal-600 font-medium hover:text-green-600"
                    >
                    Registrar-se
                    </button>
                </div>

            </div>
            </div>
        </main>
    );
}
