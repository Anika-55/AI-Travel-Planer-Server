import { prisma } from "../config/prisma";
import { env } from "../config/env";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: "USER" | "ADMIN";
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true
};

const jwtSecret = env.jwtSecret as Secret;
const jwtOptions: SignOptions = {
  expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
};

export async function registerUser(input: {
  name?: string;
  email: string;
  password: string;
  avatar?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return { error: "Email already in use" } as const;
  }

  const hashed = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name ?? null,
      email: input.email,
      password: hashed,
      avatar: input.avatar ?? null
    },
    select: userSelect
  });

  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, jwtOptions);

  return { user, token } as const;
}

export async function loginUser(input: { email: string; password: string }) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!userWithPassword) {
    return { error: "Invalid credentials" } as const;
  }

  const match = await bcrypt.compare(input.password, userWithPassword.password);
  if (!match) {
    return { error: "Invalid credentials" } as const;
  }

  const user: AuthUser = {
    id: userWithPassword.id,
    name: userWithPassword.name,
    email: userWithPassword.email,
    avatar: userWithPassword.avatar,
    role: userWithPassword.role
  };

  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, jwtOptions);

  return { user, token } as const;
}
