<?php

namespace DenunciaVista\Services;

require_once __DIR__ . '/../../models/User.php';

class AuthService
{
    private $db;
    private $userModel;
    
    public function __construct($database)
    {
        $this->db = $database;
        $this->userModel = new \User($database);
    }
    
    public function signup(array $data): array
    {
        $body = $data['body'] ?? [];
        
        if (empty($body['email']) || empty($body['name'])) {
            throw new \Exception('Email y nombre son requeridos');
        }
        
        // Check if user already exists
        if ($this->userModel->findByEmail($body['email'])) {
            throw new \Exception('El email ya está registrado');
        }
        
        // Generate username if not provided
        if (empty($body['username'])) {
            $body['username'] = $this->generateUsername($body['name']);
        }
        
        // Check if username exists
        if ($this->userModel->findByUsername($body['username'])) {
            throw new \Exception('El username ya está en uso');
        }
        
        // Create user
        $userId = $this->userModel->create($body);
        
        if (!$userId) {
            throw new \Exception('Error al crear usuario');
        }
        
        // Create session
        $token = $this->userModel->createSession($userId);
        $user = $this->userModel->findById($userId);
        
        return [
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'token' => $token
        ];
    }
    
    public function login(array $data): array
    {
        $body = $data['body'] ?? [];
        
        if (empty($body['username']) || empty($body['password'])) {
            throw new \Exception('Username y password son requeridos');
        }
        
        $user = $this->userModel->findByUsername($body['username']);
        
        if (!$user || !password_verify($body['password'], $user['password'])) {
            throw new \Exception('Credenciales inválidas');
        }
        
        $token = $this->userModel->createSession($user['id']);
        
        return [
            'success' => true,
            'message' => 'Login exitoso',
            'user' => $user,
            'token' => $token
        ];
    }
    
    public function logout(array $data): array
    {
        $authHeader = $data['auth'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if ($token) {
            $this->userModel->deleteSession($token);
        }
        
        return [
            'success' => true,
            'message' => 'Logout exitoso'
        ];
    }
    
    public function getProfile(array $data): array
    {
        $user = $this->authenticateUser($data);
        
        return [
            'success' => true,
            'user' => $user
        ];
    }
    
    public function updateProfile(array $data): array
    {
        $user = $this->authenticateUser($data);
        $body = $data['body'] ?? [];
        
        $this->userModel->updateProfile($user['id'], $body);
        $updatedUser = $this->userModel->findById($user['id']);
        
        return [
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'user' => $updatedUser
        ];
    }
    
    public function googleAuth(array $data): array
    {
        global $GoogleOAuth;
        
        return [
            'success' => true,
            'auth_url' => $GoogleOAuth->getAuthUrl()
        ];
    }
    
    public function googleCallback(array $data): array
    {
        global $GoogleOAuth;
        
        $code = $data['query']['code'] ?? '';
        
        if (!$code) {
            throw new \Exception('Código de autorización no encontrado');
        }
        
        $tokenData = $GoogleOAuth->getAccessToken($code);
        
        if (!isset($tokenData['access_token'])) {
            throw new \Exception('Error al obtener token de acceso');
        }
        
        $userInfo = $GoogleOAuth->getUserInfo($tokenData['access_token']);
        
        if (!$userInfo) {
            throw new \Exception('Error al obtener información del usuario');
        }
        
        // Check if user exists by Google ID
        $existingUser = $this->userModel->findByGoogleId($userInfo['id']);
        
        if ($existingUser) {
            // User exists, login
            $token = $this->userModel->createSession($existingUser['id']);
            return [
                'success' => true,
                'message' => 'Login con Google exitoso',
                'user' => $existingUser,
                'token' => $token
            ];
        } else {
            // Register new user
            $userData = [
                'name' => $userInfo['name'],
                'email' => $userInfo['email'],
                'username' => $this->generateUsername($userInfo['name']),
                'google_id' => $userInfo['id'],
                'avatar' => $userInfo['picture'] ?? null,
                'is_verified' => true
            ];
            
            $userId = $this->userModel->create($userData);
            $token = $this->userModel->createSession($userId);
            $user = $this->userModel->findById($userId);
            
            return [
                'success' => true,
                'message' => 'Registro con Google exitoso',
                'user' => $user,
                'token' => $token
            ];
        }
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
    
    private function generateUsername(string $name): string
    {
        $username = strtolower(str_replace(' ', '_', $name));
        $username = preg_replace('/[^a-z0-9_]/', '', $username);
        
        // Check if username exists, add number if needed
        $originalUsername = $username;
        $counter = 1;
        
        while ($this->userModel->findByUsername($username)) {
            $username = $originalUsername . '_' . $counter;
            $counter++;
        }
        
        return $username;
    }
}