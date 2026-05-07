import { PrismaClient } from "./generated/client"; 
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import axios from "axios";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Expanded bounds to cover all major South Indian hubs
const SOUTH_INDIA_BOUNDS = {
  latMin: 8.0,   // Kanyakumari
  latMax: 20.0,  // Just above Hyderabad
  lonMin: 74.0,  // Mangaluru/Kochi
  lonMax: 85.0   // Vizag
};

async function main() {
  console.log("🚀 Starting Major South India Data Injection...");

  try {
    const response = await axios.get('https://api.openchargemap.io/v3/poi/', {
      params: {
        output: 'json',
        countrycode: 'IN',
        maxresults: 250, // Increased to get more cities
        compact: true,
        verbose: false,
        key: 'cb531ed2-4ab7-4f26-bff8-78a4864add2c ' // 🔥 PASTE YOUR KEY FROM THE SCREENSHOT HERE
      },
      headers: {
        'User-Agent': 'GreenRide-South-India-Project' 
      }
    });

    const stations = response.data;
    let count = 0;

    for (const s of stations) {
      const lat = s.AddressInfo.Latitude;
      const lon = s.AddressInfo.Longitude;

      if (
        lat >= SOUTH_INDIA_BOUNDS.latMin && lat <= SOUTH_INDIA_BOUNDS.latMax &&
        lon >= SOUTH_INDIA_BOUNDS.lonMin && lon <= SOUTH_INDIA_BOUNDS.lonMax
      ) {
        await prisma.station.upsert({
          where: { externalId: s.ID },
          update: { availableBatteries: Math.floor(Math.random() * 12) + 2 },
          create: {
            externalId: s.ID,
            name: s.AddressInfo.Title,
            address: s.AddressInfo.AddressLine1 || "Public Station",
            city: s.AddressInfo.Town || "South India City",
            state: s.AddressInfo.StateOrProvince || "South India",
            latitude: lat,
            longitude: lon,
            operatorName: s.OperatorInfo?.Title || "Independent",
            availableBatteries: Math.floor(Math.random() * 12) + 2,
          },
        });
        count++;
      }
    }

    console.log(`✅ Successfully injected ${count} real stations across South India!`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((e) => console.error(e)).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
