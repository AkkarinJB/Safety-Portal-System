# วิธีแก้ SQL Syntax Error

## ปัญหา
Error: `#1064 - You have an error in your SQL syntax`

## วิธีแก้ไข (รันทีละคำสั่ง)

### วิธีที่ 1: รันทีละคำสั่ง (แนะนำ)

**STEP 1: Drop Table**
```sql
DROP TABLE IF EXISTS `Users`;
```
→ คลิก "Go"

**STEP 2: Create Table**
```sql
CREATE TABLE `Users` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Username` VARCHAR(100) NOT NULL UNIQUE,
    `Code` VARCHAR(4) NOT NULL UNIQUE,
    `Role` INT NOT NULL,
    `FullName` VARCHAR(200) NULL,
    `Email` VARCHAR(200) NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(6) NOT NULL,
    `UpdatedAt` DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
→ คลิก "Go"

**STEP 3: Insert SuperAdmin**
```sql
INSERT INTO `Users` (`Username`, `Code`, `Role`, `FullName`, `IsActive`, `CreatedAt`) 
VALUES ('admin', '9999', 3, 'ผู้ดูแลระบบ', 1, NOW());
```
→ คลิก "Go"

**STEP 4: Insert Inspector**
```sql
INSERT INTO `Users` (`Username`, `Code`, `Role`, `FullName`, `IsActive`, `CreatedAt`) 
VALUES ('inspector1', '1234', 1, 'ผู้ตรวจสอบ 1', 1, NOW());
```
→ คลิก "Go"

**STEP 5: Insert Editor**
```sql
INSERT INTO `Users` (`Username`, `Code`, `Role`, `FullName`, `IsActive`, `CreatedAt`) 
VALUES ('editor1', '5678', 2, 'ผู้แก้ไข 1', 1, NOW());
```
→ คลิก "Go"

### วิธีที่ 2: ใช้ไฟล์ SQL_FIXED

1. เปิดไฟล์ `SQL_UPDATE_USER_TABLE_FIXED.sql`
2. Copy ทั้งหมด
3. วางใน phpMyAdmin
4. **สำคัญ**: ตรวจสอบว่าไม่มี character พิเศษหรือ line break ที่ผิดปกติ
5. คลิก "Go"

### วิธีที่ 3: ใช้ Structure Tab

1. ไปที่ตาราง `Users` → คลิก "Structure"
2. คลิก "Drop" เพื่อลบตาราง
3. คลิก "SQL" tab
4. รันคำสั่ง CREATE TABLE (STEP 2)
5. รัน INSERT statements (STEP 3-5)

## ตรวจสอบผลลัพธ์

หลังจากรันเสร็จ:
1. ไปที่ตาราง `Users` → คลิก "Browse"
2. ควรเห็น 3 แถว:
   - admin (9999) - SuperAdmin
   - inspector1 (1234) - Inspector  
   - editor1 (5678) - Editor

