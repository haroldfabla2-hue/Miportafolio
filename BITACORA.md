# BITACORA.md - MiWeb

Archivo de seguimiento de tareas y progreso (Solo adición).

## [2026-02-15] Porting Missing Views from Brandistry
- **Tarea**: Portar Pipeline View (Kanban) y Calendar View de Brandistry-CMR a MiWeb.
- **Acciones**:
    - Backend: Agregado modelo `Event` y enum `EventType` a `schema.prisma`.
    - Backend: Implementado `EventsModule`, `EventsService` y `EventsController`.
    - Frontend: Agregado interfaces `Lead`, `CalendarEvent` y `EventType` a `models.ts`.
    - Frontend: Agregado `leadsApi`, `clientsApi` y `eventsApi` a `api.ts`.
    - Frontend: Portado `PipelineView.tsx` (Kanban) con soporte para Drag & Drop y filtros.
    - Frontend: Portado `CalendarView.tsx` con integración de API real y gestión de eventos.
    - Routing: Registrados nuevos componentes en `App.tsx`.
    - Sidebar: Agregados accesos directos en `AdminLayout.tsx`.
- **Estado**: ✅ Completado. Lista de tareas en `task.md` actualizada.

## [2026-02-15] Bug Fix: Calendar View TypeScript Errors
- **Problema**: Errores de tipos en backend y frontend (Prisma stale types, auth paths incorrectos).
- **Acciones**:
    - Backend: Refactorizado `EventsController` para usar `@Req` estándar; corregida ruta de `JwtAuthGuard`.
    - Backend: Implementado bypass de tipos en `EventsService` para `EventType` y `prisma.event` debido- **2026-02-15**: Finalizada la Fase de Producción (Ciclo 8). Se implementaron esqueletos de carga en Oracle, se generó toda la documentación estándar (README, LICENSE, etc.), se aplicó SEO dinámico en todas las páginas públicas y se verificó la infraestructura Docker/Prisma. El sistema está listo para despliegue.
- **Estado**: ✅ Corregido.

## [2026-02-15] Oracle 2.0 Porting
- **Tarea**: Migrar motor de simulación financiera y Strategic Advisor de Brandistry-CMR.
- **Acciones**:
    - **Backend**: Implementado `OracleService` con lógica profesional de simulación a 12 meses.
    - **Backend**: Creado `OracleController` asegurado con `JwtAuthGuard` y `AdminGuard`.
    - **Database**: Actualizado `schema.prisma` agregando `budgetAllocated` al modelo `Client`.
    - **Frontend**: Creado `oracleService.ts` para comunicación con API.
    - **Frontend**: Consolidado componente `Oracle.tsx` con UI premium, gráficos de Recharts y integración con el AI Advisor (CFO Persona).
    - **Limpieza**: Eliminado `OracleView.tsx` redundante y actualizado `AppModule`.
- **Estado**: ✅ Completado y aprobado por el Senior.

## [2026-06-20] CMS Upgrade: Settings, Taxonomies and Custom Fields (Iris Module)
- **Tarea**: Crear el dashboard interactivo de configuración del CMS ("Iris") que sea autogestionable y dinámico sin migraciones de base de datos recurrentes.
- **Acciones**:
    - **Base de Datos**: Modificado `schema.prisma` agregando `CmsSettings`, `Taxonomy`, `TaxonomyTerm`, `ContentTaxonomyTerm` (pivot), `CustomFieldDefinition` y `PublishingWebhook`.
    - **Backend**: Creado `CmsSettingsService` y `CmsSettingsController` para el CRUD de configuraciones, webhooks, taxonomías y custom fields.
    - **Backend**: Creado `SeoService` y `SeoController` para despachar `sitemap.xml`, `robots.txt` y `rss.xml` dinámicos desde la base de datos de producción con caching adaptativo en memoria.
    - **Backend**: Extendido `CmsService` para persistir `customFields` en transacciones Prisma y despachar webhooks automatizados con firmas HMAC `X-Hub-Signature-256`.
    - **Frontend**: Creado `SettingsCms.tsx` con UI premium glassmorphism y 5 pestañas de control.
    - **Frontend**: Integrado `ContentEditor.tsx` para cargar dinámicamente taxonomías y custom fields por tipo de contenido, renderizando inputs y tags en el formulario de edición y enviándolos en el payload.
    - **Frontend**: Configurada la ruta en `App.tsx` y el enlace en el menú lateral de `Settings.tsx`.
- **Estado**: ✅ Completado. Compilación exitosa en frontend y backend sin errores.
