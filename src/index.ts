import { Elysia } from 'elysia';
import { db } from '../db';
import { users } from '../db/schema';
import { usersRoute } from './routes/users-route';

export const app = new Elysia()
  .use(usersRoute)
  .get('/', () => {
    return {
      message: 'Hello World from Elysia + Drizzle!',
      timestamp: new Date().toISOString(),
    };
  })
  .get('/users', async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error(error);
      return { error: 'Failed to fetch users. Is the database running?' };
    }
  });

app.listen(process.env.PORT || 3000);

console.log(
  `🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
