import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../modules/auth/auth.model.js";

// Creates the demo customer + admin so you can log in right away.
// Each check is unchanged (only inserts if the email doesn't exist yet).
export async function seedDefaultUsers(): Promise<void> {
  const exists = await prisma.user.findUnique({ where: { email: "alex.morgan@lumen.com" } });
  if (!exists) {
    await prisma.user.create({
      data: {
        name: "Alex Morgan",
        email: "alex.morgan@lumen.com",
        password: await hashPassword("password123"),
        phone: "+63 917 555 2345",
        role: "customer",
      },
    });
    console.log("Seeded demo customer: alex.morgan@lumen.com / password123");
  }

  const adminExists = await prisma.user.findUnique({ where: { email: "admin@lumen.com" } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "Lumen Admin",
        storeName: "Lumen Official Store",
        email: "admin@lumen.com",
        password: await hashPassword("password123"),
        role: "admin",
        category: "electronics",
      },
    });
    console.log("Seeded admin: admin@lumen.com / password123");
  }
}
