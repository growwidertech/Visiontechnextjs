import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, Role, IUser } from '../models';
import { PermissionKey, RoleName } from '@vision/shared';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    roleName: RoleName;
    permissions: PermissionKey[];
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.vts_token) {
      token = req.cookies.vts_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access the administration panel.',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      roleName: RoleName;
    };

    const user: IUser | null = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
      isActive: true,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.',
      });
      return;
    }

    const roleDoc = await Role.findById(user.role);
    const rolePermissions = roleDoc ? roleDoc.permissions : [];
    const mergedPermissions = Array.from(
      new Set([...rolePermissions, ...(user.customPermissions || [])])
    ) as PermissionKey[];

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      roleName: user.roleName,
      permissions: mergedPermissions,
    };

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session.',
    });
  }
}

export function requirePermission(...requiredPermissions: PermissionKey[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (
      req.user.roleName === 'Super Administrator' ||
      req.user.roleName === 'Administrator'
    ) {
      // Super Administrator has full access; Administrator has full content access except role system mutation if restricted
      if (
        req.user.roleName === 'Super Administrator' ||
        !requiredPermissions.includes('roles:manage')
      ) {
        next();
        return;
      }
    }

    const hasPerm = requiredPermissions.some((perm) =>
      req.user!.permissions.includes(perm)
    );

    if (!hasPerm) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${requiredPermissions.join(' or ')} (Current role: ${req.user.roleName})`,
      });
      return;
    }

    next();
  };
}
