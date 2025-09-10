import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, count, desc } from 'drizzle-orm';
import * as schema from '../../../packages/db/schema';
import { UserRepository } from '../domain/UserRepository';
import { User, CreateUserData, UpdateUserData } from '../domain/User';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export class DrizzleUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const [user] = await db.insert(schema.users).values({
      email: userData.email,
      username: userData.username,
      name: userData.name,
      password: userData.password,
      role: userData.role || 'tenant',
      plan: userData.plan || 'free',
    }).returning();
    return user;
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const [user] = await db.update(schema.users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  async findAll(offset = 0, limit = 50): Promise<User[]> {
    return db.select()
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async count(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(schema.users);
    return result.count;
  }
}
