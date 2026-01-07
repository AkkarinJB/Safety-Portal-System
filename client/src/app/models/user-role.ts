export enum UserRole {
  Inspector = 'Inspector',  // ผู้ตรวจสอบ
  Editor = 'Editor',        // ผู้แก้ไข
  SuperAdmin = 'SuperAdmin'  // ผู้ดูแลระบบ
}

export interface UserInfo {
  username: string;
  role: UserRole;
  token: string;
}

