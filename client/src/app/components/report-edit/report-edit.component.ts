import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SafetyApiService } from '../../services/safety-api.service';
import { SafetyReport } from '../../models/safety-report';
import { AlertService } from '../../services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-report-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report-edit.component.html',
  styleUrls: ['./report-edit.component.scss']
})
export class ReportEditComponent implements OnInit {
  report: SafetyReport | null = null;
  selectedFile: File | null = null;
  imageAfterPreview: string | null = null;
  isLoading = true;
  isSubmitting = false;
  fileName = '';
  
  status: number = 0;

  constructor(
    private route: ActivatedRoute,
    private api: SafetyApiService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(+id);
    } else {
      this.isLoading = false;
    }
  }

  loadReport(id: number) {
    this.isLoading = true;
    this.api.getReportById(id).subscribe({
      next: (data) => {
        this.report = data;
        if (data.status === 'Done') this.status = 2;
        else if (data.status === 'OnProcess') this.status = 1;
        else this.status = 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.alertService.error('ไม่พบข้อมูล', 'ไม่สามารถโหลดข้อมูลรายงานได้');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.alertService.toastError('ไฟล์ภาพต้องไม่เกิน 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.alertService.toastError('กรุณาเลือกไฟล์ภาพเท่านั้น');
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageAfterPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imageAfterPreview = null;
    this.fileName = '';
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getStatusLabel(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'ยังไม่ดำเนินการ',
      1: 'กำลังดำเนินการ',
      2: 'เสร็จสิ้น'
    };
    return statusMap[status] || 'ไม่ทราบสถานะ';
  }

  getStatusColor(status: number): string {
    const colorMap: { [key: number]: string } = {
      0: 'secondary',
      1: 'primary',
      2: 'success'
    };
    return colorMap[status] || 'secondary';
  }

  onSubmit() {
    if (!this.report) return;

    this.isSubmitting = true;
    this.api.updateReport(this.report.id!, this.status, this.selectedFile!).subscribe({
      next: () => {
        this.alertService.success('อัปเดตงานเรียบร้อย!', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.alertService.error('อัปเดตไม่สำเร็จ', err.message);
        this.isSubmitting = false;
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