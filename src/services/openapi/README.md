# OpenAPI-Based Service Generation

Este sistema permite generar automáticamente servicios TypeScript a partir de la especificación OpenAPI/Swagger, reduciendo significativamente el código boilerplate.

## Arquitectura

### Componentes Principales

1. **OpenApiTypeGenerator**: Parsea el archivo `openapi.yaml` y extrae información de operaciones
2. **OpenApiClient**: Cliente HTTP que mapea operaciones a llamadas REST
3. **ServiceGenerator**: Genera dinámicamente clases de servicio basadas en los tags de OpenAPI
4. **OpenApiServiceFactory**: Factory principal que coordina todo el sistema

### Ventajas

- **Menos código**: Los servicios se generan automáticamente desde la especificación
- **Consistencia**: Garantiza que el frontend esté siempre sincronizado con la API
- **Mantenibilidad**: Un solo lugar de verdad (el archivo OpenAPI)
- **Tipado automático**: Los tipos se generan automáticamente

## Configuración

### Variables de Entorno

```bash
# Habilitar servicios OpenAPI
VITE_USE_OPENAPI=true

# URL de la API
VITE_API_URL=http://localhost/api
```

### Activación

```typescript
// Automática si VITE_USE_OPENAPI=true
const service = serviceFactory.getComplaintsService();

// Manual
await serviceFactory.switchToOpenApi();
```

## Uso

### Servicios Generados Automáticamente

Los servicios se generan basándose en los tags de OpenAPI:

- `Authentication` → AuthService
- `Complaints` → ComplaintsService  
- `Analytics` → AnalyticsService
- `Gamification` → GamificationService

### Mapeo de OperationIds

Los `operationId` del OpenAPI se mapean a métodos TypeScript:

```yaml
# OpenAPI
operationId: getComplaints
# TypeScript
getComplaints(filters?: ComplaintFilters): Promise<Complaint[]>

operationId: createComplaint  
# TypeScript
createComplaint(data: ComplaintFormData): Promise<Complaint>
```

### Ejemplo de Uso

```typescript
// El servicio se genera automáticamente desde OpenAPI
const complaintsService = serviceFactory.getComplaintsService();

// Estos métodos se mapean directamente a las operaciones OpenAPI
const complaints = await complaintsService.getComplaints();
const complaint = await complaintsService.getComplaint('123');
const newComplaint = await complaintsService.createComplaint(data);
```

## Correspondencia con PHP

Este sistema TypeScript es análogo al `OpenApiRouter.php` que ya existe en el backend:

**PHP (Backend)**:
```php
// php/src/OpenApiRouter.php
$operationId = "complaints.list";
[$serviceName, $methodName] = parseOperationId($operationId);
$service = $serviceContainer->getService($serviceName);
$result = $service->$methodName($requestData);
```

**TypeScript (Frontend)**:
```typescript
// src/services/openapi/
const operation = typeGenerator.getOperation("getComplaints");
const result = await client.callOperation(operation.operationId, params);
```

## Flujo de Trabajo

1. **Desarrollo**: Usar mocks para desarrollo rápido
2. **Integración**: Cambiar a `VITE_USE_OPENAPI=true` para usar servicios auto-generados
3. **Producción**: Los servicios se conectan automáticamente a las APIs reales

## Beneficios vs Implementación Manual

### Antes (Manual)
```typescript
// Cada endpoint requería implementación manual
class RealComplaintsService implements IComplaintsService {
  async getComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
    const response = await fetch(`${API_URL}/complaints`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // ... configuración manual
    });
    return await response.json();
  }
  
  async createComplaint(data: ComplaintFormData): Promise<Complaint> {
    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      // ... configuración manual
    });
    return await response.json();
  }
  
  // ... 20+ métodos más
}
```

### Ahora (OpenAPI)
```typescript
// Se genera automáticamente desde openapi.yaml
const service = openApiFactory.getService<IComplaintsService>('Complaints');

// Todos los métodos disponibles automáticamente
// Sin código boilerplate
// Tipado automático
// Consistencia garantizada
```

## Debugging

```typescript
// Ver operaciones disponibles
const factory = serviceFactory.getOpenApiFactory();
console.log(factory?.getAvailableTags());
console.log(factory?.getOperationsByTag('Complaints'));

// Llamar operaciones directamente
const result = await factory?.callOperation('getComplaints', { query: { limit: 10 } });
```

## Migración Gradual

El sistema permite migración gradual:

1. Los servicios mock siguen funcionando para desarrollo
2. Los servicios manuales siguen disponibles como fallback
3. Los servicios OpenAPI se activan opcionalmente
4. Ambos sistemas pueden coexistir

## Extensión

Para agregar nuevos servicios:

1. Agregar operaciones al `openapi.yaml` con tags apropiados
2. Opcionalmente crear una clase wrapper que implemente la interfaz específica
3. El resto se genera automáticamente

```typescript
// Ejemplo de wrapper personalizado
export class CustomComplaintsService extends BaseApiService implements IComplaintsService {
  constructor(client: OpenApiClient) {
    super(client, 'Complaints');
  }
  
  // Métodos complejos pueden tener implementación custom
  async complexOperation(data: any): Promise<any> {
    const result1 = await this.callApi('operation1', data);
    const result2 = await this.callApi('operation2', result1);
    return this.processResults(result1, result2);
  }
}
```