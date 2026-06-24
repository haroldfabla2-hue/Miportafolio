import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const exchangeRate = 3.75; // USD to PEN SBS rate

interface CalculationResults {
    zapierCost: number;
    n8nHostingCost: number;
    licenseSavings: number;
    timeSavedValue: number;
    totalMonthlySavings: number;
    totalAnnualSavings: number;
    roiPercentage: number;
}

const RoiCalculator: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
    const [tasks, setTasks] = useState<number>(50000);
    const [flows, setFlows] = useState<number>(10);
    const [hours, setHours] = useState<number>(40);
    const [rate, setRate] = useState<number>(75); // S/. 75 or $20 depending on currency
    const [results, setResults] = useState<CalculationResults>({
        zapierCost: 0,
        n8nHostingCost: 0,
        licenseSavings: 0,
        timeSavedValue: 0,
        totalMonthlySavings: 0,
        totalAnnualSavings: 0,
        roiPercentage: 0
    });

    // Handle currency changes (re-scale rates)
    const handleCurrencyChange = (newCurrency: 'PEN' | 'USD') => {
        if (newCurrency === currency) return;
        if (newCurrency === 'PEN') {
            setRate(Math.round(rate * exchangeRate));
        } else {
            setRate(Math.round(rate / exchangeRate));
        }
        setCurrency(newCurrency);
    };

    useEffect(() => {
        // 1. Calculate Zapier Cost (USD brackets based on 2026 tasks pricing)
        let zapierCostUsd = 0;
        if (tasks <= 1000) zapierCostUsd = 29.99;
        else if (tasks <= 10000) zapierCostUsd = 103.50;
        else if (tasks <= 50000) zapierCostUsd = 253.50;
        else if (tasks <= 100000) zapierCostUsd = 448.50;
        else if (tasks <= 500000) zapierCostUsd = 1198.50;
        else zapierCostUsd = 2398.50;

        // 2. Calculate n8n Self-hosted VPS Hosting cost (Hetzner dynamic sizing based on execution payload)
        let n8nHostUsd = 0;
        if (tasks <= 100000) n8nHostUsd = 6.00; // CX21 vCPU/4GB
        else if (tasks <= 500000) n8nHostUsd = 12.00; // CX31 vCPU/8GB
        else n8nHostUsd = 25.00; // CX41 vCPU/16GB

        // Convert if currency is PEN
        const zapierCost = currency === 'PEN' ? zapierCostUsd * exchangeRate : zapierCostUsd;
        const n8nHostingCost = currency === 'PEN' ? n8nHostUsd * exchangeRate : n8nHostUsd;

        const licenseSavings = zapierCost - n8nHostingCost;
        const timeSavedValue = hours * rate;
        const totalMonthlySavings = licenseSavings + timeSavedValue;
        const totalAnnualSavings = totalMonthlySavings * 12;

        // ROI percentage calculation based on the typical build fee amortized (e.g. S/. 5,625 / $1,500 build fee)
        const buildFee = currency === 'PEN' ? 5625 : 1500;
        const roiPercentage = Math.round((totalAnnualSavings / buildFee) * 100);

        setResults({
            zapierCost,
            n8nHostingCost,
            licenseSavings,
            timeSavedValue,
            totalMonthlySavings,
            totalAnnualSavings,
            roiPercentage
        });
    }, [tasks, flows, hours, rate, currency]);

    const formatVal = (val: number) => {
        const locale = i18n.language === 'es' ? 'es-PE' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div style={{
            backgroundColor: 'rgba(15,15,15,0.75)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            padding: '30px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            maxWidth: '960px',
            margin: '0 auto',
            color: '#fff'
        }}>
            {/* Header / Selector */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '20px',
                marginBottom: '30px'
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>{t('roi.title')}</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                        {t('roi.subtitle')}
                    </p>
                </div>
                {/* Currency selector toggle */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '4px',
                    borderRadius: '30px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button
                        onClick={() => handleCurrencyChange('PEN')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: currency === 'PEN' ? 'var(--color-accent)' : 'transparent',
                            color: currency === 'PEN' ? '#000' : '#888',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t('roi.currency.pen')}
                    </button>
                    <button
                        onClick={() => handleCurrencyChange('USD')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: currency === 'USD' ? 'var(--color-accent)' : 'transparent',
                            color: currency === 'USD' ? '#000' : '#888',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t('roi.currency.usd')}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px'
            }}>
                {/* Sliders Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {/* Slider 1: Tasks */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>{t('roi.labels.taskVolume')}</label>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                                {tasks.toLocaleString()} {t('roi.units.tasks')}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="2000"
                            max="500000"
                            step="2000"
                            value={tasks}
                            onChange={(e) => setTasks(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                accentColor: 'var(--color-accent)',
                                cursor: 'pointer',
                                background: '#333',
                                height: '5px',
                                borderRadius: '3px'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
                            <span>2,000</span>
                            <span>500,000+</span>
                        </div>
                    </div>

                    {/* Slider 2: Manual hours */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>{t('roi.labels.hoursFreed')}</label>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                                {hours} {t('roi.units.hours')}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            step="5"
                            value={hours}
                            onChange={(e) => setHours(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                accentColor: 'var(--color-accent)',
                                cursor: 'pointer',
                                background: '#333',
                                height: '5px',
                                borderRadius: '3px'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
                            <span>{t('roi.units.hoursZero')}</span>
                            <span>{t('roi.units.hoursMax')}</span>
                        </div>
                    </div>

                    {/* Slider 3: Hourly Rate */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#ccc' }}>{t('roi.labels.hourlyCost')}</label>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                                {formatVal(rate)} {t('roi.units.perHour')}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={currency === 'PEN' ? '15' : '5'}
                            max={currency === 'PEN' ? '300' : '80'}
                            step={currency === 'PEN' ? '5' : '2'}
                            value={rate}
                            onChange={(e) => setRate(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                accentColor: 'var(--color-accent)',
                                cursor: 'pointer',
                                background: '#333',
                                height: '5px',
                                borderRadius: '3px'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
                            <span>{currency === 'PEN' ? t('roi.units.minPen') : t('roi.units.minUsd')}</span>
                            <span>{currency === 'PEN' ? t('roi.units.maxPen') : t('roi.units.maxUsd')}</span>
                        </div>
                    </div>
                </div>

                {/* Results Visualisation Panel */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Zapier Cost vs n8n */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{t('roi.results.zapierCost')}</span>
                            <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: '#ff4d4d' }}>
                                {formatVal(results.zapierCost)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{t('roi.results.n8nHostingCost')}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                                {formatVal(results.n8nHostingCost)}
                            </span>
                        </div>
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '15px' }}></div>

                        {/* License Savings */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{t('roi.results.licenseSavings')}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                                {formatVal(results.licenseSavings)} {t('roi.units.perMonth')}
                            </span>
                        </div>

                        {/* Labor Freed Value */}
                        {hours > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{t('roi.results.manualValue')}</span>
                                <span style={{ fontSize: '1.1rem', color: '#fff' }}>
                                    {formatVal(results.timeSavedValue)} {t('roi.units.perMonth')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Final CTA/Annual Box */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(163,255,0,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                        border: '1px solid rgba(163,255,0,0.25)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>
                            {t('roi.results.annualRoi')}
                        </span>
                        <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--color-accent)', display: 'block', lineHeight: '1.1' }}>
                            {formatVal(results.totalAnnualSavings)}
                        </span>
                        {results.roiPercentage > 0 && (
                            <span style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px', display: 'block' }}>
                                {t('roi.results.returnOnDevelopment', { percent: results.roiPercentage })}
                            </span>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <a href="/contact" style={{
                            display: 'block',
                            backgroundColor: 'var(--color-accent)',
                            color: '#000',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            padding: '12px 24px',
                            borderRadius: '30px',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(163, 255, 0, 0.25)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {t('roi.cta')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoiCalculator;
