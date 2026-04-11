import { Elysia } from 'elysia';
import { db } from '../db';
import { users } from '../db/schema';
import { swagger } from '@elysiajs/swagger';
import { usersRoute } from './routes/users-route';

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Vibe Coding User API',
        version: '1.0.0',
        description: 'API Documentation for User Management'
      }
    }
  }))
  .use(usersRoute)
  .get('/', () => {
    return {
      message: 'Hello World from Elysia + Drizzle!',
      timestamp: new Date().toISOString(),
    };
  });

app.listen(process.env.PORT || 3000);

console.log(
  `🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
