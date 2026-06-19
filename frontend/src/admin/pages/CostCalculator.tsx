import React, { useState, useEffect } from 'react';

interface WbsItem {
    id: string;
    description: string;
    role: 'ALBERTO' | 'JUNIOR' | 'QA';
    hours: number;
}

const roleRates = {
    ALBERTO: 375, // Soles per hour (Revision/Consultation rate)
    JUNIOR: 30,   // Soles per hour
    QA: 22.50     // Soles per hour
};

const TACI_RATE = 11.10; // Soles per hour (absorb fijos)
const exchangeRate = 3.75;

const CostCalculator: React.FC = () => {
    const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
    const [clientType, setClientType] = useState<'PE' | 'INT'>('PE');
    const [directMaterials, setDirectMaterials] = useState<number>(0);
    const [wbsItems, setWbsItems] = useState<WbsItem[]>([
        { id: '1', description: 'Auditoría inicial y plano lógico (Blueprint)', role: 'ALBERTO', hours: 2 },
        { id: '2', description: 'Despliegue del VPS n8n en Docker', role: 'ALBERTO', hours: 2 },
        { id: '3', description: 'Reconfiguración lógica de flujos', role: 'JUNIOR', hours: 8 },
        { id: '4', description: 'QA técnico y control de errores', role: 'QA', hours: 2 }
    ]);

    // Financial totals
    const [modTotal, setModTotal] = useState<number>(0);
    const [cifTotal, setCifTotal] = useState<number>(0);
    const [breakEven, setBreakEven] = useState<number>(0);
    const [contingency, setContingency] = useState<number>(0);
    const [safetyPrice, setSafetyPrice] = useState<number>(0);
    const [suggestedPrice, setSuggestedPrice] = useState<number>(0);
    const [igvAmount, setIgvAmount] = useState<number>(0);
    const [detraccionAmount, setDetraccionAmount] = useState<number>(0);
    const [netBankInflow, setNetBankInflow] = useState<number>(0);

    const formatVal = (val: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 2
        }).format(val);
    };

    // Calculate financials whenever sliders/WBS changes
    useEffect(() => {
        // Calculations are performed in local Soles (PEN) first to avoid floating point errors, then converted
        let modSum = 0;
        let cifSum = 0;

        wbsItems.forEach(item => {
            const rate = roleRates[item.role];
            modSum += item.hours * rate;
            cifSum += item.hours * TACI_RATE;
        });

        const mid = directMaterials;
        const be = modSum + mid + cifSum;
        const cont = be * 0.20; // 20% contingency
        const safety = be + cont;
        const suggested = safety / (1 - 0.40); // 40% margin

        // Taxes logic
        let igv = 0;
        if (clientType === 'PE') {
            igv = suggested * 0.18; // 18% IGV local
        }

        const totalWithIaxes = suggested + igv;
        let detraccion = 0;
        if (clientType === 'PE' && totalWithIaxes > 700) {
            detraccion = totalWithIaxes * 0.12; // 12% detracción
        }

        const netBank = totalWithIaxes - detraccion;

        // Convert values if USD is selected
        const coef = currency === 'USD' ? 1 / exchangeRate : 1;

        setModTotal(modSum * coef);
        setCifTotal(cifSum * coef);
        setBreakEven(be * coef);
        setContingency(cont * coef);
        setSafetyPrice(safety * coef);
        setSuggestedPrice(suggested * coef);
        setIgvAmount(igv * coef);
        setDetraccionAmount(detraccion * coef);
        setNetBankInflow(netBank * coef);
    }, [wbsItems, directMaterials, currency, clientType]);

    const handleAddItem = () => {
        const newItem: WbsItem = {
            id: Date.now().toString(),
            description: '',
            role: 'JUNIOR',
            hours: 1
        };
        setWbsItems([...wbsItems, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        setWbsItems(wbsItems.filter(item => item.id !== id));
    };

    const handleUpdateItem = (id: string, key: keyof WbsItem, value: any) => {
        setWbsItems(wbsItems.map(item => {
            if (item.id === id) {
                return { ...item, [key]: value };
            }
            return item;
        }));
    };

    return (
        <div style={{ padding: '30px', color: '#fff', background: '#0a0a0a', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Calculadora WBS y Presupuestos</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>Diseño de costos unitarios y estimaciones por hitos de ingeniería</p>
                </div>
                {/* Control switches */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <select 
                        value={clientType} 
                        onChange={(e) => setClientType(e.target.value as 'PE' | 'INT')}
                        style={{
                            background: '#151515',
                            border: '1px solid #333',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="PE">Cliente Local (Perú)</option>
                        <option value="INT">Cliente Internacional</option>
                    </select>

                    <div style={{ display: 'flex', background: '#151515', border: '1px solid #333', borderRadius: '8px', padding: '3px' }}>
                        <button onClick={() => setCurrency('PEN')} style={{ padding: '6px 12px', border: 'none', background: currency === 'PEN' ? 'var(--color-accent)' : 'transparent', color: currency === 'PEN' ? '#000' : '#888', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>PEN (S/.)</button>
                        <button onClick={() => setCurrency('USD')} style={{ padding: '6px 12px', border: 'none', background: currency === 'USD' ? 'var(--color-accent)' : 'transparent', color: currency === 'USD' ? '#000' : '#888', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>USD ($)</button>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                {/* WBS Input Table */}
                <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Estructura Desglosada de Trabajo (WBS)</h3>
                        <button 
                            onClick={handleAddItem}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--color-accent)',
                                color: 'var(--color-accent)',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(163,255,0,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            + Añadir Actividad
                        </button>
                    </div>

                    {/* Table Headings */}
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 50px', gap: '15px', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '15px', fontSize: '0.85rem', color: '#666', fontWeight: 'bold' }}>
                        <span>Descripción del Hito / Tarea</span>
                        <span>Rol Asignado</span>
                        <span>Horas</span>
                        <span style={{ textAlign: 'center' }}>Acción</span>
                    </div>

                    {/* Table Body */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {wbsItems.map((item) => (
                            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 50px', gap: '15px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="ej. Configuración de VPS..."
                                    value={item.description}
                                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                    style={{
                                        background: '#151515',
                                        border: '1px solid #333',
                                        color: '#fff',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                />
                                <select
                                    value={item.role}
                                    onChange={(e) => handleUpdateItem(item.id, 'role', e.target.value as any)}
                                    style={{
                                        background: '#151515',
                                        border: '1px solid #333',
                                        color: '#fff',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="ALBERTO">Alberto (S/. 375/h)</option>
                                    <option value="JUNIOR">Junior (S/. 30/h)</option>
                                    <option value="QA">QA (S/. 22.50/h)</option>
                                </select>
                                <input
                                    type="number"
                                    min="0.5"
                                    max="200"
                                    step="0.5"
                                    value={item.hours}
                                    onChange={(e) => handleUpdateItem(item.id, 'hours', parseFloat(e.target.value) || 0)}
                                    style={{
                                        background: '#151515',
                                        border: '1px solid #333',
                                        color: '#fff',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff4d4d',
                                        cursor: 'pointer',
                                        fontSize: '1.1rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Direct Materials Block */}
                    <div style={{ borderTop: '1px solid #222', marginTop: '30px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Costos de Materiales Directos (MID)</h4>
                            <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '0.8rem' }}>ej. Licencias, VPS de desarrollo o plugins Pro a adquirir</p>
                        </div>
                        <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={directMaterials}
                            onChange={(e) => setDirectMaterials(parseFloat(e.target.value) || 0)}
                            style={{
                                background: '#151515',
                                border: '1px solid #333',
                                color: '#fff',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                outline: 'none',
                                width: '120px',
                                textAlign: 'right'
                            }}
                        />
                    </div>
                </div>

                {/* Financial Summary panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Panel 1: Cost structure breakdown */}
                    <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Estructura de Costos</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Mano de Obra Directa (MOD):</span>
                                <span>{formatVal(modTotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Materiales Directos (MID):</span>
                                <span>{formatVal(directMaterials * (currency === 'USD' ? 1 / exchangeRate : 1))}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Overhead Indirecto (CIF - TACI):</span>
                                <span>{formatVal(cifTotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '10px' }}>
                                <span style={{ color: '#fff' }}>Costo de Ruptura (Break-Even):</span>
                                <span style={{ fontWeight: 'bold' }}>{formatVal(breakEven)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Contingencia (20%):</span>
                                <span>{formatVal(contingency)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '10px', background: 'rgba(255,255,255,0.01)', padding: '5px' }}>
                                <span style={{ color: '#ff9800' }}>Precio de Seguridad (Mínimo):</span>
                                <span style={{ fontWeight: 'bold', color: '#ff9800' }}>{formatVal(safetyPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Sugerido & Tax simulator */}
                    <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Precio Sugerido e Impuestos</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Sugerido */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#aaa', fontSize: '0.95rem' }}>Precio Sugerido Venta:</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--color-accent)' }}>
                                    {formatVal(suggestedPrice)}
                                </span>
                            </div>

                            {clientType === 'PE' && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>IGV Local (18%):</span>
                                        <span>{formatVal(igvAmount)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '10px' }}>
                                        <span style={{ color: '#aaa' }}>Total con Impuestos:</span>
                                        <span>{formatVal(suggestedPrice + igvAmount)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4d4d' }}>
                                        <span style={{ color: '#ff4d4d' }}>Retención Detracción (12%):</span>
                                        <span>-{formatVal(detraccionAmount)}</span>
                                    </div>
                                </>
                            )}

                            {/* Net bank inflow */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '2px solid #222',
                                paddingTop: '15px',
                                background: 'linear-gradient(135deg, rgba(163,255,0,0.06) 0%, transparent 100%)',
                                padding: '10px',
                                borderRadius: '8px'
                            }}>
                                <span style={{ fontWeight: 'bold' }}>Ingreso Neto en Caja Banco:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--color-accent)', fontSize: '1.1rem' }}>{formatVal(netBankInflow)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostCalculator;
