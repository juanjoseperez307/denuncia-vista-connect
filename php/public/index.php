<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use DenunciaVista\OpenApiRouter;
use DenunciaVista\Services\ServiceContainer;

require __DIR__ . '/../vendor/autoload.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Create Slim app
$app = AppFactory::create();
$app->addErrorMiddleware(true, true, true);

// Initialize service container
$serviceContainer = new ServiceContainer();

// Initialize OpenAPI router
$openApiRouter = new OpenApiRouter(__DIR__ . '/../../api/openapi.yaml', $serviceContainer);

// Add routes from OpenAPI spec
$openApiRouter->addRoutesToApp($app);

// Health check endpoint
$app->get('/health', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['status' => 'ok', 'timestamp' => time()]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();