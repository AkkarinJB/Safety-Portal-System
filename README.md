# 🛡️ Safety Portal

ระบบจัดการและแจ้งปัญหาความปลอดภัย (Safety Management System)

## 📁 โครงสร้างโปรเจ็กต์ (Monorepo)

```
SafetyPortal/
├── client/                 # Frontend - Angular 19
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── vercel.json        # Vercel deployment config
│
├── SafetyPortal.API/      # Backend - .NET 8.0
│   ├── Controllers/
│   ├── Services/
│   ├── Data/
│   ├── Program.cs
│   ├── Dockerfile         # Render deployment config
│   └── SafetyPortal.API.csproj
│
├── .gitignore            # Monorepo gitignore
├── README.md             # ไฟล์นี้
└── DEPLOYMENT.md         # คู่มือการ deploy
```

## 🚀 Quick Start

### Prerequisites
- **.NET 8.0 SDK** (สำหรับ Backend)
- **Node.js 18+** และ **npm** (สำหรับ Frontend)
- **PostgreSQL** (สำหรับ Database)

### Backend Setup

```bash
cd SafetyPortal.API

# Restore packages
dotnet restore

# Update database (ต้องมี PostgreSQL running)
dotnet ef database update

# Run API
dotnet run
```

API จะรันที่: `http://localhost:5097`
Swagger UI: `http://localhost:5097/swagger`

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Run development server
npm start
```

Frontend จะรันที่: `http://localhost:4200`

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **Angular 19** - Frontend Framework
- **Bootstrap 5** - UI Framework
- **Bootstrap Icons** - Icons
- **SweetAlert2** - Alert/Modal dialogs
- **RxJS** - Reactive programming

### Backend
- **.NET 8.0** - Backend Framework
- **Entity Framework Core** - ORM
- **PostgreSQL** - Database
- **JWT Authentication** - Authentication
- **Swagger/OpenAPI** - API Documentation

## 📦 Features

- ✅ ระบบ Login/Authentication
- ✅ Dashboard แสดงรายการแจ้งปัญหา
- ✅ แจ้งปัญหาความปลอดภัย (พร้อมอัปโหลดรูปภาพ)
- ✅ อัปเดตสถานะงานซ่อม
- ✅ AI Analysis (ใช้ Gemini API)
- ✅ จัดการข้อมูลด้วย CRUD operations

## 🌐 Deployment

โปรเจ็กต์นี้ deploy บน:
- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com)
- **Database**: [Render PostgreSQL](https://render.com)

ดูรายละเอียดการ deploy ใน [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📝 Development

### Backend Commands

```bash
# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove
```

### Frontend Commands

```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test
```

## 🔐 Environment Variables

### Backend (appsettings.json หรือ Environment Variables)
- `ConnectionStrings__DefaultConnection` - PostgreSQL connection string
- `JwtSettings__Key` - JWT secret key
- `JwtSettings__Issuer` - JWT issuer
- `JwtSettings__Audience` - JWT audience
- `Gemini__ApiKey` - Google Gemini API key

### Frontend (environment files)
- `apiUrl` - Backend API URL

## 📄 License

Private project - สำหรับใช้งานภายในองค์กร

## 👥 Contributors

- Development Team

---

**หมายเหตุ**: สำหรับข้อมูลเพิ่มเติมเกี่ยวกับการ deploy โปรดดู [DEPLOYMENT.md](./DEPLOYMENT.md)

