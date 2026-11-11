import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { PermissionKey, RoleName } from '@vision/shared';
import { first, findById } from './db';
import { getJwtSecret as readJwtSecret } from './env';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roleName: RoleName;
  permissions: PermissionKey[];
  designation?: string;
  avatar?: string;
};

async function secretKey() {
  const secret = await readJwtSecret();
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: { id: string; email: string; roleName: string }) {
  const key = await secretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key);
}

export async function verifyToken(token: string) {
  const key = await secretKey();
  const { payload } = await jwtVerify(token, key);
  return payload as { id: string; email: string; roleName: RoleName };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function loadAuthUser(userId: string): Promise<AuthUser | null> {
  const user = await findById<any>('users', userId);
  if (!user || user.isDeleted || !user.isActive) return null;
  const role = await findById<any>('roles', user.role);
  const permissions = Array.from(
    new Set([...(role?.permissions || []), ...(user.customPermissions || [])])
  ) as PermissionKey[];
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    roleName: user.roleName,
    permissions,
    designation: user.designation,
    avatar: user.avatar,
  };
}

export async function authenticateRequest(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get('authorization') || '';
  let token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|;\s*)vts_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }
  if (!token) return null;
  try {
    const decoded = await verifyToken(token);
    return loadAuthUser(decoded.id);
  } catch {
    return null;
  }
}

export function hasPermission(user: AuthUser, ...required: PermissionKey[]) {
  if (user.roleName === 'Super Administrator') return true;
  if (user.roleName === 'Administrator' && !required.includes('roles:manage')) return true;
  return required.some((perm) => user.permissions.includes(perm));
}

export async function findUserByEmail(email: string) {
  const normalized = email.toLowerCase();
  let user = await first<any>(
    'users',
    'SELECT * FROM users WHERE email = ? AND isDeleted = 0 LIMIT 1',
    [normalized]
  );
  if (!user && normalized.endsWith('@visiontechsolutions.com')) {
    user = await first<any>(
      'users',
      'SELECT * FROM users WHERE email = ? AND isDeleted = 0 LIMIT 1',
      [normalized.replace('@visiontechsolutions.com', '@visiontechsolutions.co.in')]
    );
  } else if (!user && normalized.endsWith('@visiontechsolutions.co.in')) {
    user = await first<any>(
      'users',
      'SELECT * FROM users WHERE email = ? AND isDeleted = 0 LIMIT 1',
      [normalized.replace('@visiontechsolutions.co.in', '@visiontechsolutions.com')]
    );
  }
  return user;
}
