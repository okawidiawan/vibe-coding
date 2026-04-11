import { describe, expect, it, beforeEach } from 'bun:test';
import { app } from '../src/index';
import { resetDatabase } from './test-utils';

const BASE_URL = 'http://localhost';

describe('API Integration Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    describe('General API', () => {
        it('GET / should return hello message', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/`));
            expect(response.status).toBe(200);
            const body: any = await response.json();
            expect(body.message).toContain('Hello World');
            expect(body.timestamp).toBeDefined();
        });

    });

    describe('Registration API (POST /api/users)', () => {
        it('should register successfully with valid data', async () => {
            const payload = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const response = await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }));
            expect(response.status).toBe(200);
            const result: any = await response.json();
            expect(result.data).toBe('OK');
        });

        it('should fail if required fields are missing', async () => {
            const payload = {
                name: 'Test User'
                // email and password missing
            };
            const response = await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }));
            expect(response.status).toBe(422);
        });

        it('should fail if email is already registered', async () => {
            const payload = {
                name: 'Test User',
                email: 'duplicate@example.com',
                password: 'password123'
            };
            // First registration
            await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }));
            // Second registration with same email
            const response = await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }));
            expect(response.status).toBe(400);
            const result: any = await response.json();
            expect(result.error).toBe('Email sudah terdaftar');
        });

        it('should fail if name exceeds 255 characters', async () => {
            const payload = {
                name: 'a'.repeat(256),
                email: 'longname@example.com',
                password: 'password123'
            };
            const response = await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }));
            expect(response.status).toBe(422);
        });

        it('should fail with invalid email format', async () => {
            const payload = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123'
            };
            const response = await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }));
            expect(response.status).toBe(422);
        });
    });

    describe('Login API (POST /api/users/login)', () => {
        beforeEach(async () => {
            // Register a user for login tests
            await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'password123'
                })
            }));
        });

        it('should login successfully with correct credentials', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'login@example.com',
                    password: 'password123'
                })
            }));
            expect(response.status).toBe(200);
            const result: any = await response.json();
            expect(result.data).toBeDefined(); // Token
        });

        it('should fail with wrong password', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                })
            }));
            expect(response.status).toBe(401);
            const result: any = await response.json();
            expect(result.error).toBe('Email atau password salah');
        });
        it('should fail if user is not found', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'notfound@example.com',
                    password: 'password123'
                })
            }));
            expect(response.status).toBe(401);
            const result: any = await response.json();
            expect(result.error).toBe('Email atau password salah');
        });

        it('should fail with invalid email format', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invalid-email',
                    password: 'password123'
                })
            }));
            expect(response.status).toBe(422);
        });
    });

    describe('Authenticated API Scenarios', () => {
        let token: string;

        beforeEach(async () => {
            await app.handle(new Request(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Auth User',
                    email: 'auth@example.com',
                    password: 'password123'
                })
            }));
            const loginRes = await app.handle(new Request(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'auth@example.com',
                    password: 'password123'
                })
            }));
            const loginData: any = await loginRes.json();
            token = loginData.data;
        });

        it('should get current user profile', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/current`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }));
            expect(response.status).toBe(200);
            const result: any = await response.json();
            expect(result.data.email).toBe('auth@example.com');
        });

        it('should fail get current user without token', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/current`, {
                method: 'GET'
            }));
            expect(response.status).toBe(401);
        });

        it('should logout successfully', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/logout`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }));
            expect(response.status).toBe(200);
            const result: any = await response.json();
            expect(result.data).toBe('OK');

            // Verify token is no longer valid
            const profileRes = await app.handle(new Request(`${BASE_URL}/api/users/current`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }));
            expect(profileRes.status).toBe(401);
        });
        it('should fail with invalid token', async () => {
            const profileRes = await app.handle(new Request(`${BASE_URL}/api/users/current`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer invalid_token` }
            }));
            expect(profileRes.status).toBe(401);
            const result: any = await profileRes.json();
            expect(result.error).toBe('Unauthorized');
        });

        it('should fail to logout with invalid token', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/api/users/logout`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer invalid_token` }
            }));
            expect(response.status).toBe(401);
            const result: any = await response.json();
            expect(result.error).toBe('Unauthorized');
        });
    });
});
