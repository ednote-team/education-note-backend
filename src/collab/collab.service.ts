import * as http from 'http';
import { WebSocketServer } from 'ws';
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Hocuspocus } from '@hocuspocus/server';
import { jwtDecode } from 'jwt-decode';
import { NoteActivityService } from '../note-activity/note-activity.service';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface AuthContext {
  userId: string;
  userName: string;
  role: string;
}

@Injectable()
export class CollabService implements OnApplicationShutdown {
  private readonly logger = new Logger(CollabService.name);
  private server: Hocuspocus;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly noteActivityService: NoteActivityService,
  ) {}

  private buildServerConfig() {
    const ds = this.dataSource;
    const activityService = this.noteActivityService;

    return {
      async onAuthenticate({ token, documentName, connectionConfig }) {
        let resourceType: 'note' | 'plan';
        let resourceId: string;

        if (documentName.startsWith('study-plan-')) {
          resourceType = 'plan';
          resourceId = documentName.slice('study-plan-'.length);
        } else {
          resourceType = 'note';
          resourceId = documentName.replace(/^note-/, '');
        }

        if (!UUID_RE.test(resourceId)) {
          throw new Error(`Invalid document name: ${documentName}`);
        }

        let userId: string;
        let userName: string;
        try {
          if (!token || token.length < 10) {
            console.warn(`[collab] Empty/short token for ${documentName} (len=${token?.length ?? 0})`);
            throw new Error('empty token');
          }
          const payload = jwtDecode<{
            sub: string;
            email?: string;
            user_metadata?: { full_name?: string };
          }>(token);
          if (!payload?.sub) throw new Error('Missing sub');
          userId = payload.sub;
          userName =
            payload.user_metadata?.full_name ?? payload.email ?? 'Anonymous';
        } catch (e) {
          console.warn(`[collab] Token decode failed for ${documentName}:`, e instanceof Error ? e.message : e);
          throw new Error('Invalid token');
        }

        if (resourceType === 'note') {
          const ownerRows: unknown[] = await ds.query(
            `SELECT 1 FROM notes WHERE id = $1::uuid AND user_id = $2::uuid AND is_deleted = false LIMIT 1`,
            [resourceId, userId],
          );

          if (ownerRows.length > 0) {
            return { userId, userName, role: 'owner' } satisfies AuthContext;
          }

          const permRows: { role: string }[] = await ds.query(
            `SELECT role FROM note_permissions WHERE note_id = $1::uuid AND user_id = $2::uuid LIMIT 1`,
            [resourceId, userId],
          );

          if (permRows.length === 0) throw new Error('Forbidden');

          const role = permRows[0].role;
          if (role === 'view') connectionConfig.readOnly = true;
          return { userId, userName, role } satisfies AuthContext;
        }

        const planOwnerRows: unknown[] = await ds.query(
          `SELECT 1 FROM study_plans WHERE id = $1::uuid AND user_id = $2::uuid AND is_deleted = false LIMIT 1`,
          [resourceId, userId],
        );

        if (planOwnerRows.length > 0) {
          return { userId, userName, role: 'owner' } satisfies AuthContext;
        }

        const planPermRows: { role: string }[] = await ds.query(
          `SELECT role FROM note_permissions WHERE note_id = $1::uuid AND user_id = $2::uuid AND resource_type = 'plan' LIMIT 1`,
          [resourceId, userId],
        );

        if (planPermRows.length === 0) throw new Error('Forbidden');

        const planRole = planPermRows[0].role;
        if (planRole === 'view') connectionConfig.readOnly = true;
        return { userId, userName, role: planRole } satisfies AuthContext;
      },

      async onChange({ documentName, context }) {
        if (!documentName.startsWith('note-')) return;
        const noteId = documentName.slice('note-'.length);
        if (!UUID_RE.test(noteId)) return;

        const { userId, userName } = context as AuthContext;
        if (!userId) return;

        activityService
          .logActivity(noteId, userId, userName)
          .catch((err) =>
            console.error('[onChange] Failed to log activity', err),
          );
      },
    };
  }

  // Called from main.ts after app.listen() — shares the same HTTP port
  attachToHttpServer(httpServer: http.Server) {
    this.server = new Hocuspocus(this.buildServerConfig());

    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket as any, head, (ws) => {
        this.server.handleConnection(ws, request);
      });
    });

    this.logger.log(`🤝 Collab (Hocuspocus) attached to shared HTTP server`);
  }

  async onApplicationShutdown() {
    this.server?.closeConnections();
  }
}