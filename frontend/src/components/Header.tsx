"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 📐 Interface de propriedades para dinamizar os títulos por página
interface HeaderProps {
  title: string;
  subtitle: string;
}

const getJwtExpiration = (token: string): number | null => {
  try {
    // Pega a parte do meio do token (Payload) e descodifica de Base64
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    
    const payload = JSON.parse(jsonPayload);
    // Retorna a propriedade 'exp' (timestamp em segundos)
    return payload.exp || null;
  } catch (error) {
    return null;
  }
};

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("Calculando...");

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const expirationTimestamp = getJwtExpiration(token);

    if (!expirationTimestamp) {
      localStorage.clear(); 
      router.replace("/login?error=invalid_token");
      return;
    }

    const updateCountdown = () => {
      const currentTimestamp = Math.floor(Date.now() / 1000); 
      const remainingSeconds = expirationTimestamp - currentTimestamp;

      if (remainingSeconds <= 0) {
        
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("usuarioLogado");
        router.replace("/auth/login?error=session_expired");
        return;
      }

     
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      setTimeLeft(formattedTime);
    };


    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [router]);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0 flex justify-between items-center shadow-sm z-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      </div>


      <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl shadow-inner">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Sessão expira em:
        </span>
        <span
          className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded-md transition-colors duration-300 ${
            parseInt(timeLeft.split(":")[0], 10) < 5
              ? "bg-red-100 text-red-700 animate-pulse" 
              : "bg-teal-50 text-teal-800"
          }`}
        >
          ⏱️ {timeLeft}
        </span>
      </div>
    </header>
  );
}