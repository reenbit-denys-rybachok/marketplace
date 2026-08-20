# MarketOps LocalCraft

Starter ecommerce pet project:

- `apps/api`: NestJS API with Prisma
- `apps/web`: Next.js storefront/admin starter

PostgreSQL is expected to run locally. Configure the connection string in
`apps/api/.env`.

Default local connection:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/marketops_localcraft?schema=public"
```

If your database name is different, replace `marketops_localcraft` in the URL.
The database must exist before running Prisma migrations.

Product images are uploaded to Cloudinary. Configure these variables in
`apps/api/.env`:

```env
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Start

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
npm install
npm run db:generate
npm run db:migrate
npm run dev:api
npm run dev:web
```

Default local URLs:

- API: `http://localhost:4000`
- Web: `http://localhost:3000`
- Products API: `http://localhost:4000/api/products`
- Product image upload API: `http://localhost:4000/api/uploads/product-image`

## Product Direction

Storefront will follow the clean `LocalCraft Market` direction. Admin will follow the operational `MarketOps` direction.
