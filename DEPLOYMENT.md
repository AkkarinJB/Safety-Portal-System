# 🚀 คำแนะนำการ Deploy Safety Portal

คู่มือนี้จะช่วยคุณ deploy Application ไปยัง:
- **Database**: Render PostgreSQL (ฟรี)
- **Backend**: Render (.NET API)
- **Frontend**: Vercel (Angular)

> **หมายเหตุ**: โปรเจ็กต์นี้ใช้ **Monorepo** structure (Frontend และ Backend อยู่ใน repository เดียวกัน)

---

## 📋 ขั้นตอนการ Deploy

### 1️⃣ Database: Render PostgreSQL

1. ไปที่ https://render.com และสมัครด้วย GitHub
2. กด **"New +"** → **"PostgreSQL"**
3. ตั้งค่า:
   - **Name**: `safetyportal-db`
   - **Database**: `safetyportaldb` (หรือชื่ออื่น)
   - **User**: `safetyportal_user` (หรือชื่ออื่น)
   - **Region**: **Singapore** (ใกล้ไทย)
   - **PostgreSQL Version**: Latest
   - **Plan**: **Free**
4. กด **"Create Database"**
5. รอให้สร้างเสร็จ (ประมาณ 2-3 นาที)
6. หลังจากสร้างเสร็จ:
   - ไปที่หน้า Database → **"Connections"** หรือ **"Info"**
   - คัดลอก **Internal Database URL** หรือ **External Database URL**
   - รูปแบบ: `postgresql://user:password@host:port/dbname`

---

### 2️⃣ Backend: Render (.NET API)

1. **Push code ไป GitHub** (ถ้ายังไม่ได้ทำ):
   ```bash
   # ตรวจสอบว่าเป็น git repository หรือยัง
   git init  # ถ้ายังไม่ได้ init
   
   git add .
   git commit -m "Initial commit: Monorepo structure"
   
   # เชื่อมต่อกับ GitHub (ถ้ายังไม่ได้ทำ)
   git remote add origin https://github.com/yourusername/SafetyPortal.git
   git branch -M main
   git push -u origin main
   ```

2. ไปที่ Render Dashboard → **"New +"** → **"Web Service"**

3. เชื่อมต่อ GitHub repository ของคุณ (เลือก repository เดียวกับ Frontend)

4. ตั้งค่า Web Service:
   - **Name**: `safetyportal-api`
   - **Region**: **Singapore**
   - **Branch**: `main` (หรือ branch ที่คุณใช้)
   - **Root Directory**: `SafetyPortal.API` ⚠️ **สำคัญ: ต้องระบุ Root Directory**
   - **Runtime**: **Docker** (หรือเลือก **.NET**)
   - **Build Command**: (ถ้าใช้ Docker ไม่ต้องใส่อะไร, ถ้าใช้ .NET ใส่:)
     ```
     dotnet restore && dotnet publish -c Release -o ./publish
     ```
   - **Start Command**: (ถ้าใช้ Docker ไม่ต้องใส่อะไร, ถ้าใช้ .NET ใส่:)
     ```
     dotnet ./publish/SafetyPortal.API.dll
     ```

5. **Environment Variables** (สำคัญมาก!):
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection=<ใส่ Connection String จาก PostgreSQL>
   JwtSettings__Key=Your_Long_Secret_Key_Must_Be_Longer_Than_32_Bytes!
   JwtSettings__Issuer=SafetyPortalAPI
   JwtSettings__Audience=SafetyPortalClient
   Gemini__ApiKey=AIzaSyAdWY0YxDlsynQkhHNQ77H9nbo8yxpBql8
   AllowedOrigins__Vercel=<เว้นว่างไว้ก่อน จะเพิ่มหลัง deploy frontend>
   ```

6. กด **"Create Web Service"**

7. **รอ build และ deploy** (ประมาณ 5-10 นาที)

8. หลัง deploy เสร็จ จะได้ URL เช่น: `https://safetyportal-api.onrender.com`

9. **รัน Migration**:
   - เปิด **Shell** ใน Render Dashboard (เมนูด้านซ้าย)
   - รันคำสั่ง:
     ```bash
     cd SafetyPortal.API
     dotnet ef database update --connection "your-connection-string"
     ```
   - หรือใช้วิธีอื่น:
     - ไปที่ PostgreSQL → "Info" → Copy connection string
     - ใช้เครื่องมือ local หรือ pgAdmin เพื่อรัน migration

10. ทดสอบ API: ไปที่ `https://your-api-url.onrender.com/swagger`

---

### 3️⃣ Frontend: Vercel (Angular)

1. **แก้ไข `client/src/environments/environment.prod.ts`**:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.onrender.com/api'  // ใส่ URL จาก Render
   };
   ```

2. ไปที่ https://vercel.com และสมัครด้วย GitHub

3. กด **"Add New..."** → **"Project"**

4. เลือก GitHub repository ของคุณ (repository เดียวกับ Backend - Monorepo)

5. ตั้งค่า Project:
   - **Framework Preset**: **Angular** หรือ **Other**
   - **Root Directory**: `client` ⚠️ **สำคัญ: ต้องระบุ Root Directory**
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/client/browser`
   - **Install Command**: `npm install`

6. **Environment Variables** (ไม่จำเป็นสำหรับ Angular ถ้าใช้ environment files)

7. กด **"Deploy"**

8. รอ build เสร็จ (ประมาณ 2-3 นาที)

9. จะได้ URL เช่น: `https://safetyportal.vercel.app`

---

### 4️⃣ อัปเดต CORS ใน Backend

หลัง deploy Frontend เสร็จ ต้องอัปเดต CORS ใน Backend:

1. ไปที่ Render Dashboard → Web Service → **Environment**

2. เพิ่มหรือแก้ไข Environment Variable:
   ```
   AllowedOrigins__Vercel=https://your-frontend-url.vercel.app
   ```

3. **Redeploy** Backend (กด Manual Deploy หรือ push code ใหม่)

---

## ✅ Checklist สรุป

### Git Repository (Monorepo)
- [ ] สร้าง `.gitignore` หลัก (✅ สร้างแล้ว)
- [ ] Initialize git repository (`git init`)
- [ ] Commit และ push ไป GitHub
- [ ] ตรวจสอบว่า repository structure ถูกต้อง

### Database (Render PostgreSQL)
- [ ] สร้าง PostgreSQL database
- [ ] เก็บ Connection String ไว้

### Backend (Render)
- [ ] Deploy Backend บน Render
- [ ] **ตั้ง Root Directory = `SafetyPortal.API`** ⚠️
- [ ] ตั้ง Environment Variables ทั้งหมด
- [ ] รัน Migration (`dotnet ef database update`)
- [ ] ทดสอบ API endpoint (Swagger)

### Frontend (Vercel)
- [ ] Deploy Frontend บน Vercel
- [ ] **ตั้ง Root Directory = `client`** ⚠️
- [ ] แก้ไข `client/src/environments/environment.prod.ts` ให้ใส่ Render URL
- [ ] ได้ Vercel URL

### อัปเดต CORS
- [ ] เพิ่ม Vercel URL ใน Backend Environment Variables
- [ ] Redeploy Backend

---

## 🔧 Troubleshooting

### Backend ไม่สามารถเชื่อมต่อ Database
- ตรวจสอบ Connection String ว่าใส่ถูกต้อง
- ตรวจสอบว่าใช้ Internal Database URL หรือ External Database URL ตามที่ Render แนะนำ

### CORS Error
- ตรวจสอบว่าเพิ่ม Frontend URL ใน Backend Environment Variables แล้ว
- ตรวจสอบ `Program.cs` ว่า CORS ถูกตั้งค่าถูกต้อง

### Frontend ไม่แสดงข้อมูล
- ตรวจสอบ Console ใน Browser ดูว่ามี error อะไร
- ตรวจสอบว่า `environment.prod.ts` ใส่ API URL ถูกต้อง
- ตรวจสอบ Network tab ว่ามี request ไป API หรือไม่

### Migration ไม่ทำงาน
- ตรวจสอบว่ามี `dotnet-ef` tool ติดตั้งแล้ว
- หรือใช้วิธี manual: export connection string และรัน migration จากเครื่อง local

---

## 📝 หมายเหตุสำคัญ

1. **Render Free Tier**: 
   - อาจ sleep หลัง idle 15 นาที
   - Request แรกหลัง sleep อาจช้า (cold start)
   - ใช้ได้ประมาณ 750 ชั่วโมง/เดือน

2. **Vercel Free Tier**:
   - Bandwidth: 100GB/เดือน
   - Build time: 6000 นาที/เดือน
   - เหมาะสำหรับ testing และ demo

3. **Environment Variables**: 
   - **อย่า hardcode secrets ใน code**
   - เก็บ JWT Key, API Keys ใน Environment Variables

4. **HTTPS**: 
   - Render และ Vercel ใช้ HTTPS โดยอัตโนมัติ
   - ไม่ต้องตั้งค่า SSL เอง

---

## 🔗 URLs ที่ได้

หลัง deploy เสร็จ คุณจะมี:
- **Backend API**: `https://safetyportal-api.onrender.com`
- **Frontend**: `https://safetyportal.vercel.app`
- **Database**: Internal connection string (ใช้ใน Backend เท่านั้น)

---

**ขอให้ Deploy สำเร็จ! 🎉**

