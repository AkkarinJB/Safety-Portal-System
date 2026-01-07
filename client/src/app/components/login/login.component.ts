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
  code = '';
  showCode = false;
  isSubmitting = false;
  isError = false;
  errorMessage = '';

  constructor(
    private auth: AuthService, 
    private router: Router,
    private alert: AlertService
  ) {}

  toggleCodeVisibility() {
    this.showCode = !this.showCode;
  }

  onCodeChange(): void {
    this.code = this.code.replace(/[^0-9]/g, '');
    
    if (this.code.length > 4) {
      this.code = this.code.substring(0, 4);
    }
    
    if (this.isError) {
      this.isError = false;
      this.errorMessage = '';
    }
    
    if (this.code.length === 4) {
      setTimeout(() => {
        this.login();
      }, 300);
    }
  }

  onInputFocus(): void {
    // Focus handling if needed
  }

  onInputBlur(): void {
    // Blur handling if needed
  }

  login() {
    if (!this.code.trim()) {
      this.showError('กรุณากรอกรหัส 4 ตัว');
      return;
    }

    if (this.code.length !== 4) {
      this.showError('กรุณากรอกรหัส 4 ตัว');
      return;
    }

    if (!/^\d{4}$/.test(this.code)) {
      this.showError('รหัสต้องเป็นตัวเลข 4 ตัว');
      return;
    }

    this.isSubmitting = true;
    this.isError = false;
    this.errorMessage = '';

    this.auth.login(this.code).subscribe({
      next: () => {
        this.alert.toastSuccess('ยินดีต้อนรับ');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSubmitting = false;
        this.showError('รหัสไม่ถูกต้อง');
        this.code = '';
        setTimeout(() => {
          const input = document.getElementById('codeInput') as HTMLInputElement;
          if (input) input.focus();
        }, 100);
      }
    });
  }

  private showError(message: string) {
    this.isError = true;
    this.errorMessage = message;
    setTimeout(() => {
      this.isError = false;
      this.errorMessage = '';
    }, 3000);
  }
}