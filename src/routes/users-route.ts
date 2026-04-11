import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logout } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post(
    "/users",
    async ({ body, set }) => {
      try {
        const { name, email, password } = body;
        const result = await registerUser(name, email, password);

        return { data: result };
      } catch (error: any) {
        if (error.message === "Email sudah terdaftar") {
          set.status = 400;
          return { error: error.message };
        }

        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        name: t.String({ maxLength: 255 }),
        email: t.String({ format: "email", maxLength: 255 }),
        password: t.String({ maxLength: 255 }),
      }),
      response: {
        200: t.Object({ data: t.String() }),
        400: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
      detail: {
        summary: "Register User",
        tags: ["Authentication"],
      },
    },
  )
  .post(
    "/users/login",
    async ({ body, set }) => {
      try {
        const { email, password } = body;
        const token = await loginUser(email, password);

        return { data: token };
      } catch (error: any) {
        if (error.message === "Email atau password salah") {
          set.status = 401; // Unauthorized
          return { error: error.message };
        }

        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      response: {
        200: t.Object({ data: t.String() }),
        401: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
      detail: {
        summary: "Login User",
        tags: ["Authentication"],
      },
    },
  )
  .derive(({ request }) => {
    const authHeader = request.headers.get("Authorization");
    return {
      token: authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null,
    };
  })
  .get(
    "/users/current",
    async ({ token, set }) => {
      try {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const user = await getCurrentUser(token);

        return { data: user };
      } catch (error: any) {
        if (error.message === "Unauthorized") {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      response: {
        200: t.Object({
          data: t.Object({
            id: t.Number(),
            name: t.String(),
            email: t.String(),
            createdAt: t.Any(),
          }),
        }),
        401: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
      detail: {
        summary: "Get Current User Profile",
        tags: ["User Management"],
        security: [{ bearerAuth: [] }],
      },
    },
  )
  .delete(
    "/users/logout",
    async ({ token, set }) => {
      try {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        await logout(token);

        return { data: "OK" };
      } catch (error: any) {
        if (error.message === "Unauthorized") {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      response: {
        200: t.Object({ data: t.String() }),
        401: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
      detail: {
        summary: "Logout User",
        tags: ["Authentication"],
        security: [{ bearerAuth: [] }],
      },
    },
  );
