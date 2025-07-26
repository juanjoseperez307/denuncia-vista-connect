<?php

namespace DenunciaVista\Services;

require_once __DIR__ . '/../../models/Complaint.php';
require_once __DIR__ . '/../../models/User.php';

class ComplaintsService
{
    private $db;
    private $complaintModel;
    private $userModel;
    
    public function __construct($database)
    {
        $this->db = $database;
        $this->complaintModel = new \Complaint($database);
        $this->userModel = new \User($database);
    }
    
    public function list(array $data): array
    {
        $query = $data['query'] ?? [];
        $page = (int)($query['page'] ?? 1);
        $limit = (int)($query['limit'] ?? 10);
        $category = $query['category'] ?? null;
        $status = $query['status'] ?? null;
        $search = $query['search'] ?? null;
        
        $offset = ($page - 1) * $limit;
        
        $complaints = $this->complaintModel->getAll($limit, $offset, $category, $status, $search);
        $total = $this->complaintModel->getTotalCount($category, $status, $search);
        
        return [
            'success' => true,
            'data' => $complaints,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }
    
    public function get(array $data): array
    {
        $id = $data['params']['id'] ?? null;
        
        if (!$id) {
            throw new \Exception('ID de denuncia requerido');
        }
        
        $complaint = $this->complaintModel->findById($id);
        
        if (!$complaint) {
            throw new \Exception('Denuncia no encontrada');
        }
        
        return [
            'success' => true,
            'data' => $complaint
        ];
    }
    
    public function create(array $data): array
    {
        $user = $this->authenticateUser($data);
        $body = $data['body'] ?? [];
        
        if (empty($body['category']) || empty($body['content'])) {
            throw new \Exception('Categoría y contenido son requeridos');
        }
        
        $body['user_id'] = $user['id'];
        $complaintId = $this->complaintModel->create($body);
        
        if (!$complaintId) {
            throw new \Exception('Error al crear denuncia');
        }
        
        $complaint = $this->complaintModel->findById($complaintId);
        
        return [
            'success' => true,
            'message' => 'Denuncia creada exitosamente',
            'data' => $complaint
        ];
    }
    
    public function update(array $data): array
    {
        $user = $this->authenticateUser($data);
        $id = $data['params']['id'] ?? null;
        $body = $data['body'] ?? [];
        
        if (!$id) {
            throw new \Exception('ID de denuncia requerido');
        }
        
        $complaint = $this->complaintModel->findById($id);
        
        if (!$complaint) {
            throw new \Exception('Denuncia no encontrada');
        }
        
        // Check if user owns the complaint or is admin
        if ($complaint['user_id'] != $user['id'] && $user['username'] !== 'admin') {
            throw new \Exception('No tienes permisos para editar esta denuncia');
        }
        
        $this->complaintModel->update($id, $body);
        $updatedComplaint = $this->complaintModel->findById($id);
        
        return [
            'success' => true,
            'message' => 'Denuncia actualizada exitosamente',
            'data' => $updatedComplaint
        ];
    }
    
    public function delete(array $data): array
    {
        $user = $this->authenticateUser($data);
        $id = $data['params']['id'] ?? null;
        
        if (!$id) {
            throw new \Exception('ID de denuncia requerido');
        }
        
        $complaint = $this->complaintModel->findById($id);
        
        if (!$complaint) {
            throw new \Exception('Denuncia no encontrada');
        }
        
        // Check if user owns the complaint or is admin
        if ($complaint['user_id'] != $user['id'] && $user['username'] !== 'admin') {
            throw new \Exception('No tienes permisos para eliminar esta denuncia');
        }
        
        $this->complaintModel->delete($id);
        
        return [
            'success' => true,
            'message' => 'Denuncia eliminada exitosamente'
        ];
    }
    
    public function like(array $data): array
    {
        $user = $this->authenticateUser($data);
        $body = $data['body'] ?? [];
        $complaintId = $body['complaint_id'] ?? null;
        
        if (!$complaintId) {
            throw new \Exception('ID de denuncia requerido');
        }
        
        $result = $this->complaintModel->toggleLike($user['id'], $complaintId);
        
        return [
            'success' => true,
            'message' => $result['liked'] ? 'Like agregado' : 'Like removido',
            'liked' => $result['liked'],
            'likes_count' => $result['likes_count']
        ];
    }
    
    public function comment(array $data): array
    {
        $user = $this->authenticateUser($data);
        $body = $data['body'] ?? [];
        
        if (empty($body['complaint_id']) || empty($body['content'])) {
            throw new \Exception('ID de denuncia y contenido son requeridos');
        }
        
        $commentData = [
            'user_id' => $user['id'],
            'complaint_id' => $body['complaint_id'],
            'content' => $body['content'],
            'parent_id' => $body['parent_id'] ?? null
        ];
        
        $commentId = $this->complaintModel->addComment($commentData);
        
        if (!$commentId) {
            throw new \Exception('Error al crear comentario');
        }
        
        $comment = $this->complaintModel->getComment($commentId);
        
        return [
            'success' => true,
            'message' => 'Comentario agregado exitosamente',
            'data' => $comment
        ];
    }
    
    public function getComments(array $data): array
    {
        $id = $data['params']['id'] ?? null;
        $query = $data['query'] ?? [];
        $page = (int)($query['page'] ?? 1);
        $limit = (int)($query['limit'] ?? 10);
        
        if (!$id) {
            throw new \Exception('ID de denuncia requerido');
        }
        
        $offset = ($page - 1) * $limit;
        $comments = $this->complaintModel->getComments($id, $limit, $offset);
        $total = $this->complaintModel->getCommentsCount($id);
        
        return [
            'success' => true,
            'data' => $comments,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }
    
    public function search(array $data): array
    {
        $query = $data['query'] ?? [];
        $q = $query['q'] ?? '';
        $category = $query['category'] ?? null;
        $location = $query['location'] ?? null;
        $page = (int)($query['page'] ?? 1);
        $limit = (int)($query['limit'] ?? 10);
        
        if (empty($q)) {
            throw new \Exception('Término de búsqueda requerido');
        }
        
        $offset = ($page - 1) * $limit;
        $results = $this->complaintModel->search($q, $category, $location, $limit, $offset);
        $total = $this->complaintModel->getSearchCount($q, $category, $location);
        
        return [
            'success' => true,
            'data' => $results,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }
    
    public function detectEntities(array $data): array
    {
        $body = $data['body'] ?? [];
        $text = $body['text'] ?? '';
        
        if (empty($text)) {
            throw new \Exception('Texto requerido');
        }
        
        // Simple entity detection (can be improved with ML/NLP)
        $entities = $this->complaintModel->detectEntities($text);
        
        return [
            'success' => true,
            'entities' => $entities
        ];
    }
    
    public function share(array $data): array
    {
        $body = $data['body'] ?? [];
        $complaintId = $body['complaint_id'] ?? null;
        $platform = $body['platform'] ?? 'general';
        
        if (!$complaintId) {
            throw new \Exception('ID de denuncia requerido');
        }
        
        $this->complaintModel->incrementShares($complaintId);
        
        return [
            'success' => true,
            'message' => 'Denuncia compartida exitosamente'
        ];
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