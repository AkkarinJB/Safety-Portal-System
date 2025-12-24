import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private alert: AlertService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.alert.toastSuccess('ยินดีต้อนรับกลับครับ!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.alert.error('เข้าสู่ระบบไม่สำเร็จ', 'Username หรือ Password ผิดครับ');
      }
    });
  }
}