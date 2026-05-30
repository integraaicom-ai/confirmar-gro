import { useState, useEffect } from "react";

const PORTAL_LOGIN_URL =
  "https://app.base44.com/api/apps/692ce8b41b53f8d1d71b7ec7/functions/portalLogin";
const CONFIRMAR_URL =
  "https://app.base44.com/api/apps/692ce8b41b53f8d1d71b7ec7/functions/confirmarLeituraGROPortal";

export default function App() {
  const [tela, setTela] = useState("login"); // login | confirmando_login | confirmacao | confirmando | sucesso | ja_confirmado | erro
  const [usuario, setUsuario] = useState(null);
  const [comunicado, setComunicado] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loginErro, setLoginErro] = useState("");
  const [erroMsg, setErroMsg] = useState("");

  const params = new URLSearchParams(window.location.search);
  const comunicado_id = params.get("comunicado_id");

  useEffect(() => {
    if (!comunicado_id) {
      setTela("erro");
      setErroMsg("Link inválido. Verifique se copiou o link corretamente.");
    }
  }, []);

  const fazerLogin = async () => {
    if (!email || !senha) {
      setLoginErro("Preencha e-mail e senha.");
      return;
    }
    setTela("confirmando_login");
    setLoginErro("");
    try {
      const res = await fetch(PORTAL_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), senha }),
      });
      const data = await res.json();
      if (data?.success && data?.usuario) {
        setUsuario(data.usuario);
        setTela("confirmacao");
      } else {
        setLoginErro(data?.error || "E-mail ou senha inválidos.");
        setTela("login");
      }
    } catch (e) {
      setLoginErro("Erro de conexão. Tente novamente.");
      setTela("login");
    }
  };

  const confirmarLeitura = async () => {
    setTela("confirmando");
    try {
      const res = await fetch(CONFIRMAR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comunicado_id,
          usuario_email: usuario.email,
          usuario_nome: usuario.nome,
          empresa_id: usuario.empresa_id,
        }),
      });
      const data = await res.json();
      if (data?.ja_confirmado) {
        setTela("ja_confirmado");
      } else if (data?.success) {
        setComunicado(data.comunicado_titulo || "Comunicado GRO");
        setTela("sucesso");
      } else {
        setErroMsg(data?.error || "Erro ao registrar confirmação.");
        setTela("erro");
      }
    } catch (e) {
      setErroMsg("Erro de conexão. Tente novamente.");
      setTela("erro");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}><ShieldIcon /></div>
          <h1 style={styles.title}>Confirmação de Leitura</h1>
          <p style={styles.subtitle}>GRO — Gerenciamento de Riscos Ocupacionais</p>
        </div>

        <div style={styles.body}>

          {/* TELA LOGIN */}
          {tela === "login" && (
            <div style={styles.center}>
              <p style={styles.infoText}>
                Entre com suas credenciais para confirmar o comunicado de segurança conforme exigido pela{" "}
                <strong style={{ color: "#f97316" }}>NR-1</strong>.
              </p>
              <div style={{ width: "100%", marginTop: "8px" }}>
                <label style={styles.label}>E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => { setLoginErro(""); setEmail(e.target.value); }}
                  onKeyDown={(e) => e.key === "Enter" && fazerLogin()}
                  style={styles.input}
                />
              </div>
              <div style={{ width: "100%", marginTop: "4px" }}>
                <label style={styles.label}>Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => { setLoginErro(""); setSenha(e.target.value); }}
                  onKeyDown={(e) => e.key === "Enter" && fazerLogin()}
                  style={styles.input}
                />
              </div>
              {loginErro && <p style={styles.erroTexto}>{loginErro}</p>}
              <button onClick={fazerLogin} style={styles.btnPrimary}>
                Entrar
              </button>
              <p style={{ ...styles.mutedText, fontSize: "11px" }}>
                Use as mesmas credenciais do Portal IntegraConnect.
              </p>
            </div>
          )}

          {/* AGUARDANDO LOGIN */}
          {tela === "confirmando_login" && (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p style={styles.mutedText}>Autenticando...</p>
            </div>
          )}

          {/* TELA CONFIRMAÇÃO */}
          {tela === "confirmacao" && (
            <div style={styles.center}>
              <div style={styles.welcomeBadge}>
                👋 Olá, {usuario?.nome?.split(" ")[0]}
              </div>
              <p style={styles.infoText}>
                Ao confirmar, você declara que leu e compreendeu o comunicado de segurança e saúde
                ocupacional conforme exigido pela{" "}
                <strong style={{ color: "#f97316" }}>NR-1</strong>.
              </p>
              <p style={styles.mutedText}>
                Esta confirmação é registrada com data, hora e validade jurídica.
              </p>
              <button onClick={confirmarLeitura} style={styles.btnPrimary}>
                ✅ Confirmar Leitura
              </button>
            </div>
          )}

          {/* PROCESSANDO CONFIRMAÇÃO */}
          {tela === "confirmando" && (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p style={styles.mutedText}>Registrando confirmação...</p>
            </div>
          )}

          {/* SUCESSO */}
          {tela === "sucesso" && (
            <div style={styles.center}>
              <CheckIcon color="#22c55e" />
              <p style={{ ...styles.resultTitle, color: "#22c55e" }}>Confirmado!</p>
              <p style={styles.mutedText}>
                Sua confirmação foi registrada com validade jurídica conforme a NR-1.
              </p>
              <p style={{ ...styles.mutedText, fontSize: "12px", marginTop: "4px" }}>
                Você pode fechar esta página.
              </p>
            </div>
          )}

          {/* JÁ CONFIRMADO */}
          {tela === "ja_confirmado" && (
            <div style={styles.center}>
              <CheckIcon color="#3b82f6" />
              <p style={{ ...styles.resultTitle, color: "#3b82f6" }}>Já Confirmado</p>
              <p style={styles.mutedText}>Você já confirmou este comunicado anteriormente.</p>
            </div>
          )}

          {/* ERRO */}
          {tela === "erro" && (
            <div style={styles.center}>
              <AlertIcon />
              <p style={{ ...styles.resultTitle, color: "#ef4444" }}>Erro</p>
              <p style={styles.mutedText}>{erroMsg}</p>
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
  subtitle: { fontSize: "13px", color: "#6b7280" },
  body: { minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", width: "100%" },
  infoText: { fontSize: "14px", color: "#d1d5db", lineHeight: "1.6" },
  mutedText: { fontSize: "13px", color: "#6b7280", lineHeight: "1.5" },
  resultTitle: { fontSize: "20px", fontWeight: "700", marginBottom: "4px" },
  label: { display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px", textAlign: "left" },
  input: { width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "12px 14px", fontSize: "15px", color: "#f9fafb", outline: "none", boxSizing: "border-box" },
  erroTexto: { fontSize: "12px", color: "#ef4444", textAlign: "left", width: "100%" },
  btnPrimary: { background: "#f97316", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%", marginTop: "4px" },
  welcomeBadge: { background: "#1f2937", border: "1px solid #374151", borderRadius: "20px", padding: "8px 20px", fontSize: "14px", color: "#d1d5db" },
  spinner: { width: "40px", height: "40px", border: "3px solid #1f2937", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  footer: { textAlign: "center", fontSize: "11px", color: "#374151", marginTop: "32px" },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(styleSheet);
