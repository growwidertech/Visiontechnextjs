# Production Deployment, Backup & Maintenance Guide

## 1. Production Environment Configuration

Set the following environment variables in your production environment:

- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/visiontechsolutions?retryWrites=true&w=majority`
- `JWT_SECRET=<64-char-random-hex-secret>`
- `CLOUDINARY_CLOUD_NAME=<your-cloud-name>`
- `CLOUDINARY_API_KEY=<your-api-key>`
- `CLOUDINARY_API_SECRET=<your-api-secret>`
- `SMTP_HOST=smtp.gmail.com` (or AWS SES / SendGrid SMTP)
- `SMTP_PORT=587`
- `SMTP_USER=<your-smtp-user>`
- `SMTP_PASS=<your-smtp-password>`
- `NEXT_PUBLIC_API_URL=https://api.visiontechsolutions.com/api`
- `NEXT_PUBLIC_SITE_URL=https://www.visiontechsolutions.com`

## 2. Building for Production

```bash
npm run build
npm run start
```

## 3. Database & Media Backup Strategy

1. **MongoDB Backups**:
   - Schedule daily automated snapshots via MongoDB Atlas Continuous Cloud Backup or `mongodump --uri="$MONGODB_URI" --archive=backup-$(date +%F).gz --gzip`.
2. **Cloudinary Media Backups**:
   - Enable Cloudinary Automatic Backup to an AWS S3 or Google Cloud Storage bucket in your Cloudinary Dashboard settings.
3. **Enquiry Lead Exports**:
   - Administrators can also export all enquiries at any time from `/admin` -> **Enquiries** -> **Export Leads to CSV** (`/api/enquiries/export/csv`).
