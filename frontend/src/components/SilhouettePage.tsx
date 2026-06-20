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

// Local translations helper to keep the component plug-and-play
const translations = {
    es: {
        title: "Silhouette Agency OS",
        subtitle: "Sistema Operativo Cognitivo Autónomo para Agencias Creativas",
        tagline: "Despliega enjambres de agentes de IA locales con memoria cuántica e integración continua en tu propia máquina.",
        downloadWin: "Descargar para Windows",
        downloadWinDesc: "Instalador NSIS (.exe) — v2.2.0 (x64)",
        viewCode: "Ver Código en GitHub",
        warnings: "Requisitos de instalación:",
        warningSmartScreen: "El instalador no está firmado. En Windows SmartScreen, haz clic en 'Más información' -> 'Ejecutar de todas formas'.",
        requirements: "Requiere Windows 10/11, macOS 12+ o Ubuntu 22+.",
        
        terminalTitle: "Terminal de Simulación Cognitiva",
        terminalPlaceholder: "Escribe 'help' y presiona Enter...",
        terminalWelcome: "Bienvenido a la consola de Silhouette OS v2.2.0.\nEscribe 'help' para ver los comandos disponibles.",
        
        swarmTitle: "Simulador de Enjambres de Agentes",
        swarmDesc: "Presiona 'Ejecutar Enjambre' para ver cómo cooperan los agentes de desarrollo, packaging y telemetría de forma autónoma.",
        runSwarm: "Ejecutar Enjambre",
        swarmActive: "Enjambre Activo...",
        
        calTitle: "Calibrador de Hardware",
        calDesc: "Evalúa si tu hardware local puede ejecutar los modelos de lenguaje locales recomendados.",
        cpuCores: "Núcleos del CPU",
        ramSize: "Memoria RAM",
        runCal: "Analizar Equipo",
        
        featuresTitle: "Características Principales",
        feature1: "Orquestación de Enjambres",
        feature1Desc: "Agentes especializados cooperando autónomamente con loops OODA individuales.",
        feature2: "Memoria de 4 Capas",
        feature2Desc: "Base de datos de grafos vectorizados con respaldo local en SQLite (Zero-Downtime).",
        feature3: "Entorno Python Portable",
        feature3Desc: "Virtualenv local autogestionado sin configuración previa de dependencias de IA.",
        feature4: "Telemetría Anónima Opt-in",
        feature4Desc: "Privacidad absoluta. Ingesta local en SQLite y sanitización de datos personales.",

        faqTitle: "Preguntas Frecuentes",
        faq1: "¿Funciona 100% sin internet?",
        faq1Ans: "Sí. Silhouette Agency OS está diseñado para ser completamente local. Puede orquestar modelos de LLM locales mediante Ollama y utiliza SQLite local para su memoria de grafos y almacenamiento.",
        faq2: "¿Qué hace el instalador de Windows?",
        faq2Ans: "El asistente de instalación (NSIS) registra el protocolo seguro 'silhouette://', asienta la estructura de directorios en AppData, instala la app en tu sistema y crea los accesos directos necesarios.",
        faq3: "¿Es segura la telemetría?",
        faq3Ans: "Totalmente. La telemetría es anónima y requiere consentimiento explícito (opt-in). Elimina automáticamente correos, contraseñas, tokens y rutas de archivos locales antes de guardar nada. Puedes auditar, exportar y borrar tus datos desde la configuración.",
        faq4: "¿Cómo funciona la auto-evolución?",
        faq4Ans: "Si lo deseas, puedes conectar tu token de GitHub. La app se auto-corrige, genera pull requests con mejoras en su propio código y automatiza lanzamientos mediante GitHub Actions."
    },
    en: {
        title: "Silhouette Agency OS",
        subtitle: "Autonomous Cognitive Operating System for Creative Agencies",
        tagline: "Deploy local AI agent swarms with cognitive memory and automated CI/CD releases directly on your machine.",
        downloadWin: "Download for Windows",
        downloadWinDesc: "NSIS Installer (.exe) — v2.2.0 (x64)",
        viewCode: "View Code on GitHub",
        warnings: "Installation Notes:",
        warningSmartScreen: "Installer is unsigned. On Windows SmartScreen, click 'More Info' -> 'Run anyway'.",
        requirements: "Requires Windows 10/11, macOS 12+, or Ubuntu 22+.",
        
        terminalTitle: "Cognitive Simulation Console",
        terminalPlaceholder: "Type 'help' and press Enter...",
        terminalWelcome: "Welcome to Silhouette OS v2.2.0 console.\nType 'help' to list available commands.",
        
        swarmTitle: "Agent Swarm Simulator",
        swarmDesc: "Click 'Run Swarm' to witness how product, packaging, and telemetry agents collaborate autonomously.",
        runSwarm: "Run Swarm",
        swarmActive: "Swarm Active...",
        
        calTitle: "Hardware Calibrator",
        calDesc: "Check if your local machine is optimized to run recommended local LLMs.",
        cpuCores: "CPU Cores",
        ramSize: "System RAM",
        runCal: "Analyze Setup",
        
        featuresTitle: "Core Capabilities",
        feature1: "Swarm Orchestration",
        feature1Desc: "Specialized agents collaborating autonomously with independent OODA loops.",
        feature2: "4-Tier Hybrid Memory",
        feature2Desc: "Vectorized graph memory with automatic zero-downtime local SQLite fallback.",
        feature3: "Portable Python Env",
        feature3Desc: "Self-managed local virtualenv with zero-configuration AI dependencies.",
        feature4: "Opt-In Telemetry",
        feature4Desc: "Privacy-first tracking. SQLite buffering and automatic personal data sanitization.",

        faqTitle: "Frequently Asked Questions",
        faq1: "Does it work 100% offline?",
        faq1Ans: "Yes. Silhouette Agency OS is built to run entirely locally. It orchestrates local LLMs via Ollama and utilizes local SQLite for database fallback and vector memory index files.",
        faq2: "What does the Windows installer do?",
        faq2Ans: "The NSIS installation wizard registers the secure 'silhouette://' protocol, initializes your AppData working folder structure, copies dependencies, and generates desktop shortcuts.",
        faq3: "Is the telemetry safe?",
        faq3Ans: "Yes. Telemetry is strictly opt-in and anonymous. It automatically redacts emails, tokens, passwords, and file paths. You can inspect your raw event buffer and purge it at any time in Settings.",
        faq4: "How does auto-evolution work?",
        faq4Ans: "Optionally configure a GitHub token. The system auto-corrects runtime errors, writes unit tests, drafts PRs to its own repository, and triggers releases via CI/CD automatically."
    }
};

const SilhouettePage: React.FC = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language && i18n.language.startsWith('es') ? 'es' : 'en';
    const text = translations[currentLang];

    // Terminal State
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState<string[]>([text.terminalWelcome]);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Swarm Simulator State
    const [swarmStep, setSwarmStep] = useState<number>(0); // 0: Idle, 1: PM, 2: Dev, 3: Telemetry, 4: Done
    const [swarmLog, setSwarmLog] = useState<string[]>([]);
    const [isSwarmRunning, setIsSwarmRunning] = useState(false);

    // Hardware Calculator State
    const [cpuCores, setCpuCores] = useState<number>(8);
    const [ramSize, setRamSize] = useState<number>(16);
    const [calResult, setCalResult] = useState<{ recommendation: string; details: string } | null>(null);

    // FAQ Accordion State
    const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalHistory]);

    // Terminal Commands Executor
    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = terminalInput.trim().toLowerCase();
        if (!cmd) return;

        let response = '';
        if (cmd === 'help') {
            response = currentLang === 'es' 
                ? "Comandos disponibles:\n  /swarm     - Simula el inicio del enjambre de agentes.\n  /memory    - Prueba la velocidad de recuperación de memoria.\n  /hardware  - Muestra el perfil de calibración actual.\n  /clear     - Limpia la consola de logs."
                : "Available commands:\n  /swarm     - Simulates starting up the agent swarm.\n  /memory    - Tests semantic memory retrieval speeds.\n  /hardware  - Displays current hardware calibration profile.\n  /clear     - Clears the console window logs.";
        } else if (cmd === '/swarm') {
            response = currentLang === 'es'
                ? "🪐 [Kernel] Inicializando Enjambre de Agentes...\n👥 Orquestador: Activo.\n🔧 Dev Agent: Conectado a Git.\n📊 Telemetry Agent: Consentimiento validado.\n✅ Enjambre listo. Utiliza la sección del simulador abajo para ver la interacción visual."
                : "🪐 [Kernel] Initializing Agent Swarm...\n👥 Orchestrator: Active.\n🔧 Dev Agent: Linked to Git.\n📊 Telemetry Agent: Consent verified.\n✅ Swarm ready. Use the simulator panel below to watch the visual flow.";
        } else if (cmd === '/memory') {
            response = currentLang === 'es'
                ? "🧠 [Continuum Memory] Consultando base de datos local...\n🔍 Buscando similitud semántica para 'ci/cd workflows'\n💾 Fallback SQLite activo (Neo4j offline)\n⚡ Coincidencia encontrada: 98% en 2.4ms.\n📦 Registro devuelto: 'release.yml template'."
                : "🧠 [Continuum Memory] Querying local database...\n🔍 Checking semantic similarity for 'ci/cd workflows'\n💾 SQLite Fallback active (Neo4j offline)\n⚡ Match found: 98% in 2.4ms.\n📦 Result returned: 'release.yml template'.";
        } else if (cmd === '/hardware') {
            response = currentLang === 'es'
                ? "🖥️ [Diagnostics] Leyendo especificaciones...\n⚙️ CPU: 8 Cores detectados.\n📊 RAM: 16 GB detectados.\n🔋 Calibración: Sugiriendo Mamba o Gemma 2B para evitar OOM de CUDA."
                : "🖥️ [Diagnostics] Inspecting hardware specifications...\n⚙️ CPU: 8 Cores detected.\n📊 RAM: 16 GB detected.\n🔋 Calibration: Suggesting Mamba or Gemma 2B to prevent CUDA Out-Of-Memory.";
        } else if (cmd === '/clear') {
            setTerminalHistory([]);
            setTerminalInput('');
            return;
        } else {
            response = currentLang === 'es'
                ? `Consola: Comando '${cmd}' no reconocido. Escribe 'help' para ver la lista.`
                : `Console: Command '${cmd}' not recognized. Type 'help' for options.`;
        }

        setTerminalHistory(prev => [...prev, `guest@silhouette-os:~$ ${terminalInput}`, response]);
        setTerminalInput('');
    };

    // Run Swarm Simulation
    const runSwarmSimulation = async () => {
        if (isSwarmRunning) return;
        setIsSwarmRunning(true);
        setSwarmStep(1);
        
        const logs = currentLang === 'es' ? [
            "🤖 [Product Manager]: Leyendo especificaciones del Brief...",
            "📋 [Product Manager]: Generando PR Spec para la automatización del release...",
            "🚀 [Developer]: PR recibido. Modificando package.json y electron.cjs...",
            "⚙️ [Developer]: Compilando bundle de TypeScript y ejecutando typecheck...",
            "📦 [Developer]: Empaquetando instalador con Electron-Builder...",
            "📊 [Telemetry]: Registrando evento 'setup.completed' de forma anónima...",
            "🔒 [Telemetry]: Sanitizando dirección IP y rutas locales... [OK]",
            "🎉 [Kernel]: ¡PR fusionado y desplegado de forma autónoma!"
        ] : [
            "🤖 [Product Manager]: Reading specification requirements from Brief...",
            "📋 [Product Manager]: Generating PR Spec for release automation...",
            "🚀 [Developer]: PR received. Updating package.json and electron.cjs...",
            "⚙️ [Developer]: Building TypeScript bundles and compiling types...",
            "📦 [Developer]: Packaging installer binary via Electron-Builder...",
            "📊 [Telemetry]: Tracking 'setup.completed' event anonymously...",
            "🔒 [Telemetry]: Sanitizing IP address and local file paths... [OK]",
            "🎉 [Kernel]: PR merged and deployed autonomously!"
        ];

        setSwarmLog([logs[0]]);
        await new Promise(r => setTimeout(r, 1200));
        
        setSwarmStep(2);
        setSwarmLog(prev => [...prev, logs[1], logs[2]]);
        await new Promise(r => setTimeout(r, 1500));
        
        setSwarmStep(3);
        setSwarmLog(prev => [...prev, logs[3], logs[4], logs[5]]);
        await new Promise(r => setTimeout(r, 1500));
        
        setSwarmStep(4);
        setSwarmLog(prev => [...prev, logs[6], logs[7]]);
        setIsSwarmRunning(false);
    };

    // Calculate Hardware
    const handleCalculate = () => {
        let recommendation = '';
        let details = '';

        if (ramSize >= 32 && cpuCores >= 12) {
            recommendation = "Llama 3 8B / Qwen 14B (High Cognition)";
            details = currentLang === 'es'
                ? "¡Excelente setup! Tu equipo tiene suficiente VRAM y capacidad multihilo para orquestar enjambres pesados con tiempos de respuesta óptimos (<1.5s/token)."
                : "Excellent setup! Your system has plenty of RAM and multi-threaded CPU capacity to run large cognitive swarms with optimal speeds (<1.5s/token).";
        } else if (ramSize >= 16) {
            recommendation = "Llama 3.2 3B / DeepSeek 7B (Standard Performance)";
            details = currentLang === 'es'
                ? "Calibración recomendada. Tu hardware ejecutará modelos medianos con excelente precisión en tareas de desarrollo y redacción sin saturar la memoria."
                : "Balanced calibration. Your hardware will run medium LLMs with high accuracy in coding and writing tasks without saturating system memory.";
        } else {
            recommendation = "Gemma 2B / Mamba-2.8B (Lightweight Core)";
            details = currentLang === 'es'
                ? "Calibración ligera. Adecuado para un uso responsivo y sin latencia. Sugerimos usar modelos de menos de 3 mil millones de parámetros para evitar VRAM Out-Of-Memory."
                : "Lightweight calibration. Optimized for responsive operation. We suggest LLMs under 3B parameters to bypass VRAM Out-Of-Memory limits.";
        }

        setCalResult({ recommendation, details });
    };

    const toggleFaq = (index: number) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-white relative overflow-hidden font-sans pb-20">
            <SEO title="Silhouette OS" description={text.subtitle} />

            {/* Background Glow Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Back Link */}
                <div className="pt-8">
                    <Link 
                        to="/projects" 
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-wider"
                    >
                        <span>←</span> Return to Projects
                    </Link>
                </div>

                {/* Hero / Header Section */}
                <header className="text-center mt-12 mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="w-24 h-24 mx-auto mb-6 relative"
                    >
                        <img 
                            src="/logo/isotipo-oscuro.png" 
                            alt="Silhouette Logo" 
                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                        />
                        <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-pulse pointer-events-none" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400"
                    >
                        {text.title}
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-lg md:text-xl font-medium text-cyan-400/90 mb-4"
                    >
                        {text.subtitle}
                    </motion.p>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-sm md:text-base text-slate-400 leading-relaxed mb-8"
                    >
                        {text.tagline}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        {/* Download Installer Button */}
                        <a 
                            href="https://github.com/haroldfabla2-hue/Silhouette-Agency-OS-OpenSource/releases/latest" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-cyan-400/20"
                        >
                            <Download size={16} />
                            <div className="text-left">
                                <div className="font-extrabold leading-none">{text.downloadWin}</div>
                                <span className="text-[10px] text-cyan-200 font-medium block mt-1">{text.downloadWinDesc}</span>
                            </div>
                        </a>

                        {/* View Source Code Button */}
                        <a 
                            href="https://github.com/haroldfabla2-hue/Silhouette-Agency-OS-OpenSource" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 hover:text-white font-bold text-sm border border-slate-800 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md"
                        >
                            <Github size={16} />
                            <span>{text.viewCode}</span>
                        </a>
                    </motion.div>

                    {/* SmartScreen Alert Helper */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-900 text-[11px] text-slate-500 max-w-lg mx-auto leading-normal"
                    >
                        <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                            ⚠️ {text.warnings}
                        </div>
                        <p className="mb-1">{text.warningSmartScreen}</p>
                        <p>{text.requirements}</p>
                    </motion.div>
                </header>

                {/* Main Interactive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                    {/* Interactive Console Console (Left Column) */}
                    <div className="lg:col-span-7 flex flex-col">
                        <div className="flex-1 rounded-2xl bg-zinc-950/85 border border-zinc-800/60 shadow-2xl p-6 font-mono text-xs flex flex-col min-h-[380px] backdrop-blur-xl relative overflow-hidden">
                            {/* Terminal Top bar */}
                            <div className="flex items-center gap-2 border-b border-zinc-900 pb-4 mb-4 text-zinc-500">
                                <TerminalIcon size={14} className="text-cyan-400" />
                                <span className="font-semibold text-[10px] uppercase tracking-wider">{text.terminalTitle}</span>
                                <div className="flex gap-1.5 ml-auto">
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                                </div>
                            </div>

                            {/* Logs History */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-slate-300 leading-relaxed max-h-[300px]">
                                {terminalHistory.map((line, idx) => (
                                    <div key={idx} className="whitespace-pre-wrap">
                                        {line.startsWith('guest@') ? (
                                            <span className="text-cyan-400">{line}</span>
                                        ) : line.includes('[Diagnostics]') ? (
                                            <span className="text-amber-400">{line}</span>
                                        ) : line.includes('[Kernel]') ? (
                                            <span className="text-purple-400">{line}</span>
                                        ) : line.includes('[Continuum Memory]') ? (
                                            <span className="text-emerald-400">{line}</span>
                                        ) : (
                                            line
                                        )}
                                    </div>
                                ))}
                                <div ref={terminalEndRef} />
                            </div>

                            {/* Console Prompt Input */}
                            <form onSubmit={handleCommandSubmit} className="flex gap-2 border-t border-zinc-900 pt-4 mt-4">
                                <span className="text-cyan-400">guest@silhouette-os:~$</span>
                                <input
                                    type="text"
                                    value={terminalInput}
                                    onChange={(e) => setTerminalInput(e.target.value)}
                                    placeholder={text.terminalPlaceholder}
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-700"
                                />
                            </form>
                        </div>
                    </div>

                    {/* Agent Swarm Visualizer (Right Column) */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="flex-1 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-2xl p-6 flex flex-col justify-between backdrop-blur-xl">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Layers className="text-purple-400" size={18} />
                                    <h3 className="font-bold text-white text-base">{text.swarmTitle}</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-normal mb-6">{text.swarmDesc}</p>
                            </div>

                            {/* Active Visual Nodes */}
                            <div className="relative flex justify-around items-center h-32 my-4">
                                {/* Connector Lines (SVG) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                    <path 
                                        d="M 80 64 Q 150 20 220 64" 
                                        fill="none" 
                                        stroke={swarmStep >= 2 ? "#a855f7" : "#334155"} 
                                        strokeWidth="1.5" 
                                        strokeDasharray="4"
                                        className={swarmStep === 2 ? "animate-pulse" : ""}
                                    />
                                    <path 
                                        d="M 220 64 Q 150 110 80 64" 
                                        fill="none" 
                                        stroke={swarmStep >= 3 ? "#06b6d4" : "#334155"} 
                                        strokeWidth="1.5" 
                                        strokeDasharray="4"
                                        className={swarmStep === 3 ? "animate-pulse" : ""}
                                    />
                                </svg>

                                {/* Node 1: Product Manager */}
                                <div className={`relative z-10 flex flex-col items-center transition-transform duration-300 ${swarmStep === 1 ? 'scale-110' : 'opacity-70'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${swarmStep === 1 ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-slate-950 border-slate-800'}`}>
                                        <Sparkles size={16} className={swarmStep === 1 ? 'text-purple-400' : 'text-slate-500'} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">PM Agent</span>
                                </div>

                                {/* Node 2: Developer Agent */}
                                <div className={`relative z-10 flex flex-col items-center transition-transform duration-300 ${swarmStep === 2 ? 'scale-110' : 'opacity-70'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${swarmStep === 2 ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-950 border-slate-800'}`}>
                                        <Cpu size={16} className={swarmStep === 2 ? 'text-cyan-400' : 'text-slate-500'} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Dev Agent</span>
                                </div>

                                {/* Node 3: Telemetry Agent */}
                                <div className={`relative z-10 flex flex-col items-center transition-transform duration-300 ${swarmStep === 3 ? 'scale-110' : 'opacity-70'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${swarmStep === 3 ? 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-950 border-slate-800'}`}>
                                        <Shield size={16} className={swarmStep === 3 ? 'text-emerald-400' : 'text-slate-500'} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Telemetry</span>
                                </div>
                            </div>

                            {/* Simulation Logs box */}
                            <div className="bg-slate-950/90 border border-slate-850 p-4 rounded-xl min-h-[90px] font-mono text-[10px] text-slate-400 mb-6">
                                {swarmLog.length === 0 ? (
                                    <span className="text-zinc-700 italic">Waiting...</span>
                                ) : (
                                    <div className="space-y-1.5">
                                        {swarmLog.map((log, idx) => (
                                            <div key={idx} className="fade-in">{log}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Execute Swarm Trigger */}
                            <button
                                onClick={runSwarmSimulation}
                                disabled={isSwarmRunning}
                                className={`w-full py-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isSwarmRunning ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200'}`}
                            >
                                {isSwarmRunning ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                                <span>{isSwarmRunning ? text.swarmActive : text.runSwarm}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Core Features Grid */}
                <section className="mb-20">
                    <h2 className="text-center text-2xl font-extrabold text-white mb-10 tracking-tight flex items-center justify-center gap-2">
                        <Sparkles className="text-cyan-400" size={20} />
                        {text.featuresTitle}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Swarm Orchestration */}
                        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                                    <Layers size={18} />
                                </div>
                                <h3 className="font-extrabold text-white text-sm mb-2">{text.feature1}</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{text.feature1Desc}</p>
                            </div>
                        </div>

                        {/* Hybrid Memory */}
                        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                                    <TerminalIcon size={18} />
                                </div>
                                <h3 className="font-extrabold text-white text-sm mb-2">{text.feature2}</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{text.feature2Desc}</p>
                            </div>
                        </div>

                        {/* Portable Python Env */}
                        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                                    <Cpu size={18} />
                                </div>
                                <h3 className="font-extrabold text-white text-sm mb-2">{text.feature3}</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{text.feature3Desc}</p>
                            </div>
                        </div>

                        {/* Privacy Telemetry */}
                        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                                    <Shield size={18} />
                                </div>
                                <h3 className="font-extrabold text-white text-sm mb-2">{text.feature4}</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{text.feature4Desc}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* System Calibrator */}
                <section className="mb-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-900/20 border border-slate-900 rounded-3xl p-8 backdrop-blur-md">
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Cpu className="text-cyan-400" size={20} />
                            <h2 className="text-xl font-bold text-white">{text.calTitle}</h2>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{text.calDesc}</p>
                    </div>

                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Selector CPU */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">{text.cpuCores}</label>
                            <select
                                value={cpuCores}
                                onChange={(e) => setCpuCores(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-3 outline-none focus:border-cyan-500"
                            >
                                <option value={4}>4 Cores</option>
                                <option value={8}>8 Cores</option>
                                <option value={12}>12 Cores</option>
                                <option value={16}>16+ Cores</option>
                            </select>
                        </div>

                        {/* Selector RAM */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">{text.ramSize}</label>
                            <select
                                value={ramSize}
                                onChange={(e) => setRamSize(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-3 outline-none focus:border-cyan-500"
                            >
                                <option value={8}>8 GB</option>
                                <option value={16}>16 GB</option>
                                <option value={32}>32 GB</option>
                                <option value={64}>64+ GB</option>
                            </select>
                        </div>

                        {/* Calculate Trigger Button */}
                        <div className="sm:col-span-2 pt-2">
                            <button
                                onClick={handleCalculate}
                                className="w-full py-3 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 font-bold text-xs transition-all duration-300"
                            >
                                {text.runCal}
                            </button>
                        </div>

                        {/* Calibration Output result */}
                        {calResult && (
                            <div className="sm:col-span-2 bg-slate-950/80 border border-slate-850 p-4 rounded-xl text-left fade-in">
                                <span className="text-[10px] font-bold text-cyan-400 block mb-1">💡 Recommended Model:</span>
                                <div className="text-white font-extrabold text-sm mb-1">{calResult.recommendation}</div>
                                <div className="text-[10px] text-slate-400 leading-normal">{calResult.details}</div>
                            </div>
                        )}
                    </div>
                </section>

                {/* FAQ Accordion */}
                <section className="max-w-3xl mx-auto mb-16">
                    <h2 className="text-center text-2xl font-extrabold text-white mb-10 tracking-tight flex items-center justify-center gap-2">
                        <HelpCircle className="text-purple-400" size={20} />
                        {text.faqTitle}
                    </h2>

                    <div className="space-y-4">
                        {[
                            { q: text.faq1, a: text.faq1Ans },
                            { q: text.faq2, a: text.faq2Ans },
                            { q: text.faq3, a: text.faq3Ans },
                            { q: text.faq4, a: text.faq4Ans }
                        ].map((item, idx) => (
                            <div 
                                key={idx} 
                                className="border border-slate-900 bg-slate-950/30 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-5 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-900/20 transition-all duration-300"
                                >
                                    <span>{item.q}</span>
                                    {faqOpen[idx] ? <ChevronUp size={16} className="text-cyan-400" /> : <ChevronDown size={16} className="text-slate-500" />}
                                </button>
                                
                                <AnimatePresence initial={false}>
                                    {faqOpen[idx] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="p-5 pt-0 text-[11px] text-slate-400 leading-relaxed border-t border-slate-950 bg-slate-950/10">
                                                {item.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SilhouettePage;
