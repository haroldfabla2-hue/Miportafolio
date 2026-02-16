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
