
<?php
require_once __DIR__ . '/../core/ApiResponse.php';
require_once __DIR__ . '/../models/User.php';

$userModel = new User($DB);

switch ($_GET['action'] ?? '') {
    case 'signup':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar datos requeridos
            if (!isset($data['email']) || !isset($data['name'])) {
                ApiResponse::error('Email y nombre son requeridos', 400);
            }
            
            // Verificar si el usuario ya existe
            if ($userModel->findByEmail($data['email'])) {
                ApiResponse::error('El email ya está registrado', 409);
            }
            
            // Generar username único si no se proporciona
            if (!isset($data['username'])) {
                $data['username'] = strtolower(str_replace(' ', '_', $data['name'])) . '_' . rand(1000, 9999);
            }
            
            $id = $userModel->create($data);
            if ($id) {
                $user = $userModel->findById($id);
                $token = $userModel->createSession($id);
                
                // No retornar password
                unset($user['password']);
                
                ApiResponse::success([
                    'user' => $user,
                    'token' => $token,
                    'message' => 'Usuario registrado exitosamente'
                ]);
            } else {
                ApiResponse::error('No se pudo registrar el usuario');
            }
        }
        break;
        
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['username']) || !isset($data['password'])) {
                ApiResponse::error('Username y password son requeridos', 400);
            }
            
            $user = $userModel->findByUsername($data['username']);
            if ($user && password_verify($data['password'], $user['password'])) {
                $token = $userModel->createSession($user['id']);
                unset($user['password']);
                
                ApiResponse::success([
                    'user' => $user,
                    'token' => $token,
                    'message' => 'Login exitoso'
                ]);
            } else {
                ApiResponse::error('Credenciales inválidas', 401);
            }
        }
        break;
        
    case 'logout':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
                $userModel->deleteSession($token);
            }
            
            ApiResponse::success(['message' => 'Logout exitoso']);
        }
        break;
        
    case 'google_signup':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $authUrl = $GoogleOAuth->getAuthUrl();
            ApiResponse::success(['auth_url' => $authUrl]);
        }
        break;
        
    case 'google_callback':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $code = $_GET['code'] ?? '';
            
            if (!$code) {
                ApiResponse::error('Código de autorización no encontrado', 400);
            }
            
            $tokenData = $GoogleOAuth->getAccessToken($code);
            
            if (!isset($tokenData['access_token'])) {
                ApiResponse::error('Error al obtener token de acceso', 400);
            }
            
            $userInfo = $GoogleOAuth->getUserInfo($tokenData['access_token']);
            
            if (!$userInfo) {
                ApiResponse::error('Error al obtener información del usuario', 400);
            }
            
            // Verificar si el usuario ya existe
            $existingUser = $userModel->findByGoogleId($userInfo['id']);
            
            if ($existingUser) {
                // Usuario existente, hacer login
                $token = $userModel->createSession($existingUser['id']);
                unset($existingUser['password']);
                
                ApiResponse::success([
                    'user' => $existingUser,
                    'token' => $token,
                    'message' => 'Login con Google exitoso'
                ]);
            } else {
                // Nuevo usuario, registrar
                $userData = [
                    'name' => $userInfo['name'],
                    'email' => $userInfo['email'],
                    'username' => strtolower(str_replace(' ', '_', $userInfo['name'])) . '_' . rand(1000, 9999),
                    'google_id' => $userInfo['id'],
                    'avatar' => $userInfo['picture'] ?? null,
                    'is_verified' => true
                ];
                
                $userId = $userModel->create($userData);
                
                if ($userId) {
                    $user = $userModel->findById($userId);
                    $token = $userModel->createSession($userId);
                    unset($user['password']);
                    
                    ApiResponse::success([
                        'user' => $user,
                        'token' => $token,
                        'message' => 'Registro con Google exitoso'
                    ]);
                } else {
                    ApiResponse::error('Error al crear usuario con Google');
                }
            }
        }
        break;
        
    case 'profile':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            
            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                ApiResponse::error('Token de autorización requerido', 401);
            }
            
            $token = $matches[1];
            $user = $userModel->validateSession($token);
            
            if (!$user) {
                ApiResponse::error('Token inválido o expirado', 401);
            }
            
            unset($user['password']);
            ApiResponse::success(['user' => $user]);
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            
            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                ApiResponse::error('Token de autorización requerido', 401);
            }
            
            $token = $matches[1];
            $user = $userModel->validateSession($token);
            
            if (!$user) {
                ApiResponse::error('Token inválido o expirado', 401);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if ($userModel->updateProfile($user['id'], $data)) {
                $updatedUser = $userModel->findById($user['id']);
                unset($updatedUser['password']);
                ApiResponse::success([
                    'user' => $updatedUser,
                    'message' => 'Perfil actualizado exitosamente'
                ]);
            } else {
                ApiResponse::error('Error al actualizar perfil');
            }
        }
        break;
        
    default:
        ApiResponse::error('Acción no válida', 400);
}
?>
