import { Injectable } from '@nestjs/common';

// Note: For production, puppeteer should be installed: npm install puppeteer
// For now, we provide a fallback HTML-based solution

@Injectable()
export class PdfService {
    private puppeteer: any;
    private puppeteerAvailable = false;

    constructor() {
        // Try to load puppeteer dynamically
        try {
            this.puppeteer = require('puppeteer');
            this.puppeteerAvailable = true;
        } catch {
            console.warn('Puppeteer not installed. PDF generation will return HTML.');
        }
    }

    async generatePdf(htmlContent: string): Promise<Buffer> {
        if (!this.puppeteerAvailable) {
            // Return HTML as buffer if puppeteer is not available
            return Buffer.from(htmlContent, 'utf-8');
        }

        let browser;
        try {
            browser = await this.puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    bottom: '40px',
                    left: '20px',
                    right: '20px'
                }
            });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw new Error('Failed to generate PDF');
        } finally {
            if (browser) await browser.close();
        }
    }

    getInvoiceTemplate(invoice: any, companyDetails: any): string {
        const items = invoice.items || [];
        const itemsHtml = items.map((item: any) => `
            <tr>
                <td>${item.description || item.name || 'Item'}</td>
                <td style="text-align: center">${item.quantity || 1}</td>
                <td style="text-align: right">$${(item.unitPrice || item.price || 0).toFixed(2)}</td>
                <td style="text-align: right">$${((item.quantity || 1) * (item.unitPrice || item.price || 0)).toFixed(2)}</td>
            </tr>
        `).join('');

        const subtotal = items.reduce((sum: number, item: any) =>
            sum + (item.quantity || 1) * (item.unitPrice || item.price || 0), 0
        );
        const taxRate = invoice.taxRate || 18;
        const taxAmount = subtotal * (taxRate / 100);
        const total = invoice.total || (subtotal + taxAmount);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .title { font-size: 28px; font-weight: bold; color: #4f46e5; }
                    .invoice-info { color: #666; }
                    .company-info { text-align: right; }
                    .company-info h3 { margin: 0 0 5px 0; color: #333; }
                    .bill-to { margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; }
                    .bill-to strong { color: #4f46e5; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { text-align: left; background: #f3f4f6; padding: 12px; font-weight: 600; }
                    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
                    .totals { float: right; width: 300px; margin-top: 30px; }
                    .totals .row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
                    .notes { margin-top: 60px; padding: 15px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #666; }
                    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="title">INVOICE</div>
                        <div class="invoice-info">
                            <p><strong>#${invoice.number}</strong></p>
                            <p>Date: ${new Date(invoice.createdAt || new Date()).toLocaleDateString()}</p>
                            ${invoice.dueDate ? `<p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
                        </div>
                    </div>
                    <div class="company-info">
                        <h3>${companyDetails?.name || 'Your Company'}</h3>
                        <p>${companyDetails?.address || ''}</p>
                        <p>${companyDetails?.email || ''}</p>
                        <p>${companyDetails?.phone || ''}</p>
                    </div>
                </div>

                <div class="bill-to">
                    <strong>Bill To:</strong>
                    <p style="margin: 5px 0 0 0; font-size: 16px;">${invoice.client?.company || invoice.client?.name || 'Client'}</p>
                    <p style="margin: 2px 0; color: #666;">${invoice.client?.email || ''}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center">Qty</th>
                            <th style="text-align: right">Price</th>
                            <th style="text-align: right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="row">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="row">
                        <span>Tax (${taxRate}%):</span>
                        <span>$${taxAmount.toFixed(2)}</span>
                    </div>
                    <div class="row grand-total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)} ${invoice.currency || 'USD'}</span>
                    </div>
                </div>

                <div style="clear: both;"></div>

                <div class="notes">
                    <p><strong>Notes:</strong></p>
                    <p>${invoice.notes || 'Thank you for your business!'}</p>
                </div>

                <div class="footer">
                    <p>Generated by Iris CRM</p>
                </div>
            </body>
            </html>
        `;
    }

    getContractTemplate(contract: any): string {
        const dateStr = new Date(contract.issueDate || new Date()).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generate cryptographic signature of contract parameters
        const crypto = require('crypto');
        const dataToSign = `${contract.clientRuc || ''}-${contract.price || 0}-${contract.planCode || ''}-${contract.currency || ''}-${dateStr}`;
        const secret = process.env.JWT_SECRET || 'fallback-secret-for-hmac-integrity-validation-2026';
        const hmacSignature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex').toUpperCase();


        // Determine currency symbol
        const currencySymbol = contract.currency === 'PEN' ? 'S/.' : '$';

        // Format price
        const formattedPrice = new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(contract.price || 0);

        // Get details of SOWs
        const sowTemplates: Record<string, { title: string; scope: string; access: string; milestones: string }> = {
            'C.1': {
                title: 'ANEXO TÉCNICO C.1: Reingeniería Lógica y Migración de Automatizaciones a n8n',
                scope: `<ul>
                    <li><strong>Auditoría y Mapeo Lógico:</strong> Auditoría y documentación técnica visual de hasta cinco (5) flujos lógicos activos en las plataformas origen (Zapier o Make).</li>
                    <li><strong>Despliegue de Entorno Dedicado:</strong> Configuración y hardening de un servidor VPS Linux (Ubuntu) en el proveedor del Cliente (${contract.vpsProvider || 'Hetzner'}), instalando n8n bajo contenedores Docker aislados, base de datos PostgreSQL dedicada y certificado de seguridad SSL Let's Encrypt.</li>
                    <li><strong>Reingeniería y Migración:</strong> Reconstrucción optimizada de los 5 flujos en n8n, utilizando scripting (JavaScript/Node.js) para consolidar tareas y minimizar llamadas innecesarias a APIs.</li>
                    <li><strong>Resiliencia Operativa:</strong> Implementación de flujos de backup automáticos diarios cifrados hacia un bucket S3/Cloudflare R2 y alertas inmediatas a Slack/WhatsApp en caso de fallos lógicos.</li>
                    <li><strong>Entrega:</strong> Video interactivo de Loom (10 min) detallando la operatividad de los flujos y entrega de credenciales.</li>
                </ul>`,
                access: `<ul>
                    <li>Credenciales de solo lectura de la cuenta de Zapier/Make origen.</li>
                    <li>Acceso de administrador al panel de control del hosting/VPS para configuración DNS y Docker.</li>
                    <li>API Keys y credenciales de autenticación activas para las herramientas integradas en los flujos.</li>
                </ul>`,
                milestones: `El precio cerrado de este anexo se fija en <strong>${currencySymbol} ${formattedPrice} ${contract.currency}</strong> (Más IGV 18% si es local en Perú). Los hitos de pago se estructuran de la siguiente manera:<br/>
                <ul>
                    <li><strong>Hito 1 (Inicio):</strong> 50% de anticipo (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}). Se inicia la fase de auditoría y despliegue del VPS.</li>
                    <li><strong>Hito 2 (Entrega):</strong> 50% restante (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}) tras la ejecución del Shadow Run paralelo (7 días útiles) confirmando cero discrepancias de datos.</li>
                </ul>`
            },
            'C.2': {
                title: 'ANEXO TÉCNICO C.2: Plataforma Web, Tienda Virtual o Academia LMS',
                scope: `<ul>
                    <li><strong>Instalación y Cache de Servidor:</strong> Configuración del CMS WordPress en el hosting del Cliente, aplicando optimización técnica de velocidad (WPO) mediante compresión Gzip, almacenamiento en caché a nivel de base de datos y optimización de recursos estáticos.</li>
                    <li><strong>Maquetación de Interfaces UX/UI:</strong> Configuración del tema base, tema hijo (child theme) e interfaces responsivas a medida mediante constructores visuales (Hello Elementor / Astra).</li>
                    <li><strong>Motor Transaccional / LMS:</strong> Configuración del catálogo y carrito de compras (WooCommerce) o del sistema de cursos y membresías (LearnDash/TutorLMS).</li>
                    <li><strong>Pasarela de Pagos:</strong> Integración segura de pasarelas locales en Perú (Culqi, Niubiz) o globales (Stripe, PayPal) en entorno sandbox y pase a producción.</li>
                    <li><strong>SEO Técnico:</strong> Configuración de redirecciones HTTPS forzosas, sitemap XML, indexación en Google Search Console y optimización técnica de velocidad de carga superior a 90 puntos en móviles (PageSpeed).</li>
                </ul>`,
                access: `<ul>
                    <li>Accesos de administrador al panel de cPanel/Hostinger.</li>
                    <li>Credenciales de acceso al proveedor de dominio (GoDaddy, Namecheap, punto.pe).</li>
                    <li>Credenciales en entorno de producción de las pasarelas de pago.</li>
                </ul>`,
                milestones: `El precio cerrado de este anexo se fija en <strong>${currencySymbol} ${formattedPrice} ${contract.currency}</strong> (Más IGV 18% si es local en Perú). Los hitos de pago se estructuran de la siguiente manera:<br/>
                <ul>
                    <li><strong>Hito 1 (Inicio):</strong> 50% de anticipo (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}). Se inician los trabajos de maquetación y diseño de bases de datos.</li>
                    <li><strong>Hito 2 (Entrega):</strong> 50% restante (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}) a la firma del acta de conformidad tras pruebas exitosas de compra/registro.</li>
                </ul>`
            },
            'B.1': {
                title: 'ANEXO TÉCNICO B.1: Orquestación de Leads y Canales Corporativos (Silhouette OS)',
                scope: `<ul>
                    <li><strong>Licenciamiento Silhouette OS:</strong> Integración de la consola web propietaria <strong>Silhouette OS</strong> bajo el subdominio y marca del Cliente.</li>
                    <li><strong>Despliegue de Silhouette Brain:</strong> Configuración del motor de procesamiento semántico en n8n para auditar leads entrantes, evaluar el ajuste con el Perfil de Cliente Ideal (ICP) y asignar un score inteligente (0-100).</li>
                    <li><strong>Integración de API Conversacional:</strong> Vinculación de la API oficial de WhatsApp Business (Meta Cloud API) para disparar respuestas automáticas de perfilamiento en menos de 30 segundos.</li>
                    <li><strong>Sincronización de CRM:</strong> Conexión y enrutamiento dinámico de leads calificados hacia el CRM del Cliente (HubSpot, Pipedrive o Salesforce), enviando alertas inmediatas de leads calificados a Slack/WhatsApp.</li>
                    <li><strong>Calibración Semántica:</strong> 30 días calendario de fine-tuning de prompts y base de conocimientos de la IA para evitar alucinaciones.</li>
                </ul>`,
                access: `<ul>
                    <li>Acceso de administrador a Meta Business Manager para verificación del número de WhatsApp oficial.</li>
                    <li>Accesos de administrador con permisos API al CRM de la empresa.</li>
                    <li>Cuenta de OpenAI Developer activa con facturación en tarjeta registrada por el Cliente.</li>
                </ul>`,
                milestones: `El precio cerrado de este anexo se fija en <strong>${currencySymbol} ${formattedPrice} ${contract.currency}</strong> (Más IGV 18% si es local en Perú). Los hitos de pago se estructuran de la siguiente manera:<br/>
                <ul>
                    <li><strong>Hito 1 (Inicio):</strong> 50% de anticipo (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}). Se inicia la configuración del Business Manager y consola.</li>
                    <li><strong>Hito 2 (Entrega):</strong> 50% restante (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}) al término de las pruebas de enrutamiento exitosas.</li>
                </ul>`
            },
            'B.2': {
                title: 'ANEXO TÉCNICO B.2: Desarrollo de Aplicación Web Dedicada y Consola Operativa',
                scope: `<ul>
                    <li><strong>Arquitectura Frontend:</strong> Construcción de interfaz de usuario de página única (SPA) mediante React, TypeScript y TailwindCSS (código modular y limpio).</li>
                    <li><strong>Arquitectura Backend y Base de Datos:</strong> Backend en Node.js/Express con base de datos PostgreSQL, implementando seguridad de datos y control de accesos basados en roles (RBAC).</li>
                    <li><strong>Consola de Administración:</strong> Dashboard privado para gestión de usuarios, auditoría de logs y analíticas clave de negocio.</li>
                    <li><strong>Autenticación:</strong> Implementación de tokens JWT seguros y/o Supabase Auth.</li>
                    <li><strong>Despliegue:</strong> Configuración del repositorio GitHub y despliegue continuo (CI/CD) en Vercel, Netlify o servidores VPS propios de la empresa.</li>
                </ul>`,
                access: `<ul>
                    <li>Acceso al repositorio de código en GitHub/GitLab.</li>
                    <li>Accesos de administrador a la cuenta de Supabase / AWS / DigitalOcean del Cliente.</li>
                </ul>`,
                milestones: `El precio cerrado de este anexo se fija en <strong>${currencySymbol} ${formattedPrice} ${contract.currency}</strong> (Más IGV 18% si es local en Perú). Los hitos de pago se estructuran de la siguiente manera:<br/>
                <ul>
                    <li><strong>Hito 1 (Inicio):</strong> 40% de anticipo (${currencySymbol} ${(contract.price * 0.4).toFixed(2)}). Se inician los trabajos de maquetación y diseño de bases de datos.</li>
                    <li><strong>Hito 2 (Hito Medio):</strong> 30% (${currencySymbol} ${(contract.price * 0.3).toFixed(2)}) a la entrega de la versión Beta funcional.</li>
                    <li><strong>Hito 3 (Entrega):</strong> 30% restante (${currencySymbol} ${(contract.price * 0.3).toFixed(2)}) a la firma del acta de aceptación, previo al despliegue en producción.</li>
                </ul>`
            },
            'A.1': {
                title: 'ANEXO TÉCNICO A.1: Enjambres Autónomos de Razonamiento e Inteligencia Artificial',
                scope: `<ul>
                    <li><strong>Diseño de Swarms Multi-Agente:</strong> Desarrollo en Python del enjambre de agentes autónomos y colaborativos mediante la librería <strong>LangGraph</strong> (ej. agentes redactores, analistas de cumplimiento y enrutadores).</li>
                    <li><strong>Capa de Memoria Causal:</strong> Integración de la base de datos de memoria persistente <strong>CausalOS-Python</strong> para asegurar la retención histórica coherente de interacciones semánticas.</li>
                    <li><strong>Infraestructura de Telemetría:</strong> Vinculación y monitoreo del consumo de tokens y depuración de prompts con plataformas como LangSmith o Langfuse.</li>
                    <li><strong>Transferencia Tecnológica:</strong> Taller interactivo de 4 horas impartido por Alberto Farah Blair para el equipo de desarrollo interno del Cliente sobre el mantenimiento del sistema.</li>
                </ul>`,
                access: `<ul>
                    <li>Accesos de administrador al repositorio de código principal.</li>
                    <li>Credenciales de facturación activa en las plataformas de telemetría y APIs (OpenAI/Anthropic).</li>
                </ul>`,
                milestones: `El precio cerrado de este anexo se fija en <strong>${currencySymbol} ${formattedPrice} ${contract.currency}</strong> (Más IGV 18% si es local en Perú). Los hitos de pago se estructuran de la siguiente manera:<br/>
                <ul>
                    <li><strong>Hito 1 (Inicio):</strong> 50% de anticipo (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}). Inicio de fase de modelado de agentes en sandbox.</li>
                    <li><strong>Hito 2 (Entrega):</strong> 50% restante (${currencySymbol} ${(contract.price * 0.5).toFixed(2)}) tras el taller de transferencia técnica y aprobación en Staging.</li>
                </ul>`
            },
            'A.2': {
                title: 'ANEXO TÉCNICO A.2: Plataforma de Software SaaS de Alta Disponibilidad',
                scope: `<ul>
                    <li><strong>Arquitectura Next.js App Router:</strong> Desarrollo de plataforma web robusta con Server-Side Rendering (SSR) y optimización de velocidad de carga extrema.</li>
                    <li><strong>Ecosistema de Base de Datos y Docker:</strong> Dockerización de servicios y balanceador de carga en AWS/DigitalOcean con réplicas de bases de datos de lectura.</li>
                    <li><strong>Stripe Billing:</strong> Configuración del motor transaccional multi-tarifa de Stripe (suscripciones mensuales, por consumo, periodos de prueba y facturación basada en asientos).</li>
                    <li><strong>Suite de Testing:</strong> Programación de pruebas automatizadas End-to-End con Playwright para asegurar estabilidad del core de negocio.</li>
                </ul>`,
                access: `<ul>
                    <li>Acceso al entorno de producción de Stripe del Cliente.</li>
                    <li>Accesos de administrador a la consola de AWS o DigitalOcean empresarial.</li>
                </ul>`,
                milestones: `El precio cerrado de este anexo se fija en <strong>${currencySymbol} ${formattedPrice} ${contract.currency}</strong> (Más IGV 18% si es local en Perú). Los hitos de pago se estructuran de la siguiente manera:<br/>
                <ul>
                    <li><strong>Hito 1 (Inicio):</strong> 30% de anticipo (${currencySymbol} ${(contract.price * 0.3).toFixed(2)}).</li>
                    <li><strong>Hito 2 (Base de Datos e Integración Stripe):</strong> 40% (${currencySymbol} ${(contract.price * 0.4).toFixed(2)}) a la entrega del núcleo funcional.</li>
                    <li><strong>Hito 3 (Entrega):</strong> 30% restante (${currencySymbol} ${(contract.price * 0.3).toFixed(2)}) a la aprobación de la suite de pruebas automatizadas y despliegue final.</li>
                </ul>`
            }
        };

        const currentSow = sowTemplates[contract.planCode] || sowTemplates['C.1'];

        // Build the HTML template
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Georgia', 'Times New Roman', serif;
                        color: #111;
                        padding: 50px;
                        line-height: 1.6;
                        font-size: 14px;
                    }
                    h1, h2, h3, h4, h5 {
                        font-family: 'Helvetica Neue', 'Arial', sans-serif;
                        font-weight: bold;
                        color: #111;
                        text-align: center;
                    }
                    h1 { font-size: 20px; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    h2 { font-size: 16px; margin-top: 40px; margin-bottom: 20px; text-align: left; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    p { margin-bottom: 15px; text-align: justify; }
                    ul { margin-bottom: 15px; padding-left: 20px; }
                    li { margin-bottom: 5px; text-align: justify; }
                    .header-info {
                        margin-bottom: 40px;
                        font-size: 12px;
                        color: #666;
                        text-align: right;
                    }
                    .signature-table {
                        width: 100%;
                        margin-top: 50px;
                        border-collapse: collapse;
                    }
                    .signature-table td {
                        width: 50%;
                        padding: 10px;
                        vertical-align: top;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        margin-top: 50px;
                        padding-top: 5px;
                        font-size: 12px;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                </style>
            </head>
            <body>
                <div class="header-info">
                    <strong>ID CONTRATO:</strong> MSA-AP-${new Date().getFullYear()}-${contract.planCode}-${Math.floor(1000 + Math.random() * 9000)}<br/>
                    <strong>FECHA DE EMISIÓN:</strong> ${dateStr}
                </div>

                <h1>CONTRATO MARCO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO Y AUTOMATIZACIÓN TECNOLÓGICA</h1>

                <p>Conste por el presente documento el <strong>Contrato Marco de Prestación de Servicios Tecnológicos</strong>, que celebran de una parte:</p>
                
                <p><strong>EL CONTRATISTA:</strong> <strong>Alberto Farah Blair</strong>, persona física con R.U.C. N° 10 MYPE, bajo el Régimen MYPE Tributario (RMT), con domicilio fiscal en Lima, Perú (en adelante, el <strong>"Consultor"</strong>).</p>
                
                <p><strong>EL CLIENTE:</strong> <strong>${contract.clientCompany || '[Razón Social del Cliente]'}</strong>, con R.U.C. / N.I.F. N° <strong>${contract.clientRuc || '[RUC/NIF del Cliente]'}</strong>, con domicilio fiscal en su dirección declarada, representada legalmente por <strong>${contract.clientName || '[Nombre del Representante]'}</strong> (en adelante, el <strong>"Cliente"</strong>).</p>

                <p>El Consultor y el Cliente serán denominados individualmente como la "Parte" y conjuntamente como las "Partes". El Contrato se suscribe bajo los siguientes términos y condiciones:</p>

                <h2>CLÁUSULA PRIMERA: OBJETO DEL CONTRATO</h2>
                <p>El objeto del presente Contrato es la prestación de servicios profesionales de desarrollo de software, migraciones de infraestructura lógica, diseño de integraciones y despliegue de sistemas de Inteligencia Artificial por parte del Consultor a favor del Cliente. El alcance específico, hitos, entregables y cronogramas se detallarán de forma exclusiva en el <strong>Anexo Técnico (Statement of Work - SOW)</strong> adjunto a este documento.</p>

                <h2>CLÁUSULA SEGUNDA: TÉRMINOS ECONÓMICOS Y FORMA DE PAGO</h2>
                <p><strong>2.1. Honorarios:</strong> El Cliente se compromete a abonar al Consultor los importes detallados en el Anexo Técnico aprobado. Los honorarios se pagarán bajo la modalidad de hitos de entrega.</p>
                
                <p><strong>2.2. Impuestos Locales e Internacionales:</strong></p>
                <ul>
                    <li><strong>Para Clientes en Perú (Servicio Domiciliado):</strong> Se aplicará obligatoriamente el Impuesto General a las Ventas (IGV) del <strong>18%</strong> sobre los importes netos cotizados. Las facturas que superen el monto total de <strong>S/. 700.00 PEN</strong> (con IGV) están sujetas a la detracción del <strong>12%</strong> bajo el código de SUNAT <strong>022 (Otros servicios empresariales)</strong>. El Cliente se compromete a depositar dicho 12% en la cuenta del Banco de la Nación del Consultor y transferir el 88% restante a la cuenta corriente bancaria designada.</li>
                    <li><strong>Para Clientes en el Extranjero (Exportación de Servicios):</strong> La facturación se emitirá bajo la categoría de Exportación de Servicios Modernos, resultando <strong>Inafecta (0% de IGV)</strong> de acuerdo con las leyes tributarias peruanas. Si el pago se realiza mediante pasarelas de pago (PayPal o Stripe), se aplicará un recargo por fricción del <strong>5.5% (Gross-Up)</strong> sobre el valor neto para cubrir las comisiones financieras, a menos que el pago se efectúe vía transferencia internacional directa.</li>
                </ul>

                <h2>CLÁUSULA TERCERA: GESTIÓN DE MOROSIDAD Y PENALIZACIONES JURISDICCIONALES</h2>
                <p>En caso de retraso en el pago de cualquier factura emitida bajo este Contrato, resultará de aplicación el régimen correspondiente según la jurisdicción fiscal del Cliente:</p>
                <ul>
                    <li><strong>Aplicación Jurisdiccional para España (Ley 3/2004 de Medidas de Lucha contra la Morosidad):</strong> El Cliente incurrirá de manera automática en situación de mora desde el día siguiente al vencimiento del plazo pactado, sin necesidad de requerimiento previo. Resultará de aplicación el interés de demerito comercial del 8% sobre la tasa del BCE. Adicionalmente, la Agencia estará facultada para exigir automáticamente una indemnización fija de cuarenta euros (&euro;40.00) por factura impagada.</li>
                    <li><strong>Aplicación Jurisdiccional para Perú:</strong> El incumplimiento generará un interés moratorio diario y automático equivalente a la Tasa de Interés Activa (TAMEX/TAMN) vigente publicada por la SBS, más una penalidad del 2% mensual sobre el saldo deudor.</li>
                </ul>
                <p>El Consultor se reserva el derecho de suspender o interrumpir el acceso a la infraestructura en la nube y servicios de API transcurridos cinco (5) días hábiles desde la fecha de impago.</p>

                <h2>CLÁUSULA QUINTA: LIMITACIÓN DE RESPONSABILIDAD TÉCNICA</h2>
                <p><strong>5.1. Dependencia de Interfaces Externas (APIs):</strong> El Cliente reconoce que las soluciones de automatización integran APIs provistas por terceros (OpenAI, Anthropic, Meta). El Consultor no asume responsabilidad por caídas, degradación o aumentos de tarifas de dichos proveedores.</p>
                <p><strong>5.2. Tope de Responsabilidad:</strong> La responsabilidad agregada máxima del Consultor frente al Cliente por cualquier daño o reclamación quedará limitada al importe neto total abonado por el Cliente al Consultor durante los doce (12) meses anteriores al evento desencadenante.</p>

                <h2>CLÁUSULA SEXTA: DESCARGO DE IA Y PROTOCOLO HUMAN-IN-THE-LOOP (HITL)</h2>
                <p><strong>6.1. Naturaleza Estocástica de la IA:</strong> El Cliente acepta que las herramientas de IA son probabilísticas y pueden generar alucinaciones o errores lógicos. El Consultor excluye cualquier garantía de exactitud en contenidos generados por IA.</p>
                <p><strong>6.2. Obligación HITL:</strong> El Cliente asume la obligación ineludible de supervisar e inspeccionar humanamente cualquier resultado, respuesta o acción automatizada de la IA antes de que sea despachada a clientes finales o entorno de producción.</p>

                <h2>CLÁUSULA SÉPTIMA: HITOS DE ACEPTACIÓN Y SILENCIO POSITIVO</h2>
                <p>Al finalizar cada hito, el Cliente dispone de cinco (5) días hábiles para probar y reportar observaciones por escrito. Transcurrido dicho plazo sin observaciones formales, el hito se considerará <strong>aprobado y aceptado en su totalidad</strong> por silencio positivo.</p>

                <h2>CLÁUSULA OCTAVA: PROPIEDAD INTELECTUAL Y TECNOLOGÍA PROPIETARIA</h2>
                <p><strong>8.1. Retención de Propiedad Base:</strong> Toda la arquitectura base preexistente y herramientas de software modular desarrolladas por el Consultor —incluyendo la consola web <strong>Silhouette OS</strong> y el núcleo de persistencia <strong>CausalOS-Python</strong>— son propiedad exclusiva del Consultor. El Cliente recibe una licencia de uso interna no exclusiva.</p>
                <p><strong>8.2. Transferencia Condicionada:</strong> El código a medida y configuraciones lógicas personalizadas desarrolladas específicamente para el Cliente se transferirán en propiedad exclusiva al Cliente únicamente cuando este haya liquidado el 100% de los honorarios pactados.</p>

                <h2>CLÁUSULA NOVENA: PROTECCIÓN DE DATOS (RGPD Y LEY 29733)</h2>
                <p>El Consultor actuará como Encargado del Tratamiento bajo instrucciones estrictas del Cliente. Para clientes en Perú se aplica la Ley N° 29733, y para clientes en la Unión Europea/España se aplica el RGPD (Art. 28), garantizando medidas técnicas de seguridad, confidencialidad del equipo y flujos de transferencia transfronteriza seguros.</p>

                <div class="page-break"></div>

                <div class="header-info">
                    <strong>ANEXO SOW ID:</strong> SOW-${contract.planCode}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}
                </div>

                <h1>DECLARACIÓN DE TRABAJO (SOW): ${contract.planName}</h1>
                <p style="text-align: center; font-weight: bold; font-size: 12px; margin-top: -20px; color: #666;">
                    Servicio ID: ${contract.planCode} | Código de Licencia Corporativa
                </p>

                <h3>1. Alcance del Proyecto y Entregables Técnicos</h3>
                ${currentSow.scope}

                <h3>2. Requerimientos de Accesos y Entornos (A cargo del Cliente)</h3>
                ${currentSow.access}

                <h3>3. Hitos de Pago y Presupuesto</h3>
                <p>${currentSow.milestones}</p>
                
                <p><strong>Hitos de Pago Personalizados (Acordados):</strong> ${contract.milestones || '50% anticipo / 50% entrega de pruebas'}</p>

                <h3>4. Aceptación de Términos</h3>
                <p>En señal de conformidad con todos los términos del presente Contrato Marco de Prestación de Servicios Tecnológicos y su correspondiente Declaración de Trabajo (SOW) ${contract.planCode}, las partes firman digitalmente este instrumento.</p>

                <table class="signature-table">
                    <tr>
                        <td>
                            <div class="signature-line">
                                <strong>POR EL CLIENTE:</strong><br/>
                                Razón Social: ${contract.clientCompany || '[Razón Social del Cliente]'}<br/>
                                Representado por: ${contract.clientName || '[Representante Cliente]'}<br/>
                                Cargo: Representante Autorizado<br/>
                                RUC / NIF / DNI: ${contract.clientRuc || '[RUC/NIF/DNI]'}<br/>
                                Fecha: ____ / ____ / ________
                            </div>
                        </td>
                        <td>
                            <div class="signature-line">
                                <strong>POR EL CONSULTOR:</strong><br/>
                                Nombre: Alberto Farah Blair<br/>
                                RUC: 10 MYPE (Lima, Perú)<br/>
                                Cargo: AI & Automation Architect / Director Operativo<br/>
                                Fecha: ${dateStr}
                            </div>
                        </td>
                    </tr>
                </table>

                <div class="page-break"></div>

                <div class="header-info">
                    <strong>REGISTRO DE FIRMA & PISTA DE AUDITORÍA CRIPTOGRÁFICA</strong>
                </div>

                <h1>ACTA DE AUDITORÍA Y SELLO DIGITAL</h1>
                <p>Este documento incorpora una firma digital criptográfica de integridad de datos. Los detalles del contrato aquí presentados han sido registrados y sellados para garantizar la prevención de manipulaciones y asegurar su validez ante los sistemas del Consultor.</p>

                <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse; margin-top: 20px; font-size: 11px;">
                    <tr style="background: #f9f9f9;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Parámetro de Control</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Valor Registrado</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Identificador de SOW</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">SOW-${contract.planCode}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Monto Neto y Moneda</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${currencySymbol} ${formattedPrice} ${contract.currency}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Razón Social Cliente</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${contract.clientCompany || '[Cliente]'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">RUC / NIF Cliente</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${contract.clientRuc || '[RUC/NIF]'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Fecha de Generación</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${dateStr}</td>
                    </tr>
                    <tr style="background: #fff8e1;">
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #b78103;">Sello Digital de Integridad (HMAC-SHA256)</td>
                        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-size: 10px; word-break: break-all; color: #b78103; font-weight: bold;">${hmacSignature}</td>
                    </tr>
                </table>

                <div style="margin-top: 30px; border-left: 3px solid #ff9800; padding-left: 15px; font-size: 11px; color: #555; text-align: justify;">
                    <strong>Instrucciones de Verificación:</strong> El Consultor puede verificar la autenticidad de este sello de forma instantánea importando este código HMAC en el panel administrativo de Iris CRM. Cualquier alteración de precios, alcances, fechas u orígenes de datos romperá la integridad del sello digital aquí presentado.
                </div>
            </body>
            </html>
        `;
    }
}

