import { OpenApiClient } from './OpenApiClient';
import { OpenApiTypeGenerator } from './OpenApiTypeGenerator';

export abstract class BaseApiService {
  protected client: OpenApiClient;
  protected tag: string;

  constructor(client: OpenApiClient, tag: string) {
    this.client = client;
    this.tag = tag;
  }

  protected async callApi<T = any>(operationId: string, params?: any): Promise<T> {
    return await this.client.get<T>(operationId, params);
  }

  protected async postApi<T = any>(operationId: string, data?: any, params?: any): Promise<T> {
    return await this.client.post<T>(operationId, data, params);
  }

  protected async putApi<T = any>(operationId: string, data?: any, params?: any): Promise<T> {
    return await this.client.put<T>(operationId, data, params);
  }

  protected async deleteApi<T = any>(operationId: string, params?: any): Promise<T> {
    return await this.client.delete<T>(operationId, params);
  }
}

export class ServiceGenerator {
  private typeGenerator: OpenApiTypeGenerator;
  private client: OpenApiClient;

  constructor(typeGenerator: OpenApiTypeGenerator, client: OpenApiClient) {
    this.typeGenerator = typeGenerator;
    this.client = client;
  }

  generateService(tag: string): any {
    const operations = this.typeGenerator.getOperationsByTag(tag);
    const client = this.client;
    
    const serviceClass = class extends BaseApiService {
      constructor() {
        super(client, tag);
      }
    };

    // Add methods dynamically based on operations
    operations.forEach(operation => {
      const methodName = this.getMethodName(operation.operationId);
      
      serviceClass.prototype[methodName] = async function(...args: any[]) {
        const params = this.parseMethodArguments(operation, args);
        
        switch (operation.method) {
          case 'GET':
            return await this.callApi(operation.operationId, params);
          case 'POST':
            return await this.postApi(operation.operationId, params.body, params);
          case 'PUT':
            return await this.putApi(operation.operationId, params.body, params);
          case 'DELETE':
            return await this.deleteApi(operation.operationId, params);
          default:
            throw new Error(`Unsupported HTTP method: ${operation.method}`);
        }
      };
    });

    return new serviceClass();
  }

  private getMethodName(operationId: string): string {
    // Convert operationId to a more readable method name
    // Examples:
    // "getComplaints" -> "getComplaints"
    // "loginUser" -> "login" 
    // "createComplaint" -> "create"
    
    if (operationId.includes('User')) {
      return operationId.replace('User', '').toLowerCase();
    }
    
    if (operationId.startsWith('get') && operationId.includes('ById')) {
      return 'getById';
    }
    
    return operationId;
  }

  private parseMethodArguments(operation: any, args: any[]): any {
    // This is a simplified version - in a real implementation,
    // you'd parse the OpenAPI parameters more carefully
    const params: any = {};
    
    // For now, assume the arguments match the expected pattern:
    // - Path parameters come first
    // - Request body comes next
    // - Options/query parameters come last
    
    let argIndex = 0;
    
    // Extract path parameters
    const pathParams = operation.path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      pathParams.forEach((param: string) => {
        const paramName = param.slice(1, -1);
        if (args[argIndex] !== undefined) {
          params[paramName] = args[argIndex++];
        }
      });
    }
    
    // Extract body parameter
    if (operation.requestSchema && args[argIndex] !== undefined) {
      params.body = args[argIndex++];
    }
    
    // Extract query/options
    if (args[argIndex] !== undefined) {
      params.query = args[argIndex];
    }
    
    return params;
  }
}