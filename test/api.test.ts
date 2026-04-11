import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../src/index';
import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('User API - Get Current User', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${crypto.randomUUID()}@example.com`,
    password: 'password123',
  };

  let authToken: string;

  beforeAll(async () => {
    // 1. Register test user
    await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      })
    );

    // 2. Login to get token
    const loginRes = await app.handle(
      new Request('http://localhost/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password }),
      })
    );
    const loginData = await loginRes.json();
    authToken = loginData.data;
  });

  afterAll(async () => {
    // Cleanup: Delete test user and their sessions
    const userResult = await db.select().from(users).where(eq(users.email, testUser.email)).limit(1);
    if (userResult.length > 0) {
      const userId = userResult[0].id;
      await db.delete(sessions).where(eq(sessions.userId, userId));
      await db.delete(users).where(eq(users.id, userId));
    }
  });

  it('should return 200 and user profile when valid token provided', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.name).toBe(testUser.name);
    expect(body.data.email).toBe(testUser.email);
    expect(body.data.id).toBeTypeOf('number');
  });

  it('should return 401 when no token provided', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET'
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 401 when invalid token provided', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });
});
