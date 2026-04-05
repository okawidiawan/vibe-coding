import { Elysia, t } from 'elysia';
import { registerUser, loginUser } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api' })
  .post('/users', async ({ body, set }) => {
    try {
      const { name, email, password } = body;
      const result = await registerUser(name, email, password);
      
      return { data: result };
    } catch (error: any) {
      if (error.message === 'Email sudah terdaftar') {
        set.status = 400; 
        return { error: error.message };
      }
      
      set.status = 500;
      return { error: 'Internal Server Error' };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  .post('/users/login', async ({ body, set }) => {
    try {
      const { email, password } = body;
      const token = await loginUser(email, password);
      
      return { data: token };
    } catch (error: any) {
      if (error.message === 'Email atau password salah') {
        set.status = 401; // Unauthorized
        return { error: error.message };
      }
      
      set.status = 500;
      return { error: 'Internal Server Error' };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  });
