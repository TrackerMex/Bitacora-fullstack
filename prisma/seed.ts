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

async function main() {
  console.log('Seeding database...');

  // Seed permissions
  console.log('Creating permissions...');
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
  console.log(`Created ${permissions.length} permissions`);

  // Seed admin role
  console.log('Creating admin role...');
  const adminRole = await prisma.role.upsert({
    where: { key: 'admin' },
    update: {
      name: 'Administrator',
      description: 'Full access to the platform.',
      isActive: true,
    },
    create: {
      key: 'admin',
      name: 'Administrator',
      description: 'Full access to the platform.',
      isActive: true,
    },
  });

  // Create additional roles
  console.log('Creating additional roles...');
  const operatorRole = await prisma.role.upsert({
    where: { key: 'operator' },
    update: {
      name: 'Operator',
      description: 'Can manage dispatches and tracking.',
      isActive: true,
    },
    create: {
      key: 'operator',
      name: 'Operator',
      description: 'Can manage dispatches and tracking.',
      isActive: true,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { key: 'viewer' },
    update: {
      name: 'Viewer',
      description: 'Read-only access to data.',
      isActive: true,
    },
    create: {
      key: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to data.',
      isActive: true,
    },
  });

  // Hash admin password
  console.log('Creating admin user with hashed password...');
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tracker.local' },
    update: {
      name: 'Admin Inicial',
      passwordHash,
      isActive: true,
    },
    create: {
      email: 'admin@tracker.local',
      name: 'Admin Inicial',
      passwordHash,
      isActive: true,
    },
  });

  // Assign all permissions to admin role
  console.log('Assigning permissions to admin role...');
  for (const permission of permissions) {
    const permissionRecord = await prisma.permission.findUniqueOrThrow({
      where: { key: permission.key },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permissionRecord.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permissionRecord.id,
      },
    });
  }

  // Assign read permissions to operator role
  const operatorPermissions = [
    'dispatches.read',
    'dispatches.write',
    'tracking.read',
    'tracking.write',
  ];
  for (const permKey of operatorPermissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { key: permKey },
    });
    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: operatorRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: operatorRole.id,
          permissionId: permissionRecord.id,
        },
      });
    }
  }

  // Assign read-only permissions to viewer role
  const viewerPermissions = [
    'dispatches.read',
    'tracking.read',
    'reports.read',
  ];
  for (const permKey of viewerPermissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { key: permKey },
    });
    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: viewerRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: viewerRole.id,
          permissionId: permissionRecord.id,
        },
      });
    }
  }

  // Assign admin role to admin user
  console.log('Assigning admin role to admin user...');
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('');
  console.log('Seed completed successfully!');
  console.log('');
  console.log('Default admin credentials:');
  console.log('  Email: admin@tracker.local');
  console.log('  Password: admin123');
  console.log('');
  console.log('IMPORTANT: Change the admin password in production!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
