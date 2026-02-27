import { Controller } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import axios from 'axios';
import { DatabaseService } from '../database/database.service';

type DebugSampleDataPayload = {
  limit?: string;
};

@Controller()
export class DebugController {
  constructor(
    @InjectConnection() private conn: Connection,
    private config: ConfigService,
    private db: DatabaseService,
  ) {}

  @MessagePattern('ats.debug.db')
  async dbInfo() {
    const db = this.conn.db;
    if (!db) {
      return { error: 'Database not connected', message: 'MongoDB connection is not established' };
    }
    try {
      const adminDb = db.admin();
      const [serverStatus, dbStats] = await Promise.all([adminDb.serverStatus(), db.stats()]);
      const collections = await db.listCollections().toArray();
      const names = collections.map((c: any) => c.name);
      const counts: Record<string, number> = {};
      for (const name of names) {
        try {
          counts[name] = await db.collection(name).countDocuments();
        } catch {
          counts[name] = -1;
        }
      }
      return {
        success: true,
        database: {
          name: db.databaseName,
          status: this.conn.readyState === 1 ? 'connected' : 'disconnected',
          readyState: this.conn.readyState,
          host: this.conn.host,
          port: this.conn.port,
        },
        collections: { names, counts, total: names.length },
        stats: {
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize,
          collections: dbStats.collections,
        },
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return { error: 'Failed to retrieve database info', message: err?.message || 'Unknown error' };
    }
  }

  @MessagePattern('ats.debug.sampleData')
  async sampleData(@Payload() payload: DebugSampleDataPayload) {
    const n = parseInt(payload?.limit || '5', 10);
    return this.db.getSampleData(n);
  }

  @MessagePattern('ats.debug.aiConnection')
  async aiConnection() {
    const url = this.config.get<string>('AI_SERVICE_URL');
    const enabled = this.config.get<string>('AI_SERVICE_ENABLED') === 'true';
    if (!url || !enabled) {
      return {
        success: false,
        message: 'AI service is disabled or not configured',
        ai_service: { enabled: !!enabled, url: url || 'not configured', healthy: false, error: 'AI service is disabled or not configured' },
      };
    }
    let healthy = false;
    let pingTime = 0;
    let errorMsg: string | null = null;
    let info: Record<string, unknown> | null = null;
    const testResults: Record<string, unknown> = {};
    try {
      const start = Date.now();
      const healthRes = await axios.get(`${url}/health`, { timeout: 10000 });
      pingTime = Date.now() - start;
      if (healthRes.status === 200 && healthRes.data) {
        healthy = healthRes.data.status === 'healthy' || healthRes.data.status === 'degraded';
        info = healthRes.data;
        testResults.health_check = { success: true, response_time_ms: pingTime, data: healthRes.data };
      }
    } catch (err: any) {
      errorMsg = err?.message || 'Connection failed';
      if (err?.code === 'ECONNREFUSED') errorMsg = 'Connection refused - AI service may be down';
      if (err?.code === 'ETIMEDOUT') errorMsg = 'Connection timeout';
      testResults.health_check = { success: false, error: errorMsg, code: err?.code };
    }
    return {
      success: healthy,
      message: healthy ? 'AI service connection is working' : 'AI service connection failed',
      ai_service: { enabled: true, url, healthy, ping_time_ms: pingTime, error: errorMsg, info: info || undefined },
      test_results: testResults,
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller()
export class HealthTestController {
  constructor(
    @InjectConnection() private conn: Connection,
    private config: ConfigService,
  ) { }

  @MessagePattern('ats.health.test')
  async healthTest() {
    const db = this.conn.db;
    let dbHealthy = false;
    let dbPingTime = 0;
    if (db) {
      try {
        const start = Date.now();
        await db.admin().ping();
        dbPingTime = Date.now() - start;
        dbHealthy = true;
      } catch {
        dbHealthy = false;
      }
    }
    const aiUrl = this.config.get<string>('AI_SERVICE_URL');
    const aiEnabled = this.config.get<string>('AI_SERVICE_ENABLED') === 'true';
    let aiHealthy = false;
    let aiPingTime = 0;
    let aiError: string | null = null;
    let aiInfo: Record<string, unknown> | null = null;
    if (aiUrl && aiEnabled) {
      try {
        const start = Date.now();
        const res = await axios.get(`${aiUrl}/health`, { timeout: 5000 });
        aiPingTime = Date.now() - start;
        if (res.status === 200 && res.data) {
          aiHealthy = res.data.status === 'healthy' || res.data.status === 'degraded';
          aiInfo = res.data;
        }
      } catch (err: any) {
        aiError = err?.message || 'Connection failed';
        if (err?.code === 'ECONNREFUSED') aiError = 'Connection refused';
        if (err?.code === 'ETIMEDOUT') aiError = 'Connection timeout';
      }
    } else {
      aiError = 'AI service is disabled or not configured';
    }
    const overall = dbHealthy && (aiHealthy || !aiEnabled) ? 'healthy' : 'degraded';
    return {
      status: overall,
      message: 'ATS System is operational',
      version: '2.0.0',
      checks: {
        server: 'operational',
        database: {
          connected: this.conn.readyState === 1,
          healthy: dbHealthy,
          ping_time_ms: dbPingTime,
          state: this.conn.readyState === 1 ? 'connected' : 'disconnected',
        },
        ai_service: {
          enabled: aiEnabled,
          url: aiUrl || 'not configured',
          healthy: aiHealthy,
          ping_time_ms: aiPingTime,
          error: aiError,
          info: aiInfo,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
