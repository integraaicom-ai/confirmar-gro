import { useState, useEffect } from "react";

const CRM_FUNCTION_URL =
  "https://app.base44.com/api/apps/692ce8b41b53f8d1d71b7ec7/functions/confirmarLeituraGRO";

function formatCPF(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function App() {
  const [status, setStatus] = useState("loading");
  const [mensagem, setMensagem] = useState("");
  const [titulo, setTitulo] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfErro, setCpfErro] = useState("");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const comunicado_id = params.get("comunicado_id");
  const usuario_id = params.get("usuario_id");

  useEffect(() => {
    if (!token || !comunicado_id || !usuario_id) {
      setStatus("erro");
      setMensagem("Link inválido ou incompleto. Verifique se copiou o link corretamente.");
      return;
    }
    if (token === "TESTE123" || comunicado_id === "teste") {
      setStatus("demo");
      setTitulo("Comunicado de Teste — GRO");
      return;
    }
    setStatus("pendente");
  }, []);

  const confirmar = async () => {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setCpfErro("Digite um CPF válido com 11 dígitos.");
      return;
    }
    setCpfErro("");
    setStatus("confirmando");
    try {
      const res = await fetch(CRM_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, comunicado_id, usuario_id, cpf: cpfLimpo }),
      });
      const data = await res.json();
      if (data?.ja_confirmado) {
        setStatus("ja_confirmado");
        setMensagem(data.error || "Você já confirmou este comunicado anteriormente.");
      } else if (data?.success) {
        setStatus("confirmado");
        setMensagem(data.mensagem || "Sua confirmação foi registrada com validade jurídica conforme a NR-1.");
      } else {
        setStatus("pendente");
        setCpfErro(data?.error || "Erro ao processar confirmação.");
      }
    } catch (e) {
      setStatus("pendente");
      setCpfErro("Erro de conexão. Tente novamente em alguns instantes.");
    }
  };

  const confirmarDemo = async () => {
    setStatus("confirmando");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("confirmado");
    setMensagem("Modo de demonstração — nenhum registro foi salvo.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}><ShieldIcon /></div>
          <h1 style={styles.title}>Confirmação de Leitura</h1>
          <p style={styles.subtitle}>GRO — Gerenciamento de Riscos Ocupacionais</p>
          {titulo && <p style={styles.comunicadoTitulo}>📋 {titulo}</p>}
        </div>

        <div style={styles.body}>
          {status === "loading" && (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p style={styles.mutedText}>Carregando...</p>
            </div>
          )}

          {status === "pendente" && (
            <div style={styles.center}>
              <p style={styles.infoText}>
                Ao confirmar, você declara que leu e compreendeu o comunicado de segurança e saúde
                ocupacional conforme exigido pela{" "}
                <strong style={{ color: "#f97316" }}>NR-1</strong>.
              </p>
              <p style={styles.mutedText}>
                Esta confirmação é registrada com data, hora e validade jurídica.
              </p>

              {/* Campo CPF */}
              <div style={{ width: "100%", marginTop: "8px" }}>
                <label style={styles.label}>CPF para validação de identidade</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => {
                    setCpfErro("");
                    setCpf(formatCPF(e.target.value));
                  }}
                  style={{
                    ...styles.input,
                    borderColor: cpfErro ? "#ef4444" : "#374151",
                  }}
                  maxLength={14}
                />
                {cpfErro && <p style={styles.erroTexto}>{cpfErro}</p>}
              </div>

              <button onClick={confirmar} style={styles.btnPrimary}>
                ✅ Confirmar Leitura
              </button>

              <p style={{ ...styles.mutedText, fontSize: "11px" }}>
                🔒 Seu CPF é usado apenas para validar sua identidade e não é armazenado completo.
              </p>
            </div>
          )}

          {status === "demo" && (
            <div style={styles.center}>
              <div style={{ ...styles.badge, background: "#431407", color: "#f97316", border: "1px solid #f97316" }}>
                🧪 MODO DEMONSTRAÇÃO
              </div>
              <p style={styles.infoText}>Este é um link de teste. Nenhum registro será salvo.</p>
              <button onClick={confirmarDemo} style={styles.btnPrimary}>✅ Simular Confirmação</button>
            </div>
          )}

          {status === "confirmando" && (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p style={styles.mutedText}>Registrando confirmação...</p>
            </div>
          )}

          {status === "confirmado" && (
            <div style={styles.center}>
              <CheckIcon color="#22c55e" />
              <p style={{ ...styles.resultTitle, color: "#22c55e" }}>Confirmado!</p>
              <p style={styles.mutedText}>{mensagem}</p>
              <p style={{ ...styles.mutedText, fontSize: "12px", marginTop: "8px" }}>
                Você pode fechar esta página.
              </p>
            </div>
          )}

          {status === "ja_confirmado" && (
            <div style={styles.center}>
              <CheckIcon color="#3b82f6" />
              <p style={{ ...styles.resultTitle, color: "#3b82f6" }}>Já Confirmado</p>
              <p style={styles.mutedText}>{mensagem}</p>
            </div>
          )}

          {status === "erro" && (
            <div style={styles.center}>
              <AlertIcon />
              <p style={{ ...styles.resultTitle, color: "#ef4444" }}>Erro</p>
              <p style={styles.mutedText}>{mensagem}</p>
            </div>
          )}
        </div>

        <p style={styles.footer}>IntegraConnect CRM © 2026</p>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon({ color }) {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px" }}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px" }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "linear-gradient(135deg, #030712 0%, #0f172a 100%)" },
  card: { background: "#111827", borderRadius: "20px", padding: "40px 32px", maxWidth: "420px", width: "100%", border: "1px solid #1f2937", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
  header: { textAlign: "center", marginBottom: "32px" },
  iconWrapper: { display: "flex", justifyContent: "center", marginBottom: "16px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#f9fafb", marginBottom: "4px" },
  subtitle: { fontSize: "13px", color: "#6b7280", marginBottom: "0" },
  comunicadoTitulo: { marginTop: "12px", fontSize: "14px", color: "#d1d5db", background: "#1f2937", borderRadius: "8px", padding: "8px 12px" },
  body: { minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", width: "100%" },
  infoText: { fontSize: "14px", color: "#d1d5db", lineHeight: "1.6" },
  mutedText: { fontSize: "13px", color: "#6b7280", lineHeight: "1.5" },
  resultTitle: { fontSize: "20px", fontWeight: "700", marginBottom: "4px" },
  label: { display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px", textAlign: "left" },
  input: { width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "12px 14px", fontSize: "16px", color: "#f9fafb", outline: "none", boxSizing: "border-box", letterSpacing: "2px" },
  erroTexto: { fontSize: "12px", color: "#ef4444", textAlign: "left", marginTop: "4px" },
  btnPrimary: { background: "#f97316", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%", marginTop: "4px" },
  badge: { padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em" },
  spinner: { width: "40px", height: "40px", border: "3px solid #1f2937", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  footer: { textAlign: "center", fontSize: "11px", color: "#374151", marginTop: "32px" },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);
