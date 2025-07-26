# Denuncia Vista

Plataforma colaborativa para reportar y dar seguimiento a problemas sociales, ambientales y de servicios públicos.

## Características

- 🗳️ **Sistema de denuncias** - Reporta problemas con categorías, ubicaciones y archivos adjuntos
- 👤 **Sistema de usuarios** - Registro, login y perfiles con gamificación
- 📊 **Analytics** - Dashboard con métricas y estadísticas detalladas
- 🏆 **Gamificación** - Logros, desafíos y rankings para incentivar participación
- 🔔 **Notificaciones** - Sistema de notificaciones en tiempo real
- 🔍 **Búsqueda avanzada** - Búsqueda por texto, categoría y ubicación

## Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** para bundling y desarrollo
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **React Router** para navegación

### Backend
- **PHP 7.4+** con Slim Framework 4
- **MySQL** como base de datos
- **OpenAPI 3.0** para especificación de API
- **JWT** para autenticación

## Instalación

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd php
composer install
php setup.php
composer start
```

## Arquitectura API-First

El backend utiliza un patrón API-first donde todas las rutas se generan automáticamente desde la especificación OpenAPI (`api/openapi.yaml`). El sistema lee la especificación y:

- Crea rutas automáticamente
- Mapea endpoints a servicios
- Valida requests/responses
- Maneja autenticación JWT

### Servicios Implementados
- `AuthService` - Autenticación y usuarios
- `ComplaintsService` - Gestión de denuncias  
- `AnalyticsService` - Métricas y estadísticas
- `GamificationService` - Logros y desafíos
- `NotificationService` - Notificaciones
