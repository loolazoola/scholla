import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const firstNames = [
  "Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fitri", "Gita", "Hadi",
  "Indra", "Joko", "Kartika", "Lina", "Made", "Nadia", "Omar", "Putri",
  "Rudi", "Sari", "Tono", "Umar", "Vina", "Wati", "Yanto", "Zahra",
  "Andi", "Bella", "Cahya", "Dian", "Eka", "Fajar", "Gilang", "Hana",
  "Ilham", "Jaya", "Kiki", "Lani", "Maya", "Nina", "Oki", "Pandu",
  "Rina", "Sinta", "Tari", "Umi", "Vera", "Wulan", "Yudi", "Zaki",
  "Ayu", "Bayu"
];

const lastNames = [
  "Santoso", "Wijaya", "Kusuma", "Pratama", "Saputra", "Wibowo", "Nugroho", "Hidayat",
  "Setiawan", "Permana", "Gunawan", "Kurniawan", "Susanto", "Firmansyah", "Hakim", "Rahman",
  "Suharto", "Budiman", "Suryanto", "Hartono", "Prabowo", "Sutanto", "Irawan", "Mahendra",
  "Putra", "Utomo", "Hermawan", "Sugiarto", "Wahyudi", "Ramadhan", "Adiputra", "Kusumah",
  "Darmawan", "Prasetyo", "Nugraha", "Wicaksono", "Setyawan", "Haryanto", "Sulistyo", "Maulana",
  "Saputro", "Widodo", "Surya", "Anwar", "Rizki", "Fauzi", "Habibi", "Syahputra",
  "Perdana", "Aditya"
];

async function main() {
  console.log("Starting to seed 50 students...");

  const password = await bcrypt.hash("password123", 10);

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.school.id`;

    try {
      const student = await prisma.user.create({
        data: {
          email,
          password,
          name,
          role: "STUDENT",
          active: true,
          locale: "id",
        },
      });

      console.log(`Created student ${i + 1}/50: ${student.name} (${student.email})`);
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(`Skipped ${email} - already exists`);
      } else {
        console.error(`Error creating student ${name}:`, error);
      }
    }
  }

  console.log("\nSeeding completed!");
  console.log("All students have password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
