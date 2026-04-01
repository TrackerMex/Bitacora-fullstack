import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5433/bitacora';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const SALT_ROUNDS = 12;
const DEFAULT_ADMIN_PASSWORD = 'admin123'; // Change in production!

// ============================================
// GLOBAL PERMISSIONS (Shared across all tenants)
// ============================================
const permissions = [
  {
    key: 'users.read',
    name: 'Read users',
    module: 'users',
    description: 'Allows listing and viewing users.',
  },
  {
    key: 'users.write',
    name: 'Write users',
    module: 'users',
    description: 'Allows creating and updating users.',
  },
  {
    key: 'roles.read',
    name: 'Read roles',
    module: 'roles',
    description: 'Allows listing roles and permissions.',
  },
  {
    key: 'roles.write',
    name: 'Write roles',
    module: 'roles',
    description: 'Allows assigning roles and permissions.',
  },
  {
    key: 'dispatches.read',
    name: 'Read dispatches',
    module: 'dispatches',
    description: 'Allows viewing dispatch records.',
  },
  {
    key: 'dispatches.write',
    name: 'Write dispatches',
    module: 'dispatches',
    description: 'Allows creating and updating dispatch records.',
  },
  {
    key: 'tracking.read',
    name: 'Read tracking',
    module: 'tracking',
    description: 'Allows viewing tracking data.',
  },
  {
    key: 'tracking.write',
    name: 'Write tracking',
    module: 'tracking',
    description: 'Allows creating and updating tracking data.',
  },
  {
    key: 'reports.read',
    name: 'Read reports',
    module: 'reports',
    description: 'Allows viewing and generating reports.',
  },
  {
    key: 'reports.write',
    name: 'Write reports',
    module: 'reports',
    description: 'Allows creating and exporting reports.',
  },
];

// ============================================
// TENANTS CONFIGURATION
// ============================================
const tenants = [
  {
    name: 'Acme Corporation',
    slug: 'acme-corp',
    email: 'contact@acme-corp.com',
    adminUser: {
      email: 'admin@acme.local',
      name: 'Admin Acme',
    },
  },
  {
    name: 'TechCorp Solutions',
    slug: 'techcorp',
    email: 'contact@techcorp.com',
    adminUser: {
      email: 'admin@techcorp.local',
      name: 'Admin TechCorp',
    },
  },
  {
    name: 'Logística XYZ',
    slug: 'logistica-xyz',
    email: 'contact@logistica-xyz.com',
    adminUser: {
      email: 'admin@logistica.local',
      name: 'Admin Logística',
    },
  },
];

// ============================================
// ROLES CONFIGURATION (Per tenant)
// ============================================
const roleTemplates = [
  {
    key: 'admin',
    name: 'Administrator',
    description: 'Full access to the platform.',
    permissions: [
      'users.read',
      'users.write',
      'roles.read',
      'roles.write',
      'dispatches.read',
      'dispatches.write',
      'tracking.read',
      'tracking.write',
      'reports.read',
      'reports.write',
    ],
  },
  {
    key: 'operator',
    name: 'Operator',
    description: 'Can manage dispatches and tracking.',
    permissions: [
      'dispatches.read',
      'dispatches.write',
      'tracking.read',
      'tracking.write',
    ],
  },
  {
    key: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to data.',
    permissions: ['dispatches.read', 'tracking.read', 'reports.read'],
  },
];

async function main() {
  console.log('🌱 Starting Multi-Tenant Database Seeding...\n');

  // ============================================
  // STEP 1: Create Global Permissions
  // ============================================
  console.log('📋 Creating global permissions...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        module: permission.module,
        description: permission.description,
      },
      create: permission,
    });
  }
  console.log(`✅ Created ${permissions.length} permissions\n`);

  // ============================================
  // STEP 2: Create Tenants and Their Data
  // ============================================
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);

  for (const tenantConfig of tenants) {
    console.log(
      `🏢 Setting up tenant: ${tenantConfig.name} (${tenantConfig.slug})`,
    );

    // Create Tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantConfig.slug },
      update: {
        name: tenantConfig.name,
        email: tenantConfig.email,
        isActive: true,
      },
      create: {
        name: tenantConfig.name,
        slug: tenantConfig.slug,
        email: tenantConfig.email,
        isActive: true,
      },
    });
    console.log(`  ✓ Tenant created: ${tenant.id}`);

    // Create Roles for this Tenant
    console.log('  📝 Creating roles...');
    const createdRoles: Record<string, any> = {};

    for (const roleTemplate of roleTemplates) {
      const role = await prisma.role.upsert({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: roleTemplate.key,
          },
        },
        update: {
          name: roleTemplate.name,
          description: roleTemplate.description,
          isActive: true,
        },
        create: {
          tenantId: tenant.id,
          key: roleTemplate.key,
          name: roleTemplate.name,
          description: roleTemplate.description,
          isActive: true,
        },
      });
      createdRoles[roleTemplate.key] = role;
      console.log(`    ✓ Role: ${role.name} (${role.key})`);

      // Assign Permissions to Role
      for (const permKey of roleTemplate.permissions) {
        const permission = await prisma.permission.findUnique({
          where: { key: permKey },
        });

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              tenantId: tenant.id,
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
    console.log(`  ✅ Created ${Object.keys(createdRoles).length} roles`);

    // Create Admin User for this Tenant
    console.log('  👤 Creating admin user...');
    const adminUser = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: tenantConfig.adminUser.email,
        },
      },
      update: {
        name: tenantConfig.adminUser.name,
        passwordHash,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        email: tenantConfig.adminUser.email,
        name: tenantConfig.adminUser.name,
        passwordHash,
        isActive: true,
      },
    });
    console.log(`    ✓ User: ${adminUser.email}`);

    // Assign Admin Role to Admin User
    const adminRole = createdRoles['admin'];
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
    console.log(`    ✓ Assigned admin role to user`);
    console.log('  ✅ Admin user created and configured\n');
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`  • ${permissions.length} global permissions created`);
  console.log(`  • ${tenants.length} tenants created`);
  console.log(
    `  • ${roleTemplates.length} roles per tenant (${tenants.length * roleTemplates.length} total)`,
  );
  console.log(`  • ${tenants.length} admin users created\n`);

  console.log('🔐 Default Admin Credentials:\n');
  for (const tenant of tenants) {
    console.log(`  ${tenant.name} (slug: ${tenant.slug})`);
    console.log(`    Email: ${tenant.adminUser.email}`);
    console.log(`    Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log('');
  }

  console.log('⚠️  IMPORTANT: Change all admin passwords in production!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
