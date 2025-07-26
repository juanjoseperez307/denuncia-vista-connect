<?php

namespace DenunciaVista\Services;

require_once __DIR__ . '/../../models/User.php';

class GamificationService
{
    private $db;
    private $userModel;
    
    public function __construct($database)
    {
        $this->db = $database;
        $this->userModel = new \User($database);
    }
    
    public function getProfile(array $data): array
    {
        $user = $this->authenticateUser($data);
        
        $achievements = $this->getUserAchievements($user['id']);
        $challenges = $this->getUserChallenges($user['id']);
        $leaderboardPosition = $this->getUserLeaderboardPosition($user['id']);
        
        return [
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'username' => $user['username'],
                    'level' => $user['level'],
                    'transparency_points' => $user['transparency_points'],
                    'avatar' => $user['avatar']
                ],
                'achievements' => $achievements,
                'challenges' => $challenges,
                'leaderboard_position' => $leaderboardPosition
            ]
        ];
    }
    
    public function getAchievements(array $data): array
    {
        $query = $data['query'] ?? [];
        $userId = $this->authenticateUser($data)['id'];
        $category = $query['category'] ?? null;
        
        $achievements = $this->getAvailableAchievements($userId, $category);
        $userAchievements = $this->getUserAchievements($userId);
        
        return [
            'success' => true,
            'data' => [
                'available' => $achievements,
                'user_progress' => $userAchievements
            ]
        ];
    }
    
    public function getChallenges(array $data): array
    {
        $query = $data['query'] ?? [];
        $userId = $this->authenticateUser($data)['id'];
        $type = $query['type'] ?? null;
        $active = $query['active'] ?? true;
        
        $challenges = $this->getAvailableChallenges($type, $active);
        $userChallenges = $this->getUserChallenges($userId);
        
        return [
            'success' => true,
            'data' => [
                'available' => $challenges,
                'user_progress' => $userChallenges
            ]
        ];
    }
    
    public function getLeaderboard(array $data): array
    {
        $query = $data['query'] ?? [];
        $period = $query['period'] ?? 'all';
        $type = $query['type'] ?? 'points';
        $limit = (int)($query['limit'] ?? 10);
        
        $leaderboard = $this->getLeaderboardData($period, $type, $limit);
        
        return [
            'success' => true,
            'data' => $leaderboard,
            'period' => $period,
            'type' => $type
        ];
    }
    
    public function joinChallenge(array $data): array
    {
        $user = $this->authenticateUser($data);
        $body = $data['body'] ?? [];
        $challengeId = $body['challenge_id'] ?? null;
        
        if (!$challengeId) {
            throw new \Exception('ID del desafío requerido');
        }
        
        // Check if challenge exists and is active
        $challenge = $this->getChallengeById($challengeId);
        if (!$challenge || !$challenge['is_active']) {
            throw new \Exception('Desafío no encontrado o inactivo');
        }
        
        // Check if user already joined
        if ($this->hasUserJoinedChallenge($user['id'], $challengeId)) {
            throw new \Exception('Ya te has unido a este desafío');
        }
        
        // Join challenge
        $this->joinUserToChallenge($user['id'], $challengeId);
        
        return [
            'success' => true,
            'message' => 'Te has unido al desafío exitosamente',
            'challenge' => $challenge
        ];
    }
    
    public function recordAction(array $data): array
    {
        $user = $this->authenticateUser($data);
        $body = $data['body'] ?? [];
        $action = $body['action'] ?? '';
        $value = $body['value'] ?? 1;
        
        if (empty($action)) {
            throw new \Exception('Acción requerida');
        }
        
        // Record the action and update achievements/challenges
        $points = $this->processUserAction($user['id'], $action, $value);
        
        return [
            'success' => true,
            'message' => 'Acción registrada exitosamente',
            'points_earned' => $points
        ];
    }
    
    private function getUserAchievements(int $userId): array
    {
        $sql = "SELECT a.*, ua.progress, ua.completed, ua.completed_at 
                FROM achievements a 
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ? 
                ORDER BY ua.completed DESC, a.rarity, a.points_reward DESC";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $achievements = [];
        while ($row = $result->fetch_assoc()) {
            $achievements[] = $row;
        }
        
        return $achievements;
    }
    
    private function getUserChallenges(int $userId): array
    {
        $sql = "SELECT c.*, uc.progress, uc.completed, uc.completed_at 
                FROM challenges c 
                LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ? 
                WHERE c.is_active = 1 AND (c.end_date IS NULL OR c.end_date > NOW()) 
                ORDER BY uc.completed, c.end_date";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $challenges = [];
        while ($row = $result->fetch_assoc()) {
            $challenges[] = $row;
        }
        
        return $challenges;
    }
    
    private function getUserLeaderboardPosition(int $userId): int
    {
        $sql = "SELECT COUNT(*) + 1 as position 
                FROM users 
                WHERE transparency_points > (SELECT transparency_points FROM users WHERE id = ?)";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        
        return $stmt->get_result()->fetch_assoc()['position'];
    }
    
    private function getAvailableAchievements(int $userId, ?string $category): array
    {
        $sql = "SELECT * FROM achievements";
        $params = [];
        
        if ($category) {
            $sql .= " WHERE category = ?";
            $params[] = $category;
        }
        
        $sql .= " ORDER BY rarity, points_reward DESC";
        
        $stmt = $this->db->conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
        }
        $stmt->execute();
        
        $result = $stmt->get_result();
        $achievements = [];
        while ($row = $result->fetch_assoc()) {
            $achievements[] = $row;
        }
        
        return $achievements;
    }
    
    private function getAvailableChallenges(?string $type, bool $active): array
    {
        $sql = "SELECT * FROM challenges WHERE 1=1";
        $params = [];
        
        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }
        
        if ($active) {
            $sql .= " AND is_active = 1 AND (end_date IS NULL OR end_date > NOW())";
        }
        
        $sql .= " ORDER BY end_date, created_at DESC";
        
        $stmt = $this->db->conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
        }
        $stmt->execute();
        
        $result = $stmt->get_result();
        $challenges = [];
        while ($row = $result->fetch_assoc()) {
            $challenges[] = $row;
        }
        
        return $challenges;
    }
    
    private function getLeaderboardData(string $period, string $type, int $limit): array
    {
        $orderBy = $type === 'points' ? 'transparency_points' : 'level';
        
        $sql = "SELECT id, name, username, avatar, transparency_points, level, 
                       complaints_submitted, comments_given, helpful_votes
                FROM users 
                ORDER BY $orderBy DESC 
                LIMIT ?";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $limit);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $leaderboard = [];
        $position = 1;
        while ($row = $result->fetch_assoc()) {
            $row['position'] = $position++;
            $leaderboard[] = $row;
        }
        
        return $leaderboard;
    }
    
    private function getChallengeById(int $challengeId): ?array
    {
        $sql = "SELECT * FROM challenges WHERE id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $challengeId);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    private function hasUserJoinedChallenge(int $userId, int $challengeId): bool
    {
        $sql = "SELECT id FROM user_challenges WHERE user_id = ? AND challenge_id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ii', $userId, $challengeId);
        $stmt->execute();
        
        return $stmt->get_result()->num_rows > 0;
    }
    
    private function joinUserToChallenge(int $userId, int $challengeId): void
    {
        $sql = "INSERT INTO user_challenges (user_id, challenge_id) VALUES (?, ?)";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ii', $userId, $challengeId);
        $stmt->execute();
        
        // Update participants count
        $sql = "UPDATE challenges SET participants_count = participants_count + 1 WHERE id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $challengeId);
        $stmt->execute();
    }
    
    private function processUserAction(int $userId, string $action, int $value): int
    {
        $pointsEarned = 0;
        
        // Award points based on action
        switch ($action) {
            case 'complaint_created':
                $pointsEarned = 10;
                $this->updateUserStat($userId, 'complaints_submitted', 1);
                break;
            case 'comment_created':
                $pointsEarned = 5;
                $this->updateUserStat($userId, 'comments_given', 1);
                break;
            case 'like_received':
                $pointsEarned = 2;
                $this->updateUserStat($userId, 'helpful_votes', 1);
                break;
            default:
                $pointsEarned = 1;
        }
        
        // Update user points
        $this->updateUserPoints($userId, $pointsEarned);
        
        // Check and update achievements
        $this->checkAchievements($userId, $action, $value);
        
        // Check and update challenges
        $this->checkChallenges($userId, $action, $value);
        
        return $pointsEarned;
    }
    
    private function updateUserStat(int $userId, string $stat, int $increment): void
    {
        $sql = "UPDATE users SET $stat = $stat + ? WHERE id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ii', $increment, $userId);
        $stmt->execute();
    }
    
    private function updateUserPoints(int $userId, int $points): void
    {
        $sql = "UPDATE users SET transparency_points = transparency_points + ? WHERE id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ii', $points, $userId);
        $stmt->execute();
        
        // Update level based on points
        $this->updateUserLevel($userId);
    }
    
    private function updateUserLevel(int $userId): void
    {
        $sql = "SELECT transparency_points FROM users WHERE id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $points = $stmt->get_result()->fetch_assoc()['transparency_points'];
        
        // Simple level calculation (every 100 points = 1 level)
        $newLevel = floor($points / 100) + 1;
        
        $sql = "UPDATE users SET level = ? WHERE id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ii', $newLevel, $userId);
        $stmt->execute();
    }
    
    private function checkAchievements(int $userId, string $action, int $value): void
    {
        // Get relevant achievements based on action
        $categoryMap = [
            'complaint_created' => 'complaints',
            'comment_created' => 'comments',
            'like_received' => 'likes'
        ];
        
        $category = $categoryMap[$action] ?? null;
        if (!$category) return;
        
        $sql = "SELECT a.*, ua.progress FROM achievements a 
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ? 
                WHERE a.category = ? AND (ua.completed IS NULL OR ua.completed = 0)";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('is', $userId, $category);
        $stmt->execute();
        
        $result = $stmt->get_result();
        while ($achievement = $result->fetch_assoc()) {
            $currentProgress = $achievement['progress'] ?? 0;
            $newProgress = $currentProgress + $value;
            
            if ($newProgress >= $achievement['target']) {
                // Achievement completed
                $this->completeAchievement($userId, $achievement['id'], $achievement['points_reward']);
            } else {
                // Update progress
                $this->updateAchievementProgress($userId, $achievement['id'], $newProgress);
            }
        }
    }
    
    private function checkChallenges(int $userId, string $action, int $value): void
    {
        // Similar to achievements but for active challenges
        $sql = "SELECT c.*, uc.progress FROM challenges c 
                LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ? 
                WHERE c.is_active = 1 AND (c.end_date IS NULL OR c.end_date > NOW()) 
                AND c.requirement_type = ? AND (uc.completed IS NULL OR uc.completed = 0)";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('is', $userId, $action);
        $stmt->execute();
        
        $result = $stmt->get_result();
        while ($challenge = $result->fetch_assoc()) {
            $currentProgress = $challenge['progress'] ?? 0;
            $newProgress = $currentProgress + $value;
            
            if ($newProgress >= $challenge['requirement_target']) {
                // Challenge completed
                $this->completeChallenge($userId, $challenge['id'], $challenge['points_reward']);
            } else {
                // Update progress
                $this->updateChallengeProgress($userId, $challenge['id'], $newProgress);
            }
        }
    }
    
    private function completeAchievement(int $userId, int $achievementId, int $pointsReward): void
    {
        $sql = "INSERT INTO user_achievements (user_id, achievement_id, progress, completed, completed_at) 
                VALUES (?, ?, (SELECT target FROM achievements WHERE id = ?), 1, NOW()) 
                ON DUPLICATE KEY UPDATE completed = 1, completed_at = NOW()";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('iii', $userId, $achievementId, $achievementId);
        $stmt->execute();
        
        // Award points
        $this->updateUserPoints($userId, $pointsReward);
    }
    
    private function updateAchievementProgress(int $userId, int $achievementId, int $progress): void
    {
        $sql = "INSERT INTO user_achievements (user_id, achievement_id, progress) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE progress = ?";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('iiii', $userId, $achievementId, $progress, $progress);
        $stmt->execute();
    }
    
    private function completeChallenge(int $userId, int $challengeId, int $pointsReward): void
    {
        $sql = "UPDATE user_challenges 
                SET progress = (SELECT requirement_target FROM challenges WHERE id = ?), 
                    completed = 1, completed_at = NOW() 
                WHERE user_id = ? AND challenge_id = ?";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('iii', $challengeId, $userId, $challengeId);
        $stmt->execute();
        
        // Award points
        $this->updateUserPoints($userId, $pointsReward);
    }
    
    private function updateChallengeProgress(int $userId, int $challengeId, int $progress): void
    {
        $sql = "INSERT INTO user_challenges (user_id, challenge_id, progress) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE progress = ?";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('iiii', $userId, $challengeId, $progress, $progress);
        $stmt->execute();
    }
    
    private function authenticateUser(array $data): array
    {
        $authHeader = $data['auth'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) {
            throw new \Exception('Token de autorización requerido');
        }
        
        $user = $this->userModel->findBySessionToken($token);
        
        if (!$user) {
            throw new \Exception('Token inválido o expirado');
        }
        
        return $user;
    }
}