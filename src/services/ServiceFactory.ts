
// Service factory to choose between real and mock implementations
import { IComplaintsService } from './interfaces/IComplaintsService';
import { IAnalyticsService } from './interfaces/IAnalyticsService';
import { IGamificationService } from './interfaces/IGamificationService';
import { INotificationService } from './interfaces/INotificationService';
import { IAuthService } from './interfaces/IAuthService';

// Real implementations
import { RealComplaintsService } from './real/RealComplaintsService';
import { RealAnalyticsService } from './real/RealAnalyticsService';
import { RealGamificationService } from './real/RealGamificationService';
import { RealNotificationService } from './real/RealNotificationService';
import { RealAuthService } from './real/RealAuthService';

// Mock implementations
import { MockComplaintsService } from './mock/MockComplaintsService';
import { MockAnalyticsService } from './mock/MockAnalyticsService';
import { MockGamificationService } from './mock/MockGamificationService';
import { MockNotificationService } from './mock/MockNotificationService';
import { MockAuthService } from './mock/MockAuthService';

// Configuration to determine which implementation to use
const USE_MOCK_SERVICES = process.env.NODE_ENV === 'development' || !process.env.VITE_API_URL;

class ServiceFactory {
  private complaintsService: IComplaintsService;
  private analyticsService: IAnalyticsService;
  private gamificationService: IGamificationService;
  private notificationService: INotificationService;
  private authService: IAuthService;

  constructor() {
    if (USE_MOCK_SERVICES) {
      this.complaintsService = new MockComplaintsService();
      this.analyticsService = new MockAnalyticsService();
      this.gamificationService = new MockGamificationService();
      this.notificationService = new MockNotificationService();
      this.authService = new MockAuthService();
    } else {
      this.complaintsService = new RealComplaintsService();
      this.analyticsService = new RealAnalyticsService();
      this.gamificationService = new RealGamificationService();
      this.notificationService = new RealNotificationService();
      this.authService = new RealAuthService();
    }
  }

  getComplaintsService(): IComplaintsService {
    return this.complaintsService;
  }

  getAnalyticsService(): IAnalyticsService {
    return this.analyticsService;
  }

  getGamificationService(): IGamificationService {
    return this.gamificationService;
  }

  getNotificationService(): INotificationService {
    return this.notificationService;
  }

  getAuthService(): IAuthService {
    return this.authService;
  }

  // Method to switch between implementations at runtime (for testing)
  switchToMock(): void {
    this.complaintsService = new MockComplaintsService();
    this.analyticsService = new MockAnalyticsService();
    this.gamificationService = new MockGamificationService();
    this.notificationService = new MockNotificationService();
    this.authService = new MockAuthService();
  }

  switchToReal(): void {
    this.complaintsService = new RealComplaintsService();
    this.analyticsService = new RealAnalyticsService();
    this.gamificationService = new RealGamificationService();
    this.notificationService = new RealNotificationService();
    this.authService = new RealAuthService();
  }

  isMockMode(): boolean {
    return USE_MOCK_SERVICES;
  }
}

export const serviceFactory = new ServiceFactory();
