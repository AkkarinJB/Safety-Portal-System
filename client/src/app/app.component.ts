import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  isLoginPage = false;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // ตรวจสอบ route เริ่มต้น
    this.checkRoute();

    // ตรวจสอบ route เมื่อมีการ navigate
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRoute() {
    this.isLoginPage = this.router.url === '/login';
  }

  logout() {
    this.alertService.confirm('ออกจากระบบ?', 'คุณต้องการออกจากระบบหรือไม่?')
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.authService.logout();
          this.alertService.toastSuccess('ออกจากระบบเรียบร้อย');
        }
      });
  }
}
