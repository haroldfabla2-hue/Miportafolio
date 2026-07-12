import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Layers, Cpu, Code2, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface LeadQualificationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LeadQualificationForm: React.FC<LeadQualificationFormProps> = ({ onSuccess, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [operationalPain, setOperationalPain] = useState<string | null>(null);
  const [tasks, setTasks] = useState(1000);
  const [hours, setHours] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // i18n compliance keys
  const nextLabel = 'Continue';
  const cancelLabel = 'Cancel';
  const unitHoursSuffix = 'h';
  const unitRateSuffix = '/h';
  const unitMonthlySuffix = ' / mo';
  const currencySymbol = '$';

  // Live ROI Calculation
  // manual labor cost = hours * hourlyRate
  // average task automation platform cost (Zapier estimate) = tasks * 0.05
  // custom self-hosted n8n cost = 20 (VPS flat fee)
  // estimated savings = (manual labor cost) + (Zapier cost) - n8n cost
  const manualLaborCost = hours * hourlyRate;
  const zapierCost = Math.round(tasks * 0.05);
  const vpsCost = 20;
  const estimatedSavings = Math.max(0, manualLaborCost + zapierCost - vpsCost);

  const isCorporateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) return false;
    
    const domain = emailStr.split('@')[1].toLowerCase();
    const freeDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'aol.com', 'mail.ru', 'yandex.ru', 'live.com', 'icloud.com',
      'gmx.com', 'zoho.com', 'protonmail.com', 'ymail.com'
    ];
    return !freeDomains.includes(domain);
  };

  const handlePainSelect = (painKey: string) => {
    setOperationalPain(painKey);
    setStep(2);
  };

  const handleStep2Submit = () => {
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !company.trim()) {
      setErrorMsg(i18n.language.startsWith('es') ? 'Por favor complete todos los campos obligatorios.' : 'Please fill in all required fields.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg(i18n.language.startsWith('es') ? 'Debe aceptar la Política de Privacidad para continuar.' : 'You must accept the Privacy Policy to continue.');
      return;
    }

    if (!isCorporateEmail(email)) {
      setErrorMsg(t('qualify.form.contact.invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/leads/qualify', {
        name,
        email,
        phone: phone || undefined,
        company,
        operationalPain: operationalPain || undefined,
        monthlyVolume: tasks,
        roiEstimate: estimatedSavings,
        qualificationStep: 'COMPLETED',
        message: `BANT Qualify Form - Pain: ${operationalPain}, Volume: ${tasks} tasks, Wasted Hours: ${hours}h, Hourly Rate: $${hourlyRate}/h. Estimated Savings: $${estimatedSavings}/mo.`
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        // We do NOT auto-call onSuccess() here anymore. We want them to see the Calendly iframe.
        // The modal will be closed manually by the user or via Calendly event if we add listeners.
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || (i18n.language.startsWith('es') ? 'Error al enviar los datos. Por favor intente de nuevo.' : 'Failed to send data. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '650px',
      margin: '0 auto',
      background: 'linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(10,10,10,0.95) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)',
      backdropFilter: 'blur(10px)',
      color: '#fff',
      fontFamily: 'var(--font-family, Figtree), sans-serif'
    }}>
      {/* Title */}
      {!success && (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>
            {t('qualify.title')}
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.95rem' }}>
            {t('qualify.subtitle')}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {!success && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ flex: 1, height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: step >= s ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%', background: step === s ? '#A3FF00' : step > s ? '#8FE000' : 'transparent' }}
              />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '10px 0' }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              {i18n.language.startsWith('es') ? '¡Datos Calificados!' : 'Project Qualified!'}
            </h3>
            <p style={{ color: '#aaa', lineHeight: 1.4, maxWidth: '400px', margin: '0 auto 16px auto', fontSize: '0.9rem' }}>
              {i18n.language.startsWith('es') ? 'Elige una fecha y hora para nuestra llamada estratégica. Tu información ya está pre-cargada.' : 'Pick a time for our strategic call. Your details have been pre-filled.'}
            </p>
            <div style={{ borderRadius: '16px', overflow: 'hidden', height: '400px', background: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
              <iframe
                src={`https://calendly.com/alberto-farah-b/30min?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&hide_event_type_details=1&hide_gdpr_banner=1`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Calendly Scheduling"
              ></iframe>
            </div>
            {onCancel && (
               <button onClick={onCancel} style={{ marginTop: '16px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                 {i18n.language.startsWith('es') ? 'Cerrar ventana' : 'Close window'}
               </button>
            )}
          </motion.div>
        ) : step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
              {t('qualify.form.pain.title')}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Option 1: SaaS */}
              <motion.div
                whileHover={{ scale: 1.02, borderColor: '#A3FF00', backgroundColor: 'rgba(163,255,0,0.03)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePainSelect('SAAS_DOUBLE_ENTRY')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
              >
                <div style={{ background: 'rgba(163,255,0,0.1)', padding: '12px', borderRadius: '12px', color: '#A3FF00' }}>
                  <Layers size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                    {i18n.language.startsWith('es') ? 'Desarrollo SaaS / Integraciones' : 'Custom SaaS / Integrations'}
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    {t('qualify.form.pain.saas')}
                  </p>
                </div>
              </motion.div>

              {/* Option 2: AI Agents */}
              <motion.div
                whileHover={{ scale: 1.02, borderColor: '#A3FF00', backgroundColor: 'rgba(163,255,0,0.03)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePainSelect('AI_AGENTS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
              >
                <div style={{ background: 'rgba(163,255,0,0.1)', padding: '12px', borderRadius: '12px', color: '#A3FF00' }}>
                  <Cpu size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                    {i18n.language.startsWith('es') ? 'Enjambres de Agentes de IA' : 'Autonomous AI Agent Swarms'}
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    {t('qualify.form.pain.agents')}
                  </p>
                </div>
              </motion.div>

              {/* Option 3: Custom Dev */}
              <motion.div
                whileHover={{ scale: 1.02, borderColor: '#A3FF00', backgroundColor: 'rgba(163,255,0,0.03)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePainSelect('CUSTOM_SYSTEM')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
              >
                <div style={{ background: 'rgba(163,255,0,0.1)', padding: '12px', borderRadius: '12px', color: '#A3FF00' }}>
                  <Code2 size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                    {i18n.language.startsWith('es') ? 'Sistemas a Medida' : 'Tailor-made Systems'}
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    {t('qualify.form.pain.custom')}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '32px', textAlign: 'center' }}>
              {t('qualify.form.roi.title')}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '40px' }}>
              {/* Slider 1: Tasks */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#ccc' }}>
                  <span>{t('qualify.form.roi.tasks')}</span>
                  <span style={{ color: '#A3FF00', fontWeight: 'bold' }}>{tasks.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={tasks}
                  onChange={(e) => setTasks(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#A3FF00', height: '6px', background: '#222', borderRadius: '3px', outline: 'none' }}
                />
              </div>

              {/* Slider 2: Hours */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#ccc' }}>
                  <span>{t('qualify.form.roi.hours')}</span>
                  <span style={{ color: '#A3FF00', fontWeight: 'bold' }}>{hours}{unitHoursSuffix}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#A3FF00', height: '6px', background: '#222', borderRadius: '3px', outline: 'none' }}
                />
              </div>

              {/* Slider 3: Hourly Rate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#ccc' }}>
                  <span>{t('qualify.form.roi.hourlyRate')}</span>
                  <span style={{ color: '#A3FF00', fontWeight: 'bold' }}>{currencySymbol}{hourlyRate}{unitRateSuffix}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#A3FF00', height: '6px', background: '#222', borderRadius: '3px', outline: 'none' }}
                />
              </div>
            </div>

            {/* ROI savings preview */}
            <div style={{
              background: 'rgba(163,255,0,0.04)',
              border: '1px solid rgba(163,255,0,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.95rem', color: '#aaa', fontWeight: 500 }}>{t('qualify.form.roi.estimate')}</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#A3FF00' }}>
                {currencySymbol}{estimatedSavings.toLocaleString()}<span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 500 }}>{unitMonthlySuffix}</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#666')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
              >
                {i18n.language.startsWith('es') ? 'Atrás' : 'Back'}
              </button>
              <button
                type="button"
                onClick={handleStep2Submit}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: '#A3FF00',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#111',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#8FE000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#A3FF00')}
              >
                {nextLabel}
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
              {t('qualify.form.contact.title')}
            </h4>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 500 }}>{t('qualify.form.contact.name')} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    background: '#151515',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Company */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 500 }}>{t('qualify.form.contact.company')} *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    background: '#151515',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Corporate Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 500 }}>{t('qualify.form.contact.email')} *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    background: '#151515',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Phone (Optional) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 500 }}>
                  {t('qualify.form.contact.phone')} <span style={{ color: '#666', fontSize: '0.8rem' }}>{t('contact.optional')}</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    background: '#151515',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div style={{ color: '#ff4a4a', fontSize: '0.85rem', marginTop: '8px', lineHeight: 1.4 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* GDPR Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <input 
                  type="checkbox" 
                  id="gdpr_consent"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: '4px', cursor: 'pointer', accentColor: '#A3FF00' }}
                />
                <label htmlFor="gdpr_consent" style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.4, cursor: 'pointer' }}>
                  {i18n.language.startsWith('es') 
                    ? <>He leído y acepto la <a href="/privacy" target="_blank" style={{ color: '#A3FF00', textDecoration: 'underline' }}>Política de Privacidad</a> y consiento el procesamiento de mis datos.</>
                    : <>I have read and accept the <a href="/privacy" target="_blank" style={{ color: '#A3FF00', textDecoration: 'underline' }}>Privacy Policy</a> and consent to the processing of my data.</>}
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'transparent',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#666')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
                >
                  {i18n.language.startsWith('es') ? 'Atrás' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '14px',
                    background: '#A3FF00',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#111',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#8FE000')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#A3FF00')}
                >
                  {loading ? (
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    t('qualify.form.contact.submit')
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline styles for spinner keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LeadQualificationForm;
