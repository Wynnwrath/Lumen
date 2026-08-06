# Lumen — Project Architecture Guide

> **Welcome!** If you just joined this project, start here. This document explains *everything*: what Lumen is, how the frontend and backend fit together, what databases are (from zero!), what Prisma and Supabase do, how auth works, and how to do everyday dev tasks. No database experience required — we teach it all from scratch.

---

## 1. What Is Lumen?

**Lumen is an e-commerce web application** — an online store. Customers browse products, view details, fill a cart, apply coupons, and place orders. An admin panel lets staff manage products and categories, view orders, and inspect customers.

Lumen is a **full-stack application**: two halves that talk to each other over HTTP.

| Half | Folder | What it is | Tech stack |
|------|--------|------------|------------|
| **Frontend** (the client) | `F:\Lumen\client` | The website users see and click | React + TypeScript + Vite + Tailwind CSS + Zustand |
| **Backend** (the server) | `F:\Lumen\server` | The brain that stores data and runs business rules | Express + TypeScript + **Prisma** + **PostgreSQL** (hosted on **Supabase**) |

**Analogy:** if the customer is a diner, the frontend is the *dining room and menu*, and the backend is the *kitchen, storeroom, and accountant*. They communicate via **HTTP requests** — waiters running between tables and kitchen.

> ⚠️ **Important context:** the server was *just migrated* from MongoDB (a "NoSQL" database) to PostgreSQL via Prisma. The client is *partially* migrated: **auth uses the real backend**, but most pages (products, categories, orders, customers) still read from a **fake "mock" database in the browser**. We explain this in [Section 11](#11-the-frontend-react-spa) and [Section 14](#14-troubleshooting--gotchas).

---

## 2. Table of Contents

1. [What Is Lumen?](#1-what-is-lumen)
2. [Table of Contents](#2-table-of-contents)
3. [The Big Picture](#3-the-big-picture)
4. [A Day in the Life: One HTTP Request End-to-End](#4-a-day-in-the-life-one-http-request-end-to-end)
5. [Understanding the Backend (Express + TypeScript)](#5-understanding-the-backend-express--typescript)
6. [Databases 101 (from zero)](#6-databases-101-from-zero)
7. [PostgreSQL & Supabase](#7-postgresql--supabase)
8. [Prisma ORM](#8-prisma-orm)
9. [The Database Schema (the 6 Tables)](#9-the-database-schema-the-6-tables)
10. [The Auth System (JWT + bcrypt)](#10-the-auth-system-jwt--bcrypt)
11. [The Frontend (React SPA)](#11-the-frontend-react-spa)
12. [Data Flows in Detail](#12-data-flows-in-detail)
13. [Common Developer Workflows](#13-common-developer-workflows)
14. [Troubleshooting & Gotchas](#14-troubleshooting--gotchas)
15. [Glossary](#15-glossary)
16. [Appendix: Complete Code Reference](#16-appendix-complete-code-reference)

---

## 3. The Big Picture

The root folder `F:\Lumen` holds two sibling projects. This is a **monorepo-style** layout ("mono" = one, "repo" = repository): one git repo, multiple projects.

```
F:\Lumen\
│
├── ARCHITECTURE.md        ← you are here
├── client\                ← FRONTEND (React SPA, port 5173)
│   ├── src\
│   │   ├── main.tsx       ← React entry point (bootstrap)
│   │   ├── App.tsx        ← defines every URL route
│   │   ├── api\client.ts  ← how the client talks to the server
│   │   ├── pages\         ← one React component per screen
│   │   ├── components\    ← shared UI pieces (layouts, etc.)
│   │   ├── stores\        ← Zustand state stores (cart, auth, ...)
│   │   ├── services\dataService.ts  ← LOCALSTORAGE MOCK database
│   │   ├── hooks\         ← (empty folder, unused)
│   │   └── types\index.ts ← shared TypeScript types for API data
│   ├── index.html
│   ├── vite.config.ts     ← dev server + proxy config
│   ├── tailwind.config.ts ← styling framework config
│   └── htmls\             ← 🚫 LEGACY pre-React HTML prototype. NOT USED.
│
└── server\                ← BACKEND (Express API, port 5000)
    ├── prisma\
    │   └── schema.prisma  ← THE database definition (single source of truth)
    ├── src\
    │   ├── index.ts       ← entry: connect DB + seed + start listening
    │   ├── app.ts         ← assembles Express app + routes + middleware
    │   ├── config\        ← environment config + DB connection
    │   ├── lib\prisma.ts  ← the one shared Prisma client (singleton)
    │   ├── middleware\    ← auth, validation, error handling
    │   ├── modules\       ← feature folders (auth, products, orders, ...)
    │   ├── seed\          ← "starter data" scripts
    │   ├── types\         ← shared TS types
    │   └── utils\         ← helper functions
    └── .env.example       ← template for your secret config file
```

### How the two halves talk to each other

```
                    YOUR BROWSER
                         │  user clicks "Products"
                         ▼
┌──────────────────────────────────────────────────┐
│  FRONTEND  (React, port 5173)                    │
│  axios → /api/products?category=electronics       │
└────────────────────┬─────────────────────────────┘
                     │  HTTP request (Vite dev proxy
                     │  forwards /api → :5000)
                     ▼
┌──────────────────────────────────────────────────┐
│  BACKEND  (Express, port 5000)                   │
│  routes → middleware → controller → service      │
│  service → Prisma Client → PostgreSQL (Supabase) │
└──────────────────────────────────────────────────┘
```

During development the frontend runs on **port 5173** (Vite) and the backend on **port 5000**. The frontend sends requests to `/api/...`; Vite's dev **proxy** (a mail-forwarding service) redirects them to `http://localhost:5000/api/...` (configured in `client/vite.config.ts`):

```ts
server: {
  port: 5173,
  proxy: { "/api": { target: "http://localhost:5000", changeOrigin: true } },
},
```

> **Term:** a **proxy** is an intermediary that forwards requests. Thanks to it, frontend code writes `api.get("/products")` and never needs to know the backend's address.

---

## 4. A Day in the Life: One HTTP Request End-to-End

Running example: **a user views the product list, filtered to electronics.**

```
[1] User opens http://localhost:5173/products
      React Router matches URL → renders <ProductsPage />

[2] ProductsPage calls the API layer: api.get("/products?category=electronics&sort=newest")
      (axios writes only "/api..." because baseURL is "/api")

[3] Vite dev proxy sees "/api" → forwards to http://localhost:5000/api/products?...

[4] Express receives it via app.use("/api/products", productRoutes) → matches GET "/"
      Middleware chain first: validate(productQuerySchema, "query") checks the params

[5] Controller → service: productService.findAll(req.query)

[6] Service builds a Prisma filter and queries (SQL sent to Postgres):
      prisma.product.findMany({ where: { status: { not: "inactive" }, category: "electronics" },
                                orderBy, skip, take })  +  prisma.product.count({ where })

[7] Postgres runs the query → Prisma hands back typed objects

[8] Controller wraps the result in the standard envelope:
      res.json({ success: true, data: toApi(result) })
      toApi() renames every "id" key to "_id" (the client's expected contract)

[9] JSON travels back through the proxy → ProductsPage renders product cards
```

What does that JSON actually look like? Here's a real response from `GET /api/products?category=electronics`:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "clx8k2...abc",
        "name": "iPhone 16 Pro Max 256GB Titanium",
        "category": "electronics",
        "brand": "Apple",
        "price": 1099,
        "originalPrice": 1199,
        "stock": 15,
        "status": "active",
        "images": ["https://images.unsplash.com/photo-...?q=80"],
        "specs": { "Display": "6.9-inch Super Retina XDR OLED", "Chipset": "Apple A18 Pro" }
      },
      { "_id": "...", "name": "Samsung Galaxy S24 Ultra", ... }
    ],
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

The `products` array holds the matching products (with `_id` — the `toApi()` trick from [Section 8.7](#87-the-id--id-trick)). The surrounding `total`, `page`, `limit`, `totalPages` are the **pagination envelope** — the client uses these to show "Page 1 of 1" and know when to disable "Next."

That's the whole journey. Now let's zoom into each part.

---

## 5. Understanding the Backend (Express + TypeScript)

### 5.1 What Express is

**Express** is a small, unopinionated web framework for Node.js ("unopinionated" = it doesn't force one structure; *you* organize the code). **Node.js** is the runtime that runs JavaScript/TypeScript outside the browser. **TypeScript** adds types so the compiler catches mistakes before the app runs.

### 5.2 The 5-File Module Pattern

Every feature (`auth`, `products`, `categories`, `orders`, `coupons`, `dashboard`) lives in `server/src/modules/<name>/` and follows the same shape. Think of each feature as a small restaurant:

| File | Restaurant analogy | Job |
|------|-------------------|-----|
| `*.routes.ts` | **Reception desk** | Declares URL + HTTP method → which middleware + controller runs |
| `*.controller.ts` | **Host** | Thin: receives the request, delegates to the service, wraps the reply in the standard envelope |
| `*.service.ts` | **Kitchen chef** | Business logic + all database queries (Prisma) |
| `*.model.ts` | **Menu/recipe card** | Old MongoDB schemas are gone; now just re-exports Prisma's generated types (or bcrypt helpers) |
| `*.validator.ts` | **Maître d'** | Zod schemas that check incoming data is well-formed |

Flow is always: **routes → controller → service → database**.

> Deviations: `coupons` has no service/validator, `dashboard` has no service — their controllers call Prisma directly. The main modules follow the full pattern.

### 5.3 A Concrete Example Traced File-by-File

Let's trace **products** — the fullest example. Think back to the restaurant: a customer orders from the menu (routes), the host seats them (middleware validates their order), takes the ticket (controller), passes it to the kitchen (service), the chef queries the pantry (Prisma → Postgres), and the dish returns plated (response envelope + toApi). Each file plays its role in order.

**`product.routes.ts` (reception desk)** — each line says *"when a request with this method + path arrives, run these middleware in order, then hand to this controller."* Note `GET` is public (anyone can browse) but writes require `protect` (logged in) **and** `authorize("admin")`:

```ts
router.get("/", validate(productQuerySchema, "query"), productController.getAll);
router.get("/:id", productController.getById);
router.post("/", protect, authorize("admin"), validate(createProductSchema), productController.create);
router.patch("/:id", protect, authorize("admin"), validate(updateProductSchema), productController.update);
router.delete("/:id", protect, authorize("admin"), productController.remove);
```

The remaining four files (full source in the [Appendix](#16-appendix-complete-code-reference)):

- **`product.controller.ts` (host)** — thin: calls `productService.findAll(req.query)`, then wraps the result in the **envelope** and runs it through `toApi()`: `res.json({ success: true, data: toApi(result) })`.
- **`product.service.ts` (chef)** — all the brain work: builds a Prisma `where` filter from the query (category, brand, price range, search...), picks an `orderBy` from a sort map, computes pagination, then runs `prisma.product.findMany(...)` **and** `prisma.product.count(...)` in parallel and returns `{ products, total, page, limit, totalPages }`.
- **`product.model.ts` (menu)** — in the MongoDB era this defined the schema. Now Prisma does that, so the file is just a compatibility re-export: `export type { Product as IProduct } from "@prisma/client";`.
- **`product.validator.ts` (maître d')** — `createProductSchema` (with `z.string().min(1)`, `z.number().min(0)`, etc.), `updateProductSchema = createProductSchema.partial()` (all fields optional), and `productQuerySchema` for the `?category=...` query params. Types come free via `z.infer<typeof ...>`.

### 5.4 Middleware Explained

**Middleware** runs *between* the request arriving and the final handler. Think **airport security checkpoints**: each station either lets the passenger through (`next()`) or sends them back with an error. Middleware is just a function: `(req, res, next) => { ... }`.

Lumen's five reusable middleware:

| Middleware | File | What it does |
|------------|------|--------------|
| `asyncHandler` | `middleware/asyncHandler.ts` | Catches errors thrown in `async` controllers and forwards them to the error handler (no try/catch in every controller) |
| `validate` | `middleware/validate.ts` | Checks `req.body` or `req.query` against a Zod schema before the handler runs |
| `protect` | `middleware/auth.ts` | Verifies the JWT in the `Authorization` header; if valid, sets `req.user` |
| `authorize("admin")` | `middleware/auth.ts` | Checks `req.user.role` is allowed; returns 403 if not |
| `errorHandler` | `middleware/errorHandler.ts` | Final safety net — converts any thrown error into a clean JSON error |

**`asyncHandler`** (the invisible workhorse): if an `async` controller throws, that's a *rejected promise* Express wouldn't catch — the server could hang or crash. `asyncHandler` catches it and forwards it via `next(error)` to `errorHandler`:

```ts
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**The error handler** maps Prisma errors to friendly HTTP responses:

| Prisma error code | Meaning | HTTP response |
|-------------------|---------|---------------|
| `P2002` | Unique constraint violated (duplicate email, etc.) | `409` + `"DUPLICATE"` |
| `P2025` | Record not found | `404` + `"NOT_FOUND"` |
| `P2023` | Malformed ID | `400` + `"INVALID_ID"` |
| anything else | Unknown server error | `500` + `"INTERNAL_ERROR"` |

### 5.5 Zod Validation Explained Simply

**Zod** is a TypeScript library for defining schemas — *rules describing what valid data looks like* — and checking data against them:

```ts
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

Read it as: *"an object with an email-shaped string and a non-empty password string."* Send garbage and the API answers:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": { "email": ["Invalid email address"] }
  }
}
```

Two superpowers:

1. **Runtime safety** — it actually inspects data at request time. Anything sent over HTTP is just text; the server must not trust it.
2. **Free TypeScript types** — `z.infer<typeof loginSchema>` yields `{ email: string; password: string }`, so the compiler and the runtime validator can never disagree.

---

## 6. Databases 101 (from zero)

### 6.1 What is a database?

A **database** is a program that *stores data on disk and retrieves it quickly and reliably*. Without one, all data would vanish when the server restarts. Our database, **PostgreSQL** (say "post-gres-Q-L"), stores data in **tables** — grids of rows and columns, like spreadsheet tabs:

```
products table (simplified)
┌───────────────┬────────────────┬───────┬────────┐
│ id            │ name           │ price │ stock  │
├───────────────┼────────────────┼───────┼────────┤
│ abc123        │ iPhone 16 Pro  │ 1099  │ 15     │
│ def456        │ Galaxy S24     │ 999   │ 8      │
│ ghi789        │ Jordan Hoodie  │ 45    │ 24     │
└───────────────┴────────────────┴───────┴────────┘
```

**Row** = one record. **Column** = one property shared by all rows (a field on the "form"). **Primary key** = the column that uniquely identifies each row.

### 6.2 Relational vs Document databases

| | **Relational (SQL)** | **Document (NoSQL)** |
|---|---|---|
| Store | Tables of rows/columns, like spreadsheets | Documents (JSON-like blobs), like folders of forms |
| Query language | **SQL** (Structured Query Language) | Vendor-specific (e.g., MongoDB's syntax) |
| Relationships | Strict, enforced via foreign keys | Flexible, often duplicated data |
| Great at | Consistency, complex queries, transactions | Scaling, flexible schemas |
| Examples | PostgreSQL, MySQL | MongoDB, CouchDB |

> **Term:** **SQL** (Structured Query Language) is the standard language for relational databases. Example: `SELECT * FROM products WHERE price < 50;`

### 6.3 What Lumen uses, and the important correction

Lumen **used to use MongoDB** (document/NoSQL). The recent migration switched it to **PostgreSQL** (relational/SQL) hosted on **Supabase**.

> 🚨 **Please unlearn this:** the migration notes mention "mysql", but **Lumen does NOT use MySQL**. MySQL and PostgreSQL are *two different* SQL databases — like Honda vs Toyota: both cars, not interchangeable parts. **Lumen's database is PostgreSQL, via Supabase.** If you write docs or config, say PostgreSQL/Supabase.

The old code used *documents* with `_id` fields; the new code uses *tables* with columns. That's why you'll see the `id`/`_id` naming dance everywhere — see [Section 8.7](#87-the-id--_id-trick-explained-in-depth).

---

## 7. PostgreSQL & Supabase

### 7.1 What is Supabase?

**Supabase** is a service that hosts **PostgreSQL** databases in the cloud (renting a server instead of buying one). It offers extras — auth, storage, realtime — but **Lumen only uses its Postgres database**.

You connect via a **connection string** (a URL with address, username, and password):

```
postgresql://postgres:YOURPASSWORD@db.abcdefghijk.supabase.co:5432/postgres
└──────────┘  └──────┘ └────────────┘  └───────────────────────┘ └───┘  └───────┘
  protocol      user      password          host (address)        port   db name
```

| Piece | Meaning |
|-------|---------|
| `postgresql://` | The protocol (like `https://` but for databases) |
| `postgres` / `YOURPASSWORD` | Username and password (keep the password secret!) |
| `db.<PROJECT_REF>.supabase.co` | Your hosted database's address (`<PROJECT_REF>` is Supabase's unique project ID) |
| `5432` | PostgreSQL's default **port** — like a door number on the server (how the server knows which service to talk to; HTTP uses port 80, HTTPS uses 443) |
| `postgres` | The name of the database inside the server |

### 7.2 The two connection strings (`DATABASE_URL` vs `DIRECT_URL`)

`.env.example` has two:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

Supabase routes app traffic through a **connection pooler** (a middleman sharing connections, like a call center holding lines). The pooler breaks *administrative* operations like migrations (schema changes). So:

- **`DATABASE_URL`** — used by the running app (through the pooler).
- **`DIRECT_URL`** — used by Prisma *migrations* to talk directly to the database.

The `schema.prisma` only references `DATABASE_URL`; Prisma's migration tooling picks up `DIRECT_URL` automatically.

### 7.3 Why PostgreSQL here?

- **Free tier on Supabase** — a hosted Postgres at zero cost.
- **Relational integrity** — orders really link to users and products; you don't want an order referencing a missing product.
- **JSONB columns** — Postgres supports rigid columns *and* flexible JSON columns, so the MongoDB-era `specs`/`images` data migrated smoothly (JSONB explained in [9.4](#94-what-is-jsonb)).
- **Prima's first-class support** — Prisma works beautifully with PostgreSQL.

---

## 8. Prisma ORM

### 8.1 What is an ORM?

**ORM** = **Object-Relational Mapper** — a *translator* between two worlds:

- **Your TypeScript code** thinks in objects: `product.price`, `order.items`.
- **PostgreSQL** thinks in tables, rows, and SQL text.

You write database operations in TypeScript; Prisma handles the SQL. Analogy: you speak English, the database speaks SQL — Prisma is your **interpreter**, or your kitchen's **ingredient-ordering system**: you write "bring me 20 products, newest first," and Prisma fetches them from the storeroom and hands you typed objects.

**Without ORM** (raw SQL strings + manual mapping — slow and error-prone):

```sql
SELECT * FROM products WHERE category = 'electronics' ORDER BY "createdAt" DESC;
```

**With Prisma** (type-checked, safer):

```ts
const products = await prisma.product.findMany({
  where: { category: "electronics" },
  orderBy: { createdAt: "desc" },
});
```

### 8.2 The `schema.prisma` file — the single source of truth

`server/prisma/schema.prisma` **defines the entire database** in one place. From it, Prisma can (a) generate a typed client and (b) generate migrations to build/alter the real database.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}
```

| Block | Purpose |
|-------|---------|
| `generator` | Which client to produce (the TypeScript client you import) |
| `datasource` | Which engine (`postgresql`) and where (from the `DATABASE_URL` env var) |
| `model` | Defines a table: columns, types, constraints, relations |

Each `model` block describes one table:

```prisma
model Product {
  id       String  @id @default(cuid()) @map("_id")
  name     String
  price    Float
  stock    Int     @default(0)
  ...
}
```

| Annotation | Meaning |
|------------|---------|
| `@id` | This column is the **primary key** (unique row identifier) |
| `@default(cuid())` | If not provided, auto-generate a **cuid** (a random unique string ID) |
| `@map("_id")` | Name the actual Postgres column `_id`, while code uses `id` (see 8.7) |
| `@unique` | No two rows may share this value (e.g., email) |
| `@default(now())` / `@updatedAt` | Auto-fill created time / auto-update on every change |
| `@relation(...)` | Declares a link between two tables |
| `@@map("products")` | Rename the *table* itself (plural lowercase) |
| `@@index(...)` | Add a database **index** (a book-index for fast lookups) |

### 8.3 The generated client

Run `npm run prisma:generate` and Prisma reads `schema.prisma` and produces a typed **generated client**. Lumen shares one instance via `server/src/lib/prisma.ts` (full file in [16.2](#162-src-libprismats-the-singleton)) — a **singleton** (exactly one instance app-wide):

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Why the singleton dance? Dev tools hot-reload code and could create many `PrismaClient` instances, each holding its own database connection pool → leaked connections and crashes. Stashing the client on the global object (`globalThis`) keeps one shared instance. (Analogy: one shared kitchen pass-through window, not 20 drilled through the wall.) In production there's no hot reload, so a fresh client is fine.

### 8.4 Common Prisma queries (with the SQL they become)

| Prisma method | Purpose | Rough SQL |
|---------------|---------|-----------|
| `findUnique({ where: { id } })` | One row by a unique field | `SELECT * FROM ... WHERE id = '...'` |
| `findFirst({ where })` | First matching row | `SELECT * FROM ... WHERE ... LIMIT 1` |
| `findMany({ where, orderBy, skip, take })` | Many rows, sorted/paginated | `SELECT * FROM ... WHERE ... ORDER BY ... LIMIT/OFFSET ...` |
| `count({ where })` | Count matching rows | `SELECT COUNT(*) FROM ... WHERE ...` |
| `create({ data })` / `createMany({ data })` | Insert one / many rows | `INSERT INTO ...` |
| `update({ where, data })` | Update one row | `UPDATE ... SET ... WHERE ...` |
| `delete({ where })` | Delete one row | `DELETE FROM ... WHERE ...` |
| `$transaction(async (tx) => { ... })` | All-or-nothing batch | `BEGIN; ... COMMIT;` / `ROLLBACK;` |

**The four workhorse options:**

| Option | Meaning | Used for |
|--------|---------|----------|
| `where` | Filter which rows | "only active products" |
| `orderBy` | Sort order | "newest first" |
| `skip` / `take` | Pagination (skip N, take M) | "page 2, 20 per page" |
| `include` / `select` | Pull in related rows / pick columns | "order with items", "just name + email" |

Lumen's product listing uses all of them:

```ts
prisma.product.findMany({
  where: { status: { not: "inactive" }, category: "electronics" },
  orderBy: { createdAt: "desc" },
  skip: (page - 1) * limit,
  take: limit,
});
```

### 8.5 Debugging Prisma queries

When things go wrong, you'll want to see the **actual SQL** Prisma sends to Postgres. Enable query logging in `src/lib/prisma.ts`:

```ts
export const prisma = new PrismaClient({ log: ["query"] });
```

In development, every Prisma call now prints the raw SQL in the server terminal. You can also inspect data directly in the **Supabase dashboard** — open your project, go to **Table Editor**, and browse any table to see what's actually stored. This is the fastest way to verify whether data exists, check a column's value, or spot a seeding issue.

### 8.6 Transactions: all-or-nothing

A **transaction** groups operations so they all succeed or all roll back — like a recipe batch: if the soufflé fails, you toss the whole batch. Lumen's order creation is the classic case ([12.3](#123-flow-3--order-creation-the-transaction)): it must *decrement stock* AND *create the order* AND *create line items*. If any step fails, everything undoes — no half-created orders or phantom stock deductions.

```ts
return prisma.$transaction(async (tx) => {
  // read products, check stock, decrement stock
  // create order + items
  // any throw → everything rolls back
});
```

Inside the callback you use `tx` (the transaction client) instead of `prisma`, so every operation joins the same batch.

### 8.7 The `id` → `_id` trick (explained in depth)

The most confusing-looking thing in the codebase — a **compatibility bridge** from the MongoDB migration.

**The history:**
1. The old app used MongoDB, whose primary key is named `_id` (leading underscore).
2. The whole client and its types were built around `product._id`, `order._id`, etc.
3. Prisma rule: **field names may not start with an underscore** — `_id` is illegal as a field name.

**The solution — three layers:**

```
Layer 1:  Prisma schema →  field named "id", but the real Postgres column is "_id"
                             id String @id @default(cuid()) @map("_id")

Layer 2:  Postgres      →  the actual column is literally "_id" (via @map)

Layer 3:  toApi()       →  when sending JSON, rename every "id" key back to "_id"
```

The key's journey through one product:

```
Prisma code:       product.id            (what TypeScript says)
      │  @map("_id") maps field → column
      ▼
Postgres column:   _id                   (what the database calls it)
      │  Prisma reads it back as "id"
      ▼
Prisma code:       product.id            (still "id" in TS)
      │  toApi() renames the key on the way out
      ▼
JSON to browser:   "_id": "cm8..."       (what the client expects)
```

The `toApi()` helper recursively renames `id` → `_id` through the whole response — including arrays and nested objects (full source in [16.8](#168-utilities)):

```ts
if (Array.isArray(value)) return value.map((item) => toApi(item));
const result = {};
for (const [key, val] of Object.entries(value)) {
  result[key === "id" ? "_id" : key] = toApi(val);
}
```

**The payoff:** the client never had to change its `_id`-based types — zero frontend breakage during the DB migration.

> **Remember:** in the database and Prisma code it's `id`; in API JSON and the client it's `_id`. Mixing them up is the #1 "why is this undefined?" bug right now.

### 8.8 Prisma error codes

When a Prisma operation fails, it throws an error with a code; the error handler translates them ([5.4](#54-middleware-explained)):

| Code | When it happens | Example |
|------|-----------------|---------|
| `P2002` | Unique constraint violation | registering with an existing email |
| `P2025` | Record to update/delete wasn't found | deleting a nonexistent product id |
| `P2023` | Invalid ID format | passing `"hello"` where a cuid was expected |

---

## 9. The Database Schema (the 6 Tables)

Full `schema.prisma` is in the [Appendix](#161-prismaschemaprisma-full).

### 9.1 The relational diagram

```
┌─────────────┐     1    N   ┌─────────────┐     1    N   ┌─────────────────┐
│    users    │─────────────►│   orders    │─────────────►│   order_items   │
├─────────────┤              ├─────────────┤              ├─────────────────┤
│ id (_id)    │  customerId  │ id (_id)    │  orderId     │ id (_id)        │
│ name,email  │  (FK)        │ orderNumber │  (FK)        │ orderId  (FK)   │
│ password    │              │ customerId→ │              │ productId  (FK) │
│ role        │              │ subtotal/   │              │ name,price      │
└─────────────┘              │ tax/ship/   │              │ quantity,image  │
                             │ discount    │              └────────┬────────┘
                             │ total       │                       │ productId (FK)
                             │ status,addr │                       ▼
                             └──────┬──────┘               ┌─────────────┐
                                    │ category slug        │  products   │
        ┌─────────────┐             │ (string, no FK)      ├─────────────┤
        │ categories  │◄────────────┘                      │ id (_id)    │
        ├─────────────┤                                    │ name,category│
        │ id (_id)    │                                    │ price,stock  │
        │ slug (uniq) │                                    │ status       │
        │ name,icon   │                                    │ images (JSONB)
        └─────────────┘                                    │ specs (JSONB) │
        ┌─────────────┐                                    └─────────────┘
        │  coupons    │
        ├─────────────┤
        │ id (_id)    │
        │ code (uniq) │
        │ discount%   │
        │ isActive    │
        └─────────────┘
```

### 9.2 Each table, friendly-style

**users** — everyone who logs in: customers *and* admins.

| Column | Type | Notes |
|--------|------|-------|
| `id` (`_id`) | String | primary key, auto cuid |
| `name` | String | display name |
| `email` | String | **unique**, used for login |
| `password` | String | **bcrypt hash** — never plain text (Section 10) |
| `phone` | String | default `""` |
| `role` | String | `"customer"` or `"admin"` (default `"customer"`) |
| `storeName`, `category` | String? | admin extras (nullable) |
| `createdAt` / `updatedAt` | DateTime | auto timestamps |

**categories** — the store's departments (Electronics, Fashion, ...).

| Column | Type | Notes |
|--------|------|-------|
| `id` (`_id`) | String | primary key |
| `slug` | String | **unique**, URL-friendly name (`electronics`) |
| `name` | String | display name |
| `icon`, `description` | String | UI icon name + marketing text |

**products** — the items for sale.

| Column | Type | Notes |
|--------|------|-------|
| `id` (`_id`) | String | primary key |
| `name` | String | |
| `category` | String | ⚠️ a *slug string*, NOT a foreign key (see 9.3) |
| `brand` | String | default `"Lumen"` |
| `price`, `originalPrice` | Float | current + strikethrough price |
| `stock` | Int | quantity on hand |
| `status` | String | `"active"` / `"out_of_stock"` / `"inactive"` |
| `rating`, `reviewsCount` | Float/Int | display stars |
| `arrival`, `isSale` | Boolean | "New!" / "On sale!" badges |
| `images` | **Json (JSONB)** | array of image URLs |
| `description` | String | |
| `specs` | **Json (JSONB)** | key/value spec sheet: `{"Display": "6.9-inch OLED"}` |
| `createdAt` / `updatedAt` | DateTime | |

**coupons** — discount codes.

| Column | Type | Notes |
|--------|------|-------|
| `id` (`_id`) | String | primary key |
| `code` | String | **unique**, e.g. `LUMEN10` |
| `discountPercent` | Float | `10` = 10% off |
| `isActive` | Boolean | enables/disables the code |

**orders** — one row per customer checkout.

| Column | Type | Notes |
|--------|------|-------|
| `id` (`_id`) | String | primary key |
| `orderNumber` | String | **unique**, human-friendly like `LMN-123456` |
| `customerId` | String | **FK** → `users.id` |
| `subtotal`, `tax`, `shipping`, `discount`, `total` | Float | the money math |
| `paymentMethod` | String | e.g. `"Cash on Delivery"` |
| `status` | String | `Pending` → `Confirmed` → `Preparing` → `Shipped` → `Completed` / `Cancelled` |
| `address` | String | delivery address |
| `couponUsed`, `orderNotes` | String? | applied code + free-text note |

**order_items** — the line items inside an order (a "join table").

| Column | Type | Notes |
|--------|------|-------|
| `id` (`_id`) | String | primary key |
| `orderId` | String | **FK** → `orders.id` |
| `productId` | String | **FK** → `products.id` |
| `name`, `price`, `image` | | a *snapshot* of the product at purchase time |
| `quantity` | Int | how many |

### 9.3 Relationships in plain English

- **users 1—N orders**: one user has many orders (`orders.customerId` points at a user).
- **orders 1—N order_items**: one order contains many line items.
- **products 1—N order_items**: one product appears in many order items.
- **categories ⇄ products = loosely coupled**: `products.category` is a **string slug**, not a **foreign key**. A **foreign key** is a column referencing another table's primary key that the database *enforces*; here nothing enforces that the slug exists. It's a "by convention" link.
- **Snapshot behavior**: each order item copies `name`/`price`/`image` at purchase time, so old orders still show what the customer actually paid even if the product changes later.

### 9.4 What is JSONB?

`images` and `specs` are typed `Json` in the schema; Postgres stores those as **JSONB** ("JSON Binary"). Think **flexible storage drawers**: normal columns are rigid drawers (a `price` drawer holds numbers, period), JSONB drawers hold *anything* — nested objects, arrays, free-form shapes, no schema required.

That's why they fit so well: `specs` (every product's spec sheet is a different shape) and `images` (an array of image URLs of any length). JSONB is stored in an optimized binary format (you can even query inside it) — and it's exactly the bridge that let the MongoDB-era documents migrate so smoothly.

---

## 10. The Auth System (JWT + bcrypt)

**Authentication** answers *"who are you?"* **Authorization** answers *"are you allowed to do this?"* Lumen handles both with **bcrypt** (passwords) and **JWT** (login sessions).

### 10.1 bcrypt — password hashing, from zero

Storing plain-text passwords is a catastrophe. Instead we store a **hash** — a one-way scramble: `"password123"` → `"$2a$12$4Fv0PcTk...garbled"`.

- **One-way:** you can't reverse a hash. Even if the DB leaks, attackers get garbage.
- **Same input → same output:** to check a login, hash the candidate and compare.
- **Salt + work factor:** bcrypt adds a random "salt" (extra data) so identical passwords produce different hashes; the `12` is the work factor (more rounds = slower = harder to brute-force).

```ts
import bcrypt from "bcryptjs";
export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 12);
export const comparePassword = (candidate: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(candidate, hashed);
```

### 10.2 JWT — the stamped hand

**JWT** = **JSON Web Token** — proof that "this person already logged in," without asking for the password on every request.

**Analogy — festival wristbands:**
1. At the gate you show ID + ticket (email + password). ✅
2. Security stamps your hand (the server *signs* a JWT with your identity and expiry).
3. Every stage you enter, you flash the band (the client sends the JWT in the `Authorization` header).
4. When the band expires (7 days here), back to the gate.

A JWT is three base64 parts separated by dots:

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImNtOCIsInJvbGUiOiJhZG1pbiJ9.s0meS1gn4tur3
└────────┬────────┘ └─────────┬─────────┘ └─────────┬────────┘
      header              payload            signature
   (algorithm)         (claims: id,       (proves it's
                       role, exp)          genuine)
```

- **Header** — how it was signed.
- **Payload** — the *claims*: `id`, `role`, expiry. Lumen signs `{ id, role }` with a 7-day expiry.
- **Signature** — a secret fingerprint. The server re-computes it from header+payload using `JWT_SECRET`. Tamper with the payload and the signature won't match → rejected. (Clients can *read* the payload — it's just base64 — but can't *forge* it.)

```ts
export function signToken(id: string, role: "customer" | "admin"): string {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });
}
```

### 10.3 The full auth flow

```
REGISTER → POST /api/auth/register {name, email, password, phone}
   → [validate] Zod checks the body
   → [auth.controller] → authService.registerUser
      1. check email not taken (prisma.user.findUnique)
      2. hashPassword(password)          (bcrypt, 12 rounds)
      3. prisma.user.create({...})       (save user w/ hashed password)
      4. signToken(user.id, "customer")  (make JWT)
   → Response: { success: true, data: { user: {...}, token } }

CLIENT STORES THE TOKEN → { user, token } persisted to localStorage ("lumen-auth")

EVERY LATER REQUEST → axios adds "Authorization: Bearer <token>"
   → [protect]: jwt.verify(token, JWT_SECRET)
       valid   → req.user = { id, role } → next()
       invalid → 401 "Invalid or expired token"
   → [authorize("admin")]: role check → next() or 403 "Insufficient permissions"
   401 → axios response interceptor auto-logs the user out.
```

### 10.4 The middleware, annotated

```ts
// protect: "are you wearing a valid wristband?"
export function protect(req: RequestWithUser, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next(new AppError("Not authenticated", 401, "UNAUTHORIZED"));
  try {
    req.user = jwt.verify(authHeader.split(" ")[1], config.jwtSecret) as JwtPayload;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, "TOKEN_INVALID"));
  }
}

// authorize: "does your band say staff?"  (a factory — returns middleware)
export function authorize(...roles: string[]) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Not authenticated", 401, "UNAUTHORIZED"));
    if (!roles.includes(req.user.role)) return next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
    next();
  };
}
```

- `protect` decodes the JWT and sets `req.user` (typed via `RequestWithUser` in `src/types/request.ts`).
- `authorize(...roles)` is a **factory** — it *returns* middleware, so routes call it as `authorize("admin")`.

### 10.5 Demo accounts (seeded)

| Role | Email | Password |
|------|-------|----------|
| customer | `alex.morgan@lumen.com` | `password123` |
| admin | `admin@lumen.com` | `password123` |

---

## 11. The Frontend (React SPA)

### 11.1 What a React SPA is

**SPA** = **Single Page Application**. The browser loads ONE HTML page; JavaScript takes over. As the user clicks, React swaps content without full page reloads. **React Router** reads the URL and renders the matching component — navigation is client-side, not server-side.

### 11.2 The bootstrap: `main.tsx`

```tsx
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

Three wrappers, three jobs:
- **`BrowserRouter`** — client-side routing.
- **`QueryClientProvider`** — react-query, a data-fetching library. ⚠️ **Installed but UNUSED** — there are zero `useQuery`/`useMutation` calls anywhere. It's "future-ready" scaffolding; don't be confused.
- **`StrictMode`** — React's dev-mode safety double-renderer.

### 11.3 The routing table (`App.tsx`)

```
URL                         Component                 Layout          Access
──────────────────────────────────────────────────────────────────────────────
/login                      <LoginPage />             (none)          public
/admin/login                <AdminLoginPage />        (none)          public
/                           <HomePage />              PublicLayout    public
/products                   <ProductsPage />          PublicLayout    public
/product/:id                <ProductDetailPage />     PublicLayout    public
/cart                       <CartPage />              PublicLayout    public
/checkout                   <CheckoutPage />          PublicLayout    public
/admin                      <AdminDashboardPage />    AdminLayout     admin only*
/admin/products             <AdminProductsPage />     AdminLayout     admin only*
/admin/categories           <AdminCategoriesPage />   AdminLayout     admin only*
/admin/orders               <AdminOrdersPage />       AdminLayout     admin only*
/admin/customers            <AdminCustomersPage />    AdminLayout     admin only*
* anything else             → redirect to "/"
```

Key ideas:

- **Layouts** are parent routes wrapping child routes with shared chrome (header/footer/sidebar). `PublicLayout` wraps the storefront; `AdminLayout` wraps the admin pages.
- **`ProtectedAdminRoute`** is a client-side guard: reads the auth store; if there's no admin user, `<Navigate to="/admin/login" replace />`. (Real security is the server's `protect` + `authorize`.)
- `:id` in `/product/:id` is a **URL parameter**, read via `useParams()`.

### 11.4 The API client (`api/client.ts`)

One axios instance, configured once (full source in [16.11](#1611-client-srcapiclientts-full)):

```ts
const api = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) useAuthStore.getState().logout();
  return Promise.reject(error);
});
```

- **`baseURL: "/api"`** — `api.get("/products")` becomes `GET /api/products` → proxied to `:5000`.
- **Request interceptor** — an **interceptor** is a hook on every request/response. This one automatically attaches `Authorization: Bearer <token>`, so call sites never handle tokens manually.
- **Response interceptor** — on a 401 (expired/invalid token), auto-log-out: the "wristband expired" moment.

### 11.5 Zustand stores (`stores/`)

**Zustand** is a tiny React state-management library. A **store** = state + actions that any component can read. Lumen has four:

| Store | File | Holds | Talks to | Persisted as |
|-------|------|-------|----------|--------------|
| `auth` | `stores/auth.store.ts` | user + token | **REAL backend API** ✅ | `lumen-auth` |
| `cart` | `stores/cart.store.ts` | cart items | localStorage only | `lumen-cart` |
| `theme` | `stores/theme.store.ts` | light/dark mode | localStorage only | `lumen-theme` |
| `wishlist` | `stores/wishlist.store.ts` | saved product ids | localStorage only | `lumen-wishlist` |

**Persistence:** the `persist` middleware saves each store to `localStorage` (browser key/value storage that survives reloads), so a cart survives refresh.

The auth store is the *only* one calling the real backend:

```ts
login: async (email, password) => {
  const res = await api.post<{ success: true; data: AuthResult }>("/auth/login", { email, password });
  const { user, token } = res.data.data;
  set({ user, token, isAuthenticated: true });
},
```

### 11.6 The mock data layer: `services/dataService.ts`

The big current-state truth: most of the client **does not talk to the real backend** for products/categories/orders/customers. It uses a **mock database** — a 561-line class that fakes a database with `localStorage`. Think **training restaurant**: the front-of-house (UI) runs the exact same routines, but the kitchen is cardboard props (localStorage) instead of the real kitchen (Postgres).

| Mock collection | localStorage key |
|-----------------|------------------|
| products | `lumen_products_v2` |
| categories | `lumen_categories_v2` |
| orders | `lumen_orders_v2` |
| customers | `lumen_customers_v2` |

Its API mirrors what the real backend returns: `getProducts()`, `getProductById(id)`, `addProduct()`, `updateProduct()`, `deleteProduct()`, `getCategories()`, `getOrders()`, `addOrder()`, `updateOrderStatus()`, `getCustomers()`.

**The migration state at a glance:**

```
┌─────────────────────────────────────────────────────────────┐
│                    MIGRATION STATUS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ DONE          Auth (login / register / admin login)     │
│                   → hits real /api/auth/* endpoints          │
│                   → server-side bcrypt + JWT working         │
│                                                             │
│  🟡 NEXT UP       Products, Categories, Orders, Customers  │
│                   → server endpoints fully built + tested   │
│                   → client pages still use localStorage mock │
│                   → connect these pages to real API          │
│                                                             │
│  ✅ BY DESIGN     Cart, Wishlist, Theme                     │
│                   → localStorage is correct (per-browser)   │
│                   → no migration needed                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

So an admin "creating a product" writes to *this browser's* localStorage, not Postgres — different browsers see different data! The server already has `/api/products`, `/api/categories`, `/api/orders`, `/api/dashboard` fully implemented; migrating each admin page to them is the natural next step.

### 11.7 The client types

`client/src/types/index.ts` defines API data shapes — using `_id` everywhere to match the server's `toApi()` contract:

```ts
export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  ...
  specs: Record<string, string>;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: { _id: string; name: string; email: string };
  items: OrderItem[];
  ...
}
```

---

## 12. Data Flows in Detail

### 12.1 Flow 1 — Product listing request

Already traced step-by-step in [Section 4](#4-a-day-in-the-life-one-http-request-end-to-end). The one-line version:

```
ProductsPage → api.get("/products?category=electronics")
  → axios → Vite proxy → Express route
  → validate(query) → controller → service
  → prisma.product.findMany + count   (SQL to Postgres)
  → toApi() → JSON → browser → render cards
```

### 12.2 Flow 2 — Authentication (register/login → JWT → protected request)

Full detail in [Section 10.3](#103-the-full-auth-flow). The compact version:

```
REGISTER → service: check email unique → bcrypt hash → prisma.user.create → signToken
LOGIN    → service: prisma.user.findFirst({email, role}) → bcrypt.compare
           (mismatch = 401) → signToken
   both return { success: true, data: { user, token } }

PROTECTED REQUEST → axios adds "Authorization: Bearer <token>"
   → [protect] jwt.verify → req.user = {id, role}
   → [authorize("admin")] role check → controller → service → prisma
```

### 12.3 Flow 3 — Order creation (the `$transaction`)

`orderService.createOrder(input, customerId)` runs everything inside `prisma.$transaction`:

```
prisma.$transaction(async (tx) => {
  │
  ├─ 1. Fetch all cart products: tx.product.findMany({ where: { id: { in: productIds } } })
  │
  ├─ 2. For each cart item:
  │      • product exists?  else throw 404   • stock >= qty?  else throw 400
  │      • add price*qty to subtotal
  │      • tx.product.update({ data: { stock: { decrement: qty } } })
  │        → flip status to "out_of_stock" when stock hits 0
  │
  ├─ 3. Money: shipping = subtotal >= 100 ? 0 : 12.00
  │      tax = 8% · discount = valid coupon? calcDiscount(...) : 0
  │      total = subtotal + tax + shipping - discount
  │
  ├─ 4. tx.order.create({ data: { orderNumber: "LMN-" + random, customerId, ...,
  │          items: { createMany: { data: orderItems } } },
  │          include: { items: { include: { product: true } } } })
  │
  └─ 5. If ANYTHING threw → whole batch ROLLS BACK:
         no order, no items, stock restored. (No half-created orders.)
});
```

Note the **snapshot**: each `OrderItem` copies `name`/`price`/`image` at purchase time, so old orders always reflect what the customer paid. And `createMany` inserts all line items in one efficient statement.

### 12.4 Flow 4 — Startup and seeding

On boot, `src/index.ts` runs a strict sequence:

```
server/src/index.ts → start()
  │
  ├─ 1. await connectDB()        → prisma.$connect()  (check Postgres reachable)
  ├─ 2. await seedCategories()   → if empty, insert 6 categories
  ├─ 3. await seedProducts()     → if empty, insert ~20 products
  ├─ 4. await seedCoupons()      → if empty, insert LUMEN10/LUMEN20/FREESHIP
  ├─ 5. await seedDefaultUsers() → if empty, create demo users
  └─ 6. app.listen(5000)         → "Lumen API running on http://localhost:5000"
```

**Seeding** = pre-loading starter data so the app is usable immediately (like pre-stocking the pantry and pre-printing menus). Every seed function is **idempotent** — it checks "is this already there?" before inserting, so re-running is always safe. Order matters: products reference category slugs; demo users need slow bcrypt, so they go last. The same sequence runs standalone via `npm run db:seed`.

---

## 13. Common Developer Workflows

### 13.1 Setup from scratch (fresh clone)

```
1. Copy server/.env.example → server/.env
     fill in DATABASE_URL + DIRECT_URL from Supabase; set JWT_SECRET to a random string
2. Server:   cd server && npm install && npm run prisma:generate && npm run db:push && npm run db:seed
3. Client:   cd client && npm install
4. Two terminals:
     Terminal A: cd server && npm run dev      # API on :5000
     Terminal B: cd client && npm run dev      # UI on  :5173
     → open http://localhost:5173 → log in as admin@lumen.com / password123
```

### 13.2 Running things day-to-day

| Task | Command (in the right folder) | Notes |
|------|-------------------------------|-------|
| Run the API (dev) | `npm run dev` (server) | `tsx watch` — restarts on save |
| Run the UI (dev) | `npm run dev` (client) | Vite dev server + proxy |
| Type-check | `npm run typecheck` (either) | `tsc --noEmit` |
| Build | `npm run build` (either) | server → `dist/`; client → `tsc -b && vite build` |
| Lint | `npm run lint` | ⚠️ **BROKEN (server and client)** — see [Section 14](#14-troubleshooting--gotchas) |
| Regenerate Prisma client | `npm run prisma:generate` | after editing `schema.prisma` |
| Create/apply a migration | `npm run prisma:migrate` | `prisma migrate dev` |
| Push schema without migration files | `npm run db:push` | direct sync |
| Seed the database | `npm run db:seed` | standalone seed runner |
| Start built server | `npm start` (server) | runs `dist/index.js` |

### 13.3 Recipe: add a new endpoint (e.g., `GET /api/products/popular`)

Follow the 5-file pattern:

**Step 1 — Validator** (`product.validator.ts`): add a schema if you need query params. For a simple endpoint, skip this.

**Step 2 — Service** (`product.service.ts`): add the logic + Prisma call:

```ts
async findPopular() {
  return prisma.product.findMany({
    where: { status: "active", isSale: true },
    orderBy: { rating: "desc" },
    take: 8,
  });
}
```

**Step 3 — Controller** (`product.controller.ts`): thin handler wrapping the result:

```ts
getPopular: asyncHandler(async (_req, res) => {
  const products = await productService.findPopular();
  res.json({ success: true, data: toApi(products) });
}),
```

**Step 4 — Route** (`product.routes.ts`): wire it. ⚠️ Put `/popular` **before** `/:id`, or Express treats "popular" as an id:

```ts
router.get("/popular", productController.getPopular);   // ← must come first
router.get("/:id", productController.getById);
```

**Step 5 — Test:** with the server running, open `http://localhost:5000/api/products/popular` — you should see the `{ success: true, data: [...] }` envelope. Then optionally call it from the client via `api.get("/products/popular")`.

### 13.4 When you change the database

```
1. Edit prisma/schema.prisma (add a column, table, index...)
2. npm run prisma:generate   # regenerate types
3. Choose one:
   • npm run prisma:migrate  # migration file + apply (best practice)
   • npm run db:push         # quick sync, no migration history
```

---

## 14. Troubleshooting & Gotchas

The traps you'll actually hit:

**1. `npm run lint` fails — on BOTH the server and the client.** The scripts exist but **eslint isn't installed** as a dependency in either project → *"eslint: command not found."* Known broken scripts. Either install eslint (add to devDependencies + a config file) or rely on `npm run typecheck` instead.

**2. Missing `.env` = mysterious failures.** `config/env.ts` loads `server/.env` and falls back to defaults — `postgresql://localhost:5432/lumen` (probably nonexistent) and a public `jwtSecret: "fallback-secret"` (an auth vulnerability). Always create `.env` from `.env.example`.

**3. react-query is installed but unused.** `QueryClientProvider` wraps the app, but there are zero `useQuery`/`useMutation` calls. Don't hunt for react-query-powered fetching — there is none yet.

**4. `node_modules` can be stale after the migration.** The MongoDB→Prisma migration changed package versions. On weird "cannot find module `@prisma/client`" or leftover Mongoose errors: delete `server/node_modules` and `package-lock.json`, re-run `npm install`.

**5. The two importer conventions.** On the **server**, imports need **`.js` extensions even though the files are `.ts`**:

```ts
import { connectDB } from "./config/db.js";  // ← yes, .js on a .ts file!
```

Why: `tsconfig.json` uses `"module": "NodeNext"` (ESM rules — Node requires real extensions; TypeScript resolves `./db.js` → `./db.ts` at compile time). Forget it and you get "module not found" at runtime. On the **client**, imports are extensionless (`./pages/HomePage`) because Vite handles resolution. Match whichever folder you're in.

**6. Remember the `id` vs `_id` split.** Database + Prisma code: `id`. API responses + client: `_id` (via `toApi()`). This is the #1 source of "why is this undefined?" bugs during the migration.

**7. `client/htmls/` is dead code.** The pre-React static HTML prototype. Not used by the running app. Don't edit it or get confused by the duplicated-looking pages.

**8. Mock data looks real but isn't shared.** Products/categories live in each browser's localStorage, so different browsers see different data. "I added a product but it's gone" usually means a different browser/profile.

**9. `dist/` folders are build output.** `client/dist/` and `server/dist/` are generated. Never edit them.

**10. Route order matters in Express.** Routes match top-to-bottom. A dynamic param route (`/:id`) placed before a specific route (`/popular`) swallows it. Specific routes first.

---

## 15. Glossary

> **Start here** — if you're new, focus on these five first: **ORM**, **Prisma**, **schema**, **migration**, **seed**. The rest you'll pick up as you go.

| Term | Definition |
|------|------------|
| **API** | The set of URLs the backend exposes for the frontend (or anyone) to call. |
| **bcrypt** | Password-hashing library. Hashing = one-way scrambling; salts make it safe even if the DB leaks. |
| **controller** | Thin module layer: takes the checked request, calls the service, returns the enveloped response. |
| **cuid** | A generated unique ID string used for primary keys. |
| **envelope** | The standard response shape `{ success, data }` or `{ success, error }`. |
| **environment variable** | A named value stored outside the code (in `.env`), e.g. `JWT_SECRET`. Keeps secrets out of the repo. |
| **Express** | A minimal web framework for Node.js used to build Lumen's HTTP server. |
| **foreign key** | A column referencing another table's primary key, creating an enforced relationship. |
| **idempotent** | Safe to repeat with the same result. Lumen's seeds are idempotent. |
| **index** | A database lookup aid (like a book's index) that speeds up queries. `@@index(...)`. |
| **interceptor** | A hook running automatically on every request/response. Lumen's axios interceptor injects the JWT. |
| **JSONB** | PostgreSQL's flexible JSON column type — structured data of any shape. |
| **JWT** | JSON Web Token — a signed, self-contained token proving a user already logged in. A festival wristband. |
| **localStorage** | The browser's persistent key/value storage. Used for cart/theme/wishlist and the mock database. |
| **middleware** | Functions running between receiving a request and the final handler — airport security checkpoints. |
| **migration** | A script that changes the database schema (add table/column) in a tracked, repeatable way. |
| **mock data** | Fake data standing in for real data. Lumen's `dataService` is a localStorage-backed mock. |
| **model** | In Prisma, one `model` block = one table. Lumen's old model files now re-export Prisma types. |
| **ORM** | Object-Relational Mapper — a translator between your language's objects and database tables/SQL. Prisma is an ORM. |
| **PostgreSQL** | A powerful open-source relational (SQL) database. Lumen's database, hosted on Supabase. |
| **primary key** | The column uniquely identifying each row. Lumen's is `id`, mapped to `_id`. |
| **Prisma** | Lumen's ORM. Define `schema.prisma`, run `prisma generate`, get a type-safe database client. |
| **proxy** | An intermediary that forwards requests. Vite's dev proxy sends `/api/*` to the server. |
| **query param** | The `?key=value` part of a URL used to filter/sort/paginate. |
| **route** | A URL + HTTP method pairing mapped to middleware and a controller. |
| **seed / seeding** | Pre-loading a database with starter data (demo users, products, coupons). |
| **service** | The business-logic layer of a module; owns all Prisma queries. |
| **singleton** | A pattern ensuring one shared instance (e.g., the single `PrismaClient`). |
| **SPA** | Single Page Application — loads once, rewrites content via JavaScript. |
| **SQL** | Structured Query Language — the standard language for relational databases. |
| **Supabase** | The cloud provider hosting Lumen's PostgreSQL. Only its Postgres is used. |
| **transaction** | A group of database operations that all succeed or all roll back (all-or-nothing). |
| **Zod** | A TypeScript validation library: runtime checks + inferred types from one schema. |
| **Zustand** | A small React state-management library. Lumen's stores use it. |

---

## 16. Appendix: Complete Code Reference

### 16.1 `prisma/schema.prisma` (full)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

// Prisma forbids field names starting with "_", so the API-facing primary key
// is named `id` in the client while the Postgres column is mapped to `_id`.
// A `toApi` serializer re-exposes it as `_id` in JSON responses.

model User {
  id        String   @id @default(cuid()) @map("_id")
  name      String
  email     String   @unique
  password  String
  phone     String   @default("")
  role      String   @default("customer") // "customer" | "admin"
  storeName String?
  category  String?
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Category {
  id          String   @id @default(cuid()) @map("_id")
  slug        String   @unique
  name        String
  icon        String   @default("category")
  description String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("categories")
}

model Product {
  id           String   @id @default(cuid()) @map("_id")
  name         String
  category     String
  brand        String   @default("Lumen")
  price        Float
  originalPrice Float   @default(0)
  stock        Int      @default(0)
  status       String   @default("active") // "active" | "out_of_stock" | "inactive"
  rating       Float    @default(0)
  reviewsCount Int      @default(0)
  arrival      Boolean  @default(false)
  isSale       Boolean  @default(false)
  images       Json     @default("[]")
  description  String   @default("")
  specs        Json     @default("{}")
  orderItems   OrderItem[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([price, status])
  @@index([category])
  @@index([brand])
  @@map("products")
}

model Coupon {
  id              String   @id @default(cuid()) @map("_id")
  code            String   @unique
  discountPercent Float
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("coupons")
}

model Order {
  id           String      @id @default(cuid()) @map("_id")
  orderNumber  String      @unique
  customerId   String
  customer     User        @relation(fields: [customerId], references: [id])
  items        OrderItem[]
  subtotal     Float
  tax          Float       @default(0)
  shipping     Float       @default(0)
  discount     Float       @default(0)
  total        Float
  paymentMethod String
  status       String      @default("Pending")
  address      String
  couponUsed   String?
  orderNotes   String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([status, createdAt])
  @@index([customerId])
  @@map("orders")
}

model OrderItem {
  id        String  @id @default(cuid()) @map("_id")
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  name      String
  price     Float
  quantity  Int
  image     String  @default("")

  @@map("order_items")
}
```

### 16.2 `src/lib/prisma.ts` (the singleton)

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 16.3 `src/config/env.ts`

```ts
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: process.env.DATABASE_URL || "postgresql://localhost:5432/lumen",
  jwtSecret: process.env.JWT_SECRET || "fallback-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
} as const;
```

### 16.4 `src/config/db.ts`

```ts
import { prisma } from "../lib/prisma.js";

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}
```

### 16.5 `src/index.ts` (server entry point)

```ts
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { seedDefaultUsers } from "./seed/auth.seed.js";
import { seedProducts } from "./seed/product.seed.js";
import { seedCategories } from "./seed/category.seed.js";
import { seedCoupons } from "./seed/coupon.seed.js";
import app from "./app.js";

async function start() {
  await connectDB();

  await seedCategories();
  await seedProducts();
  await seedCoupons();
  await seedDefaultUsers();

  app.listen(config.port, () => {
    console.log(`Lumen API running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
```

### 16.6 `src/app.ts` (Express assembly)

```ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import couponRoutes from "./modules/coupons/coupon.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

app.get("/api", (_req, res) => {
  res.json({ success: true, data: { name: "Lumen API", version: "1.0.0" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: "Route not found", code: "NOT_FOUND" } });
});

app.use(errorHandler);

export default app;
```

### 16.7 Middleware (all five)

**`src/middleware/asyncHandler.ts`:**

```ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**`src/middleware/validate.ts`:**

```ts
import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";

export function validate(schema: ZodSchema, source: "body" | "query" = "body"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = source === "body" ? req.body : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", details));
    }
    if (source === "body") {
      req.body = result.data;
    } else {
      (req as Request & { query: typeof result.data }).query = result.data as Record<string, string>;
    }
    next();
  };
}
```

**`src/middleware/auth.ts`:**

```ts
import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import type { JwtPayload, RequestWithUser } from "../types/request.js";

export function protect(req: RequestWithUser, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, "TOKEN_INVALID"));
  }
}

export function authorize(...roles: string[]) {
  return (req: RequestWithUser, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401, "UNAUTHORIZED"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
    }
    next();
  };
}
```

**`src/middleware/errorHandler.ts`:**

```ts
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        res.status(409).json({
          success: false,
          error: { message: "A record with that value already exists", code: "DUPLICATE" },
        });
        return;
      case "P2025":
        res.status(404).json({
          success: false,
          error: { message: "Record not found", code: "NOT_FOUND" },
        });
        return;
      case "P2023":
        res.status(400).json({
          success: false,
          error: { message: "Invalid ID format", code: "INVALID_ID" },
        });
        return;
    }
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: { message: "Internal server error", code: "INTERNAL_ERROR" },
  });
}
```

### 16.8 Utilities

**`src/utils/toApi.ts`:**

```ts
/**
 * Prisma models use `id` as the primary-key field name (Prisma forbids field
 * names starting with "_"), while the underlying Postgres columns are named
 * `_id` via @map. The API contract with the client is `_id`, so this helper
 * recursively renames the `id` key to `_id` in outgoing JSON payloads.
 */
export function toApi<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => toApi(item)) as T;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key === "id" ? "_id" : key] = toApi(val);
  }
  return result as T;
}
```

**`src/utils/AppError.ts`:**

```ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

**`src/utils/requireFound.ts`:**

```ts
import { AppError } from "./AppError.js";

export function requireFound<T>(doc: T, label: string): Exclude<T, null | undefined> {
  if (doc == null) throw new AppError(`${label} not found`, 404, "NOT_FOUND");
  return doc as Exclude<T, null | undefined>;
}
```

**`src/utils/signToken.ts`** (shown in full in [10.2](#102-jwt--the-stamped-hand)) — signs `{ id, role }` with `JWT_SECRET` and a 7-day expiry.

**`src/utils/calcDiscount.ts`** — `Math.round(subtotal * discountPercent) / 100` (used by the order transaction).

### 16.9 Service layer excerpts

**`src/modules/auth/auth.service.ts` (register):**

```ts
async registerUser(input: RegisterUserInput) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError("Email already registered", 400, "EMAIL_EXISTS");

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password: hashed, phone: input.phone },
  });
  const token = signToken(user.id, "customer");
  return { user: { id: user.id, name: user.name, email: user.email, role: "customer" }, token };
}
```

`loginUser` follows the same shape: `prisma.user.findFirst({ where: { email, role } })`, then `comparePassword(input.password, user.password)` (throws `401 INVALID_CREDENTIALS` on mismatch), then `signToken`.

**`src/modules/products/product.service.ts` (findAll with filters + pagination):**

```ts
async findAll(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = { status: { not: "inactive" } };
  if (query.category) where.category = query.category;
  if (query.brand) where.brand = query.brand;
  if (query.inStock === "true") where.stock = { gt: 0 };
  if (query.onSale === "true") where.isSale = true;
  if (query.minPrice || query.maxPrice) where.price = { ...(query.minPrice ? { gte: query.minPrice } : {}), ...(query.maxPrice ? { lte: query.maxPrice } : {}) };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { brand: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const orderByMap = {
    "price-low": { price: "asc" }, "price-high": { price: "desc" },
    rating: { rating: "desc" }, newest: { createdAt: "desc" },
  } as const;
  const orderBy = orderByMap[query.sort || "newest"];

  const page = query.page || 1;
  const limit = query.limit || 20;
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);
  return { products: items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

**`src/modules/orders/order.service.ts` (the transaction):**

```ts
async createOrder(input: CreateOrderInput, customerId: string) {
  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((i) => i.product);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];
    for (const item of input.items) {
      const product = productMap.get(item.product);
      if (!product) throw new AppError(`Product ${item.product} not found`, 404);
      if (product.stock < item.quantity)
        throw new AppError(`Insufficient stock for ${product.name}`, 400, "INSUFFICIENT_STOCK");
      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product.id, name: product.name, price: product.price,
        quantity: item.quantity, image: (product.images as string[])?.[0] || "",
      });
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: item.quantity },
          ...(product.stock - item.quantity === 0 ? { status: "out_of_stock" } : {}),
        },
      });
    }

    const shipping = subtotal >= 100 ? 0 : 12.0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    let discount = 0;
    if (input.couponCode) {
      const coupon = await tx.coupon.findFirst({ where: { code: input.couponCode.toUpperCase(), isActive: true } });
      if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");
      discount = calcDiscount(subtotal, coupon.discountPercent);
    }
    const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(), customerId,
        items: { createMany: { data: orderItems } },
        subtotal, tax, shipping, discount, total,
        paymentMethod: input.paymentMethod, address: input.address,
        couponUsed: input.couponCode?.toUpperCase(), orderNotes: input.orderNotes,
      },
      include: { items: { include: { product: true } } },
    });
  });
}
```

**`src/modules/products/product.validator.ts` (Zod schemas + inferred types):**

```ts
import { z } from "zod";

const specsSchema = z.record(z.string(), z.string()).optional();

export const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().optional(),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["active", "out_of_stock", "inactive"]).optional(),
  arrival: z.boolean().optional(),
  isSale: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  specs: specsSchema,
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.enum(["true", "false"]).optional(),
  onSale: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  sort: z.enum(["price-low", "price-high", "rating", "newest"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
```

### 16.10 `src/types/request.ts` — `JwtPayload { id, role }` and `RequestWithUser extends Request { user?: JwtPayload }` (a few lines; used by the auth middleware to type `req.user`).

### 16.11 Client: `src/api/client.ts` (full)

```ts
import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

**The response envelope** (every API response follows one of these two shapes — success: `{ "success": true, "data": ... }`, or error: `{ "success": false, "error": { message, code?, details? } }`).

---

*That's the whole tour. You now know what Lumen is, how its two halves fit together, what a database is, what Prisma and Supabase do, how auth works, where the real API ends and the mock data begins, and how to be productive day-to-day. Welcome aboard!*
