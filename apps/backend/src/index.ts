import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { seedDatabaseIfNeeded } from './utils/seeder';
import { authRouter, usersRouter } from './routes/authAndUsers';
import {
  pagesRouter,
  servicesRouter,
  testimonialsRouter,
  blogRouter,
  faqsRouter,
  navigationRouter,
  settingsRouter,
} from './routes/contentRoutes';
import {
  projectsRouter,
  galleryRouter,
  mediaRouter,
} from './routes/portfolioRoutes';
import { enquiriesRouter, dashboardRouter } from './routes/opsRoutes';
import { swaggerDocument } from './docs/swagger';

export const app = express();

// Security & Performance Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Serve local uploaded media assets (CDN fallback)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// OpenAPI / Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Vision Tech Solutions Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Mount REST API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/media', mediaRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/blog', blogRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/faqs', faqsRouter);
app.use('/api/dashboard', dashboardRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled API Error');
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

async function bootstrap() {
  try {
    await connectDatabase();
    await seedDatabaseIfNeeded(false);

    app.listen(env.PORT, () => {
      logger.info(`Vision Tech Solutions API Server running on http://localhost:${env.PORT}`);
      logger.info(`Swagger OpenAPI Documentation available at http://localhost:${env.PORT}/api/docs`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start backend server');
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
