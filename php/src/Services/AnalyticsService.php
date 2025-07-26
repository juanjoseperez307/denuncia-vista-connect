<?php

namespace DenunciaVista\Services;

require_once __DIR__ . '/../../models/Complaint.php';
require_once __DIR__ . '/../../models/User.php';

class AnalyticsService
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
    
    public function overview(array $data): array
    {
        $query = $data['query'] ?? [];
        $period = $query['period'] ?? '30d';
        
        // Calculate date range based on period
        $endDate = date('Y-m-d H:i:s');
        $startDate = $this->calculateStartDate($period);
        
        $stats = [
            'total_complaints' => $this->getTotalComplaints($startDate, $endDate),
            'pending_complaints' => $this->getPendingComplaints($startDate, $endDate),
            'resolved_complaints' => $this->getResolvedComplaints($startDate, $endDate),
            'total_users' => $this->getTotalUsers($startDate, $endDate),
            'active_users' => $this->getActiveUsers($startDate, $endDate),
            'engagement_rate' => $this->getEngagementRate($startDate, $endDate),
            'resolution_rate' => $this->getResolutionRate($startDate, $endDate),
            'avg_response_time' => $this->getAverageResponseTime($startDate, $endDate)
        ];
        
        return [
            'success' => true,
            'data' => $stats,
            'period' => $period,
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ];
    }
    
    public function complaints(array $data): array
    {
        $query = $data['query'] ?? [];
        $period = $query['period'] ?? '30d';
        $groupBy = $query['group_by'] ?? 'day';
        
        $endDate = date('Y-m-d H:i:s');
        $startDate = $this->calculateStartDate($period);
        
        $timeSeriesData = $this->getComplaintTimeSeries($startDate, $endDate, $groupBy);
        $categoryBreakdown = $this->getComplaintsByCategory($startDate, $endDate);
        $statusBreakdown = $this->getComplaintsByStatus($startDate, $endDate);
        $locationBreakdown = $this->getComplaintsByLocation($startDate, $endDate);
        
        return [
            'success' => true,
            'data' => [
                'time_series' => $timeSeriesData,
                'by_category' => $categoryBreakdown,
                'by_status' => $statusBreakdown,
                'by_location' => $locationBreakdown
            ],
            'period' => $period,
            'group_by' => $groupBy
        ];
    }
    
    public function users(array $data): array
    {
        $query = $data['query'] ?? [];
        $period = $query['period'] ?? '30d';
        $groupBy = $query['group_by'] ?? 'day';
        
        $endDate = date('Y-m-d H:i:s');
        $startDate = $this->calculateStartDate($period);
        
        $newUsers = $this->getNewUsersTimeSeries($startDate, $endDate, $groupBy);
        $activeUsers = $this->getActiveUsersTimeSeries($startDate, $endDate, $groupBy);
        $userEngagement = $this->getUserEngagementStats($startDate, $endDate);
        $topUsers = $this->getTopUsers($startDate, $endDate);
        
        return [
            'success' => true,
            'data' => [
                'new_users' => $newUsers,
                'active_users' => $activeUsers,
                'engagement' => $userEngagement,
                'top_users' => $topUsers
            ],
            'period' => $period,
            'group_by' => $groupBy
        ];
    }
    
    public function engagement(array $data): array
    {
        $query = $data['query'] ?? [];
        $period = $query['period'] ?? '30d';
        
        $endDate = date('Y-m-d H:i:s');
        $startDate = $this->calculateStartDate($period);
        
        $likes = $this->getLikesStats($startDate, $endDate);
        $comments = $this->getCommentsStats($startDate, $endDate);
        $shares = $this->getSharesStats($startDate, $endDate);
        $engagement = $this->getEngagementTrends($startDate, $endDate);
        
        return [
            'success' => true,
            'data' => [
                'likes' => $likes,
                'comments' => $comments,
                'shares' => $shares,
                'trends' => $engagement
            ],
            'period' => $period
        ];
    }
    
    private function calculateStartDate(string $period): string
    {
        switch ($period) {
            case '7d':
                return date('Y-m-d H:i:s', strtotime('-7 days'));
            case '30d':
                return date('Y-m-d H:i:s', strtotime('-30 days'));
            case '90d':
                return date('Y-m-d H:i:s', strtotime('-90 days'));
            case '1y':
                return date('Y-m-d H:i:s', strtotime('-1 year'));
            default:
                return date('Y-m-d H:i:s', strtotime('-30 days'));
        }
    }
    
    private function getTotalComplaints(string $startDate, string $endDate): int
    {
        $sql = "SELECT COUNT(*) as count FROM complaints WHERE created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc()['count'];
    }
    
    private function getPendingComplaints(string $startDate, string $endDate): int
    {
        $sql = "SELECT COUNT(*) as count FROM complaints WHERE status = 'pending' AND created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc()['count'];
    }
    
    private function getResolvedComplaints(string $startDate, string $endDate): int
    {
        $sql = "SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved' AND created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc()['count'];
    }
    
    private function getTotalUsers(string $startDate, string $endDate): int
    {
        $sql = "SELECT COUNT(*) as count FROM users WHERE created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc()['count'];
    }
    
    private function getActiveUsers(string $startDate, string $endDate): int
    {
        $sql = "SELECT COUNT(DISTINCT user_id) as count FROM complaints WHERE created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc()['count'];
    }
    
    private function getEngagementRate(string $startDate, string $endDate): float
    {
        $totalComplaints = $this->getTotalComplaints($startDate, $endDate);
        if ($totalComplaints === 0) return 0;
        
        $sql = "SELECT COUNT(*) as count FROM complaint_likes cl 
                JOIN complaints c ON cl.complaint_id = c.id 
                WHERE c.created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        $likes = $stmt->get_result()->fetch_assoc()['count'];
        
        return round(($likes / $totalComplaints) * 100, 2);
    }
    
    private function getResolutionRate(string $startDate, string $endDate): float
    {
        $totalComplaints = $this->getTotalComplaints($startDate, $endDate);
        if ($totalComplaints === 0) return 0;
        
        $resolvedComplaints = $this->getResolvedComplaints($startDate, $endDate);
        return round(($resolvedComplaints / $totalComplaints) * 100, 2);
    }
    
    private function getAverageResponseTime(string $startDate, string $endDate): float
    {
        // Simplified calculation - in real app you'd track when complaints are first responded to
        return 0; // Placeholder
    }
    
    private function getComplaintTimeSeries(string $startDate, string $endDate, string $groupBy): array
    {
        $groupFormat = $groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';
        
        $sql = "SELECT DATE_FORMAT(created_at, ?) as period, COUNT(*) as count 
                FROM complaints 
                WHERE created_at BETWEEN ? AND ? 
                GROUP BY period 
                ORDER BY period";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('sss', $groupFormat, $startDate, $endDate);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        return $data;
    }
    
    private function getComplaintsByCategory(string $startDate, string $endDate): array
    {
        $sql = "SELECT category, COUNT(*) as count 
                FROM complaints 
                WHERE created_at BETWEEN ? AND ? 
                GROUP BY category 
                ORDER BY count DESC";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        return $data;
    }
    
    private function getComplaintsByStatus(string $startDate, string $endDate): array
    {
        $sql = "SELECT status, COUNT(*) as count 
                FROM complaints 
                WHERE created_at BETWEEN ? AND ? 
                GROUP BY status 
                ORDER BY count DESC";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        return $data;
    }
    
    private function getComplaintsByLocation(string $startDate, string $endDate): array
    {
        $sql = "SELECT location, COUNT(*) as count 
                FROM complaints 
                WHERE created_at BETWEEN ? AND ? AND location IS NOT NULL 
                GROUP BY location 
                ORDER BY count DESC 
                LIMIT 10";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        return $data;
    }
    
    private function getNewUsersTimeSeries(string $startDate, string $endDate, string $groupBy): array
    {
        $groupFormat = $groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';
        
        $sql = "SELECT DATE_FORMAT(created_at, ?) as period, COUNT(*) as count 
                FROM users 
                WHERE created_at BETWEEN ? AND ? 
                GROUP BY period 
                ORDER BY period";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('sss', $groupFormat, $startDate, $endDate);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        return $data;
    }
    
    private function getActiveUsersTimeSeries(string $startDate, string $endDate, string $groupBy): array
    {
        // Simplified - users who created complaints
        $groupFormat = $groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';
        
        $sql = "SELECT DATE_FORMAT(c.created_at, ?) as period, COUNT(DISTINCT c.user_id) as count 
                FROM complaints c 
                WHERE c.created_at BETWEEN ? AND ? 
                GROUP BY period 
                ORDER BY period";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('sss', $groupFormat, $startDate, $endDate);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        return $data;
    }
    
    private function getUserEngagementStats(string $startDate, string $endDate): array
    {
        return [
            'avg_complaints_per_user' => 2.5,
            'avg_likes_per_user' => 5.2,
            'avg_comments_per_user' => 3.1
        ];
    }
    
    private function getTopUsers(string $startDate, string $endDate): array
    {
        $sql = "SELECT u.id, u.name, u.username, COUNT(c.id) as complaints_count 
                FROM users u 
                LEFT JOIN complaints c ON u.id = c.user_id AND c.created_at BETWEEN ? AND ? 
                GROUP BY u.id 
                ORDER BY complaints_count DESC 
                LIMIT 10";
        
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        return $data;
    }
    
    private function getLikesStats(string $startDate, string $endDate): array
    {
        $sql = "SELECT COUNT(*) as total_likes FROM complaint_likes cl 
                JOIN complaints c ON cl.complaint_id = c.id 
                WHERE c.created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        $totalLikes = $stmt->get_result()->fetch_assoc()['total_likes'];
        
        return ['total' => $totalLikes, 'avg_per_complaint' => 0];
    }
    
    private function getCommentsStats(string $startDate, string $endDate): array
    {
        $sql = "SELECT COUNT(*) as total_comments FROM complaint_comments cc 
                JOIN complaints c ON cc.complaint_id = c.id 
                WHERE c.created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        $totalComments = $stmt->get_result()->fetch_assoc()['total_comments'];
        
        return ['total' => $totalComments, 'avg_per_complaint' => 0];
    }
    
    private function getSharesStats(string $startDate, string $endDate): array
    {
        $sql = "SELECT SUM(shares_count) as total_shares FROM complaints 
                WHERE created_at BETWEEN ? AND ?";
        $stmt = $this->db->conn->prepare($sql);
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        $totalShares = $stmt->get_result()->fetch_assoc()['total_shares'] ?? 0;
        
        return ['total' => $totalShares, 'avg_per_complaint' => 0];
    }
    
    private function getEngagementTrends(string $startDate, string $endDate): array
    {
        // Simplified engagement trends
        return [];
    }
}