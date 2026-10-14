import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany();
  const apps = await prisma.jobApplication.findMany();
  const emps = await prisma.employment.findMany();
  const tasks = await prisma.employmentTask.findMany();
  const payrolls = await prisma.payrollRecord.findMany();
  const clients = await prisma.client.findMany();
  const projs = await prisma.freelanceProject.findMany();
  const milestones = await prisma.projectMilestone.findMany();
  const trxs = await prisma.transaction.findMany();
  const cats = await prisma.category.findMany();

  console.log(JSON.stringify({
    usersCount: users.length,
    apps: apps.map(a => ({ id: a.id, company: a.companyName })),
    emps: emps.map(e => ({ id: e.id, company: e.companyName })),
    clients: clients.map(c => ({ id: c.id, name: c.name, company: c.company })),
    projs: projs.map(p => ({ id: p.id, title: p.title })),
    milestones: milestones.map(m => ({ id: m.id, title: m.title, status: m.status })),
    trxs: trxs.map(t => ({ id: t.id, desc: t.description, catId: t.categoryId })),
    cats: cats.map(c => ({ id: c.id, name: c.name, type: c.type, userId: c.userId })),
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
