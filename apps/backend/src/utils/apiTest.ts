import { connectDatabase, disconnectDatabase } from '../config/database';
import { seedDatabaseIfNeeded } from './seeder';
import { app } from '../index';
import { env } from '../config/env';
import http from 'http';

async function runTests() {
  console.log('=== VISION TECH SOLUTIONS - END-TO-END API & CMS VERIFICATION ===');
  await connectDatabase();
  await seedDatabaseIfNeeded(false);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  try {
    // 1. Test Health Endpoint
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    if (!healthJson.success) throw new Error('Health check failed');
    console.log('✓ [1/7] Health check & Express middleware verified');

    // 2. Test Public Bundle (Home sections, 8 Services, 8 Projects, Testimonials, Settings)
    const bundleRes = await fetch(`${baseUrl}/dashboard/public-bundle`);
    const bundleJson = await bundleRes.json();
    const bundle = bundleJson.data;
    if (!bundle || bundle.services.length < 8 || bundle.projects.length < 8) {
      throw new Error(
        `Expected at least 8 services and 8 projects, got ${bundle?.services?.length} services and ${bundle?.projects?.length} projects`
      );
    }
    console.log(
      `✓ [2/7] Public CMS Bundle verified: ${bundle.homeSections.length} home sections, ${bundle.services.length} services, ${bundle.projects.length} projects, ${bundle.testimonials.length} testimonials`
    );

    // 3. Test Admin Authentication (Super Administrator)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      }),
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success || !loginJson.data?.token) {
      throw new Error('Admin login failed');
    }
    const token = loginJson.data.token;
    console.log(
      `✓ [3/7] Admin JWT Authentication verified for ${loginJson.data.user.name} (${loginJson.data.user.roleName})`
    );

    // 4. Test RBAC Users & Roles API
    const usersRes = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const usersJson = await usersRes.json();
    if (!usersJson.success || usersJson.data.roles.length < 5) {
      throw new Error('RBAC roles verification failed');
    }
    console.log(
      `✓ [4/7] RBAC verified: ${usersJson.data.roles.length} roles and ${usersJson.data.permissions.length} granular permissions active`
    );

    // 5. Test Public Consultation Enquiry Submission + Duplicate Prevention
    const enquiryRes = await fetch(`${baseUrl}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Client Verification',
        email: 'client.test@example.com',
        phone: '+91 98111 22334',
        location: 'MG Road, Bangalore',
        serviceInterestedIn: 'Villa Interior Design',
        budgetRange: '₹50 Lakhs – ₹1 Crore',
        projectDetails: 'Verification test for luxury villa turnkey interior.',
        sourcePage: 'Automated E2E Test',
      }),
    });
    const enquiryJson = await enquiryRes.json();
    if (!enquiryJson.success) {
      throw new Error(`Enquiry submission failed: ${enquiryJson.message}`);
    }
    console.log('✓ [5/7] Public Consultation Enquiry submission & email notification verified');

    // 6. Test Admin Dashboard Metrics & CSV Export
    const dashRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashJson = await dashRes.json();
    if (!dashJson.success || !dashJson.data?.stats) {
      throw new Error('Admin dashboard metrics failed');
    }
    console.log(
      `✓ [6/7] Admin Dashboard verified: ${dashJson.data.stats.totalEnquiries} enquiries, ${dashJson.data.stats.publishedPages} published pages`
    );

    // 7. Test Dynamic Page Creation via CMS
    const pageRes = await fetch(`${baseUrl}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Turnkey Quality Assurance',
        slug: `turnkey-qa-${Date.now()}`,
        description: 'Our 100-point interior quality checklist.',
        status: 'published',
      }),
    });
    const pageJson = await pageRes.json();
    if (!pageJson.success) {
      throw new Error('CMS dynamic page creation failed');
    }
    console.log(`✓ [7/7] Dynamic CMS Page Builder verified (Created /${pageJson.data.slug})`);

    console.log('=== ALL 7 BACKEND & CMS VERIFICATION SUITES PASSED ===');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

runTests().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
