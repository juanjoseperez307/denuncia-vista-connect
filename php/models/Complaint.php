
<?php
require_once __DIR__ . '/../config.php';

class Complaint {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db->conn;
    }
    
    public function all($filters = []) {
        $where = ['1=1'];
        $params = [];
        $types = '';
        
        if (!empty($filters['category'])) {
            $where[] = 'c.category = ?';
            $params[] = $filters['category'];
            $types .= 's';
        }
        
        if (!empty($filters['location'])) {
            $where[] = 'c.location LIKE ?';
            $params[] = '%' . $filters['location'] . '%';
            $types .= 's';
        }
        
        if (!empty($filters['trending'])) {
            $where[] = 'c.is_trending = 1';
        }
        
        if (!empty($filters['timeRange'])) {
            switch ($filters['timeRange']) {
                case 'today':
                    $where[] = 'DATE(c.created_at) = CURDATE()';
                    break;
                case 'week':
                    $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
                    break;
                case 'month':
                    $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
                    break;
                case 'year':
                    $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
                    break;
            }
        }
        
        $limit = (int)($filters['limit'] ?? 10);
        $offset = (int)($filters['offset'] ?? 0);
        
        $sql = "SELECT c.*, u.name as author, u.avatar, u.username,
                       cat.label as category_label, cat.icon as category_icon, cat.color as category_color,
                       TIMESTAMPDIFF(MINUTE, c.created_at, NOW()) as minutes_ago
                FROM complaints c 
                LEFT JOIN users u ON c.user_id = u.id 
                LEFT JOIN categories cat ON c.category = cat.name
                WHERE " . implode(' AND ', $where) . "
                ORDER BY c.created_at DESC 
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        $types .= 'ii';
        
        $stmt = $this->conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        $complaints = [];
        while ($row = $result->fetch_assoc()) {
            // Formatear tiempo relativo
            $row['time'] = $this->formatRelativeTime($row['minutes_ago']);
            
            // Obtener archivos
            $row['files'] = $this->getComplaintFiles($row['id']);
            
            // Obtener entidades
            $row['entities'] = $this->getComplaintEntities($row['id']);
            
            // Si es anónimo, ocultar datos del autor
            if ($row['is_anonymous']) {
                $row['author'] = 'Anónimo';
                $row['avatar'] = null;
                $row['username'] = null;
            }
            
            $complaints[] = $row;
        }
        
        return $complaints;
    }
    
    public function findById($id) {
        $sql = "SELECT c.*, u.name as author, u.avatar, u.username,
                       cat.label as category_label, cat.icon as category_icon, cat.color as category_color,
                       TIMESTAMPDIFF(MINUTE, c.created_at, NOW()) as minutes_ago
                FROM complaints c 
                LEFT JOIN users u ON c.user_id = u.id 
                LEFT JOIN categories cat ON c.category = cat.name
                WHERE c.id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $complaint = $result->fetch_assoc();
        
        if ($complaint) {
            $complaint['time'] = $this->formatRelativeTime($complaint['minutes_ago']);
            $complaint['files'] = $this->getComplaintFiles($complaint['id']);
            $complaint['entities'] = $this->getComplaintEntities($complaint['id']);
            
            if ($complaint['is_anonymous']) {
                $complaint['author'] = 'Anónimo';
                $complaint['avatar'] = null;
                $complaint['username'] = null;
            }
        }
        
        return $complaint;
    }
    
    public function create($data) {
        $sql = "INSERT INTO complaints (user_id, category, content, status, location, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $status = $data['status'] ?? 'pending';
        $isAnonymous = $data['is_anonymous'] ?? false;
        
        $stmt->bind_param('issssi', 
            $data['user_id'], 
            $data['category'], 
            $data['content'], 
            $status, 
            $data['location'],
            $isAnonymous
        );
        
        if ($stmt->execute()) {
            $complaintId = $stmt->insert_id;
            
            // Procesar archivos si existen
            if (!empty($data['files'])) {
                $this->addComplaintFiles($complaintId, $data['files']);
            }
            
            // Detectar y guardar entidades
            $entities = $this->detectEntities($data['content']);
            $this->saveComplaintEntities($complaintId, $entities);
            
            // Actualizar estadísticas del usuario
            if (isset($data['user_id'])) {
                $userModel = new User($this->conn);
                $userModel->updateStats($data['user_id'], 'complaints_submitted');
            }
            
            return $complaintId;
        }
        return false;
    }
    
    public function updateStatus($id, $status) {
        $sql = "UPDATE complaints SET status = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('si', $status, $id);
        return $stmt->execute();
    }
    
    public function toggleLike($complaintId, $userId) {
        // Verificar si ya existe el like
        $checkSql = "SELECT id FROM complaint_likes WHERE user_id = ? AND complaint_id = ?";
        $checkStmt = $this->conn->prepare($checkSql);
        $checkStmt->bind_param('ii', $userId, $complaintId);
        $checkStmt->execute();
        $exists = $checkStmt->get_result()->fetch_assoc();
        
        if ($exists) {
            // Eliminar like
            $deleteSql = "DELETE FROM complaint_likes WHERE user_id = ? AND complaint_id = ?";
            $deleteStmt = $this->conn->prepare($deleteSql);
            $deleteStmt->bind_param('ii', $userId, $complaintId);
            $deleteStmt->execute();
            
            // Actualizar contador
            $this->conn->query("UPDATE complaints SET likes_count = likes_count - 1 WHERE id = $complaintId");
            
            return ['liked' => false, 'totalLikes' => $this->getLikesCount($complaintId)];
        } else {
            // Agregar like
            $insertSql = "INSERT INTO complaint_likes (user_id, complaint_id) VALUES (?, ?)";
            $insertStmt = $this->conn->prepare($insertSql);
            $insertStmt->bind_param('ii', $userId, $complaintId);
            $insertStmt->execute();
            
            // Actualizar contador
            $this->conn->query("UPDATE complaints SET likes_count = likes_count + 1 WHERE id = $complaintId");
            
            return ['liked' => true, 'totalLikes' => $this->getLikesCount($complaintId)];
        }
    }
    
    public function getComments($complaintId) {
        $sql = "SELECT cc.*, u.name as author, u.avatar 
                FROM complaint_comments cc
                LEFT JOIN users u ON cc.user_id = u.id
                WHERE cc.complaint_id = ? AND cc.parent_id IS NULL
                ORDER BY cc.created_at ASC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $complaintId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $comments = [];
        while ($row = $result->fetch_assoc()) {
            $row['time'] = $this->formatRelativeTime((time() - strtotime($row['created_at'])) / 60);
            $row['replies'] = $this->getCommentReplies($row['id']);
            $comments[] = $row;
        }
        
        return $comments;
    }
    
    public function addComment($complaintId, $userId, $content, $parentId = null) {
        $sql = "INSERT INTO complaint_comments (complaint_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('iisi', $complaintId, $userId, $content, $parentId);
        
        if ($stmt->execute()) {
            // Actualizar contador de comentarios
            $this->conn->query("UPDATE complaints SET comments_count = comments_count + 1 WHERE id = $complaintId");
            return $stmt->insert_id;
        }
        return false;
    }
    
    public function search($query, $filters = []) {
        $where = ['(c.content LIKE ? OR c.location LIKE ?)'];
        $params = ["%$query%", "%$query%"];
        $types = 'ss';
        
        if (!empty($filters['category'])) {
            $where[] = 'c.category = ?';
            $params[] = $filters['category'];
            $types .= 's';
        }
        
        if (!empty($filters['location'])) {
            $where[] = 'c.location LIKE ?';
            $params[] = '%' . $filters['location'] . '%';
            $types .= 's';
        }
        
        if (!empty($filters['timeRange'])) {
            switch ($filters['timeRange']) {
                case 'today':
                    $where[] = 'DATE(c.created_at) = CURDATE()';
                    break;
                case 'week':
                    $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
                    break;
                case 'month':
                    $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
                    break;
                case 'year':
                    $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
                    break;
            }
        }
        
        $sql = "SELECT c.*, u.name as author, u.avatar, u.username,
                       cat.label as category_label, cat.icon as category_icon, cat.color as category_color,
                       TIMESTAMPDIFF(MINUTE, c.created_at, NOW()) as minutes_ago
                FROM complaints c 
                LEFT JOIN users u ON c.user_id = u.id 
                LEFT JOIN categories cat ON c.category = cat.name
                WHERE " . implode(' AND ', $where) . "
                ORDER BY c.created_at DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $complaints = [];
        while ($row = $result->fetch_assoc()) {
            $row['time'] = $this->formatRelativeTime($row['minutes_ago']);
            $row['files'] = $this->getComplaintFiles($row['id']);
            $row['entities'] = $this->getComplaintEntities($row['id']);
            
            if ($row['is_anonymous']) {
                $row['author'] = 'Anónimo';
                $row['avatar'] = null;
                $row['username'] = null;
            }
            
            $complaints[] = $row;
        }
        
        return $complaints;
    }
    
    public function getCategories() {
        $sql = "SELECT name as id, label, icon, color FROM categories ORDER BY label";
        $result = $this->conn->query($sql);
        
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
        
        return $categories;
    }
    
    private function formatRelativeTime($minutes) {
        if ($minutes < 1) return 'Ahora';
        if ($minutes < 60) return $minutes . 'm';
        if ($minutes < 1440) return floor($minutes / 60) . 'h';
        return floor($minutes / 1440) . 'd';
    }
    
    private function getComplaintFiles($complaintId) {
        $sql = "SELECT filename, original_name, file_path FROM complaint_files WHERE complaint_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $complaintId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $files = [];
        while ($row = $result->fetch_assoc()) {
            $files[] = $row['file_path'];
        }
        
        return $files;
    }
    
    private function getComplaintEntities($complaintId) {
        $sql = "SELECT entity_type as type, entity_value as value, icon FROM complaint_entities WHERE complaint_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $complaintId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $entities = [];
        while ($row = $result->fetch_assoc()) {
            $entities[] = $row;
        }
        
        return $entities;
    }
    
    private function getCommentReplies($commentId) {
        $sql = "SELECT cc.*, u.name as author, u.avatar 
                FROM complaint_comments cc
                LEFT JOIN users u ON cc.user_id = u.id
                WHERE cc.parent_id = ?
                ORDER BY cc.created_at ASC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $commentId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $replies = [];
        while ($row = $result->fetch_assoc()) {
            $row['time'] = $this->formatRelativeTime((time() - strtotime($row['created_at'])) / 60);
            $replies[] = $row;
        }
        
        return $replies;
    }
    
    private function getLikesCount($complaintId) {
        $sql = "SELECT likes_count FROM complaints WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $complaintId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row['likes_count'] ?? 0;
    }
    
    private function detectEntities($text) {
        $entities = [];
        
        // Detectar menciones a instituciones gubernamentales
        $institutions = ['alcaldía', 'municipio', 'gobierno', 'policía', 'bomberos', 'hospital', 'ministerio'];
        foreach ($institutions as $institution) {
            if (stripos($text, $institution) !== false) {
                $entities[] = [
                    'type' => 'institution',
                    'value' => $institution,
                    'icon' => 'Building'
                ];
            }
        }
        
        // Detectar ubicaciones
        if (preg_match_all('/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:calle|avenida|plaza|barrio)\b/i', $text, $matches)) {
            foreach ($matches[0] as $location) {
                $entities[] = [
                    'type' => 'location',
                    'value' => $location,
                    'icon' => 'MapPin'
                ];
            }
        }
        
        return $entities;
    }
    
    private function saveComplaintEntities($complaintId, $entities) {
        foreach ($entities as $entity) {
            $sql = "INSERT INTO complaint_entities (complaint_id, entity_type, entity_value, icon) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('isss', $complaintId, $entity['type'], $entity['value'], $entity['icon']);
            $stmt->execute();
        }
    }
    
    private function addComplaintFiles($complaintId, $files) {
        foreach ($files as $file) {
            $sql = "INSERT INTO complaint_files (complaint_id, filename, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('issssi', 
                $complaintId,
                $file['filename'] ?? basename($file),
                $file['original_name'] ?? basename($file),
                $file,
                $file['size'] ?? 0,
                $file['mime_type'] ?? 'application/octet-stream'
            );
            $stmt->execute();
        }
    }
}
?>
