import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { SafetyApiService } from '../../services/safety-api.service';
import { SafetyReport } from '../../models/safety-report';
import { AlertService } from '../../services/alert.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  reports: SafetyReport[] = [];

  constructor(
    private api: SafetyApiService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.api.getAllReports().subscribe({
      next: (data) => {
        this.reports = data;
      },
    });
  }

  getRankCount(rank: string): number {
    if (!this.reports) return 0;
    return this.reports.filter(r => r.rank === rank).length;
  }

  deleteItem(id: number) {
    this.alertService.confirm('ยืนยันการลบ?', 'ข้อมูลจะหายไปถาวรและกู้คืนไม่ได้นะครับ')
      .then((isConfirmed) => {
        if (isConfirmed) {
          // ถ้าตอบตกลง ให้ยิง API ลบเลย
          this.api.deleteReport(id).subscribe({
            next: () => {
              this.alertService.toastSuccess('ลบข้อมูลเรียบร้อย');
              this.loadReports(); // โหลดตารางใหม่ให้ข้อมูลหายไป
            },
            error: (err) => {
              this.alertService.error('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาด: ' + err.message);
            }
          });
        }
      });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${url}`;
  }
}