import { OpenApiTypeGenerator } from './OpenApiTypeGenerator';
import { OpenApiClient } from './OpenApiClient';
import { ServiceGenerator } from './ServiceGenerator';

export class OpenApiServiceFactory {
  private typeGenerator: OpenApiTypeGenerator;
  private client: OpenApiClient;
  private serviceGenerator: ServiceGenerator;
  private services: Map<string, any> = new Map();
  private initialized = false;

  constructor(baseUrl: string) {
    this.typeGenerator = new OpenApiTypeGenerator();
    this.client = new OpenApiClient(baseUrl, this.typeGenerator);
    this.serviceGenerator = new ServiceGenerator(this.typeGenerator, this.client);
  }

  async initialize(specPath: string = '/api/openapi.yaml'): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.typeGenerator.loadSpec(specPath);
      this.initialized = true;
      console.log('OpenAPI Service Factory initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAPI Service Factory:', error);
      throw error;
    }
  }

  getService<T = any>(tag: string): T {
    if (!this.initialized) {
      throw new Error('OpenAPI Service Factory not initialized. Call initialize() first.');
    }

    if (!this.services.has(tag)) {
      const service = this.serviceGenerator.generateService(tag);
      this.services.set(tag, service);
    }

    return this.services.get(tag) as T;
  }

  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  clearAuthToken(): void {
    this.client.clearAuthToken();
  }

  getAvailableTags(): string[] {
    if (!this.initialized) return [];
    
    const allOperations = this.typeGenerator.getAllOperations();
    const tags = new Set<string>();
    
    allOperations.forEach(op => {
      op.tags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags);
  }

  getOperationsByTag(tag: string) {
    return this.typeGenerator.getOperationsByTag(tag);
  }

  // Direct operation calling for complex scenarios
  async callOperation<T = any>(operationId: string, params?: any): Promise<T> {
    const response = await this.client.callOperation<T>(operationId, params);
    return response.data;
  }
}