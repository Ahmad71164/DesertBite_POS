# Export / Download Full Project

This folder contains the complete **Restaurant Pro ERP & POS (Desert Bite)** source code.

## Create ZIP file (Windows)

Open PowerShell in **this project folder** (where `package.json` is) and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\create-zip.ps1
```

The zip will be created here:

```
restaurant-pro-erp-pos-complete.zip
```

Full path example:

```
C:\Users\Administrator\.cursor\projects\C-Users-ADMINI-1-AppData-Local-Temp-84be1a2a-1953-4aa6-9ad9-bba9a81edb11\restaurant-pro-erp-pos-complete.zip
```

Copy that file to USB, Google Drive, or share as needed.

## What is included in the ZIP

```
restaurant-pro-erp-pos/
├── apps/
│   ├── api/                 # Backend (Express + Prisma + SQLite)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── menu-data.ts  # Full Desert Bite menu (138+ items)
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── server.ts     # All API routes
│   │       └── seed-menu.ts
│   └── web/                 # Frontend (React + Vite)
│       └── src/
│           ├── App.tsx
│           ├── components/POS.tsx
│           ├── pages/        # Orders, Kitchen, Tables, etc.
│           └── styles.css
├── packages/shared/         # Shared types & calculations
├── package.json
├── README.md
├── setup.ps1
├── fix-db.ps1
└── create-zip.ps1
```

## What is NOT included (by design)

- `node_modules/` — run `npm install` after extracting
- `.git/` — version history
- `*.sqlite` — local database (recreated with `npm run setup:db`)

## After extracting on a new PC

```powershell
cd path\to\extracted\folder
npm install
powershell -ExecutionPolicy Bypass -File .\fix-db.ps1
npm run dev:api    # Terminal 1
npm run dev:web    # Terminal 2
```

Open: http://localhost:5173  
Login: `admin@restaurant.local` / `admin123`
