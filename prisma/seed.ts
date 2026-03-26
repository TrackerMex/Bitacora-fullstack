import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5433/bitacora';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

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
];

async function main() {
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

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tracker.local' },
    update: {
      name: 'Admin Inicial',
      isActive: true,
    },
    create: {
      email: 'admin@tracker.local',
      name: 'Admin Inicial',
      isActive: true,
    },
  });

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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
