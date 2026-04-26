const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chuchoedu.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@chuchoedu.com',
      password,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin created:', admin.email);
  console.log('   Password: admin123');
  console.log('   ⚠️  Change the password after first login!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
