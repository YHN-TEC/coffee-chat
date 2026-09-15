import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "coffeechat_session";

function getSecret() {
  return process.env.SESSION_SECRET || "coffee-chat-demo-session-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function serialize(userId: string) {
  return `${userId}.${sign(userId)}`;
}

function deserialize(rawValue?: string | null) {
  if (!rawValue) return null;
  const [userId, signature] = rawValue.split(".");
  if (!userId || !signature) return null;

  const expected = Buffer.from(sign(userId), "utf8");
  const actual = Buffer.from(signature, "utf8");
  if (expected.length !== actual.length) return null;

  return timingSafeEqual(expected, actual) ? userId : null;
}

export async function hashPassword(value: string) {
  return hash(value, 10);
}

export async function verifyPassword(value: string, passwordHash: string) {
  return compare(value, passwordHash);
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, serialize(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  return deserialize(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
