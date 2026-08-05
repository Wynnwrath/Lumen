import type { Model } from "mongoose";

export async function seedIfEmpty(model: Model<any>, data: any[], label: string): Promise<void> {
  const count = await model.countDocuments();
  if (count === 0) {
    await model.insertMany(data);
    console.log(`Seeded ${data.length} ${label}`);
  }
}
