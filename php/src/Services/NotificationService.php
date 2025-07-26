<?php

namespace DenunciaVista\Services;

require_once __DIR__ . '/../../models/User.php';

class NotificationService
{
    private $db;
    private $userModel;
    
    public function __construct($database)
    {
        $this->db = $database;
        $this->userModel = new \User($database);
        
        // Create notifications table if it doesn't exist
        $this->createNotificationsTable();
    }
    
    public function list(array $data): array
    {
        $user = $this->authenticateUser($data);
        $query = $data['query'] ?? [];
        $page = (int)($query['page'] ?? 1);
        $limit = (int)($query['limit'] ?? 20);
        $unread_only = $query['unread_only'] ?? false;
        
        $offset = ($page - 1) * $limit;
        
        $notifications = $this->getUserNotifications($user['id'], $limit, $offset, $unread_only);
        $total = $this->getUserNotificationsCount($user['id'], $unread_only);
        
        return [
            'success' => true,
            'data' => $notifications,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }
    
    public function markAsRead(array $data): array
    {
        $user = $this->authenticateUser($data);
        $id = $data['params']['id'] ?? null;
        
        if (!$id) {
            throw new \Exception('ID de notificación requerido');
        }
        
        $this->markNotificationAsRead($user['id'], $id);
        
        return [
            'success' => true,
            'message' => 'Notificación marcada como leída'
        ];
    }
    
    public function markAllAsRead(array $data): array
    {
        $user = $this->authenticateUser($data);
        
        $this->markAllNotificationsAsRead($user['id']);
        
        return [
            'success' => true,
            'message' => 'Todas las notificaciones marcadas como leídas'
        ];
    }
    
    public function getUnreadCount(array $data): array
    {
        $user = $this->authenticateUser($data);
        
        $count = $this->getUnreadNotificationsCount($user['id']);
        
        return [
            'success' => true,
            'unread_count' => $count
        ];
    }
    
    public function delete(array $data): array
    {
        $user = $this->authenticateUser($data);
        $id = $data['params']['id'] ?? null;
        
        if (!$id) {
            throw new \Exception('ID de notificación requerido');
        }
        
        $this->deleteNotification($user['id'], $id);
        
        return [
            'success' => true,
            'message' => 'Notificación eliminada'
        ];
    }
    
    public function create(array $data): array
    {
        // This would typically be called internally by the system
        $body = $data['body'] ?? [];
        
        $requiredFields = ['user_id', 'type', 'title', 'message'];
        foreach ($requiredFields as $field) {
            if (empty($body[$field])) {
                throw new \Exception("Campo requerido: $field");
            }
        }
        
        $notificationId = $this->createNotification($body);
        
        return [
            'success' => true,
            'message' => 'Notificación creada',
            'notification_id' => $notificationId
        ];
    }
    
    private function createNotificationsTable(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('complaint_update', 'new_comment', 'like_received', 'achievement_unlocked', 'challenge_completed', 'system', 'other') DEFAULT 'other',
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            data JSON,
            read_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_created (user_id, created_at),
            INDEX idx_user_read (user_id, read_at)
        )";
        
        $this->db->conn->query($sql);
    }
    
    private function getUserNotifications(int $userId, int $limit, int $offset, bool $unreadOnly): array
    {
        $sql = "SELECT * FROM notifications WHERE user_id = ?";
        
        if ($unreadOnly) {
            $sql .= " AND read_at IS NULL";
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('iii', $userId, $limit, $offset);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $notifications = [];
        while ($row = $result->fetch_assoc()) {
            // Parse JSON data if present
            if ($row['data']) {
                $row['data'] = json_decode($row['data'], true);
            }
            $notifications[] = $row;
        }
        
        return $notifications;
    }
    
    private function getUserNotificationsCount(int $userId, bool $unreadOnly): int
    {
        $sql = "SELECT COUNT(*) as count FROM notifications WHERE user_id = ?";
        
        if ($unreadOnly) {
            $sql .= " AND read_at IS NULL";
        }
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        
        return $stmt->get_result()->fetch_assoc()['count'];
    }
    
    private function getUnreadNotificationsCount(int $userId): int
    {
        return $this->getUserNotificationsCount($userId, true);
    }
    
    private function markNotificationAsRead(int $userId, int $notificationId): void
    {
        $sql = "UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ? AND read_at IS NULL";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ii', $notificationId, $userId);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new \Exception('Notificación no encontrada o ya marcada como leída');
        }
    }
    
    private function markAllNotificationsAsRead(int $userId): void
    {
        $sql = "UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
    }
    
    private function deleteNotification(int $userId, int $notificationId): void
    {
        $sql = "DELETE FROM notifications WHERE id = ? AND user_id = ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ii', $notificationId, $userId);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new \Exception('Notificación no encontrada');
        }
    }
    
    private function createNotification(array $data): int
    {
        $sql = "INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->db->conn->prepare($sql);
        
        $jsonData = isset($data['data']) ? json_encode($data['data']) : null;
        
        $stmt->bind_param('issss', 
            $data['user_id'], 
            $data['type'], 
            $data['title'], 
            $data['message'], 
            $jsonData
        );
        
        $stmt->execute();
        
        return $this->db->conn->insert_id;
    }
    
    // Helper methods for creating different types of notifications
    public function createComplaintUpdateNotification(int $userId, int $complaintId, string $status): void
    {
        $this->createNotification([
            'user_id' => $userId,
            'type' => 'complaint_update',
            'title' => 'Actualización de denuncia',
            'message' => "Tu denuncia ha sido actualizada a: $status",
            'data' => ['complaint_id' => $complaintId, 'status' => $status]
        ]);
    }
    
    public function createNewCommentNotification(int $userId, int $complaintId, string $commenterName): void
    {
        $this->createNotification([
            'user_id' => $userId,
            'type' => 'new_comment',
            'title' => 'Nuevo comentario',
            'message' => "$commenterName comentó en tu denuncia",
            'data' => ['complaint_id' => $complaintId, 'commenter' => $commenterName]
        ]);
    }
    
    public function createLikeReceivedNotification(int $userId, int $complaintId): void
    {
        $this->createNotification([
            'user_id' => $userId,
            'type' => 'like_received',
            'title' => 'Nueva valoración',
            'message' => 'Tu denuncia recibió una nueva valoración positiva',
            'data' => ['complaint_id' => $complaintId]
        ]);
    }
    
    public function createAchievementNotification(int $userId, string $achievementTitle): void
    {
        $this->createNotification([
            'user_id' => $userId,
            'type' => 'achievement_unlocked',
            'title' => '¡Logro desbloqueado!',
            'message' => "Has desbloqueado el logro: $achievementTitle",
            'data' => ['achievement' => $achievementTitle]
        ]);
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