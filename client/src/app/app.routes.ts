import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/user-role';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'create', 
    loadComponent: () => import('./components/report-form/report-form.component').then(m => m.ReportFormComponent),
    canActivate: [authGuard, roleGuard(UserRole.Inspector)] // เฉพาะผู้ตรวจสอบ
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./components/report-edit/report-edit.component').then(m => m.ReportEditComponent),
    canActivate: [authGuard] // ทั้งสอง role เข้าได้ แต่จะจำกัดสิทธิ์ใน component
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, roleGuard(UserRole.SuperAdmin)] // เฉพาะ SuperAdmin
  }
];