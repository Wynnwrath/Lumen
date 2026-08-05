import type { Model, FilterQuery } from "mongoose";

export interface PaginateOptions {
  sort?: Record<string, 1 | -1>;
  populate?: { path: string; select?: string };
}

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  opts: PaginateOptions & { page?: number; limit?: number }
): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const skip = (page - 1) * limit;

  let query = model.find(filter).sort(opts.sort || { createdAt: -1 }).skip(skip).limit(limit).lean();
  if (opts.populate) {
    query = query.populate(opts.populate.path, opts.populate.select) as typeof query;
  }

  const [items, total] = await Promise.all([query, model.countDocuments(filter)]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
