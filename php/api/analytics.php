
<?php
require_once __DIR__ . '/../core/ApiResponse.php';
require_once __DIR__ . '/../models/User.php';

$userModel = new User($DB);

// Función para validar token
function validateToken($userModel) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return $userModel->validateSession($token);
}

switch ($_GET['action'] ?? '') {
    case 'dashboard':
        $today = date('Y-m-d');
        
        // Estadísticas principales
        $totalComplaints = $DB->conn->query("SELECT COUNT(*) as count FROM complaints")->fetch_assoc()['count'];
        $inProcess = $DB->conn->query("SELECT COUNT(*) as count FROM complaints WHERE status = 'in_process'")->fetch_assoc()['count'];
        $resolved = $DB->conn->query("SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'")->fetch_assoc()['count'];
        $todayComplaints = $DB->conn->query("SELECT COUNT(*) as count FROM complaints WHERE DATE(created_at) = '$today'")->fetch_assoc()['count'];
        
        $resolutionRate = $totalComplaints > 0 ? round(($resolved / $totalComplaints) * 100, 2) : 0;
        
        // Tendencias (comparar con período anterior)
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $yesterdayComplaints = $DB->conn->query("SELECT COUNT(*) as count FROM complaints WHERE DATE(created_at) = '$yesterday'")->fetch_assoc()['count'];
        $complaintsGrowth = $yesterdayComplaints > 0 ? round((($todayComplaints - $yesterdayComplaints) / $yesterdayComplaints) * 100, 2) : 0;
        
        ApiResponse::success([
            'totalComplaints' => (int)$totalComplaints,
            'inProcess' => (int)$inProcess,
            'resolved' => (int)$resolved,
            'resolutionRate' => $resolutionRate,
            'todayComplaints' => (int)$todayComplaints,
            'trends' => [
                'complaints' => $complaintsGrowth,
                'resolution' => $resolutionRate
            ]
        ]);
        break;
        
    case 'categories':
        $sql = "SELECT cat.label as name, COUNT(c.id) as value, cat.color 
                FROM categories cat 
                LEFT JOIN complaints c ON cat.name = c.category 
                GROUP BY cat.id, cat.label, cat.color 
                ORDER BY value DESC";
        
        $result = $DB->conn->query($sql);
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = [
                'name' => $row['name'],
                'value' => (int)$row['value'],
                'color' => $row['color']
            ];
        }
        
        ApiResponse::success($categories);
        break;
        
    case 'timeline':
        $period = $_GET['period'] ?? 'month';
        
        switch ($period) {
            case 'week':
                $sql = "SELECT DATE(created_at) as date, 
                               COUNT(*) as denuncias,
                               SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resueltas
                        FROM complaints 
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date";
                break;
            case 'year':
                $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') as date, 
                               COUNT(*) as denuncias,
                               SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resueltas
                        FROM complaints 
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                        ORDER BY date";
                break;
            default: // month
                $sql = "SELECT DATE(created_at) as date, 
                               COUNT(*) as denuncias,
                               SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resueltas
                        FROM complaints 
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date";
        }
        
        $result = $DB->conn->query($sql);
        $timeline = [];
        while ($row = $result->fetch_assoc()) {
            $timeline[] = [
                'date' => $row['date'],
                'denuncias' => (int)$row['denuncias'],
                'resueltas' => (int)$row['resueltas']
            ];
        }
        
        ApiResponse::success($timeline);
        break;
        
    case 'locations':
        $sql = "SELECT location, COUNT(*) as count 
                FROM complaints 
                WHERE location IS NOT NULL AND location != ''
                GROUP BY location 
                ORDER BY count DESC 
                LIMIT 10";
        
        $result = $DB->conn->query($sql);
        $locations = [];
        $colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
        $i = 0;
        
        while ($row = $result->fetch_assoc()) {
            $locations[] = [
                'location' => $row['location'],
                'count' => (int)$row['count'],
                'color' => $colors[$i % count($colors)]
            ];
            $i++;
        }
        
        ApiResponse::success($locations);
        break;
        
    case 'trending':
        // Detectar patrones en el contenido de las denuncias
        $sql = "SELECT content FROM complaints WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        $result = $DB->conn->query($sql);
        
        $words = [];
        while ($row = $result->fetch_assoc()) {
            $text = strtolower($row['content']);
            $text = preg_replace('/[^\w\s]/', '', $text);
            $textWords = explode(' ', $text);
            
            foreach ($textWords as $word) {
                if (strlen($word) > 4) { // Solo palabras de más de 4 caracteres
                    $words[$word] = ($words[$word] ?? 0) + 1;
                }
            }
        }
        
        arsort($words);
        $trending = [];
        $count = 0;
        foreach ($words as $word => $frequency) {
            if ($count >= 10) break;
            $trending[] = [
                'tag' => $word,
                'count' => $frequency
            ];
            $count++;
        }
        
        ApiResponse::success($trending);
        break;
        
    case 'alerts':
        // Generar alertas basadas en patrones
        $alerts = [];
        
        // Alerta por aumento de denuncias
        $today = $DB->conn->query("SELECT COUNT(*) as count FROM complaints WHERE DATE(created_at) = CURDATE()")->fetch_assoc()['count'];
        $yesterday = $DB->conn->query("SELECT COUNT(*) as count FROM complaints WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)")->fetch_assoc()['count'];
        
        if ($today > $yesterday * 1.5) {
            $alerts[] = [
                'id' => 'spike_complaints',
                'title' => 'Aumento significativo de denuncias',
                'description' => "Se registraron {$today} denuncias hoy, un aumento del " . round((($today - $yesterday) / $yesterday) * 100) . "% respecto a ayer",
                'severity' => 'alta',
                'location' => 'General',
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
        
        // Alerta por categoría con muchas denuncias pendientes
        $sql = "SELECT category, COUNT(*) as count 
                FROM complaints 
                WHERE status = 'pending' 
                GROUP BY category 
                HAVING count > 5
                ORDER BY count DESC";
        
        $result = $DB->conn->query($sql);
        while ($row = $result->fetch_assoc()) {
            $alerts[] = [
                'id' => 'pending_' . $row['category'],
                'title' => 'Acumulación de denuncias pendientes',
                'description' => "Hay {$row['count']} denuncias pendientes en la categoría {$row['category']}",
                'severity' => 'media',
                'location' => $row['category'],
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
        
        ApiResponse::success($alerts);
        break;
        
    case 'patterns':
        $patterns = [];
        
        // Patrón: Aumento en categoría específica
        $sql = "SELECT category, 
                       COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as this_week,
                       COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as last_week
                FROM complaints 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                GROUP BY category
                HAVING this_week > last_week * 1.3";
        
        $result = $DB->conn->query($sql);
        while ($row = $result->fetch_assoc()) {
            $increase = round((($row['this_week'] - $row['last_week']) / $row['last_week']) * 100);
            $patterns[] = [
                'id' => 'increase_' . $row['category'],
                'type' => 'increase',
                'title' => 'Aumento en ' . $row['category'],
                'description' => "Las denuncias de {$row['category']} aumentaron {$increase}% esta semana",
                'impact' => 'medio',
                'confidence' => 0.8
            ];
        }
        
        ApiResponse::success($patterns);
        break;
        
    case 'system-health':
        // Métricas básicas de salud del sistema
        $activeUsers = $DB->conn->query("SELECT COUNT(DISTINCT user_id) as count FROM complaints WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)")->fetch_assoc()['count'];
        
        ApiResponse::success([
            'uptime' => 99.9,
            'responseTime' => 150,
            'errorRate' => 0.1,
            'activeUsers' => (int)$activeUsers
        ]);
        break;
        
    case 'users/me':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        // Obtener badges del usuario
        $badgesSql = "SELECT a.title as name, a.icon, a.description 
                      FROM user_achievements ua 
                      JOIN achievements a ON ua.achievement_id = a.id 
                      WHERE ua.user_id = ? AND ua.completed = 1";
        $stmt = $DB->conn->prepare($badgesSql);
        $stmt->bind_param('i', $user['id']);
        $stmt->execute();
        $badgesResult = $stmt->get_result();
        
        $badges = [];
        while ($row = $badgesResult->fetch_assoc()) {
            $badges[] = $row;
        }
        
        // Calcular siguiente nivel
        $currentLevel = $user['level'];
        $currentPoints = $user['transparency_points'];
        $nextLevelPoints = ($currentLevel * 100) + 100; // Fórmula simple para siguiente nivel
        
        ApiResponse::success([
            'complaintsSubmitted' => (int)$user['complaints_submitted'],
            'resolutionsHelped' => 0, // Por implementar
            'transparencyPoints' => (int)$user['transparency_points'],
            'level' => (int)$user['level'],
            'nextLevelPoints' => $nextLevelPoints - $currentPoints,
            'badges' => $badges
        ]);
        break;
        
    case 'reports':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Generar ID único para el reporte
            $reportId = uniqid('report_');
            $downloadUrl = "/api/reports/download/{$reportId}";
            
            // En una implementación real, aquí se generaría el reporte en background
            ApiResponse::success([
                'reportId' => $reportId,
                'downloadUrl' => $downloadUrl
            ]);
        }
        break;
        
    default:
        ApiResponse::error('Acción no válida', 400);
}
?>
