import { Elysia } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .use(usersRoute)
  .get("/", () => {
    return {
      message: "Hello World from Elysia + Drizzle!",
      timestamp: new Date().toISOString(),
    };
  });

app.listen(process.env.PORT || 3000);

console.log(`🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`);
