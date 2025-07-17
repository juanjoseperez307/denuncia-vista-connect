// Database service using SQL.js for browser-based relational database
import initSqlJs from 'sql.js';

export class DatabaseService {
  private db: any = null;
  private SQL: any = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('transparencia_db');
    if (savedDb) {
      // Convert base64 to Uint8Array using browser APIs
      const binaryString = atob(savedDb);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      this.db = new this.SQL.Database(uint8Array);
    } else {
      // Create new database
      this.db = new this.SQL.Database();
      await this.createTables();
    }
  }

  private async createTables(): Promise<void> {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        location TEXT,
        bio TEXT,
        avatar TEXT,
        transparency_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        complaints_submitted INTEGER DEFAULT 0,
        comments_given INTEGER DEFAULT 0,
        helpful_votes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Complaints table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        avatar TEXT,
        time TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        content TEXT NOT NULL,
        entities TEXT, -- JSON string
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        trending BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        files TEXT, -- JSON string
        status TEXT DEFAULT 'pending',
        status_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status_updated_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Comments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        complaint_id TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        time TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id)
      );
    `);

    // Notifications table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        time TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Badges table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        rarity TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User badges table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_badges (
        user_id TEXT NOT NULL,
        badge_id TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, badge_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id)
      );
    `);

    // Achievements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        target INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User achievements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME,
        PRIMARY KEY (user_id, achievement_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (achievement_id) REFERENCES achievements(id)
      );
    `);

    // Initialize default data
    await this.initializeDefaultData();
  }

  private async initializeDefaultData(): Promise<void> {
    // Default user
    this.db.exec(`
      INSERT OR REPLACE INTO users (id, name, email, phone, location, bio, avatar, transparency_points, level, complaints_submitted, comments_given, helpful_votes)
      VALUES ('1', 'Juan Pérez', 'juan.perez@email.com', '+54 11 1234-5678', 'Buenos Aires, Argentina', 'Ciudadano comprometido con la transparencia y la participación cívica', '👨‍💼', 1247, 5, 12, 45, 89);
    `);

    // Default categories
    const categories = [
      { id: 'transporte', label: 'Transporte', icon: '🚌', color: 'blue' },
      { id: 'salud', label: 'Salud', icon: '🏥', color: 'red' },
      { id: 'educacion', label: 'Educación', icon: '🎓', color: 'green' },
      { id: 'seguridad', label: 'Seguridad', icon: '🛡️', color: 'yellow' },
      { id: 'ambiente', label: 'Ambiente', icon: '🌱', color: 'emerald' },
      { id: 'infraestructura', label: 'Infraestructura', icon: '🏗️', color: 'gray' }
    ];

    categories.forEach(cat => {
      this.db.exec(`
        INSERT OR REPLACE INTO categories (id, label, icon, color)
        VALUES ('${cat.id}', '${cat.label}', '${cat.icon}', '${cat.color}');
      `);
    });

    // Default complaints
    const complaints = [
      {
        id: '1',
        author: 'María García',
        avatar: '👩‍💼',
        time: 'hace 2 horas',
        category: 'Transporte',
        location: 'Buenos Aires, CABA',
        content: 'El colectivo 152 no pasa desde hace 3 horas en la parada de Av. Corrientes y Callao. Los usuarios estamos esperando sin información oficial.',
        entities: JSON.stringify([
          { type: 'transport_line', value: '152', icon: '🚌' },
          { type: 'location', value: 'Av. Corrientes y Callao', icon: '📍' }
        ]),
        likes: 23,
        comments: 8,
        shares: 5,
        trending: true,
        verified: false
      },
      {
        id: '2',
        author: 'Carlos Mendoza',
        avatar: '👨‍🔧',
        time: 'hace 4 horas',
        category: 'Salud',
        location: 'Córdoba Capital',
        content: 'Hospital público sin medicamentos básicos. Pacientes diabéticos sin insulina desde hace una semana.',
        entities: JSON.stringify([
          { type: 'health_institution', value: 'Hospital público', icon: '🏥' },
          { type: 'medicine', value: 'insulina', icon: '💊' }
        ]),
        likes: 45,
        comments: 12,
        shares: 18,
        trending: true,
        verified: true
      }
    ];

    complaints.forEach(complaint => {
      this.db.exec(`
        INSERT OR REPLACE INTO complaints (id, author, avatar, time, category, location, content, entities, likes, comments, shares, trending, verified)
        VALUES ('${complaint.id}', '${complaint.author}', '${complaint.avatar}', '${complaint.time}', '${complaint.category}', '${complaint.location}', '${complaint.content.replace(/'/g, "''")}', '${complaint.entities}', ${complaint.likes}, ${complaint.comments}, ${complaint.shares}, ${complaint.trending}, ${complaint.verified});
      `);
    });

    // Default notifications
    const notifications = [
      {
        id: '1',
        title: 'Nuevo comentario',
        message: 'Alguien comentó en tu reclamo sobre transporte',
        time: 'hace 1 hora',
        read: false,
        type: 'info'
      },
      {
        id: '2',
        title: 'Reclamo actualizado',
        message: 'Tu reclamo sobre salud ha sido actualizado por las autoridades',
        time: 'hace 3 horas',
        read: false,
        type: 'success'
      }
    ];

    notifications.forEach(notif => {
      this.db.exec(`
        INSERT OR REPLACE INTO notifications (id, title, message, time, read, type)
        VALUES ('${notif.id}', '${notif.title}', '${notif.message}', '${notif.time}', ${notif.read}, '${notif.type}');
      `);
    });
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    await this.initialize();
    const stmt = this.db.prepare(sql);
    const results = [];
    
    if (params.length > 0) {
      stmt.bind(params);
    }
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();
    return results;
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.initialize();
    
    if (params.length > 0) {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
    } else {
      this.db.exec(sql);
    }
    
    this.save();
  }

  private save(): void {
    const data = this.db.export();
    // Convert Uint8Array to base64 using browser APIs
    let binaryString = '';
    for (let i = 0; i < data.length; i++) {
      binaryString += String.fromCharCode(data[i]);
    }
    const base64String = btoa(binaryString);
    localStorage.setItem('transparencia_db', base64String);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();