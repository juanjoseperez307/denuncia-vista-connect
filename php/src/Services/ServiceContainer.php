<?php

namespace DenunciaVista\Services;

use DenunciaVista\Services\AuthService;
use DenunciaVista\Services\ComplaintsService;
use DenunciaVista\Services\AnalyticsService;
use DenunciaVista\Services\GamificationService;
use DenunciaVista\Services\NotificationService;

class ServiceContainer
{
    private array $services = [];
    
    public function __construct()
    {
        $this->initializeServices();
    }
    
    public function getService(string $serviceName): ?object
    {
        return $this->services[$serviceName] ?? null;
    }
    
    private function initializeServices(): void
    {
        // Initialize database connection
        require_once __DIR__ . '/../../config.php';
        global $DB;
        
        // Initialize all services
        $this->services['auth'] = new AuthService($DB);
        $this->services['complaints'] = new ComplaintsService($DB);
        $this->services['analytics'] = new AnalyticsService($DB);
        $this->services['gamification'] = new GamificationService($DB);
        $this->services['notifications'] = new NotificationService($DB);
    }
}