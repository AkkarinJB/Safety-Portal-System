import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { User, CreateUserForm, UpdateUserForm } from '../../models/user';
import { UserRole } from '../../models/user-role';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  showCreateModal = false;
  showEditModal = false;
  selectedUser: User | null = null;

  createForm: CreateUserForm = {
    username: '',
    code: '',
    role: UserRole.Inspector,
    fullName: '',
    email: ''
  };

  editForm: UpdateUserForm = {};

  roles = [
    { value: UserRole.Inspector, label: 'ผู้ตรวจสอบ' },
    { value: UserRole.Editor, label: 'ผู้แก้ไข' },
    { value: UserRole.SuperAdmin, label: 'ผู้ดูแลระบบ' }
  ];

  constructor(
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.alertService.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.createForm = {
      username: '',
      code: '',
      role: UserRole.Inspector,
      fullName: '',
      email: ''
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.editForm = {
      username: user.username,
      code: user.code,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  onCreateSubmit(): void {
    if (!this.createForm.username.trim()) {
      this.alertService.toastError('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    if (!this.createForm.code || this.createForm.code.length !== 4 || !/^\d{4}$/.test(this.createForm.code)) {
      this.alertService.toastError('รหัสผ่านต้องเป็นตัวเลข 4 หลัก');
      return;
    }

    this.userService.createUser(this.createForm).subscribe({
      next: () => {
        this.alertService.toastSuccess('เพิ่มผู้ใช้เรียบร้อย');
        this.closeCreateModal();
        this.loadUsers();
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'ไม่สามารถเพิ่มผู้ใช้ได้';
        this.alertService.error('เกิดข้อผิดพลาด', errorMessage);
      }
    });
  }

  onEditSubmit(): void {
    if (!this.selectedUser) return;

    if (this.editForm.code && (this.editForm.code.length !== 4 || !/^\d{4}$/.test(this.editForm.code))) {
      this.alertService.toastError('รหัสผ่านต้องเป็นตัวเลข 4 หลัก');
      return;
    }

    this.userService.updateUser(this.selectedUser.id, this.editForm).subscribe({
      next: () => {
        this.alertService.toastSuccess('อัปเดตผู้ใช้เรียบร้อย');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'ไม่สามารถอัปเดตผู้ใช้ได้';
        this.alertService.error('เกิดข้อผิดพลาด', errorMessage);
      }
    });
  }

  deleteUser(user: User): void {
    this.alertService.confirm('ยืนยันการลบ?', `คุณต้องการลบผู้ใช้ "${user.username}" หรือไม่?`)
      .then((confirmed) => {
        if (confirmed) {
          this.userService.deleteUser(user.id).subscribe({
            next: () => {
              this.alertService.toastSuccess('ลบผู้ใช้เรียบร้อย');
              this.loadUsers();
            },
            error: (err) => {
              const errorMessage = err.error?.message || err.message || 'ไม่สามารถลบผู้ใช้ได้';
              this.alertService.error('เกิดข้อผิดพลาด', errorMessage);
            }
          });
        }
      });
  }

  getRoleLabel(role: UserRole): string {
    const roleMap = this.roles.find(r => r.value === role);
    return roleMap?.label || role;
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.SuperAdmin:
        return 'bg-danger';
      case UserRole.Inspector:
        return 'bg-primary';
      case UserRole.Editor:
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
}

