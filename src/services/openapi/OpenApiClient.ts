import { OpenApiTypeGenerator, OperationInfo } from './OpenApiTypeGenerator';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class OpenApiClient {
  private baseUrl: string;
  private typeGenerator: OpenApiTypeGenerator;
  private defaultHeaders: Record<string, string> = {};
  private authToken?: string;

  constructor(baseUrl: string, typeGenerator: OpenApiTypeGenerator) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.typeGenerator = typeGenerator;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
    delete this.defaultHeaders['Authorization'];
  }

  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  async callOperation<T = any>(
    operationId: string, 
    params: Record<string, any> = {},
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const operation = this.typeGenerator.getOperation(operationId);
    
    if (!operation) {
      throw new Error(`Operation ${operationId} not found in OpenAPI spec`);
    }

    const url = this.buildUrl(operation, params);
    const requestOptions = this.buildRequestOptions(operation, params, options);

    try {
      const response = await this.fetchWithRetry(url, requestOptions, options.retries || 3);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await this.parseResponse(response);
      
      return {
        data: responseData,
        status: response.status,
        headers: this.parseHeaders(response.headers),
      };
    } catch (error) {
      console.error(`Error calling operation ${operationId}:`, error);
      throw error;
    }
  }

  private buildUrl(operation: OperationInfo, params: Record<string, any>): string {
    let path = operation.path;
    
    // Replace path parameters
    const pathParams = path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.slice(1, -1);
        if (params[paramName] !== undefined) {
          path = path.replace(param, encodeURIComponent(params[paramName]));
        }
      });
    }

    // Add query parameters for GET requests
    if (operation.method === 'GET' && params.query) {
      const queryString = new URLSearchParams(params.query).toString();
      if (queryString) {
        path += `?${queryString}`;
      }
    }

    return `${this.baseUrl}${path}`;
  }

  private buildRequestOptions(
    operation: OperationInfo, 
    params: Record<string, any>,
    options: RequestOptions
  ): RequestInit {
    const requestOptions: RequestInit = {
      method: operation.method,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add body for non-GET requests
    if (operation.method !== 'GET' && params.body) {
      requestOptions.body = JSON.stringify(params.body);
    }

    return requestOptions;
  }

  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries: number
  ): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fetch(url, options);
      } catch (error) {
        if (i === retries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      return await response.text();
    } else {
      return await response.blob();
    }
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    return headerObj;
  }

  // Convenience methods for common operations
  async get<T = any>(operationId: string, params?: Record<string, any>): Promise<T> {
    const response = await this.callOperation<T>(operationId, params);
    return response.data;
  }

  async post<T = any>(operationId: string, data?: any, params?: Record<string, any>): Promise<T> {
    const response = await this.callOperation<T>(operationId, { ...params, body: data });
    return response.data;
  }

  async put<T = any>(operationId: string, data?: any, params?: Record<string, any>): Promise<T> {
    const response = await this.callOperation<T>(operationId, { ...params, body: data });
    return response.data;
  }

  async delete<T = any>(operationId: string, params?: Record<string, any>): Promise<T> {
    const response = await this.callOperation<T>(operationId, params);
    return response.data;
  }
}