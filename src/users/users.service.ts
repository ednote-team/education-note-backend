import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface UserSearchResult {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly dataSource: DataSource) {}

  async search(q: string, requesterId: string): Promise<UserSearchResult[]> {
    if (!q || q.trim().length < 2) return [];

    const rows: { id: string; email: string; full_name: string }[] =
      await this.dataSource.query(
        `
        SELECT
          au.id::text,
          au.email,
          COALESCE(NULLIF(TRIM(u.full_name), ''), au.raw_user_meta_data->>'full_name') AS full_name
        FROM auth.users au
        LEFT JOIN public.users u ON u.id = au.id
        WHERE (
          COALESCE(NULLIF(TRIM(u.full_name), ''), au.raw_user_meta_data->>'full_name') ILIKE $1
          OR au.email ILIKE $1
        )
          AND au.id::text != $2
        LIMIT 1
        `,
        [q.trim(), requesterId],
      );

    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.full_name ?? '',
    }));
  }
}
