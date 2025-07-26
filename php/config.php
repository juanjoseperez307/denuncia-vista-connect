
<?php
class Database {
    private $host = 'localhost';
    private $user = 'root';
    private $pass = '';
    private $name = 'denuncia_vista';
    public $conn;

    public function __construct() {
        $this->conn = new mysqli($this->host, $this->user, $this->pass);
        if ($this->conn->connect_error) {
            die('Error de conexión: ' . $this->conn->connect_error);
        }
        $this->conn->query("CREATE DATABASE IF NOT EXISTS {$this->name}");
        $this->conn->select_db($this->name);
        $this->setupSchema();
        $this->setupDefaultData();
    }

    private function setupSchema() {
        // Tabla de usuarios
        $this->conn->query("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            username VARCHAR(50) UNIQUE,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255),
            phone VARCHAR(20),
            location VARCHAR(100),
            bio TEXT,
            avatar VARCHAR(255),
            transparency_points INT DEFAULT 0,
            level INT DEFAULT 1,
            complaints_submitted INT DEFAULT 0,
            comments_given INT DEFAULT 0,
            helpful_votes INT DEFAULT 0,
            google_id VARCHAR(255) UNIQUE NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");

        // Tabla de denuncias
        $this->conn->query("CREATE TABLE IF NOT EXISTS complaints (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            category VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            location VARCHAR(100),
            is_anonymous BOOLEAN DEFAULT FALSE,
            likes_count INT DEFAULT 0,
            comments_count INT DEFAULT 0,
            shares_count INT DEFAULT 0,
            is_trending BOOLEAN DEFAULT FALSE,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");

        // Tabla de archivos adjuntos
        $this->conn->query("CREATE TABLE IF NOT EXISTS complaint_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            complaint_id INT,
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size INT,
            mime_type VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        )");

        // Tabla de likes
        $this->conn->query("CREATE TABLE IF NOT EXISTS complaint_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            complaint_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
            UNIQUE KEY unique_like (user_id, complaint_id)
        )");

        // Tabla de comentarios
        $this->conn->query("CREATE TABLE IF NOT EXISTS complaint_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            complaint_id INT,
            content TEXT NOT NULL,
            parent_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES complaint_comments(id) ON DELETE CASCADE
        )");

        // Tabla de categorías
        $this->conn->query("CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            label VARCHAR(100) NOT NULL,
            icon VARCHAR(50),
            color VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tabla de logros
        $this->conn->query("CREATE TABLE IF NOT EXISTS achievements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            icon VARCHAR(10),
            target INT,
            category VARCHAR(50),
            rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
            points_reward INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tabla de logros de usuario
        $this->conn->query("CREATE TABLE IF NOT EXISTS user_achievements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            achievement_id INT,
            progress INT DEFAULT 0,
            completed BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_achievement (user_id, achievement_id)
        )");

        // Tabla de desafíos
        $this->conn->query("CREATE TABLE IF NOT EXISTS challenges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            type ENUM('daily', 'weekly', 'monthly', 'special') DEFAULT 'weekly',
            requirement_type VARCHAR(50),
            requirement_target INT,
            points_reward INT DEFAULT 0,
            start_date DATETIME,
            end_date DATETIME,
            is_active BOOLEAN DEFAULT TRUE,
            participants_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tabla de participación en desafíos
        $this->conn->query("CREATE TABLE IF NOT EXISTS user_challenges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            challenge_id INT,
            progress INT DEFAULT 0,
            completed BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_challenge (user_id, challenge_id)
        )");

        // Tabla de entidades detectadas
        $this->conn->query("CREATE TABLE IF NOT EXISTS complaint_entities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            complaint_id INT,
            entity_type VARCHAR(50),
            entity_value VARCHAR(255),
            icon VARCHAR(50),
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        )");

        // Tabla de sesiones
        $this->conn->query("CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            session_token VARCHAR(255) UNIQUE,
            expires_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
    }

    private function setupDefaultData() {
        // Insertar categorías por defecto
        $categories = [
            ['corrupcion', 'Corrupción', 'AlertTriangle', '#ef4444'],
            ['servicios', 'Servicios Públicos', 'Wrench', '#3b82f6'],
            ['infraestructura', 'Infraestructura', 'Building', '#f59e0b'],
            ['medio_ambiente', 'Medio Ambiente', 'Leaf', '#10b981'],
            ['seguridad', 'Seguridad', 'Shield', '#8b5cf6'],
            ['educacion', 'Educación', 'GraduationCap', '#06b6d4'],
            ['salud', 'Salud', 'Heart', '#ec4899'],
            ['transporte', 'Transporte', 'Car', '#84cc16']
        ];

        foreach ($categories as $category) {
            $this->conn->query("INSERT IGNORE INTO categories (name, label, icon, color) VALUES ('{$category[0]}', '{$category[1]}', '{$category[2]}', '{$category[3]}')");
        }

        // Insertar logros por defecto
        $achievements = [
            ['Primer Paso', 'Envía tu primera denuncia', '🚀', 1, 'complaints', 'common', 10],
            ['Activista', 'Envía 10 denuncias', '📢', 10, 'complaints', 'uncommon', 50],
            ['Defensor', 'Envía 50 denuncias', '🛡️', 50, 'complaints', 'rare', 200],
            ['Campeón', 'Envía 100 denuncias', '👑', 100, 'complaints', 'epic', 500],
            ['Comentarista', 'Comenta 25 denuncias', '💬', 25, 'comments', 'common', 25],
            ['Participativo', 'Recibe 50 likes', '👍', 50, 'likes', 'uncommon', 75]
        ];

        foreach ($achievements as $achievement) {
            $this->conn->query("INSERT IGNORE INTO achievements (title, description, icon, target, category, rarity, points_reward) VALUES ('{$achievement[0]}', '{$achievement[1]}', '{$achievement[2]}', {$achievement[3]}, '{$achievement[4]}', '{$achievement[5]}', {$achievement[6]})");
        }
    }
}

// Configuración de OAuth con Google
class GoogleOAuth {
    private $clientId;
    private $clientSecret;
    private $redirectUri;

    public function __construct() {
        $this->clientId = $_ENV['GOOGLE_CLIENT_ID'] ?? '';
        $this->clientSecret = $_ENV['GOOGLE_CLIENT_SECRET'] ?? '';
        $this->redirectUri = $_ENV['GOOGLE_REDIRECT_URI'] ?? 'http://localhost/api/auth/google/callback';
    }

    public function getAuthUrl() {
        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'scope' => 'email profile',
            'response_type' => 'code',
            'access_type' => 'offline'
        ];
        return 'https://accounts.google.com/o/oauth2/auth?' . http_build_query($params);
    }

    public function getAccessToken($code) {
        $data = [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
            'code' => $code
        ];

        $ch = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    public function getUserInfo($accessToken) {
        $ch = curl_init('https://www.googleapis.com/oauth2/v2/userinfo');
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$accessToken}"]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }
}

// Configuración CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$DB = new Database();
$GoogleOAuth = new GoogleOAuth();
?>
