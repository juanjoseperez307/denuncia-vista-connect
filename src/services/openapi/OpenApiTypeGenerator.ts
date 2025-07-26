import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';

export interface OperationInfo {
  operationId: string;
  method: string;
  path: string;
  tags: string[];
  requestSchema?: any;
  responseSchema?: any;
  parameters?: any[];
}

export class OpenApiTypeGenerator {
  private spec: OpenAPIV3.Document | null = null;
  private operations: Map<string, OperationInfo> = new Map();

  async loadSpec(specPath: string): Promise<void> {
    try {
      this.spec = await SwaggerParser.parse(specPath) as OpenAPIV3.Document;
      this.generateOperationsMap();
    } catch (error) {
      console.error('Error loading OpenAPI spec:', error);
      throw error;
    }
  }

  private generateOperationsMap(): void {
    if (!this.spec?.paths) return;

    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      if (!pathItem) return;

      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
      
      methods.forEach(method => {
        const operation = pathItem[method] as OpenAPIV3.OperationObject;
        if (!operation?.operationId) return;

        const operationInfo: OperationInfo = {
          operationId: operation.operationId,
          method: method.toUpperCase(),
          path,
          tags: operation.tags || [],
          parameters: operation.parameters as any[],
        };

        // Extract request schema
        if (operation.requestBody) {
          const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
          const content = requestBody.content?.['application/json'];
          if (content) {
            operationInfo.requestSchema = content.schema;
          }
        }

        // Extract response schema
        const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
        if (successResponse && typeof successResponse === 'object' && 'content' in successResponse) {
          const content = successResponse.content?.['application/json'];
          if (content) {
            operationInfo.responseSchema = content.schema;
          }
        }

        this.operations.set(operation.operationId, operationInfo);
      });
    });
  }

  getOperation(operationId: string): OperationInfo | undefined {
    return this.operations.get(operationId);
  }

  getAllOperations(): OperationInfo[] {
    return Array.from(this.operations.values());
  }

  getOperationsByTag(tag: string): OperationInfo[] {
    return Array.from(this.operations.values()).filter(op => 
      op.tags.includes(tag)
    );
  }

  generateServiceInterface(tag: string): string {
    const operations = this.getOperationsByTag(tag);
    const serviceName = `I${tag.charAt(0).toUpperCase() + tag.slice(1)}Service`;
    
    let interfaceCode = `export interface ${serviceName} {\n`;
    
    operations.forEach(op => {
      const methodName = this.getMethodName(op.operationId);
      const params = this.generateParameterTypes(op);
      const returnType = this.generateReturnType(op);
      
      interfaceCode += `  ${methodName}(${params}): Promise<${returnType}>;\n`;
    });
    
    interfaceCode += '}\n';
    return interfaceCode;
  }

  private getMethodName(operationId: string): string {
    // Convert operationId to camelCase method name
    // e.g., "getComplaints" -> "getComplaints", "loginUser" -> "login"
    return operationId.replace(/([A-Z])/g, (match, letter, index) => 
      index === 0 ? letter.toLowerCase() : letter
    );
  }

  private generateParameterTypes(operation: OperationInfo): string {
    const params: string[] = [];
    
    // Path parameters
    const pathParams = operation.path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.slice(1, -1);
        params.push(`${paramName}: string`);
      });
    }
    
    // Request body
    if (operation.requestSchema) {
      params.push('data: any'); // We could generate more specific types here
    }
    
    // Query parameters
    if (operation.parameters?.some(p => (p as any).in === 'query')) {
      params.push('options?: any');
    }
    
    return params.join(', ');
  }

  private generateReturnType(operation: OperationInfo): string {
    // For now, return 'any' but this could be made more specific
    return 'any';
  }

  getSpec(): OpenAPIV3.Document | null {
    return this.spec;
  }
}