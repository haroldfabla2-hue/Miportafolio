import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Terminal as TerminalIcon, Cpu, Shield, Layers, Download, Play,
  ArrowRight, CheckCircle2, Github, HelpCircle, ChevronDown,
  ChevronUp, RotateCcw, Monitor, RefreshCw, Lock, Sparkles
} from 'lucide-react';
import SEO from './SEO';

/* ─────────────────────── translations ─────────────────────── */
const translations: Record<string, Record<string, string>> = {
  es: {
    title: 'Silhouette Agency OS',
    subtitle: 'Sistema Operativo Cognitivo Autónomo para Agencias Creativas',
    tagline: 'Despliega enjambres de agentes de IA locales con memoria cuántica e integración continua en tu propia máquina.',
    downloadWin: 'Descargar para Windows',
    downloadWinDesc: 'Instalador NSIS (.exe) — v2.2.0 (x64)',
    viewCode: 'Ver Código en GitHub',
    warnings: 'Requisitos de instalación:',
    warningSmartScreen: "El instalador no está firmado. En Windows SmartScreen, haz clic en 'Más información' -> 'Ejecutar de todas formas'.",
    requirements: 'Requiere Windows 10/11, macOS 12+ o Ubuntu 22+.',
    terminalTitle: 'Terminal de Simulación Cognitiva',
    terminalPlaceholder: "Escribe 'help' y presiona Enter...",
    terminalWelcome: 'Bienvenido a la consola de Silhouette OS v2.2.0.\nEscribe \'help\' para ver los comandos disponibles.',
    swarmTitle: 'Simulador de Enjambres de Agentes',
    swarmDesc: "Presiona 'Ejecutar Enjambre' para ver cómo cooperan los agentes de desarrollo, packaging y telemetría de forma autónoma.",
    runSwarm: 'Ejecutar Enjambre',
    swarmActive: 'Enjambre Activo...',
    calTitle: 'Calibrador de Hardware',
    calDesc: 'Verifica si tu máquina local está optimizada para ejecutar los LLMs locales recomendados.',
    cpuCores: 'Núcleos CPU',
    ramSize: 'RAM del Sistema',
    runCal: 'Analizar Setup',
    featuresTitle: 'Capacidades Principales',
    feature1: 'Orquestación de Enjambres',
    feature1Desc: 'Agentes especializados colaborando de forma autónoma con bucles OODA independientes.',
    feature2: 'Memoria Híbrida de 4 Niveles',
    feature2Desc: 'Memoria de grafos vectorizada con fallback automático a SQLite local sin interrupción.',
    feature3: 'Entorno Python Portátil',
    feature3Desc: 'Virtualenv local autogestionado con dependencias de IA preconfiguradas sin necesidad de setup.',
    feature4: 'Telemetría Opt-In',
    feature4Desc: 'Tracking con privacidad primero. Buffer en SQLite y sanitización automática de datos personales.',
    faqTitle: 'Preguntas Frecuentes',
    faq1: '¿Funciona 100% sin conexión?',
    faq1Ans: 'Sí. Silhouette Agency OS está diseñado para ejecutarse completamente de forma local. Orquesta LLMs locales a través de Ollama y utiliza SQLite local para el fallback de base de datos y archivos de índice de memoria vectorial.',
    faq2: '¿Qué hace el instalador de Windows?',
    faq2Ans: "El asistente de instalación NSIS registra el protocolo seguro 'silhouette://', inicializa la estructura de carpetas de trabajo en AppData, copia dependencias y genera accesos directos en el escritorio.",
    faq3: '¿La telemetría es segura?',
    faq3Ans: 'Sí. La telemetría es estrictamente opt-in y anónima. Elimina automáticamente emails, tokens, contraseñas y rutas de archivos. Puedes inspeccionar tu buffer de eventos sin procesar y purgarlo en cualquier momento desde Configuración.',
    faq4: '¿Cómo funciona la auto-evolución?',
    faq4Ans: 'Opcionalmente configura un token de GitHub. El sistema auto-corrige errores de ejecución, escribe tests unitarios, redacta PRs a su propio repositorio y dispara releases via CI/CD automáticamente.',
    backToProjects: '← Volver a Proyectos',
    helpOutput: `Comandos disponibles:
  help        — Muestra esta ayuda
  /swarm      — Estado del enjambre
  /memory     — Diagnóstico de memoria
  /hardware   — Info de hardware
  /clear      — Limpiar consola`,
    swarmOutput: `[enjambre] Agentes activos: 4
  → product-agent    : en línea ✓
  → packaging-agent  : en línea ✓
  → telemetry-agent  : en línea ✓
  → memory-agent     : en línea ✓
  Latencia promedio del bucle OODA: 120ms`,
    memoryOutput: `[memoria] Diagnóstico de memoria híbrida:
  Nivel-0  Caché en caliente   : 128 entradas
  Nivel-1  Grafo vectorial     : 2.048 nodos
  Nivel-2  SQLite local        : operativo
  Nivel-3  Archivo frío        : 14 instantáneas
  Estado: sincronizado ✓`,
    hardwareOutput: `[hardware] Detección de entorno:
  CPU      : 8 núcleos (x86_64)
  RAM      : 16 GB
  GPU      : Detectada (CUDA 12.x)
  Ollama   : v0.4.7 en ejecución
  Python   : 3.11.9 (entorno virtual)
  Estado   : listo para producción ✓`,
    unknownCmd: 'Comando no reconocido. Escribe \'help\' para ver los comandos disponibles.',
    swarmStep1: '[product-agent] Analizando backlog del sprint…',
    swarmStep2: '[packaging-agent] Construyendo artefactos de release…',
    swarmStep3: '[telemetry-agent] Recolectando métricas anónimas…',
    swarmStep4: '[memory-agent] Sincronizando grafo vectorial…',
    swarmStep5: '[orquestador] Enjambre completado — ciclo OODA 142ms ✓',
    calResultGood: '✓ Tu configuración está lista para modelos 7B–13B con rendimiento óptimo.',
    calResultMedium: '⚠ Puedes ejecutar modelos 7B. Considera más RAM para 13B+.',
    calResultLow: '✗ Configuración limitada. Se recomienda ≥8 núcleos y ≥16 GB de RAM.',
  },
  en: {
    title: 'Silhouette Agency OS',
    subtitle: 'Autonomous Cognitive Operating System for Creative Agencies',
    tagline: 'Deploy local AI agent swarms with quantum memory and continuous integration on your own machine.',
    downloadWin: 'Download for Windows',
    downloadWinDesc: 'NSIS Installer (.exe) — v2.2.0 (x64)',
    viewCode: 'View Source on GitHub',
    warnings: 'Installation requirements:',
    warningSmartScreen: "The installer is unsigned. On Windows SmartScreen, click 'More info' -> 'Run anyway'.",
    requirements: 'Requires Windows 10/11, macOS 12+ or Ubuntu 22+.',
    terminalTitle: 'Cognitive Simulation Terminal',
    terminalPlaceholder: "Type 'help' and press Enter...",
    terminalWelcome: "Welcome to Silhouette OS v2.2.0 console.\nType 'help' for available commands.",
    swarmTitle: 'Agent Swarm Simulator',
    swarmDesc: "Click 'Run Swarm' to witness how product, packaging, and telemetry agents collaborate autonomously.",
    runSwarm: 'Run Swarm',
    swarmActive: 'Swarm Active...',
    calTitle: 'Hardware Calibrator',
    calDesc: 'Check if your local machine is optimized to run recommended local LLMs.',
    cpuCores: 'CPU Cores',
    ramSize: 'System RAM',
    runCal: 'Analyze Setup',
    featuresTitle: 'Core Capabilities',
    feature1: 'Swarm Orchestration',
    feature1Desc: 'Specialized agents collaborating autonomously with independent OODA loops.',
    feature2: '4-Tier Hybrid Memory',
    feature2Desc: 'Vectorized graph memory with automatic zero-downtime local SQLite fallback.',
    feature3: 'Portable Python Env',
    feature3Desc: 'Self-managed local virtualenv with zero-configuration AI dependencies.',
    feature4: 'Opt-In Telemetry',
    feature4Desc: 'Privacy-first tracking. SQLite buffering and automatic personal data sanitization.',
    faqTitle: 'Frequently Asked Questions',
    faq1: 'Does it work 100% offline?',
    faq1Ans: 'Yes. Silhouette Agency OS is built to run entirely locally. It orchestrates local LLMs via Ollama and utilizes local SQLite for database fallback and vector memory index files.',
    faq2: 'What does the Windows installer do?',
    faq2Ans: "The NSIS installation wizard registers the secure 'silhouette://' protocol, initializes your AppData working folder structure, copies dependencies, and generates desktop shortcuts.",
    faq3: 'Is the telemetry safe?',
    faq3Ans: 'Yes. Telemetry is strictly opt-in and anonymous. It automatically redacts emails, tokens, passwords, and file paths. You can inspect your raw event buffer and purge it at any time in Settings.',
    faq4: 'How does auto-evolution work?',
    faq4Ans: 'Optionally configure a GitHub token. The system auto-corrects runtime errors, writes unit tests, drafts PRs to its own repository, and triggers releases via CI/CD automatically.',
    backToProjects: '← Back to Projects',
    helpOutput: `Available commands:
  help        — Show this help
  /swarm      — Swarm status
  /memory     — Memory diagnostics
  /hardware   — Hardware info
  /clear      — Clear console`,
    swarmOutput: `[swarm] Active agents: 4
  → product-agent    : online ✓
  → packaging-agent  : online ✓
  → telemetry-agent  : online ✓
  → memory-agent     : online ✓
  Average OODA loop latency: 120ms`,
    memoryOutput: `[memory] Hybrid memory diagnostics:
  Tier-0  Hot cache          : 128 entries
  Tier-1  Vector graph       : 2,048 nodes
  Tier-2  Local SQLite       : operational
  Tier-3  Cold archive       : 14 snapshots
  Status: synchronized ✓`,
    hardwareOutput: `[hardware] Environment detection:
  CPU      : 8 cores (x86_64)
  RAM      : 16 GB
  GPU      : Detected (CUDA 12.x)
  Ollama   : v0.4.7 running
  Python   : 3.11.9 (virtual env)
  Status   : production-ready ✓`,
    unknownCmd: "Unknown command. Type 'help' for available commands.",
    swarmStep1: '[product-agent] Analyzing sprint backlog…',
    swarmStep2: '[packaging-agent] Building release artifacts…',
    swarmStep3: '[telemetry-agent] Collecting anonymous metrics…',
    swarmStep4: '[memory-agent] Syncing vector graph…',
    swarmStep5: '[orchestrator] Swarm completed — OODA cycle 142ms ✓',
    calResultGood: '✓ Your setup is ready for 7B–13B models with optimal performance.',
    calResultMedium: '⚠ You can run 7B models. Consider more RAM for 13B+.',
    calResultLow: '✗ Limited setup. ≥8 cores and ≥16 GB RAM recommended.',
  },
};

/* ─────────────────────── component ─────────────────────── */
const SilhouettePage: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('es') ? 'es' : 'en';
  const t = translations[lang];

  /* ── terminal state ── */
  const [terminalLines, setTerminalLines] = useState<string[]>([t.terminalWelcome]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  /* ── swarm state ── */
  const [swarmRunning, setSwarmRunning] = useState(false);
  const [swarmSteps, setSwarmSteps] = useState<string[]>([]);

  /* ── calibrator state ── */
  const [cpuCores, setCpuCores] = useState(8);
  const [ram, setRam] = useState(16);
  const [calResult, setCalResult] = useState<string | null>(null);

  /* ── FAQ state ── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* ── scroll terminal to bottom ── */
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  /* ── reset terminal welcome when language changes ── */
  useEffect(() => {
    setTerminalLines([t.terminalWelcome]);
  }, [lang]);

  /* ─────── terminal handler ─────── */
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;
    const prompt = `silhouette@os:~$ ${terminalInput}`;
    let output = '';

    switch (cmd) {
      case 'help':
        output = t.helpOutput;
        break;
      case '/swarm':
        output = t.swarmOutput;
        break;
      case '/memory':
        output = t.memoryOutput;
        break;
      case '/hardware':
        output = t.hardwareOutput;
        break;
      case '/clear':
        setTerminalLines([t.terminalWelcome]);
        setTerminalInput('');
        return;
      default:
        output = t.unknownCmd;
    }
    setTerminalLines((prev) => [...prev, prompt, output]);
    setTerminalInput('');
  };

  /* ─────── swarm handler ─────── */
  const runSwarm = () => {
    if (swarmRunning) return;
    setSwarmRunning(true);
    setSwarmSteps([]);
    const steps = [t.swarmStep1, t.swarmStep2, t.swarmStep3, t.swarmStep4, t.swarmStep5];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setSwarmSteps((prev) => [...prev, step]);
        if (i === steps.length - 1) setSwarmRunning(false);
      }, (i + 1) * 900);
    });
  };

  /* ─────── calibrator handler ─────── */
  const runCalibrator = () => {
    if (cpuCores >= 8 && ram >= 16) {
      setCalResult(t.calResultGood);
    } else if (cpuCores >= 4 && ram >= 8) {
      setCalResult(t.calResultMedium);
    } else {
      setCalResult(t.calResultLow);
    }
  };

  /* ─────── FAQ data ─────── */
  const faqs = [
    { q: t.faq1, a: t.faq1Ans },
    { q: t.faq2, a: t.faq2Ans },
    { q: t.faq3, a: t.faq3Ans },
    { q: t.faq4, a: t.faq4Ans },
  ];

  /* ─────── feature cards data ─────── */
  const features = [
    { icon: <Layers size={28} />, title: t.feature1, desc: t.feature1Desc },
    { icon: <Cpu size={28} />, title: t.feature2, desc: t.feature2Desc },
    { icon: <Monitor size={28} />, title: t.feature3, desc: t.feature3Desc },
    { icon: <Shield size={28} />, title: t.feature4, desc: t.feature4Desc },
  ];

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <>
      <SEO
        title="Silhouette Agency OS — Alberto Farah"
        description={t.subtitle}
      />

      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          color: '#ffffff',
          fontFamily: 'var(--font-family)',
          paddingTop: '150px',
          paddingBottom: '100px',
        }}
      >
        {/* ── container ── */}
        <div
          style={{
            maxWidth: 'var(--spacing-container)',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* ── back link ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '48px' }}
          >
            <Link
              to="/projects"
              style={{
                color: '#999',
                textDecoration: 'none',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A3FF00')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
            >
              {t.backToProjects}
            </Link>
          </motion.div>

          {/* ════════════════ HERO ════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              textAlign: 'center',
              marginBottom: '80px',
            }}
          >
            {/* logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ marginBottom: '32px' }}
            >
              <img
                src="/logo/isotipo-oscuro.png"
                alt="Silhouette Logo"
                style={{
                  width: '90px',
                  height: '90px',
                  margin: '0 auto',
                  filter: 'drop-shadow(0 0 24px rgba(163,255,0,0.4))',
                  display: 'block',
                }}
              />
            </motion.div>

            <h1
              style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                marginBottom: '16px',
                color: '#ffffff',
                letterSpacing: '-0.03em',
              }}
            >
              {t.title}
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                color: '#A3FF00',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              {t.subtitle}
            </p>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#999',
                maxWidth: '680px',
                margin: '0 auto 40px auto',
                lineHeight: 1.7,
              }}
            >
              {t.tagline}
            </p>

            {/* CTA row */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '24px',
              }}
            >
              {/* primary download */}
              <motion.a
                href="https://github.com/albertofarah/silhouette-agency-os/releases/latest/download/SilhouetteAgencyOS-Setup-2.2.0.exe"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 32px',
                  background: '#A3FF00',
                  color: '#111111',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#8FE000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#A3FF00')}
              >
                <Download size={18} />
                {t.downloadWin}
              </motion.a>

              {/* secondary github */}
              <motion.a
                href="https://github.com/albertofarah/silhouette-agency-os"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 32px',
                  background: 'transparent',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#A3FF00')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
              >
                <Github size={18} />
                {t.viewCode}
              </motion.a>
            </div>

            {/* download description */}
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
              {t.downloadWinDesc}
            </p>

            {/* warnings */}
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'left',
                background: 'rgba(163,255,0,0.05)',
                border: '1px solid rgba(163,255,0,0.15)',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <p style={{ color: '#A3FF00', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                {t.warnings}
              </p>
              <p style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '4px' }}>
                • {t.warningSmartScreen}
              </p>
              <p style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.6 }}>
                • {t.requirements}
              </p>
            </div>
          </motion.section>

          {/* ════════════════ TERMINAL ════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '80px' }}
          >
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
              }}
            >
              <TerminalIcon size={22} style={{ color: '#A3FF00' }} />
              {t.terminalTitle}
            </h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
              {t.terminalPlaceholder}
            </p>

            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 0 40px rgba(163,255,0,0.06)',
              }}
            >
              {/* title bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderBottom: '1px solid #222',
                  background: '#0f0f0f',
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: '12px', color: '#666', fontSize: '0.8rem' }}>
                  silhouette-os — v2.2.0
                </span>
              </div>

              {/* output area */}
              <div
                style={{
                  padding: '16px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                }}
              >
                {terminalLines.map((line, i) => (
                  <pre
                    key={i}
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: line.startsWith('silhouette@os') ? '#A3FF00' : '#ccc',
                    }}
                  >
                    {line}
                  </pre>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* input area */}
              <form
                onSubmit={handleTerminalSubmit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderTop: '1px solid #222',
                  padding: '12px 16px',
                }}
              >
                <span
                  style={{
                    color: '#A3FF00',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '0.85rem',
                    marginRight: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  silhouette@os:~$
                </span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder={t.terminalPlaceholder}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '0.85rem',
                    caretColor: '#A3FF00',
                  }}
                />
              </form>
            </div>
          </motion.section>

          {/* ════════════════ SWARM SIMULATOR ════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '80px' }}
          >
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
              }}
            >
              <RefreshCw size={22} style={{ color: '#A3FF00' }} />
              {t.swarmTitle}
            </h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
              {t.swarmDesc}
            </p>

            <div
              style={{
                background: 'rgba(26,26,26,0.8)',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '32px',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* run button */}
              <motion.button
                onClick={runSwarm}
                disabled={swarmRunning}
                whileHover={!swarmRunning ? { scale: 1.04 } : {}}
                whileTap={!swarmRunning ? { scale: 0.97 } : {}}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  background: swarmRunning ? '#333' : '#A3FF00',
                  color: swarmRunning ? '#999' : '#111111',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: swarmRunning ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-family)',
                  transition: 'background 0.2s ease',
                  marginBottom: '24px',
                }}
                onMouseEnter={(e) => {
                  if (!swarmRunning) e.currentTarget.style.background = '#8FE000';
                }}
                onMouseLeave={(e) => {
                  if (!swarmRunning) e.currentTarget.style.background = '#A3FF00';
                }}
              >
                {swarmRunning ? (
                  <>
                    <RotateCcw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {t.swarmActive}
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    {t.runSwarm}
                  </>
                )}
              </motion.button>

              {/* swarm steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence>
                  {swarmSteps.map((step, i) => {
                    const isLast = i === swarmSteps.length - 1 && !swarmRunning;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          fontSize: '0.85rem',
                          color: isLast ? '#A3FF00' : '#ccc',
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isLast ? '#A3FF00' : 'rgba(163,255,0,0.4)',
                            boxShadow: isLast ? '0 0 8px rgba(163,255,0,0.6)' : 'none',
                            flexShrink: 0,
                          }}
                        />
                        {step}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>

          {/* ════════════════ HARDWARE CALIBRATOR ════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '80px' }}
          >
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
              }}
            >
              <Cpu size={22} style={{ color: '#A3FF00' }} />
              {t.calTitle}
            </h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
              {t.calDesc}
            </p>

            <div
              style={{
                background: 'rgba(26,26,26,0.8)',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '32px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                  marginBottom: '24px',
                }}
              >
                {/* CPU select */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#999',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t.cpuCores}
                  </label>
                  <select
                    value={cpuCores}
                    onChange={(e) => {
                      setCpuCores(Number(e.target.value));
                      setCalResult(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-family)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {[2, 4, 6, 8, 10, 12, 16, 24, 32, 64].map((v) => (
                      <option key={v} value={v}>
                        {v} {lang === 'es' ? 'núcleos' : 'cores'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RAM select */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#999',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t.ramSize}
                  </label>
                  <select
                    value={ram}
                    onChange={(e) => {
                      setRam(Number(e.target.value));
                      setCalResult(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-family)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {[4, 8, 16, 32, 64, 128].map((v) => (
                      <option key={v} value={v}>
                        {v} GB
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* analyze button */}
              <motion.button
                onClick={runCalibrator}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  background: '#A3FF00',
                  color: '#111111',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#8FE000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#A3FF00')}
              >
                <Sparkles size={16} />
                {t.runCal}
              </motion.button>

              {/* result */}
              <AnimatePresence>
                {calResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      marginTop: '20px',
                      padding: '16px 20px',
                      background: calResult.startsWith('✓')
                        ? 'rgba(163,255,0,0.08)'
                        : calResult.startsWith('⚠')
                        ? 'rgba(255,200,0,0.08)'
                        : 'rgba(255,80,80,0.08)',
                      border: `1px solid ${
                        calResult.startsWith('✓')
                          ? 'rgba(163,255,0,0.25)'
                          : calResult.startsWith('⚠')
                          ? 'rgba(255,200,0,0.25)'
                          : 'rgba(255,80,80,0.25)'
                      }`,
                      borderRadius: '8px',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: '0.88rem',
                      color: calResult.startsWith('✓')
                        ? '#A3FF00'
                        : calResult.startsWith('⚠')
                        ? '#ffc800'
                        : '#ff5050',
                      lineHeight: 1.6,
                    }}
                  >
                    {calResult}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* ════════════════ FEATURES ════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '80px' }}
          >
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                marginBottom: '32px',
                color: '#ffffff',
              }}
            >
              {t.featuresTitle}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -4, borderColor: 'rgba(163,255,0,0.4)' }}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '28px',
                    transition: 'border-color 0.3s ease, transform 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: 'rgba(163,255,0,0.1)',
                      border: '1px solid rgba(163,255,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#A3FF00',
                      marginBottom: '16px',
                    }}
                  >
                    {feat.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '8px',
                      color: '#ffffff',
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#999',
                      lineHeight: 1.6,
                    }}
                  >
                    {feat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ════════════════ FAQ ════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
              }}
            >
              <HelpCircle size={22} style={{ color: '#A3FF00' }} />
              {t.faqTitle}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    style={{
                      background: '#1a1a1a',
                      border: `1px solid ${isOpen ? 'rgba(163,255,0,0.3)' : '#333'}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'border-color 0.3s ease',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-family)',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#ffffff',
                        }}
                      >
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={20} style={{ color: '#A3FF00', flexShrink: 0, marginLeft: '12px' }} />
                      ) : (
                        <ChevronDown size={20} style={{ color: '#666', flexShrink: 0, marginLeft: '12px' }} />
                      )}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p
                            style={{
                              padding: '0 24px 20px 24px',
                              color: '#999',
                              fontSize: '0.92rem',
                              lineHeight: 1.7,
                              margin: 0,
                            }}
                          >
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>

      {/* ── global keyframe for spinner ── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default SilhouettePage;
