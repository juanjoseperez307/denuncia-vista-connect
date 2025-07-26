
<?php
require_once __DIR__ . '/../core/ApiResponse.php';
require_once __DIR__ . '/../models/Complaint.php';
require_once __DIR__ . '/../models/User.php';

$complaintModel = new Complaint($DB);
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

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'categories':
                    ApiResponse::success($complaintModel->getCategories());
                    break;
                    
                case 'trending':
                    $trending = $complaintModel->all(['trending' => true, 'limit' => 10]);
                    ApiResponse::success($trending);
                    break;
                    
                case 'search':
                    $query = $_GET['q'] ?? '';
                    $filters = [
                        'category' => $_GET['category'] ?? '',
                        'location' => $_GET['location'] ?? '',
                        'timeRange' => $_GET['timeRange'] ?? ''
                    ];
                    $results = $complaintModel->search($query, array_filter($filters));
                    ApiResponse::success($results);
                    break;
                    
                case 'comments':
                    $id = $_GET['id'] ?? 0;
                    if (!$id) {
                        ApiResponse::error('ID de denuncia requerido', 400);
                    }
                    $comments = $complaintModel->getComments($id);
                    ApiResponse::success($comments);
                    break;
                    
                case 'detail':
                    $id = $_GET['id'] ?? 0;
                    if (!$id) {
                        ApiResponse::error('ID de denuncia requerido', 400);
                    }
                    $complaint = $complaintModel->findById($id);
                    if (!$complaint) {
                        ApiResponse::error('Denuncia no encontrada', 404);
                    }
                    ApiResponse::success($complaint);
                    break;
                    
                default:
                    ApiResponse::error('Acción no válida', 400);
            }
        } else {
            // Listar denuncias con filtros
            $filters = [
                'category' => $_GET['category'] ?? '',
                'location' => $_GET['location'] ?? '',
                'trending' => $_GET['trending'] ?? '',
                'timeRange' => $_GET['timeRange'] ?? '',
                'limit' => $_GET['limit'] ?? 10,
                'offset' => $_GET['offset'] ?? 0
            ];
            
            $complaints = $complaintModel->all(array_filter($filters));
            ApiResponse::success($complaints);
        }
        break;
        
    case 'POST':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'like':
                    $user = validateToken($userModel);
                    if (!$user) {
                        ApiResponse::error('Token de autorización requerido', 401);
                    }
                    
                    $data = json_decode(file_get_contents('php://input'), true);
                    $complaintId = $data['complaint_id'] ?? 0;
                    
                    if (!$complaintId) {
                        ApiResponse::error('ID de denuncia requerido', 400);
                    }
                    
                    $result = $complaintModel->toggleLike($complaintId, $user['id']);
                    ApiResponse::success($result);
                    break;
                    
                case 'comment':
                    $user = validateToken($userModel);
                    if (!$user) {
                        ApiResponse::error('Token de autorización requerido', 401);
                    }
                    
                    $data = json_decode(file_get_contents('php://input'), true);
                    $complaintId = $data['complaint_id'] ?? 0;
                    $content = $data['content'] ?? '';
                    $parentId = $data['parent_id'] ?? null;
                    
                    if (!$complaintId || !$content) {
                        ApiResponse::error('ID de denuncia y contenido son requeridos', 400);
                    }
                    
                    $commentId = $complaintModel->addComment($complaintId, $user['id'], $content, $parentId);
                    if ($commentId) {
                        ApiResponse::success(['comment_id' => $commentId]);
                    } else {
                        ApiResponse::error('Error al agregar comentario');
                    }
                    break;
                    
                case 'share':
                    $data = json_decode(file_get_contents('php://input'), true);
                    $complaintId = $data['complaint_id'] ?? 0;
                    
                    if (!$complaintId) {
                        ApiResponse::error('ID de denuncia requerido', 400);
                    }
                    
                    // Incrementar contador de shares
                    $sql = "UPDATE complaints SET shares_count = shares_count + 1 WHERE id = ?";
                    $stmt = $DB->conn->prepare($sql);
                    $stmt->bind_param('i', $complaintId);
                    $stmt->execute();
                    
                    $shareUrl = "http://" . $_SERVER['HTTP_HOST'] . "/complaint/" . $complaintId;
                    ApiResponse::success(['shareUrl' => $shareUrl]);
                    break;
                    
                case 'detect-entities':
                    $data = json_decode(file_get_contents('php://input'), true);
                    $text = $data['text'] ?? '';
                    
                    if (!$text) {
                        ApiResponse::error('Texto requerido', 400);
                    }
                    
                    // Usar el método privado a través de reflection (para demo)
                    $reflection = new ReflectionClass($complaintModel);
                    $method = $reflection->getMethod('detectEntities');
                    $method->setAccessible(true);
                    $entities = $method->invoke($complaintModel, $text);
                    
                    ApiResponse::success($entities);
                    break;
                    
                case 'upload':
                    $user = validateToken($userModel);
                    if (!$user) {
                        ApiResponse::error('Token de autorización requerido', 401);
                    }
                    
                    if (!isset($_FILES['file'])) {
                        ApiResponse::error('Archivo requerido', 400);
                    }
                    
                    $file = $_FILES['file'];
                    $uploadDir = __DIR__ . '/../uploads/';
                    
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }
                    
                    $filename = time() . '_' . $file['name'];
                    $filepath = $uploadDir . $filename;
                    
                    if (move_uploaded_file($file['tmp_name'], $filepath)) {
                        $url = '/uploads/' . $filename;
                        ApiResponse::success([
                            'url' => $url,
                            'filename' => $filename,
                            'size' => $file['size']
                        ]);
                    } else {
                        ApiResponse::error('Error al subir archivo');
                    }
                    break;
                    
                default:
                    ApiResponse::error('Acción no válida', 400);
            }
        } else {
            // Crear nueva denuncia
            $user = validateToken($userModel);
            if (!$user) {
                ApiResponse::error('Token de autorización requerido', 401);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            $data['user_id'] = $user['id'];
            
            if (!isset($data['content']) || !isset($data['category'])) {
                ApiResponse::error('Contenido y categoría son requeridos', 400);
            }
            
            $id = $complaintModel->create($data);
            if ($id) {
                $complaint = $complaintModel->findById($id);
                ApiResponse::success($complaint);
            } else {
                ApiResponse::error('No se pudo crear la denuncia');
            }
        }
        break;
        
    case 'PUT':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $complaintId = $data['id'] ?? 0;
        $status = $data['status'] ?? '';
        
        if (!$complaintId || !$status) {
            ApiResponse::error('ID y estado son requeridos', 400);
        }
        
        $ok = $complaintModel->updateStatus($complaintId, $status);
        if ($ok) {
            ApiResponse::success(['updated' => true]);
        } else {
            ApiResponse::error('No se pudo actualizar el estado');
        }
        break;
        
    case 'DELETE':
        $user = validateToken($userModel);
        if (!$user) {
            ApiResponse::error('Token de autorización requerido', 401);
        }
        
        $complaintId = $_GET['id'] ?? 0;
        if (!$complaintId) {
            ApiResponse::error('ID de denuncia requerido', 400);
        }
        
        // Verificar que el usuario sea el propietario
        $complaint = $complaintModel->findById($complaintId);
        if (!$complaint || $complaint['user_id'] != $user['id']) {
            ApiResponse::error('No autorizado para eliminar esta denuncia', 403);
        }
        
        $sql = "DELETE FROM complaints WHERE id = ?";
        $stmt = $DB->conn->prepare($sql);
        $stmt->bind_param('i', $complaintId);
        
        if ($stmt->execute()) {
            ApiResponse::success(['deleted' => true]);
        } else {
            ApiResponse::error('Error al eliminar denuncia');
        }
        break;
        
    default:
        ApiResponse::error('Método no permitido', 405);
}
?>
