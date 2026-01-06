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
  formData: any = {
    area: '',
    reportDate: '',
    detail: '',
    category: '',
    stop6: 6,
    rank: 'C',
    suggestion: '',
    responsiblePerson: '',
    status: 'NotYetDone'
  };
  
  selectedFileBefore: File | null = null;
  selectedFileAfter: File | null = null;
  imageBeforePreview: string | null = null;
  imageAfterPreview: string | null = null;
  isLoading = true;
  isSubmitting = false;
  fileNameBefore = '';
  fileNameAfter = '';

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
        this.formData = {
          area: data.area || '',
          reportDate: data.reportDate ? data.reportDate.split('T')[0] : new Date().toISOString().split('T')[0],
          detail: data.detail || '',
          category: data.category || '',
          stop6: data.stop6 || 6,
          rank: data.rank || 'C',
          suggestion: data.suggestion || '',
          responsiblePerson: data.responsiblePerson || '',
          status: data.status || 'NotYetDone'
        };
        
        if (data.imageBeforeUrl) {
          this.imageBeforePreview = this.getImageUrl(data.imageBeforeUrl);
        }
        if (data.imageAfterUrl) {
          this.imageAfterPreview = this.getImageUrl(data.imageAfterUrl);
        }
        
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.alertService.error('ไม่พบข้อมูล', 'ไม่สามารถโหลดข้อมูลรายงานได้');
      }
    });
  }

  onFileSelected(event: any, type: 'before' | 'after') {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.alertService.toastError('ไฟล์ภาพต้องไม่เกิน 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.alertService.toastError('กรุณาเลือกไฟล์ภาพเท่านั้น');
        return;
      }

      if (type === 'before') {
        this.selectedFileBefore = file;
        this.fileNameBefore = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.imageBeforePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.selectedFileAfter = file;
        this.fileNameAfter = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.imageAfterPreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(type: 'before' | 'after') {
    if (type === 'before') {
      this.selectedFileBefore = null;
      this.imageBeforePreview = this.report?.imageBeforeUrl ? this.getImageUrl(this.report.imageBeforeUrl) : null;
      this.fileNameBefore = '';
    } else {
      this.selectedFileAfter = null;
      this.imageAfterPreview = this.report?.imageAfterUrl ? this.getImageUrl(this.report.imageAfterUrl) : null;
      this.fileNameAfter = '';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'NotYetDone': 'ยังไม่ดำเนินการ',
      'OnProcess': 'กำลังดำเนินการ',
      'Done': 'เสร็จสิ้น'
    };
    return statusMap[status] || 'ไม่ทราบสถานะ';
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'NotYetDone': 'secondary',
      'OnProcess': 'primary',
      'Done': 'success'
    };
    return colorMap[status] || 'secondary';
  }

  getStop6Label(stop6: number): string {
    const stop6Map: { [key: number]: string } = {
      1: 'อันตรายจากเครื่องจักร',
      2: 'อันตรายจากวัตถุหนักตกใส่',
      3: 'อันตรายจากยานพาหนะ',
      4: 'อันตรายจากการตกจากที่สูง',
      5: 'อันตรายจากกระแสไฟฟ้า',
      6: 'อื่นๆ'
    };
    return stop6Map[stop6] || 'อื่นๆ';
  }

  onSubmit() {
    if (!this.report) return;

    if (!this.formData.area.trim()) {
      this.alertService.toastError('กรุณากรอกพื้นที่');
      return;
    }

    if (!this.formData.detail.trim()) {
      this.alertService.toastError('กรุณากรอกรายละเอียด');
      return;
    }

    this.isSubmitting = true;
    this.api.updateReport(
      this.report.id!, 
      this.formData, 
      this.selectedFileBefore || undefined,
      this.selectedFileAfter || undefined
    ).subscribe({
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