
<?php
/**
 * Script de configuración inicial para la aplicación
 * Ejecutar una sola vez para configurar la base de datos y datos iniciales
 */

require_once __DIR__ . '/config.php';

echo "=== CONFIGURACIÓN INICIAL DE LA APLICACIÓN ===\n\n";

try {
    // La configuración ya se ejecuta al instanciar Database
    echo "✓ Base de datos creada exitosamente\n";
    echo "✓ Tablas creadas exitosamente\n";
    echo "✓ Datos iniciales insertados exitosamente\n\n";
    
    // Crear directorio de uploads
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
        echo "✓ Directorio de uploads creado\n";
    }
    
    // Crear usuario administrador por defecto
    $userModel = new User($DB);
    $adminData = [
        'name' => 'Administrador',
        'email' => 'admin@denuncia-vista.com',
        'username' => 'admin',
        'password' => 'admin123',
        'is_verified' => true,
        'transparency_points' => 1000,
        'level' => 10
    ];
    
    if (!$userModel->findByUsername('admin')) {
        $adminId = $userModel->create($adminData);
        if ($adminId) {
            echo "✓ Usuario administrador creado (admin/admin123)\n";
        }
    } else {
        echo "- Usuario administrador ya existe\n";
    }
    
    // Crear algunos datos de prueba
    echo "\n=== CREANDO DATOS DE PRUEBA ===\n";
    
    // Crear usuario de prueba
    $testUserData = [
        'name' => 'Juan Pérez',
        'email' => 'juan@test.com',
        'username' => 'juan_test',
        'password' => 'test123',
        'location' => 'Bogotá',
        'transparency_points' => 250,
        'level' => 3,
        'complaints_submitted' => 5
    ];
    
    if (!$userModel->findByUsername('juan_test')) {
        $testUserId = $userModel->create($testUserData);
        if ($testUserId) {
            echo "✓ Usuario de prueba creado (juan_test/test123)\n";
            
            // Crear denuncias de prueba
            require_once __DIR__ . '/models/Complaint.php';
            $complaintModel = new Complaint($DB);
            
            $testComplaints = [
                [
                    'user_id' => $testUserId,
                    'category' => 'corrupcion',
                    'content' => 'Se está presentando un caso de corrupción en la alcaldía local donde se están desviando fondos públicos destinados a obras de infraestructura.',
                    'location' => 'Alcaldía de Chapinero, Bogotá',
                    'status' => 'pending'
                ],
                [
                    'user_id' => $testUserId,
                    'category' => 'servicios',
                    'content' => 'El servicio de recolección de basuras no ha pasado por nuestro barrio en más de una semana, causando problemas de salubridad.',
                    'location' => 'Barrio La Candelaria, Bogotá',
                    'status' => 'in_process'
                ],
                [
                    'user_id' => $testUserId,
                    'category' => 'infraestructura',
                    'content' => 'Hay varios huecos grandes en la Carrera 7 que representan un peligro para los vehículos y peatones.',
                    'location' => 'Carrera 7 con Calle 24, Bogotá',
                    'status' => 'resolved'
                ]
            ];
            
            foreach ($testComplaints as $complaint) {
                $complaintModel->create($complaint);
            }
            
            echo "✓ Denuncias de prueba creadas\n";
        }
    } else {
        echo "- Usuario de prueba ya existe\n";
    }
    
    echo "\n=== CONFIGURACIÓN COMPLETADA ===\n";
    echo "La aplicación está lista para usar.\n\n";
    echo "URLs de la API:\n";
    echo "- Usuarios: /api/user.php\n";
    echo "- Denuncias: /api/complaints.php\n";
    echo "- Analytics: /api/analytics.php\n";
    echo "- Gamificación: /api/gamification.php\n\n";
    echo "Para configurar Google OAuth:\n";
    echo "1. Crea un proyecto en Google Cloud Console\n";
    echo "2. Habilita la Google+ API\n";
    echo "3. Crea credenciales OAuth 2.0\n";
    echo "4. Configura las variables de entorno en config.php\n\n";
    
} catch (Exception $e) {
    echo "❌ Error durante la configuración: " . $e->getMessage() . "\n";
}
?>
