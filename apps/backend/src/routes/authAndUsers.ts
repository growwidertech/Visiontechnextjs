import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Role, Permission } from '../models';
import { env } from '../config/env';
import {
  AuthenticatedRequest,
  requireAuth,
  requirePermission,
} from '../middleware/auth';
import { loginSchema, sanitizeSlug } from '../validators/schemas';
import { logActivity } from '../services/activityService';

export const authRouter = Router();
export const usersRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid credentials format',
      });
      return;
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail, isDeleted: false });
    if (!user && normalizedEmail.endsWith('@visiontechsolutions.com')) {
      user = await User.findOne({
        email: normalizedEmail.replace('@visiontechsolutions.com', '@visiontechsolutions.co.in'),
        isDeleted: false,
      });
    } else if (!user && normalizedEmail.endsWith('@visiontechsolutions.co.in')) {
      user = await User.findOne({
        email: normalizedEmail.replace('@visiontechsolutions.co.in', '@visiontechsolutions.com'),
        isDeleted: false,
      });
    }

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Brute force lockout check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      res.status(429).json({
        success: false,
        message: `Account temporarily locked due to multiple failed login attempts. Try again in ${waitMinutes} minute(s).`,
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 6) {
        user.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 min lock
      }
      await user.save();
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const roleDoc = await Role.findById(user.role);
    const permissions = Array.from(
      new Set([...(roleDoc?.permissions || []), ...(user.customPermissions || [])])
    );

    const token = jwt.sign(
      {
        id: String(user._id),
        email: user.email,
        roleName: user.roleName,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.cookie('vts_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    await logActivity({
      userName: user.name,
      userRole: user.roleName,
      action: 'Logged in to Admin CMS',
      module: 'Authentication',
      entityId: String(user._id),
      entityTitle: user.email,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          designation: user.designation,
          avatar: user.avatar,
          roleName: user.roleName,
          permissions,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login error' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req, res: Response): void => {
  res.clearCookie('vts_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id).select('-passwordHash');
  res.json({
    success: true,
    data: {
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        roleName: req.user!.roleName,
        permissions: req.user!.permissions,
        designation: user?.designation || '',
        avatar: user?.avatar || '',
        lastLoginAt: user?.lastLoginAt,
      },
    },
  });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (user) {
    const token = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000);
    await user.save();
  }
  res.json({
    success: true,
    message: 'If an account with that email exists, password reset instructions have been generated.',
  });
});

// POST /api/auth/change-password
authRouter.post(
  '/change-password',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Provide current password and a new password of at least 6 characters.',
      });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    await logActivity({
      req,
      action: 'Changed account password',
      module: 'Security',
    });

    res.json({ success: true, message: 'Password updated successfully' });
  }
);

// GET /api/users - List users, roles, and permissions
usersRouter.get(
  '/',
  requireAuth,
  requirePermission('users:read'),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const [users, roles, permissions] = await Promise.all([
      User.find({ isDeleted: false }).select('-passwordHash').sort({ createdAt: 1 }),
      Role.find().sort({ createdAt: 1 }),
      Permission.find().sort({ module: 1, key: 1 }),
    ]);

    res.json({
      success: true,
      data: { users, roles, permissions },
    });
  }
);

// POST /api/users - Create new admin/staff user
usersRouter.post(
  '/',
  requireAuth,
  requirePermission('users:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, email, password, roleName, designation, customPermissions } = req.body;
      if (!name || !email || !password || !roleName) {
        res.status(400).json({
          success: false,
          message: 'Name, email, password and role are required.',
        });
        return;
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'A user with this email already exists.',
        });
        return;
      }

      const roleDoc = await Role.findOne({ name: roleName });
      if (!roleDoc) {
        res.status(400).json({ success: false, message: 'Invalid role selected.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: roleDoc._id,
        roleName: roleDoc.name,
        designation: designation || roleDoc.name,
        customPermissions: customPermissions || [],
        isActive: true,
        createdBy: req.user!.id as any,
      });

      await logActivity({
        req,
        action: 'Created admin user',
        module: 'Users & RBAC',
        entityId: String(newUser._id),
        entityTitle: `${newUser.name} (${newUser.roleName})`,
      });

      const sanitized = newUser.toObject();
      delete (sanitized as any).passwordHash;

      res.status(201).json({ success: true, data: sanitized });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/users/:id - Update user role, status, or password
usersRouter.put(
  '/:id',
  requireAuth,
  requirePermission('users:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, roleName, designation, isActive, password, customPermissions } = req.body;
      const user = await User.findById(req.params.id);
      if (!user || user.isDeleted) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) user.name = name;
      if (designation !== undefined) user.designation = designation;
      if (typeof isActive === 'boolean') user.isActive = isActive;
      if (Array.isArray(customPermissions)) user.customPermissions = customPermissions;

      if (roleName && roleName !== user.roleName) {
        const roleDoc = await Role.findOne({ name: roleName });
        if (roleDoc) {
          user.role = roleDoc._id as any;
          user.roleName = roleDoc.name;
        }
      }

      if (password && password.length >= 6) {
        user.passwordHash = await bcrypt.hash(password, 12);
      }

      user.updatedBy = req.user!.id as any;
      await user.save();

      await logActivity({
        req,
        action: 'Updated user account',
        module: 'Users & RBAC',
        entityId: String(user._id),
        entityTitle: `${user.name} (${user.roleName})`,
      });

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/users/:id
usersRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('users:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (String(user._id) === req.user!.id) {
      res.status(400).json({ success: false, message: 'You cannot delete your own active account.' });
      return;
    }

    user.isDeleted = true;
    user.isActive = false;
    await user.save();

    await logActivity({
      req,
      action: 'Deleted user account',
      module: 'Users & RBAC',
      entityId: String(user._id),
      entityTitle: user.email,
    });

    res.json({ success: true, message: 'User deleted successfully' });
  }
);

// PUT /api/users/roles/:roleId - Update configurable role permissions
usersRouter.put(
  '/roles/:roleId',
  requireAuth,
  requirePermission('roles:manage'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { permissions, description } = req.body;
    const role = await Role.findById(req.params.roleId);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }

    if (Array.isArray(permissions)) {
      role.permissions = permissions;
    }
    if (description !== undefined) {
      role.description = description;
    }
    await role.save();

    await logActivity({
      req,
      action: 'Updated role permissions',
      module: 'Users & RBAC',
      entityId: String(role._id),
      entityTitle: role.name,
    });

    res.json({ success: true, data: role });
  }
);
