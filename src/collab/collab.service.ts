import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Server } from '@hocuspocus/server';
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
export class CollabService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(CollabService.name);
  private server: Server;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly noteActivityService: NoteActivityService,
  ) {}

  async onApplicationBootstrap() {
    const port = parseInt(process.env.COLLAB_PORT ?? '1234', 10);
    const ds = this.dataSource;
    const activityService = this.noteActivityService;

    this.server = new Server({
      port,

      /* ── Auth: decode JWT + check note access ──────────────────────── */
      async onAuthenticate({ token, documentName, connectionConfig }) {
        // documentName = "note-{noteId}" (set by the frontend provider)
        const noteId = documentName.replace(/^note-/, '');

        // Reject early if noteId is not a valid UUID
        if (!UUID_RE.test(noteId)) {
          throw new Error(`Invalid document name: ${documentName}`);
        }

        // Decode JWT — no signature check, same pattern as SupabaseAuthGuard
        let userId: string;
        let userName: string;
        try {
          const payload = jwtDecode<{
            sub: string;
            email?: string;
            user_metadata?: { full_name?: string };
          }>(token);
          if (!payload?.sub) throw new Error('Missing sub');
          userId = payload.sub;
          userName =
            payload.user_metadata?.full_name ?? payload.email ?? 'Anonymous';
        } catch {
          throw new Error('Invalid token');
        }

        // 1. Note owner → full access
        const ownerRows: unknown[] = await ds.query(
          `SELECT 1
             FROM notes
            WHERE id        = $1::uuid
              AND user_id   = $2::uuid
              AND is_deleted = false
            LIMIT 1`,
          [noteId, userId],
        );

        if (ownerRows.length > 0) {
          return { userId, userName, role: 'owner' } satisfies AuthContext;
        }

        // 2. Shared collaborator
        const permRows: { role: string }[] = await ds.query(
          `SELECT role
             FROM note_permissions
            WHERE note_id = $1::uuid
              AND user_id = $2::uuid
            LIMIT 1`,
          [noteId, userId],
        );

        if (permRows.length === 0) {
          throw new Error('Forbidden');
        }

        const role = permRows[0].role;

        // View-only users may receive doc syncs but cannot push mutations
        if (role === 'view') {
          connectionConfig.readOnly = true;
        }

        return { userId, userName, role } satisfies AuthContext;
      },

      /* ── Track edits for activity history ──────────────────────────── */
      async onChange({ documentName, context }) {
        const noteId = documentName.replace(/^note-/, '');
        if (!UUID_RE.test(noteId)) return;

        const { userId, userName } = context as AuthContext;
        if (!userId) return;

        // Fire-and-forget — don't block the collab pipeline
        activityService
          .logActivity(noteId, userId, userName)
          .catch((err) =>
            console.error('[onChange] Failed to log activity', err),
          );
      },
    });

    await this.server.listen();
    this.logger.log(`🤝 Collab (Hocuspocus) running on ws://localhost:${port}`);
  }

  async onApplicationShutdown() {
    await this.server?.destroy();
  }
}
