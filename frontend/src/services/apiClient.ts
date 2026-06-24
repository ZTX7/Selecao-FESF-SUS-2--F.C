

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const baseUrl = "http://localhost:8000";
  const token = localStorage.getItem("jwt_token");

   const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  // GATILHO DA SESSÃO EXPIRADA: Se a API retornar 401, limpa tudo e desloga
  if (response.status === 401) {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("usuarioLogado");
    
    
    window.location.replace("/auth/login?error=session_expired");
    throw new Error("Sessão expirada.");

  }

  return response;
}