
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
    case 'profile':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        // Obtener ranking del usuario
        $rankSql = "SELECT COUNT(*) + 1 as rank FROM users WHERE transparency_points > ?";
        $stmt = $DB->conn->prepare($rankSql);
        $stmt->bind_param('i', $user['transparency_points']);
        $stmt->execute();
        $rank = $stmt->get_result()->fetch_assoc()['rank'];
        
        // Obtener badges
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
        
        // Obtener logros
        $achievementsSql = "SELECT a.title as name, a.description, ua.progress, a.target as maxProgress, ua.completed
                           FROM user_achievements ua 
                           JOIN achievements a ON ua.achievement_id = a.id 
                           WHERE ua.user_id = ?";
        $stmt = $DB->conn->prepare($achievementsSql);
        $stmt->bind_param('i', $user['id']);
        $stmt->execute();
        $achievementsResult = $stmt->get_result();
        
        $achievements = [];
        while ($row = $achievementsResult->fetch_assoc()) {
            $achievements[] = $row;
        }
        
        ApiResponse::success([
            'id' => $user['id'],
            'name' => $user['name'],
            'avatar' => $user['avatar'],
            'transparencyPoints' => (int)$user['transparency_points'],
            'level' => (int)$user['level'],
            'rank' => (int)$rank,
            'complaintsCount' => (int)$user['complaints_submitted'],
            'resolutionsCount' => 0, // Por implementar
            'badges' => $badges,
            'achievements' => $achievements
        ]);
        break;
        
    case 'leaderboard':
        $period = $_GET['period'] ?? 'all-time';
        $limit = (int)($_GET['limit'] ?? 20);
        
        $sql = "SELECT u.id, u.name, u.avatar, u.transparency_points 
                FROM users u 
                ORDER BY u.transparency_points DESC 
                LIMIT ?";
        
        $stmt = $DB->conn->prepare($sql);
        $stmt->bind_param('i', $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $entries = [];
        $rank = 1;
        while ($row = $result->fetch_assoc()) {
            $entries[] = [
                'rank' => $rank,
                'user' => [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'avatar' => $row['avatar'],
                    'transparencyPoints' => (int)$row['transparency_points']
                ],
                'change' => 'same' // Por implementar historial
            ];
            $rank++;
        }
        
        // Posición del usuario actual (si está autenticado)
        $userPosition = null;
        $user = validateToken($userModel);
        if ($user) {
            $userRankSql = "SELECT COUNT(*) + 1 as rank FROM users WHERE transparency_points > ?";
            $stmt = $DB->conn->prepare($userRankSql);
            $stmt->bind_param('i', $user['transparency_points']);
            $stmt->execute();
            $userRank = $stmt->get_result()->fetch_assoc()['rank'];
            
            $userPosition = [
                'rank' => (int)$userRank,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'avatar' => $user['avatar'],
                    'transparencyPoints' => (int)$user['transparency_points']
                ],
                'change' => 'same'
            ];
        }
        
        ApiResponse::success([
            'period' => $period,
            'entries' => $entries,
            'userPosition' => $userPosition
        ]);
        break;
        
    case 'rankings':
        // Rankings por diferentes categorías
        $complaintsSql = "SELECT u.id, u.name, u.avatar, u.complaints_submitted as score 
                         FROM users u 
                         ORDER BY u.complaints_submitted DESC 
                         LIMIT 10";
        
        $resolutionsSql = "SELECT u.id, u.name, u.avatar, 0 as score 
                          FROM users u 
                          ORDER BY u.transparency_points DESC 
                          LIMIT 10";
        
        $engagementSql = "SELECT u.id, u.name, u.avatar, (u.comments_given + u.helpful_votes) as score 
                         FROM users u 
                         ORDER BY (u.comments_given + u.helpful_votes) DESC 
                         LIMIT 10";
        
        $complaints = [];
        $result = $DB->conn->query($complaintsSql);
        while ($row = $result->fetch_assoc()) {
            $complaints[] = $row;
        }
        
        $resolutions = [];
        $result = $DB->conn->query($resolutionsSql);
        while ($row = $result->fetch_assoc()) {
            $resolutions[] = $row;
        }
        
        $engagement = [];
        $result = $DB->conn->query($engagementSql);
        while ($row = $result->fetch_assoc()) {
            $engagement[] = $row;
        }
        
        ApiResponse::success([
            'complaints' => $complaints,
            'resolutions' => $resolutions,
            'engagement' => $engagement
        ]);
        break;
        
    case 'badges':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        $sql = "SELECT a.id, a.title as name, a.description, a.icon, a.rarity,
                       ua.completed as unlocked, ua.completed_at as unlockedAt
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
                ORDER BY a.rarity, a.title";
        
        $stmt = $DB->conn->prepare($sql);
        $stmt->bind_param('i', $user['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $badges = [];
        while ($row = $result->fetch_assoc()) {
            $badges[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'],
                'icon' => $row['icon'],
                'rarity' => $row['rarity'],
                'unlockedAt' => $row['unlocked'] ? $row['unlockedAt'] : null
            ];
        }
        
        ApiResponse::success($badges);
        break;
        
    case 'achievements':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        $sql = "SELECT a.id, a.title as name, a.description, ua.progress, a.target as maxProgress,
                       a.points_reward, ua.completed, ua.completed_at as completedAt
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
                ORDER BY ua.completed ASC, a.title";
        
        $stmt = $DB->conn->prepare($sql);
        $stmt->bind_param('i', $user['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $achievements = [];
        while ($row = $result->fetch_assoc()) {
            $achievements[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'],
                'progress' => (int)($row['progress'] ?? 0),
                'maxProgress' => (int)$row['maxProgress'],
                'reward' => [
                    'points' => (int)$row['points_reward'],
                    'badge' => []
                ],
                'completed' => (bool)$row['completed'],
                'completedAt' => $row['completedAt']
            ];
        }
        
        ApiResponse::success($achievements);
        break;
        
    case 'challenges':
        $sql = "SELECT c.id, c.title, c.description, c.type, c.requirement_type, c.requirement_target,
                       c.points_reward, c.start_date as startDate, c.end_date as endDate,
                       c.participants_count as participants, c.is_active,
                       uc.progress as current, uc.completed
                FROM challenges c
                LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
                WHERE c.is_active = 1 AND c.end_date > NOW()
                ORDER BY c.end_date ASC";
        
        $user = validateToken($userModel);
        $userId = $user ? $user['id'] : 0;
        
        $stmt = $DB->conn->prepare($sql);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $challenges = [];
        while ($row = $result->fetch_assoc()) {
            $challenges[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'type' => $row['type'],
                'requirements' => [
                    'type' => $row['requirement_type'],
                    'target' => (int)$row['requirement_target'],
                    'current' => (int)($row['current'] ?? 0)
                ],
                'rewards' => [
                    'points' => (int)$row['points_reward'],
                    'badges' => []
                ],
                'startDate' => $row['startDate'],
                'endDate' => $row['endDate'],
                'participants' => (int)$row['participants'],
                'completed' => (bool)$row['completed']
            ];
        }
        
        ApiResponse::success($challenges);
        break;
        
    case 'challenges/join':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = validateToken($userModel);
            if (!$user) {
                ApiResponse::error('Token de autorización requerido', 401);
            }
            
            $challengeId = $_GET['id'] ?? 0;
            if (!$challengeId) {
                ApiResponse::error('ID de desafío requerido', 400);
            }
            
            // Verificar si ya está participando
            $checkSql = "SELECT id FROM user_challenges WHERE user_id = ? AND challenge_id = ?";
            $stmt = $DB->conn->prepare($checkSql);
            $stmt->bind_param('ii', $user['id'], $challengeId);
            $stmt->execute();
            
            if ($stmt->get_result()->fetch_assoc()) {
                ApiResponse::error('Ya estás participando en este desafío', 409);
            }
            
            // Unirse al desafío
            $joinSql = "INSERT INTO user_challenges (user_id, challenge_id) VALUES (?, ?)";
            $stmt = $DB->conn->prepare($joinSql);
            $stmt->bind_param('ii', $user['id'], $challengeId);
            
            if ($stmt->execute()) {
                // Incrementar contador de participantes
                $DB->conn->query("UPDATE challenges SET participants_count = participants_count + 1 WHERE id = $challengeId");
                
                ApiResponse::success([
                    'success' => true,
                    'message' => 'Te has unido al desafío exitosamente'
                ]);
            } else {
                ApiResponse::error('Error al unirse al desafío');
            }
        }
        break;
        
    case 'award-points':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = validateToken($userModel);
            if (!$user) {
                ApiResponse::error('Token de autorización requerido', 401);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            $action = $data['action'] ?? '';
            
            $pointsToAward = 0;
            
            switch ($action) {
                case 'complaint_created':
                    $pointsToAward = 10;
                    break;
                case 'comment_added':
                    $pointsToAward = 5;
                    break;
                case 'like_received':
                    $pointsToAward = 2;
                    break;
                default:
                    ApiResponse::error('Acción no válida', 400);
            }
            
            // Actualizar puntos del usuario
            $currentPoints = $user['transparency_points'];
            $newPoints = $currentPoints + $pointsToAward;
            
            $updateSql = "UPDATE users SET transparency_points = ? WHERE id = ?";
            $stmt = $DB->conn->prepare($updateSql);
            $stmt->bind_param('ii', $newPoints, $user['id']);
            $stmt->execute();
            
            // Verificar si subió de nivel
            $currentLevel = $user['level'];
            $newLevel = floor($newPoints / 100) + 1; // Nivel cada 100 puntos
            $levelUp = $newLevel > $currentLevel;
            
            if ($levelUp) {
                $levelSql = "UPDATE users SET level = ? WHERE id = ?";
                $stmt = $DB->conn->prepare($levelSql);
                $stmt->bind_param('ii', $newLevel, $user['id']);
                $stmt->execute();
            }
            
            ApiResponse::success([
                'pointsAwarded' => $pointsToAward,
                'totalPoints' => $newPoints,
                'levelUp' => $levelUp,
                'newLevel' => $newLevel,
                'badgesUnlocked' => [] // Por implementar
            ]);
        }
        break;
        
    case 'transparency-score':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        $total = (int)$user['transparency_points'];
        
        ApiResponse::success([
            'total' => $total,
            'breakdown' => [
                'complaints' => $user['complaints_submitted'] * 10,
                'resolutions' => 0,
                'engagement' => ($user['comments_given'] + $user['helpful_votes']) * 5,
                'verification' => $user['is_verified'] ? 50 : 0
            ],
            'history' => [] // Por implementar
        ]);
        break;
        
    case 'levels':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        $currentLevel = (int)$user['level'];
        $currentPoints = (int)$user['transparency_points'];
        $pointsForNextLevel = (($currentLevel * 100) + 100) - $currentPoints;
        
        $levels = [];
        for ($i = 1; $i <= max($currentLevel + 2, 5); $i++) {
            $levels[] = [
                'level' => $i,
                'name' => "Nivel $i",
                'description' => "Transparencia nivel $i",
                'perks' => ["Acceso a funciones nivel $i"]
            ];
        }
        
        ApiResponse::success([
            'currentLevel' => $currentLevel,
            'currentPoints' => $currentPoints,
            'pointsForNextLevel' => max(0, $pointsForNextLevel),
            'totalPointsForNextLevel' => ($currentLevel * 100) + 100,
            'levelsUnlocked' => $levels
        ]);
        break;
        
    default:
        ApiResponse::error('Acción no válida', 400);
}
?>
