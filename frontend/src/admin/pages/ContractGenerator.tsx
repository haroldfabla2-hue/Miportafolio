import React, { useState, useEffect } from 'react';

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
}

const planSpecs = {
    'C.1': { name: 'Reingeniería Lógica y Migración a n8n', scope: 'migrar hasta 5 flujos lógicos comerciales activos hacia la nueva infraestructura de n8n autohospedada.' },
    'C.2': { name: 'Plataforma Web / E-Commerce WooCommerce', scope: 'desplegar un sitio de comercio electrónico responsivo a medida con optimización técnica de velocidad (WPO) y pasarelas de pago integradas.' },
    'B.1': { name: 'Orquestación de Leads (Silhouette OS)', scope: 'licenciar e implementar la consola Silhouette OS e integrar el motor de triaje inteligente Silhouette Brain con la API oficial de WhatsApp.' },
    'B.2': { name: 'Aplicación Web Custom (React/TS/Node)', scope: 'desarrollar a medida la interfaz frontend, backend y consola de administración privada con base de datos PostgreSQL dedicada.' },
    'A.1': { name: 'Enjambres Autónomos de Razonamiento (LangGraph)', scope: 'diseñar y desplegar enjambres multi-agente autónomos en Python utilizando LangGraph e integrar memoria persistente CausalOS-Python.' },
    'A.2': { name: 'Plataforma SaaS Multi-Inquilino (Next.js)', scope: 'desarrollar la arquitectura multi-inquilino de software Next.js App Router e integrar pasarela de suscripciones Stripe Billing.' }
};

const ContractGenerator: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [clientEmail, setClientEmail] = useState<string>('');
    const [clientCompany, setClientCompany] = useState<string>('');
    const [clientRuc, setClientRuc] = useState<string>('');
    
    const [selectedPlan, setSelectedPlan] = useState<keyof typeof planSpecs>('C.1');
    const [price, setPrice] = useState<number>(5625);
    const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
    const [milestones, setMilestones] = useState<string>('50% anticipo al inicio / 50% al cierre de pruebas');
    const [vpsProvider, setVpsProvider] = useState<string>('Hetzner');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch clients on mount
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('/api/crm/clients'); // Typical api route in the project
                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                } else {
                    // Fallback mock clients if API is not running locally during development
                    setClients([
                        { id: '1', name: 'Diego Nuñez', company: 'Bijoueme', email: 'pablonma99@gmail.com' },
                        { id: '2', name: 'Marco Ugaz', company: 'Virako Travel', email: 'marco.ugaz.86@gmail.com' },
                        { id: '3', name: 'Client España', company: 'Yarnalia SL', email: 'yarnaliacom@gmail.com' }
                    ]);
                }
            } catch {
                setClients([
                    { id: '1', name: 'Diego Nuñez', company: 'Bijoueme', email: 'pablonma99@gmail.com' },
                    { id: '2', name: 'Marco Ugaz', company: 'Virako Travel', email: 'marco.ugaz.86@gmail.com' },
                    { id: '3', name: 'Client España', company: 'Yarnalia SL', email: 'yarnaliacom@gmail.com' }
                ]);
            }
        };
        fetchClients();
    }, []);

    // Set client details when selected
    useEffect(() => {
        const client = clients.find(c => c.id === selectedClient);
        if (client) {
            setClientEmail(client.email);
            setClientCompany(client.company);
        }
    }, [selectedClient, clients]);

    // Handle PDF Generation
    const handleGenerateContract = async () => {
        setIsLoading(true);
        setStatusMessage(null);
        setPdfUrl('');

        try {
            const token = localStorage.getItem('token'); // Read authorization token
            const response = await fetch('/api/finance/contracts/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clientName: clients.find(c => c.id === selectedClient)?.name || 'Cliente Prueba',
                    clientCompany,
                    clientEmail,
                    clientRuc,
                    planCode: selectedPlan,
                    planName: planSpecs[selectedPlan].name,
                    planScope: planSpecs[selectedPlan].scope,
                    price,
                    currency,
                    milestones,
                    vpsProvider
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPdfUrl(data.pdfUrl);
                setStatusMessage({ type: 'success', text: 'Contrato PDF generado con éxito.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error al compilar el PDF del contrato.' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Fallo en la comunicación con el servidor.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Email dispatch
    const handleSendEmail = async () => {
        if (!pdfUrl) return;
        setIsLoading(true);
        setStatusMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/finance/contracts/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    to: clientEmail,
                    clientName: clients.find(c => c.id === selectedClient)?.name || 'Cliente',
                    companyName: clientCompany,
                    pdfUrl
                })
            });

            if (response.ok) {
                setStatusMessage({ type: 'success', text: 'Contrato y propuesta enviados al cliente por correo.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error al enviar el correo con la propuesta.' });
            }
        } catch {
            setStatusMessage({ type: 'error', text: 'Fallo al despachar el correo.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px', color: '#fff', background: '#0a0a0a', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Generador de Contratos Automatizado</h2>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>Compilación digital del Contrato Marco (MSA) y Anexos Técnicos (SOW)</p>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
                {/* Configuration form */}
                <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid #222', paddingBottom: '10px' }}>Configuración del Contrato</h3>

                    {/* Client Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#888' }}>Seleccionar Cliente del CRM</label>
                        <select
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                            ))}
                        </select>
                    </div>

                    {/* Client details override */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Razón Social / Compañía</label>
                            <input
                                type="text"
                                value={clientCompany}
                                onChange={(e) => setClientCompany(e.target.value)}
                                style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.85rem', color: '#888' }}>RUC / NIF / DNI</label>
                            <input
                                type="text"
                                placeholder="ej. RUC 10..."
                                value={clientRuc}
                                onChange={(e) => setClientRuc(e.target.value)}
                                style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#888' }}>Email del Cliente</label>
                        <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid #222', paddingTop: '15px' }}></div>

                    {/* Plan Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#888' }}>Servicio Base (SOW Anexo)</label>
                        <select
                            value={selectedPlan}
                            onChange={(e) => setSelectedPlan(e.target.value as any)}
                            style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            {Object.entries(planSpecs).map(([code, spec]) => (
                                <option key={code} value={code}>{code} - {spec.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Financial & variables */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Precio Acordado</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Moneda</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as any)}
                                style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <option value="PEN">Soles (PEN)</option>
                                <option value="USD">Dólares (USD)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#888' }}>VPS Nube Proveedor (Para SOW C.1 / A.1)</label>
                        <input
                            type="text"
                            value={vpsProvider}
                            onChange={(e) => setVpsProvider(e.target.value)}
                            style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#888' }}>Hitos de Pago (Milestones)</label>
                        <input
                            type="text"
                            value={milestones}
                            onChange={(e) => setMilestones(e.target.value)}
                            style={{ background: '#151515', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px' }}
                        />
                    </div>

                    {/* Actions block */}
                    <div style={{ borderTop: '1px solid #222', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={handleGenerateContract}
                            disabled={isLoading || !selectedClient}
                            style={{
                                backgroundColor: 'var(--color-accent)',
                                color: '#000',
                                fontWeight: 'bold',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                opacity: (isLoading || !selectedClient) ? 0.5 : 1
                            }}
                        >
                            {isLoading ? 'Procesando...' : 'Generar Contrato PDF'}
                        </button>

                        {pdfUrl && (
                            <button
                                onClick={handleSendEmail}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--color-accent)',
                                    color: 'var(--color-accent)',
                                    fontWeight: 'bold',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Enviar a Email del Cliente
                            </button>
                        )}

                        {statusMessage && (
                            <div style={{
                                backgroundColor: statusMessage.type === 'success' ? 'rgba(163,255,0,0.1)' : 'rgba(255,77,77,0.1)',
                                border: `1px solid ${statusMessage.type === 'success' ? 'var(--color-accent)' : '#ff4d4d'}`,
                                color: statusMessage.type === 'success' ? '#fff' : '#ff4d4d',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                textAlign: 'center'
                            }}>
                                {statusMessage.text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Real-time Previewer panel */}
                <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', borderBottom: '1px solid #222', paddingBottom: '10px' }}>Previsualización del Contrato</h3>
                    
                    {/* A4 Sandbox Scroll */}
                    <div style={{
                        flex: 1,
                        background: '#151515',
                        border: '1px solid #222',
                        borderRadius: '8px',
                        padding: '30px',
                        overflowY: 'scroll',
                        maxHeight: '600px',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        color: '#ddd',
                        fontFamily: 'serif'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>CONTRATO MARCO DE PRESTACIÓN DE SERVICIOS TECNOLÓGICOS</h4>
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>ID: MSA-AP-2026-TEMP</span>
                        </div>

                        <p>Conste por el presente documento el <strong>Contrato Marco de Prestación de Servicios Tecnológicos</strong> que celebran, de una parte, <strong>Alberto Farah Blair</strong> (R.U.C. 10 MYPE), en adelante el <strong>"Consultor"</strong>, y de la otra parte, <strong>{clientCompany || '[Razón Social Cliente]'}</strong>, RUC/NIF <strong>{clientRuc || '[RUC/NIF]'}</strong>, representada por <strong>{clients.find(c => c.id === selectedClient)?.name || '[Representante Cliente]'}</strong>, en adelante el <strong>"Cliente"</strong>.</p>

                        <h5 style={{ color: '#fff', marginTop: '20px', fontWeight: 'bold' }}>CLÁUSULA TERCERA: PROPIEDAD INTELECTUAL Y TECNOLOGÍA PROPIETARIA</h5>
                        <p>El Cliente reconoce y acepta que toda plataforma base, software modular y plataformas preexistentes —incluyendo de forma exclusiva el entorno operativo base <strong>Silhouette OS</strong> y <strong>CausalOS-Python</strong>— son propiedad exclusiva del Consultor. El Consultor otorga al Cliente una licencia de uso no exclusiva e intransferible únicamente para el funcionamiento del producto final entregado. Los flujos concretos desarrollados para el Cliente se transferirán en propiedad exclusiva al Cliente únicamente cuando este haya liquidado el 100% de los honorarios pactados en el presente Contrato.</p>

                        <h5 style={{ color: '#fff', marginTop: '20px', fontWeight: 'bold' }}>CLÁUSULA QUINTA: LIMITACIÓN DE RESPONSABILIDAD TÉCNICA E IA</h5>
                        <p>El Cliente reconoce que las soluciones de automatización integran APIs controladas por terceros (OpenAI, Anthropic, Meta). El Consultor queda exento de toda responsabilidad por caídas, deprecaciones o aumentos de precios de dichos proveedores. Asimismo, los modelos de IA son probabilísticos; el Consultor queda eximido de responsabilidad ante errores de inferencia o alucinaciones semánticas, obligando al Cliente a implementar un protocolo de vigilancia humana <strong>Human-in-the-Loop (HITL)</strong>.</p>

                        <div style={{ borderTop: '1px dashed #444', margin: '30px 0' }}></div>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>ANEXO TÉCNICO SOW - {selectedPlan}</h4>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>{planSpecs[selectedPlan].name}</span>
                        </div>

                        <p><strong>Objeto del Servicio:</strong> El Consultor ejecutará la ingeniería y configuración para: {planSpecs[selectedPlan].scope}</p>
                        <p><strong>Proveedor VPS de Alojamiento:</strong> {vpsProvider}</p>
                        <p><strong>Hitos de Pago y Finanzas:</strong> El precio cerrado de este anexo se fija en <strong>{price.toLocaleString()} {currency}</strong> (Más IGV 18% si es local en Perú). Los pagos se realizarán según los siguientes hitos: {milestones}.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractGenerator;
