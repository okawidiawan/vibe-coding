import { db } from '../db';
import { users, sessions } from '../db/schema';

export async function resetDatabase() {
  try {
    await db.delete(sessions);
    await db.delete(users);
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}
