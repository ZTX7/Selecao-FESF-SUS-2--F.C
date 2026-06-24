"use client";

import Image from "next/image"
import { useRouter } from "next/navigation"
import { type SubmitEvent, useState } from "react"

export default function RecoveryPassword(){
    const router = useRouter();
    const [msgSend, setMsgSend] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)


    const handlerRecoveryCode = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMsgSend("");
        setError("");
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const residentCode = formData.get("resident-code") as string;
   
        if (!residentCode || residentCode.trim() === ''){
            setError("Por favor, digite o seu Código de Residente.");
            setLoading(false);
            return;
        }  
        
        try{

            const response = await fetch("http://localhost:8000/api/v1/auth/recovery-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resident_code: residentCode.trim(),
                })
            });

            if(!response.ok) {
                throw new Error("Não foi possível encontrar este código de residente.")
            }   

            setMsgSend("Instruções de recuperação enviadas para o e-mail cadastrado!");
            

        } catch (error: unknown) {
            /*=== SIMULAÇÃO MOCK ==================================== */
            // if (residentCode === "RES-2026-01") {
            //     setMsgSend("Instruções de recuperação enviadas! (Modo Simulação ativado)");
            // } else {
                   setError(error instanceof Error ? error.message : "Erro de comunicação com o servidor.");
            // }  
        } finally {
            setLoading(false);
        }
        
    }

    return (
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
            <form className="space-y-5" onSubmit={handlerRecoveryCode}>

            {/* Código do Residente */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Residente
                </label>

                <div className="relative">
                <input
                    name="resident-code"
                    type="text"
                    maxLength={11}
                    placeholder="•••••••••••"
                    className="w-full text-gray-400 border border-gray-300 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 23 24"
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

            {msgSend && (
                <div className="bg-green-100 mt-5 text-green-800 p-3 rounded-xl text-sm text-center font-medium">
                {msgSend}
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-xl text-sm text-center font-medium">
                    {error}
                </div>
            )}
            
            {/* Botão */}
            <button
                type="submit"
                className="w-full mt-5 bg-teal-600 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
            > Entrar
            </button>

            </form>

            {/* Retornar ao Login */}
            <div className="text-center mt-8 text-gray-600">
            Lembrou?
                <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="ml-2 text-teal-600 font-medium hover:text-green-600"
                >
                Retornar ao Login
                </button>
            </div>

        </div>
        </div>
    );
}