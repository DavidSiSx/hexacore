"use client";

import { useState, useRef, useEffect } from "react";
import { chatAssistantAction } from "@/app/actions/chat";
import { PokemonBuild } from "@/lib/schemas/team";
import { MessageSquare, X, Send, Sparkles, Loader2, User, Bot } from "lucide-react";

interface ChatAssistantDrawerProps {
  currentTeam: PokemonBuild[] | null;
  activeTheme: any;
}

interface Message {
  role: "user" | "model" | "assistant";
  content: string;
}

// Función sencilla para formatear texto con negrita y listas estilo markdown
function formatMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    let cleanLine = line;
    
    // Listas
    let isBullet = false;
    if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
      isBullet = true;
      cleanLine = cleanLine.substring(2);
    } else if (cleanLine.match(/^\d+\.\s/)) {
      isBullet = true;
      cleanLine = cleanLine.replace(/^\d+\.\s/, "");
    }

    // Negrita
    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
    const content = parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pi} className="font-extrabold text-[var(--accent)]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <li key={i} className="ml-4 list-disc text-xs leading-relaxed mb-1 font-bold">
          {content}
        </li>
      );
    }

    if (cleanLine.trim() === "") {
      return <div key={i} className="h-2" />;
    }

    return (
      <p key={i} className="text-xs leading-relaxed mb-2 font-bold">
        {content}
      </p>
    );
  });
}

export default function ChatAssistantDrawer({ currentTeam, activeTheme }: ChatAssistantDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "¡Hola! Soy tu Coach de IA Hexacore. Estoy aquí para perfeccionar tu estrategia, calcular puntos de ruptura de daño o corregir tus EVs. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cargar historial y contador desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("hexacore_coach_messages");
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Error loading messages from localStorage:", e);
        }
      }
      const savedCount = localStorage.getItem("hexacore_coach_total_questions");
      if (savedCount) {
        setTotalQuestions(parseInt(savedCount, 10) || 0);
      }
    }
  }, []);

  // Guardar historial en localStorage al cambiar
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (messages.length > 1) {
        localStorage.setItem("hexacore_coach_messages", JSON.stringify(messages));
      }
    }
  }, [messages]);

  // Scroll automático
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e?: React.FormEvent, customText?: string) {
    e?.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || loading || totalQuestions >= 5) return;

    if (!customText) {
      setInput("");
    }

    const newMsg: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setLoading(true);

    // Incrementar y guardar contador de preguntas
    const nextCount = totalQuestions + 1;
    setTotalQuestions(nextCount);
    if (typeof window !== "undefined") {
      localStorage.setItem("hexacore_coach_total_questions", String(nextCount));
    }

    // Si hay un equipo activo, podemos inyectarle contexto al mensaje
    let richMessage = textToSend;
    if (currentTeam && currentTeam.length > 0) {
      const teamSpecies = currentTeam.map(p => p.species).join(", ");
      richMessage += `\n\n[Contexto del equipo del usuario actual: compuesto por ${teamSpecies}]`;
    }

    // Adaptar historial para la acción
    const history = updatedMessages.map(m => ({
      role: m.role === "assistant" ? "model" as const : m.role as "user" | "model" | "assistant",
      content: m.content
    }));

    const result = await chatAssistantAction(richMessage, history);

    if (result.success) {
      setMessages((prev) => [...prev, { role: "model", content: result.response }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: `⚠️ Error de Coach: ${result.error}` },
      ]);
    }
    setLoading(false);
  }

  const quickQuestions = [
    "¿Cómo venzo a Calyrex-Ice?",
    "¿Qué naturalezas me sugieres?",
    "Analiza la sinergia del equipo",
    "EVs óptimos para Flutter Mane"
  ];

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-[var(--accent)] text-[var(--accent-foreground)] 
                   w-14 h-14 border-4 ${activeTheme.borderClass} shadow-xl flex items-center justify-center 
                   hover:-translate-y-1 hover:translate-x-1 transition-transform cursor-pointer group`}
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <span className="absolute -top-2 -left-2 bg-[var(--danger)] text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-white">
          COACH
        </span>
      </button>

      {/* Backdrop del Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 transition-opacity"
        />
      )}

      {/* Contenedor del Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] z-50 bg-[var(--background)] border-l-8 
                   ${activeTheme.borderClass} shadow-2xl flex flex-col transition-transform duration-300 transform
                   ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className={`p-4 border-b-4 ${activeTheme.borderClass} flex justify-between items-center bg-black/20 shrink-0`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${activeTheme.accentClass}`} strokeWidth={2.5} />
            <h3 className={`font-black uppercase tracking-tighter text-lg ${activeTheme.textMainClass}`}>
              Coach Estratégico IA
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1.5 border-2 ${activeTheme.borderClass} ${activeTheme.cardBgClass}
                       hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                       transition-colors cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Modo Beta Neo-Brutalista */}
        <div className="bg-[#DFE104] text-black border-b-4 border-black px-4 py-2 flex justify-between items-center font-black text-[10px] uppercase tracking-widest shrink-0 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Beta Mode Active
          </span>
          <span className="bg-black text-white px-2 py-0.5 border border-black font-mono">
            Preguntas: {totalQuestions} / 5
          </span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[radial-gradient(var(--foreground)_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-95">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 shrink-0 border-2 ${activeTheme.borderClass} flex items-center justify-center
                             ${isUser ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "bg-zinc-800 text-zinc-200"}`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`border-4 ${activeTheme.borderClass} p-3.5 
                             ${isUser 
                               ? "bg-[var(--accent)]/10 text-[var(--foreground)] border-[var(--accent)]" 
                               : `${activeTheme.cardBgClass} ${activeTheme.textMainClass}`}`}
                >
                  {/* Quitar el marcador interno de contexto del equipo si es del usuario para limpieza visual */}
                  {formatMarkdown(msg.content.split("\n\n[Contexto del equipo")[0])}
                </div>
              </div>
            );
          })}

          {/* Loader */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 shrink-0 border-2 ${activeTheme.borderClass} bg-zinc-800 text-zinc-200 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className={`border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass} p-4 flex items-center gap-2`}>
                <Loader2 className={`w-4 h-4 animate-spin ${activeTheme.accentClass}`} strokeWidth={3} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.textMutedClass}`}>
                  El Coach está analizando...
                </span>
              </div>
            </div>
          )}

          {/* Límite Alcanzado Alert */}
          {totalQuestions >= 5 && (
            <div className="border-4 border-[var(--danger)] bg-[var(--danger)]/15 p-4 flex flex-col gap-2 items-center text-center animate-fade-in my-2">
              <span className="bg-[var(--danger)] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                LÍMITE ALCANZADO
              </span>
              <p className="text-xs font-black uppercase leading-tight text-[var(--foreground)]">
                Has consumido tus 5 consultas gratuitas del Coach de IA.
              </p>
              <p className="text-[10px] font-bold uppercase leading-normal text-zinc-400">
                La fase beta está limitada a 5 preguntas para optimizar recursos. ¡Consigue la versión Pro para análisis y estrategias ilimitadas!
              </p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Questions (Sugerencias) */}
        <div className={`px-4 pt-3 pb-1 border-t-2 ${activeTheme.borderClass} bg-black/10 shrink-0`}>
          <span className={`text-[8px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1.5`}>
            Preguntas Rápidas del Metajuego:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(undefined, q)}
                disabled={totalQuestions >= 5}
                className={`text-[8.5px] font-bold uppercase py-1 px-2 border border-[var(--foreground)]/10
                           hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]
                           transition-all rounded-none cursor-pointer ${activeTheme.cardBgClass} ${activeTheme.textMainClass}
                           disabled:opacity-30 disabled:pointer-events-none`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => handleSend(e)}
          className={`p-4 border-t-4 ${activeTheme.borderClass} flex gap-2 bg-black/20 shrink-0`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={totalQuestions >= 5 ? "Límite de beta alcanzado (5/5)..." : "Hazle una consulta estratégica al Coach..."}
            disabled={loading || totalQuestions >= 5}
            className={`flex-1 bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-2
                       text-xs font-bold outline-none placeholder:text-[var(--foreground)]/30 disabled:opacity-50`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || totalQuestions >= 5}
            className={`bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--accent)]
                       px-4 flex items-center justify-center font-black hover:bg-[var(--foreground)]
                       hover:text-[var(--background)] hover:border-[var(--foreground)] transition-none
                       disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
