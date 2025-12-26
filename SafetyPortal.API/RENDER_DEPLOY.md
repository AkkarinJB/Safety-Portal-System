# 🚀 คำแนะนำการ Deploy บน Render

## ✅ สิ่งที่พร้อมแล้ว:
- ✅ Dockerfile
- ✅ MariaDB Connection String
- ✅ Migration files
- ✅ Environment configuration

---

## 📋 ขั้นตอนการ Deploy

### 1. Push Code ไป GitHub

```bash
# ตรวจสอบว่า commit การเปลี่ยนแปลงทั้งหมดแล้ว
git status

# ถ้ายังไม่ได้ commit
git add .
git commit -m "Migrate to MariaDB and prepare for Render deployment"
git push origin main
```

### 2. สร้าง Web Service บน Render

1. ไปที่ https://render.com และล็อกอินด้วย GitHub
2. กด **"New +"** → **"Web Service"**
3. เชื่อมต่อ GitHub repository:
   - เลือก repository: `AkkarinJB/Safety-Portal-System`
   - เลือก branch: `main`

### 3. ตั้งค่า Web Service

**Basic Settings:**
- **Name**: `safetyportal-api`
- **Region**: **Singapore** (ใกล้ไทย)
- **Branch**: `main`
- **Root Directory**: `SafetyPortal.API` ⚠️ **สำคัญมาก!**

**Build & Deploy:**
- **Runtime**: **Docker** (แนะนำ) หรือ **.NET**
- **Build Command**: (ถ้าใช้ Docker ไม่ต้องใส่อะไร, ถ้าใช้ .NET ใส่:)
  ```
  dotnet restore && dotnet publish -c Release -o ./publish
  ```
- **Start Command**: (ถ้าใช้ Docker ไม่ต้องใส่อะไร, ถ้าใช้ .NET ใส่:)
  ```
  dotnet ./publish/SafetyPortal.API.dll
  ```

### 4. Environment Variables

เพิ่ม Environment Variables ต่อไปนี้:

| Key | Value |
|-----|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | `Server=geno.kitkhakai.com;Database=kitkh_geno;User=kitkh_geno;Password=genodev@kkk;Port=3306;` |
| `JwtSettings__Key` | `SafetyPortal_SecretKey_MustBeLongerThan_32Bytes!` |
| `JwtSettings__Issuer` | `SafetyPortalAPI` |
| `JwtSettings__Audience` | `SafetyPortalClient` |
| `Gemini__ApiKey` | `AIzaSyAdWY0YxDlsynQkhHNQ77H9nbo8yxpBql8` |
| `AllowedOrigins__Vercel` | `<เว้นว่างไว้ก่อน จะเพิ่มหลัง deploy frontend>` |

**หมายเหตุ**: 
- ใช้ double underscore (`__`) สำหรับ nested configuration
- Connection String ใช้ MariaDB format

### 5. Deploy

1. กด **"Create Web Service"**
2. รอ build และ deploy (ประมาณ 5-10 นาที)
3. ตรวจสอบ logs ว่ามี error หรือไม่

### 6. หลัง Deploy เสร็จ

1. **ได้ URL**: เช่น `https://safetyportal-api.onrender.com`
2. **ทดสอบ API**:
   - Swagger UI: `https://your-api-url.onrender.com/swagger`
   - Health check: `https://your-api-url.onrender.com/api/SafetyReports`
3. **ตรวจสอบ Database Connection**:
   - ดู logs ใน Render Dashboard
   - ทดสอบ API endpoints

---

## ⚠️ หมายเหตุสำคัญ

### 1. Root Directory
- **ต้องระบุ**: `SafetyPortal.API`
- เพราะเป็น monorepo (Frontend และ Backend อยู่ใน repo เดียวกัน)

### 2. Database Connection
- MariaDB server ต้องอนุญาต remote connection
- ตรวจสอบว่า firewall เปิด port 3306
- Connection String ใช้ format: `Server=host;Database=db;User=user;Password=pass;Port=3306;`

### 3. Migration
- Migration ถูกสร้างและ apply แล้วใน local
- Database tables ถูกสร้างแล้ว
- ไม่จำเป็นต้องรัน migration อีกครั้งใน Render (ถ้า database ถูกสร้างแล้ว)

### 4. Free Tier Limitations
- อาจ sleep หลัง idle 15 นาที
- Request แรกหลัง sleep อาจช้า (cold start)
- ใช้ได้ประมาณ 750 ชั่วโมง/เดือน

---

## 🔧 Troubleshooting

### Build Failed
- ตรวจสอบว่า Root Directory ถูกต้อง (`SafetyPortal.API`)
- ตรวจสอบ logs ใน Render Dashboard
- ตรวจสอบว่า Dockerfile ถูกต้อง

### Database Connection Failed
- ตรวจสอบว่า MariaDB server อนุญาต remote connection
- ตรวจสอบ Connection String ใน Environment Variables
- ตรวจสอบ firewall settings

### API ไม่ทำงาน
- ตรวจสอบ logs ใน Render Dashboard
- ทดสอบ Swagger UI
- ตรวจสอบ Environment Variables

---

## 📝 Checklist

- [ ] Push code ไป GitHub
- [ ] สร้าง Web Service บน Render
- [ ] ตั้ง Root Directory = `SafetyPortal.API`
- [ ] ตั้ง Environment Variables ทั้งหมด
- [ ] Deploy และรอ build เสร็จ
- [ ] ทดสอบ API endpoint (Swagger)
- [ ] เก็บ Backend URL ไว้ (สำหรับ Frontend)

---

**หลัง Deploy เสร็จ**: อัปเดต `client/src/environments/environment.prod.ts` ให้ใช้ Render URL

