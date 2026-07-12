import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../../services/api';
import {
    Globe, Tags, Layers, Zap, Image, Check, Trash2, Edit2, Plus, 
    Settings, Shield, ChevronDown, ChevronUp, Save, Play, Info
} from 'lucide-react';
import { PremiumTabs } from '../components/ui/PremiumTabs';

type TabId = 'general-seo' | 'taxonomies' | 'custom-fields' | 'automation' | 'media';

interface TaxonomyTerm {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface Taxonomy {
    id: number;
    name: string;
    slug: string;
    description?: string;
    kind: 'CATEGORY' | 'TAG';
    scope: 'BLOG' | 'PORTFOLIO' | 'PAGE' | 'REPORT' | 'GLOBAL';
    isRequired: boolean;
    isMultiSelect: boolean;
    terms: TaxonomyTerm[];
}

interface CustomField {
    id: number;
    contentType: string;
    key: string;
    label: string;
    description?: string;
    fieldType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'URL' | 'SELECT' | 'MULTISELECT';
    required: boolean;
    options?: any;
    order: number;
}

interface Webhook {
    id: number;
    name: string;
    target: 'SLACK' | 'DISCORD' | 'ZAPIER' | 'CUSTOM';
    url: string;
    secret?: string;
    active: boolean;
    contentTypes: string[];
    events: string[];
}

const SettingsCms: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('general-seo');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // CmsSettings State
    const [siteName, setSiteName] = useState('Alberto Farah');
    const [siteUrl, setSiteUrl] = useState('https://albertofarah.com');
    const [seoDefaults, setSeoDefaults] = useState<any>({
        blog: { metaTitleTemplate: '{title} | Alberto Farah - Blog', metaDescriptionTemplate: '{description}' },
        portfolio: { metaTitleTemplate: '{title} | Alberto Farah - Proyectos', metaDescriptionTemplate: '{description}' },
        indexing: {
            allowIndexing: true,
            disallowedPaths: ['/admin*', '/invite*'],
            sitemap: {
                enabled: true,
                changefreqByType: { BLOG: 'weekly', PORTFOLIO: 'monthly', PAGE: 'monthly' },
                priorityByType: { BLOG: 0.8, PORTFOLIO: 0.9, PAGE: 0.7 }
            }
        }
    });
    const [mediaSettings, setMediaSettings] = useState<any>({
        maxImageSizeMB: 5,
        autoResizeOnUpload: true,
        resizeOptions: { maxWidth: 1920, maxHeight: 1080, format: 'webp', quality: 0.85 },
        storage: 'local'
    });
    const [publishingConfig, setPublishingConfig] = useState<any>({
        webhooksEnabled: true
    });

    // Taxonomies State
    const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
    const [selectedTaxonomy, setSelectedTaxonomy] = useState<Taxonomy | null>(null);
    const [newTaxonomyName, setNewTaxonomyName] = useState('');
    const [newTaxonomyKind, setNewTaxonomyKind] = useState<'CATEGORY' | 'TAG'>('CATEGORY');
    const [newTaxonomyScope, setNewTaxonomyScope] = useState<'BLOG' | 'PORTFOLIO' | 'GLOBAL'>('GLOBAL');
    const [newTaxonomyRequired, setNewTaxonomyRequired] = useState(false);
    const [newTaxonomyMultiSelect, setNewTaxonomyMultiSelect] = useState(true);
    const [newTermName, setNewTermName] = useState('');

    // Custom Fields State
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<CustomField['fieldType']>('TEXT');
    const [newFieldContentType, setNewFieldContentType] = useState('PORTFOLIO');
    const [newFieldRequired, setNewFieldRequired] = useState(false);
    const [newFieldOptions, setNewFieldOptions] = useState(''); // comma-separated for select/multiselect

    // Webhooks State
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [newWebhookName, setNewWebhookName] = useState('');
    const [newWebhookTarget, setNewWebhookTarget] = useState<Webhook['target']>('CUSTOM');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookSecret, setNewWebhookSecret] = useState('');
    const [newWebhookBlog, setNewWebhookBlog] = useState(true);
    const [newWebhookPortfolio, setNewWebhookPortfolio] = useState(true);

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'general-seo', label: 'General & SEO', icon: <Globe size={16} /> },
        { id: 'taxonomies', label: 'Taxonomías', icon: <Tags size={16} /> },
        { id: 'custom-fields', label: 'Campos Personalizados', icon: <Layers size={16} /> },
        { id: 'automation', label: 'Automatización', icon: <Zap size={16} /> },
        { id: 'media', label: 'Medios', icon: <Image size={16} /> },
    ];

    useEffect(() => {
        fetchSettings();
        fetchTaxonomies();
        fetchCustomFields();
        fetchWebhooks();
    }, []);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // --- API FETCH CALLS ---

    const fetchSettings = async () => {
        try {
            const res = await authFetch('/api/cms-settings');
            if (res.ok) {
                const data = await res.json();
                if (data.siteName) setSiteName(data.siteName);
                if (data.siteUrl) setSiteUrl(data.siteUrl);
                if (data.seoDefaults) setSeoDefaults(data.seoDefaults);
                if (data.mediaSettings) setMediaSettings(data.mediaSettings);
                if (data.publishingConfig) setPublishingConfig(data.publishingConfig);
            }
        } catch (err) {
            console.error('Error fetching CMS settings:', err);
        }
    };

    const fetchTaxonomies = async () => {
        try {
            const res = await authFetch('/api/cms-settings/taxonomies');
            if (res.ok) {
                const data = await res.json();
                setTaxonomies(data);
                if (selectedTaxonomy) {
                    const updated = data.find((t: Taxonomy) => t.id === selectedTaxonomy.id);
                    if (updated) setSelectedTaxonomy(updated);
                }
            }
        } catch (err) {
            console.error('Error fetching taxonomies:', err);
        }
    };

    const fetchCustomFields = async () => {
        try {
            const res = await authFetch('/api/cms-settings/custom-fields');
            if (res.ok) {
                const data = await res.json();
                setCustomFields(data);
            }
        } catch (err) {
            console.error('Error fetching custom fields:', err);
        }
    };

    const fetchWebhooks = async () => {
        try {
            const res = await authFetch('/api/cms-settings/webhooks');
            if (res.ok) {
                const data = await res.json();
                setWebhooks(data);
            }
        } catch (err) {
            console.error('Error fetching webhooks:', err);
        }
    };

    // --- ACTIONS ---

    const saveGeneralSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch('/api/cms-settings/general', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteName, siteUrl })
            });
            if (res.ok) {
                showSuccess('Ajustes generales guardados correctamente.');
            } else {
                throw new Error('Error al guardar ajustes generales.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveSeoSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch('/api/cms-settings/seo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seoDefaults)
            });
            if (res.ok) {
                showSuccess('Ajustes SEO guardados correctamente.');
            } else {
                throw new Error('Error al guardar ajustes SEO.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveMediaSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch('/api/cms-settings/media', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mediaSettings)
            });
            if (res.ok) {
                showSuccess('Ajustes de medios guardados correctamente.');
            } else {
                throw new Error('Error al guardar ajustes de medios.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Taxonomies actions
    const handleCreateTaxonomy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaxonomyName.trim()) return;

        try {
            const res = await authFetch('/api/cms-settings/taxonomies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTaxonomyName,
                    kind: newTaxonomyKind,
                    scope: newTaxonomyScope,
                    isRequired: newTaxonomyRequired,
                    isMultiSelect: newTaxonomyMultiSelect
                })
            });
            if (res.ok) {
                setNewTaxonomyName('');
                fetchTaxonomies();
                showSuccess('Taxonomía creada.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTaxonomy = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta taxonomía? Todos sus términos se desvincularán.')) return;
        try {
            const res = await authFetch(`/api/cms-settings/taxonomies/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                if (selectedTaxonomy?.id === id) setSelectedTaxonomy(null);
                fetchTaxonomies();
                showSuccess('Taxonomía eliminada.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTerm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTaxonomy || !newTermName.trim()) return;

        try {
            const res = await authFetch(`/api/cms-settings/taxonomies/${selectedTaxonomy.id}/terms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTermName })
            });
            if (res.ok) {
                setNewTermName('');
                fetchTaxonomies();
                showSuccess('Término agregado.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTerm = async (id: number) => {
        try {
            const res = await authFetch(`/api/cms-settings/terms/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchTaxonomies();
                showSuccess('Término eliminado.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Custom Fields actions
    const handleCreateCustomField = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFieldKey.trim() || !newFieldLabel.trim()) return;

        const optionsArr = newFieldOptions
            ? newFieldOptions.split(',').map(o => o.trim()).filter(Boolean)
            : undefined;

        try {
            const res = await authFetch('/api/cms-settings/custom-fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentType: newFieldContentType,
                    key: newFieldKey.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                    label: newFieldLabel,
                    fieldType: newFieldType,
                    required: newFieldRequired,
                    options: optionsArr
                })
            });
            if (res.ok) {
                setNewFieldKey('');
                setNewFieldLabel('');
                setNewFieldOptions('');
                fetchCustomFields();
                showSuccess('Campo personalizado definido correctamente.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCustomField = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta definición de campo? Los valores guardados en los contenidos no se borrarán, pero ya no se mostrarán en el formulario.')) return;
        try {
            const res = await authFetch(`/api/cms-settings/custom-fields/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchCustomFields();
                showSuccess('Campo eliminado.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Webhooks actions
    const handleCreateWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWebhookName.trim() || !newWebhookUrl.trim()) return;

        const contentTypes = [];
        if (newWebhookBlog) contentTypes.push('BLOG');
        if (newWebhookPortfolio) contentTypes.push('PORTFOLIO');

        try {
            const res = await authFetch('/api/cms-settings/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newWebhookName,
                    target: newWebhookTarget,
                    url: newWebhookUrl,
                    secret: newWebhookSecret || undefined,
                    active: true,
                    contentTypes,
                    events: ['CONTENT_PUBLISHED']
                })
            });
            if (res.ok) {
                setNewWebhookName('');
                setNewWebhookUrl('');
                setNewWebhookSecret('');
                fetchWebhooks();
                showSuccess('Webhook agregado.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteWebhook = async (id: number) => {
        try {
            const res = await authFetch(`/api/cms-settings/webhooks/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchWebhooks();
                showSuccess('Webhook eliminado.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleWebhook = async (webhook: Webhook) => {
        try {
            const res = await authFetch(`/api/cms-settings/webhooks/${webhook.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...webhook, active: !webhook.active })
            });
            if (res.ok) {
                fetchWebhooks();
                showSuccess(`Webhook ${!webhook.active ? 'activado' : 'desactivado'}.`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- STYLES ---
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.85rem 1rem',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        marginTop: '0.25rem'
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'white\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center'
    };

    const toggleStyle = (active: boolean) => ({
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: active ? 'var(--color-accent, #A3FF00)' : 'rgba(255, 255, 255, 0.1)',
        position: 'relative' as const,
        cursor: 'pointer',
        border: 'none',
        transition: 'background 0.3s'
    });

    const togglePillStyle = (active: boolean) => ({
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: active ? '#000' : '#fff',
        position: 'absolute' as const,
        top: '3px',
        left: active ? '23px' : '3px',
        transition: 'all 0.3s'
    });

    return (
        <div style={{ padding: '0 0.5rem', color: '#fff' }}>
            {/* Success & Error alerts */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                            background: '#A3FF00', color: '#000', padding: '12px 24px',
                            borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <Check size={18} />
                        {successMessage}
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                            background: '#ef4444', color: '#fff', padding: '12px 24px',
                            borderRadius: '8px', fontWeight: 'bold'
                        }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="admin-page-header">
                <h1 className="admin-page-title">Configuración del CMS</h1>
                <p className="admin-page-subtitle">Personaliza tus taxonomías, campos dinámicos, automatizaciones y SEO global.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', marginTop: '2rem' }} className="settings-layout">
                {/* Sidebar Navigation */}
                <PremiumTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as TabId)}
                    className="flex-col w-full bg-transparent border-none p-0"
                />

                {/* Main Content Area */}
                <div
                    style={{
                        background: 'rgba(20, 20, 20, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        backdropFilter: 'blur(20px)',
                        minHeight: '500px'
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* GENERAL & SEO TAB */}
                            {activeTab === 'general-seo' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 750, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>Ajustes del Sitio</h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>Nombre del Sitio</label>
                                                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>URL del Sitio (Producción)</label>
                                                <input type="text" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} style={inputStyle} />
                                            </div>
                                        </div>
                                        <button onClick={saveGeneralSettings} disabled={loading} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Save size={16} /> Guardar Ajustes Generales
                                        </button>
                                    </div>

                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 750, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>Plantillas SEO Metadatos</h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '0.95rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>Proyectos (Portfolio)</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Plantilla de Título</label>
                                                        <input type="text" value={seoDefaults.portfolio?.metaTitleTemplate} onChange={(e) => setSeoDefaults({ ...seoDefaults, portfolio: { ...seoDefaults.portfolio, metaTitleTemplate: e.target.value } })} style={inputStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Plantilla de Descripción</label>
                                                        <input type="text" value={seoDefaults.portfolio?.metaDescriptionTemplate} onChange={(e) => setSeoDefaults({ ...seoDefaults, portfolio: { ...seoDefaults.portfolio, metaDescriptionTemplate: e.target.value } })} style={inputStyle} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '0.95rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>Artículos (Blog)</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Plantilla de Título</label>
                                                        <input type="text" value={seoDefaults.blog?.metaTitleTemplate} onChange={(e) => setSeoDefaults({ ...seoDefaults, blog: { ...seoDefaults.blog, metaTitleTemplate: e.target.value } })} style={inputStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Plantilla de Descripción</label>
                                                        <input type="text" value={seoDefaults.blog?.metaDescriptionTemplate} onChange={(e) => setSeoDefaults({ ...seoDefaults, blog: { ...seoDefaults.blog, metaDescriptionTemplate: e.target.value } })} style={inputStyle} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 750, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>Indexación & Sitemaps</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>Permitir Indexación en Motores de Búsqueda (Google/Bing)</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Si se desactiva, robots.txt bloqueará todos los rastreadores.</div>
                                                </div>
                                                <button
                                                    onClick={() => setSeoDefaults({ ...seoDefaults, indexing: { ...seoDefaults.indexing, allowIndexing: !seoDefaults.indexing?.allowIndexing } })}
                                                    style={toggleStyle(seoDefaults.indexing?.allowIndexing)}
                                                >
                                                    <span style={togglePillStyle(seoDefaults.indexing?.allowIndexing)} />
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>Generación Automática de Sitemap.xml</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Mantiene un listado indexable dinámico en /sitemap.xml.</div>
                                                </div>
                                                <button
                                                    onClick={() => setSeoDefaults({ ...seoDefaults, indexing: { ...seoDefaults.indexing, sitemap: { ...seoDefaults.indexing?.sitemap, enabled: !seoDefaults.indexing?.sitemap?.enabled } } })}
                                                    style={toggleStyle(seoDefaults.indexing?.sitemap?.enabled)}
                                                >
                                                    <span style={togglePillStyle(seoDefaults.indexing?.sitemap?.enabled)} />
                                                </button>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>Rutas bloqueadas en robots.txt (separadas por coma)</label>
                                                <input
                                                    type="text"
                                                    value={seoDefaults.indexing?.disallowedPaths?.join(', ')}
                                                    onChange={(e) => setSeoDefaults({ ...seoDefaults, indexing: { ...seoDefaults.indexing, disallowedPaths: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={saveSeoSettings} disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.85rem 2rem', background: 'var(--color-accent, #A3FF00)', color: '#000', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Save size={16} /> Guardar Ajustes SEO
                                    </button>
                                </div>
                            )}

                            {/* TAXONOMIES TAB */}
                            {activeTab === 'taxonomies' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 750, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Estructura de Categorías & Etiquetas</h2>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1.5rem' }}>Define agrupadores globales para catalogar tu portafolio y blog de forma interactiva.</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
                                            {/* Left: Create Taxonomy & List */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <form onSubmit={handleCreateTaxonomy} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1rem' }}>Crear Nueva Taxonomía</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: '#888' }}>Nombre</label>
                                                            <input type="text" placeholder="Ej. Categorías de IA" value={newTaxonomyName} onChange={(e) => setNewTaxonomyName(e.target.value)} style={inputStyle} />
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', color: '#888' }}>Tipo</label>
                                                                <select value={newTaxonomyKind} onChange={(e) => setNewTaxonomyKind(e.target.value as any)} style={selectStyle}>
                                                                    <option value="CATEGORY">Categoría (Jerárquica)</option>
                                                                    <option value="TAG">Etiqueta (Plana)</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', color: '#888' }}>Alcance</label>
                                                                <select value={newTaxonomyScope} onChange={(e) => setNewTaxonomyScope(e.target.value as any)} style={selectStyle}>
                                                                    <option value="GLOBAL">Global</option>
                                                                    <option value="BLOG">Solo Blog</option>
                                                                    <option value="PORTFOLIO">Solo Proyectos</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                <input type="checkbox" checked={newTaxonomyRequired} onChange={(e) => setNewTaxonomyRequired(e.target.checked)} /> Requerido
                                                            </label>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                <input type="checkbox" checked={newTaxonomyMultiSelect} onChange={(e) => setNewTaxonomyMultiSelect(e.target.checked)} /> Multi-selección
                                                            </label>
                                                        </div>
                                                        <button type="submit" style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', background: 'var(--color-accent, #A3FF00)', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                                                            Agregar Taxonomía
                                                        </button>
                                                    </div>
                                                </form>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Taxonomías Existentes</h3>
                                                    {taxonomies.length === 0 ? (
                                                        <div style={{ color: '#555', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>No hay taxonomías creadas.</div>
                                                    ) : (
                                                        taxonomies.map(t => (
                                                            <div
                                                                key={t.id}
                                                                onClick={() => setSelectedTaxonomy(t)}
                                                                style={{
                                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                    padding: '0.85rem 1rem', borderRadius: '10px',
                                                                    background: selectedTaxonomy?.id === t.id ? 'rgba(163,255,0,0.1)' : 'rgba(255,255,255,0.02)',
                                                                    border: '1px solid ' + (selectedTaxonomy?.id === t.id ? 'var(--color-accent, #A3FF00)' : 'rgba(255,255,255,0.05)'),
                                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <div>
                                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', gap: '8px', marginTop: '0.25rem' }}>
                                                                        <span>{t.kind}</span>
                                                                        <span>•</span>
                                                                        <span>{t.scope}</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTaxonomy(t.id); }}
                                                                    style={{ color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Terms Editor for Selected Taxonomy */}
                                            <div>
                                                {selectedTaxonomy ? (
                                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Términos: {selectedTaxonomy.name}</h3>
                                                            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Configura los tags/categorías específicos que pertenecen a esta taxonomía.</p>
                                                        </div>

                                                        <form onSubmit={handleCreateTerm} style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <input type="text" placeholder="Ej. Agentes IA" value={newTermName} onChange={(e) => setNewTermName(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} />
                                                            <button type="submit" style={{ padding: '0 1rem', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer' }}>
                                                                Agregar
                                                            </button>
                                                        </form>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '100px', alignContent: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                                            {(!selectedTaxonomy.terms || selectedTaxonomy.terms.length === 0) ? (
                                                                <div style={{ color: '#555', fontSize: '0.8rem', width: '100%', textAlign: 'center', padding: '1.5rem' }}>No hay términos definidos. Escribe arriba para agregar.</div>
                                                            ) : (
                                                                selectedTaxonomy.terms.map(term => (
                                                                    <div key={term.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '30px', fontSize: '0.8rem' }}>
                                                                        <span>{term.name}</span>
                                                                        <button onClick={() => handleDeleteTerm(term.id)} style={{ border: 'none', background: 'none', color: '#888', hover: { color: '#ef4444' }, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' } as any}>
                                                                            <Trash2 size={12} style={{ marginLeft: '4px' }} />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', color: '#555', padding: '2rem', textAlign: 'center' }}>
                                                        <Tags size={32} style={{ marginBottom: '1rem' }} />
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>No se ha seleccionado ninguna taxonomía</div>
                                                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Elige una del listado de la izquierda para editar sus términos y tags correspondientes.</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOM FIELDS TAB */}
                            {activeTab === 'custom-fields' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 750, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Campos Dinámicos Personalizados</h2>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1.5rem' }}>Define campos adicionales para tus contenidos (ej: "Duración", "ROI", "Tecnología Principal") sin alterar la base de datos.</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                                            {/* Left: Custom Fields list */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Definiciones de Campos</h3>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {customFields.length === 0 ? (
                                                        <div style={{ color: '#555', fontSize: '0.85rem', padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                                            No hay campos personalizados definidos. Utiliza el formulario de la derecha para crear uno.
                                                        </div>
                                                    ) : (
                                                        ['PORTFOLIO', 'BLOG', 'REPORT'].map(type => {
                                                            const fields = customFields.filter(f => f.contentType === type);
                                                            if (fields.length === 0) return null;

                                                            return (
                                                                <div key={type} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem' }}>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-accent, #A3FF00)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                                                                        {type}
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                        {fields.map(field => (
                                                                            <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                <div>
                                                                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{field.label}</div>
                                                                                    <div style={{ fontSize: '0.7rem', color: '#666', display: 'flex', gap: '8px', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                                                                                        <span>key: {field.key}</span>
                                                                                        <span>•</span>
                                                                                        <span>type: {field.fieldType}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <button onClick={() => handleDeleteCustomField(field.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Create Field definition Form */}
                                            <form onSubmit={handleCreateCustomField} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Crear Campo</h3>
                                                
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#888' }}>Tipo de Contenido</label>
                                                    <select value={newFieldContentType} onChange={(e) => setNewFieldContentType(e.target.value)} style={selectStyle}>
                                                        <option value="PORTFOLIO">Portafolio / Proyectos</option>
                                                        <option value="BLOG">Artículos de Blog</option>
                                                        <option value="REPORT">Reportes</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#888' }}>Etiqueta de Entrada (Nombre visual)</label>
                                                    <input type="text" placeholder="Ej. ROI Obtenido" value={newFieldLabel} onChange={(e) => {
                                                        setNewFieldLabel(e.target.value);
                                                        setNewFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                                                    }} style={inputStyle} />
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#888' }}>Identificador Key (Guardado en base de datos)</label>
                                                    <input type="text" placeholder="Ej. roi_obtenido" value={newFieldKey} onChange={(e) => setNewFieldKey(e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace' }} />
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#888' }}>Tipo de Dato</label>
                                                    <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as any)} style={selectStyle}>
                                                        <option value="TEXT">Texto Corto</option>
                                                        <option value="TEXTAREA">Texto Largo</option>
                                                        <option value="NUMBER">Número</option>
                                                        <option value="BOOLEAN">Booleano (Sí/No)</option>
                                                        <option value="DATE">Fecha</option>
                                                        <option value="URL">Enlace URL</option>
                                                        <option value="SELECT">Selección Unica (Dropdown)</option>
                                                    </select>
                                                </div>

                                                {newFieldType === 'SELECT' && (
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Opciones (Separadas por comas)</label>
                                                        <input type="text" placeholder="Opción 1, Opción 2, Opción 3" value={newFieldOptions} onChange={(e) => setNewFieldOptions(e.target.value)} style={inputStyle} />
                                                    </div>
                                                )}

                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                                    <input type="checkbox" checked={newFieldRequired} onChange={(e) => setNewFieldRequired(e.target.checked)} /> Este campo es obligatorio
                                                </label>

                                                <button type="submit" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-accent, #A3FF00)', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                                                    Registrar Definición
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AUTOMATION TAB (WEBHOOKS) */}
                            {activeTab === 'automation' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 750, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Webhooks de Publicación Automática</h2>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1.5rem' }}>Configura URLs para despachar notificaciones en tiempo real (Slack, Discord, Zapier) al publicar contenidos del CMS.</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                                            {/* Left: Webhooks list */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Webhooks Registrados</h3>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {webhooks.length === 0 ? (
                                                        <div style={{ color: '#555', fontSize: '0.85rem', padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                                            No hay webhooks activos.
                                                        </div>
                                                    ) : (
                                                        webhooks.map(w => (
                                                            <div key={w.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem' }}>
                                                                <button onClick={() => handleToggleWebhook(w)} style={toggleStyle(w.active)}>
                                                                    <span style={togglePillStyle(w.active)} />
                                                                </button>
                                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{w.name}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                                                                        {w.url}
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '6px', marginTop: '0.5rem' }}>
                                                                        {w.contentTypes.map(c => (
                                                                            <span key={c} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem' }}>{c}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => handleDeleteWebhook(w.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Create Webhook Form */}
                                            <form onSubmit={handleCreateWebhook} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Añadir Destinatario</h3>
                                                
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#888' }}>Nombre Descriptivo</label>
                                                    <input type="text" placeholder="Ej. Canal de Slack #noticias" value={newWebhookName} onChange={(e) => setNewWebhookName(e.target.value)} style={inputStyle} />
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Target</label>
                                                        <select value={newWebhookTarget} onChange={(e) => setNewWebhookTarget(e.target.value as any)} style={selectStyle}>
                                                            <option value="CUSTOM">Custom Webhook</option>
                                                            <option value="SLACK">Slack Payload</option>
                                                            <option value="DISCORD">Discord Embed</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Firma Secreta HMAC (Opcional)</label>
                                                        <input type="text" placeholder="sk_secret..." value={newWebhookSecret} onChange={(e) => setNewWebhookSecret(e.target.value)} style={inputStyle} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#888' }}>Webhook Endpoint URL</label>
                                                    <input type="url" placeholder="https://hooks.slack.com/services/..." value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} style={inputStyle} />
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Filtro de Contenidos a Despachar</label>
                                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={newWebhookBlog} onChange={(e) => setNewWebhookBlog(e.target.checked)} /> Artículos (Blog)
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={newWebhookPortfolio} onChange={(e) => setNewWebhookPortfolio(e.target.checked)} /> Proyectos (Portafolio)
                                                        </label>
                                                    </div>
                                                </div>

                                                <button type="submit" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-accent, #A3FF00)', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                                                    Registrar Webhook
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MEDIA LIMITS TAB */}
                            {activeTab === 'media' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 750, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Optimización de Medios & Almacenamiento</h2>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1.5rem' }}>Configura los límites de subida de imágenes y define transformaciones automáticas para acelerar el tiempo de carga en producción.</p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>Tamaño Máximo de Subida (MB)</label>
                                                    <input
                                                        type="number"
                                                        value={mediaSettings.maxImageSizeMB}
                                                        onChange={(e) => setMediaSettings({ ...mediaSettings, maxImageSizeMB: parseFloat(e.target.value) })}
                                                        style={inputStyle}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>Destino del Almacenamiento</label>
                                                    <select
                                                        value={mediaSettings.storage}
                                                        onChange={(e) => setMediaSettings({ ...mediaSettings, storage: e.target.value })}
                                                        style={selectStyle}
                                                    >
                                                        <option value="local">Disco Local (Servidor)</option>
                                                        <option value="drive">Google Drive Workspace</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', marginTop: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>Redimensionar Automáticamente al Subir</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Optimiza imágenes reduciendo su resolución y peso al guardarse.</div>
                                                </div>
                                                <button
                                                    onClick={() => setMediaSettings({ ...mediaSettings, autoResizeOnUpload: !mediaSettings.autoResizeOnUpload })}
                                                    style={toggleStyle(mediaSettings.autoResizeOnUpload)}
                                                >
                                                    <span style={togglePillStyle(mediaSettings.autoResizeOnUpload)} />
                                                </button>
                                            </div>

                                            {mediaSettings.autoResizeOnUpload && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '16px' }}
                                                >
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Ancho Máximo (px)</label>
                                                        <input
                                                            type="number"
                                                            value={mediaSettings.resizeOptions?.maxWidth}
                                                            onChange={(e) => setMediaSettings({ ...mediaSettings, resizeOptions: { ...mediaSettings.resizeOptions, maxWidth: parseInt(e.target.value, 10) } })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Alto Máximo (px)</label>
                                                        <input
                                                            type="number"
                                                            value={mediaSettings.resizeOptions?.maxHeight}
                                                            onChange={(e) => setMediaSettings({ ...mediaSettings, resizeOptions: { ...mediaSettings.resizeOptions, maxHeight: parseInt(e.target.value, 10) } })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Formato Recomendado</label>
                                                        <select
                                                            value={mediaSettings.resizeOptions?.format}
                                                            onChange={(e) => setMediaSettings({ ...mediaSettings, resizeOptions: { ...mediaSettings.resizeOptions, format: e.target.value } })}
                                                            style={selectStyle}
                                                        >
                                                            <option value="webp">WebP (Optimizado Web)</option>
                                                            <option value="jpeg">JPEG (Estándar)</option>
                                                            <option value="png">PNG (Preserva canal Alfa)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Calidad de Compresión (0.1 - 1.0)</label>
                                                        <input
                                                            type="number"
                                                            step="0.05"
                                                            min="0.1"
                                                            max="1"
                                                            value={mediaSettings.resizeOptions?.quality}
                                                            onChange={(e) => setMediaSettings({ ...mediaSettings, resizeOptions: { ...mediaSettings.resizeOptions, quality: parseFloat(e.target.value) } })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    <button onClick={saveMediaSettings} disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.85rem 2rem', background: 'var(--color-accent, #A3FF00)', color: '#000', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Save size={16} /> Guardar Ajustes de Medios
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SettingsCms;
