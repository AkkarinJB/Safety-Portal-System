# คำแนะนำการ Migrate จาก PostgreSQL เป็น MySQL

## ✅ สิ่งที่แก้ไขแล้ว:
1. ✅ แก้ไข `.csproj` - เปลี่ยนเป็น `Pomelo.EntityFrameworkCore.MySql`
2. ✅ แก้ไข `Program.cs` - เปลี่ยนเป็น `UseMySql`
3. ✅ แก้ไข `appsettings.json` - เปลี่ยน Connection String เป็น MySQL

## 📋 ขั้นตอนถัดไป:

### 1. Restore Packages
```bash
cd SafetyPortal.API
dotnet restore
```

### 2. Backup Migrations เก่า (ถ้าต้องการเก็บไว้)
```bash
# สร้างโฟลเดอร์ backup
mkdir -p Migrations_Backup_PostgreSQL

# Copy migrations เก่าไป backup
cp -r Migrations/* Migrations_Backup_PostgreSQL/
```

### 3. ลบ Migrations เก่า
```bash
# ลบ migrations เก่าที่เป็น PostgreSQL
rm -rf Migrations/*
```

### 4. สร้าง Migration ใหม่สำหรับ MySQL
```bash
dotnet ef migrations add InitialMySqlMigration
```

### 5. Update Database
```bash
dotnet ef database update
```

## ⚠️ หมายเหตุ:

1. **ตรวจสอบ MySQL Version**: 
   - ใน `Program.cs` มี `new MySqlServerVersion(new Version(8, 0, 21))`
   - ถ้า MySQL server เป็น version อื่น ให้ปรับตาม
   - สำหรับ MariaDB อาจใช้ `new MariaDbServerVersion(new Version(10, 11, 0))`

2. **Connection String**:
   - Server: `geno.kitkhakai.com`
   - Database: `kitkh_geno`
   - User: `kitkh_geno`
   - Password: `genodev@kkk`
   - Port: `3306` (default MySQL port)

3. **ทดสอบ Connection**:
   - ตรวจสอบว่า MySQL server เปิด port 3306 และอนุญาต remote connection
   - ทดสอบ connection ด้วย MySQL client หรือ phpMyAdmin ก่อน

4. **ถ้ามีปัญหา**:
   - ตรวจสอบว่า MySQL server รองรับ remote connection
   - ตรวจสอบ firewall settings
   - ตรวจสอบว่า user `kitkh_geno` มีสิทธิ์เข้าถึง database `kitkh_geno`

