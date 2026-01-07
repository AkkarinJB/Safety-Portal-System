import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AlertService } from './services/alert.service';
import { UserRole } from './models/user-role';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  isLoginPage = false;
  isInspector = false;
  isEditor = false;
  isSuperAdmin = false;
  userRole: UserRole | null = null;
  username: string | null = null;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.updateUserInfo();
    this.checkRoute();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
        this.updateUserInfo();
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRoute(): void {
    this.isLoginPage = this.router.url === '/login';
  }

  private updateUserInfo(): void {
    this.userRole = this.authService.getUserRole();
    this.username = this.authService.getUsername();
    this.isInspector = this.authService.isInspector();
    this.isEditor = this.authService.isEditor();
    this.isSuperAdmin = this.authService.isSuperAdmin();
  }

  logout(): void {
    this.alertService.confirm('ออกจากระบบ?', 'คุณต้องการออกจากระบบหรือไม่?')
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.authService.logout();
          this.alertService.toastSuccess('ออกจากระบบเรียบร้อย');
        }
      });
  }

  getRoleLabel(): string {
    if (this.isSuperAdmin) return 'ผู้ดูแลระบบ';
    if (this.isInspector) return 'ผู้ตรวจสอบ';
    if (this.isEditor) return 'ผู้แก้ไข';
    return '';
  }
}
