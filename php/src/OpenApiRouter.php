<?php

namespace DenunciaVista;

use Slim\App;
use cebe\openapi\Reader;
use cebe\openapi\spec\OpenApi;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\Operation;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use DenunciaVista\Services\ServiceContainer;

class OpenApiRouter
{
    private OpenApi $openApiSpec;
    private ServiceContainer $serviceContainer;
    
    public function __construct(string $specFilePath, ServiceContainer $serviceContainer)
    {
        $this->openApiSpec = Reader::readFromYamlFile($specFilePath);
        $this->serviceContainer = $serviceContainer;
    }
    
    public function addRoutesToApp(App $app): void
    {
        foreach ($this->openApiSpec->paths as $path => $pathItem) {
            $this->addPathToApp($app, $path, $pathItem);
        }
    }
    
    private function addPathToApp(App $app, string $path, PathItem $pathItem): void
    {
        $slimPath = $this->convertToSlimPath($path);
        
        // Handle different HTTP methods
        if ($pathItem->get !== null) {
            $app->get($slimPath, $this->createHandler('GET', $path, $pathItem->get));
        }
        if ($pathItem->post !== null) {
            $app->post($slimPath, $this->createHandler('POST', $path, $pathItem->post));
        }
        if ($pathItem->put !== null) {
            $app->put($slimPath, $this->createHandler('PUT', $path, $pathItem->put));
        }
        if ($pathItem->delete !== null) {
            $app->delete($slimPath, $this->createHandler('DELETE', $path, $pathItem->delete));
        }
        if ($pathItem->patch !== null) {
            $app->patch($slimPath, $this->createHandler('PATCH', $path, $pathItem->patch));
        }
    }
    
    private function convertToSlimPath(string $openApiPath): string
    {
        // Convert OpenAPI path parameters {id} to Slim format {id}
        return preg_replace('/\{([^}]+)\}/', '{$1}', $openApiPath);
    }
    
    private function createHandler(string $method, string $path, Operation $operation): callable
    {
        return function (Request $request, Response $response, array $args) use ($method, $path, $operation) {
            try {
                // Extract operation ID to determine which service method to call
                $operationId = $operation->operationId;
                
                if (!$operationId) {
                    throw new \Exception("Missing operationId for $method $path");
                }
                
                // Parse operation ID to determine service and method
                [$serviceName, $methodName] = $this->parseOperationId($operationId);
                
                // Get the appropriate service
                $service = $this->serviceContainer->getService($serviceName);
                
                if (!$service) {
                    throw new \Exception("Service not found: $serviceName");
                }
                
                if (!method_exists($service, $methodName)) {
                    throw new \Exception("Method not found: $serviceName::$methodName");
                }
                
                // Prepare request data
                $requestData = $this->prepareRequestData($request, $args);
                
                // Call the service method
                $result = $service->$methodName($requestData);
                
                // Format response
                $response->getBody()->write(json_encode($result));
                return $response->withHeader('Content-Type', 'application/json');
                
            } catch (\Exception $e) {
                $errorResponse = [
                    'error' => true,
                    'message' => $e->getMessage(),
                    'timestamp' => time()
                ];
                
                $response->getBody()->write(json_encode($errorResponse));
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(500);
            }
        };
    }
    
    private function parseOperationId(string $operationId): array
    {
        // Operation IDs are in format: serviceName.methodName
        // e.g., "auth.login", "complaints.list", etc.
        $parts = explode('.', $operationId);
        
        if (count($parts) !== 2) {
            throw new \Exception("Invalid operationId format: $operationId. Expected format: service.method");
        }
        
        return $parts;
    }
    
    private function prepareRequestData(Request $request, array $args): array
    {
        $data = [];
        
        // Add path parameters
        $data['params'] = $args;
        
        // Add query parameters
        $data['query'] = $request->getQueryParams();
        
        // Add request body for POST/PUT/PATCH requests
        $body = (string) $request->getBody();
        if (!empty($body)) {
            $data['body'] = json_decode($body, true) ?? [];
        }
        
        // Add headers
        $data['headers'] = $request->getHeaders();
        
        // Extract and add authorization if present
        $authHeader = $request->getHeaderLine('Authorization');
        if ($authHeader) {
            $data['auth'] = $authHeader;
        }
        
        return $data;
    }
}