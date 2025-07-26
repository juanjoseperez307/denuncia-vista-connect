
<?php
require_once __DIR__ . '/../config.php';

class User {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db->conn;
    }
    
    public function create($data) {
        $sql = "INSERT INTO users (name, email, username, password, google_id, is_verified) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $password = isset($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : null;
        $google_id = $data['google_id'] ?? null;
        $is_verified = isset($data['google_id']) ? 1 : 0;
        
        $stmt->bind_param('sssssi', 
            $data['name'], 
            $data['email'], 
            $data['username'], 
            $password, 
            $google_id, 
            $is_verified
        );
        
        if ($stmt->execute()) {
            return $stmt->insert_id;
        }
        return false;
    }
    
    public function findByUsername($username) {
        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function findByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function findByGoogleId($google_id) {
        $sql = "SELECT * FROM users WHERE google_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('s', $google_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function updateProfile($id, $data) {
        $fields = [];
        $values = [];
        $types = '';
        
        if (isset($data['name'])) {
            $fields[] = 'name = ?';
            $values[] = $data['name'];
            $types .= 's';
        }
        if (isset($data['phone'])) {
            $fields[] = 'phone = ?';
            $values[] = $data['phone'];
            $types .= 's';
        }
        if (isset($data['location'])) {
            $fields[] = 'location = ?';
            $values[] = $data['location'];
            $types .= 's';
        }
        if (isset($data['bio'])) {
            $fields[] = 'bio = ?';
            $values[] = $data['bio'];
            $types .= 's';
        }
        if (isset($data['avatar'])) {
            $fields[] = 'avatar = ?';
            $values[] = $data['avatar'];
            $types .= 's';
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $types .= 'i';
        
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$values);
        
        return $stmt->execute();
    }
    
    public function updateStats($userId, $field, $increment = 1) {
        $sql = "UPDATE users SET {$field} = {$field} + ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('ii', $increment, $userId);
        return $stmt->execute();
    }
    
    public function createSession($userId) {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        
        $sql = "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('iss', $userId, $token, $expiresAt);
        
        if ($stmt->execute()) {
            return $token;
        }
        return false;
    }
    
    public function validateSession($token) {
        $sql = "SELECT u.* FROM users u 
                JOIN user_sessions s ON u.id = s.user_id 
                WHERE s.session_token = ? AND s.expires_at > NOW()";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('s', $token);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function deleteSession($token) {
        $sql = "DELETE FROM user_sessions WHERE session_token = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('s', $token);
        return $stmt->execute();
    }
}
?>
