import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SafetyApiService } from '../../services/safety-api.service';
import { SafetyReport } from '../../models/safety-report';
import { UpdateReportForm } from '../../models/update-report-form';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user-role';
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
  formData: UpdateReportForm = {
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
  userRole: UserRole | null = null;
  isInspector = false;
  isEditor = false;

  constructor(
    private route: ActivatedRoute,
    private api: SafetyApiService,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
    this.isInspector = this.authService.isInspector();
    this.isEditor = this.authService.isEditor();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(+id);
    } else {
      this.isLoading = false;
    }
  }

  loadReport(id: number): void {
    this.isLoading = true;
    this.api.getReportById(id).subscribe({
      next: (data: SafetyReport) => {
        this.report = data;
        
        let stop6Value = 6;
        if (data.stop6) {
          if (typeof data.stop6 === 'string') {
            const stop6Map: { [key: string]: number } = {
              'อันตรายจากเครื่องจักร': 1,
              'อันตรายจากวัตถุหนักตกใส่': 2,
              'อันตรายจากยานพาหนะ': 3,
              'อันตรายจากการตกจากที่สูง': 4,
              'อันตรายจากกระแสไฟฟ้า': 5,
              'อื่นๆ': 6
            };
            stop6Value = stop6Map[data.stop6] || parseInt(data.stop6) || 6;
          } else {
            stop6Value = Number(data.stop6) || 6;
          }
        }
        
        this.formData = {
          area: data.area || '',
          reportDate: data.reportDate ? (data.reportDate.split('T')[0] || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
          detail: data.detail || '',
          category: data.category || '',
          stop6: stop6Value,
          rank: data.rank || 'C',
          suggestion: data.suggestion || '',
          responsiblePerson: data.responsiblePerson || '',
          status: data.status || 'NotYetDone'
        };
        
        if (data.imageBeforeUrl) {
          this.imageBeforePreview = this.getImageUrl(data.imageBeforeUrl);
        } else {
          this.imageBeforePreview = null;
        }
        
        if (data.imageAfterUrl) {
          this.imageAfterPreview = this.getImageUrl(data.imageAfterUrl);
        } else {
          this.imageAfterPreview = null;
        }
        
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Error loading report:', err);
        this.isLoading = false;
        this.alertService.error('ไม่พบข้อมูล', 'ไม่สามารถโหลดข้อมูลรายงานได้');
      }
    });
  }

  onFileSelected(event: Event, type: 'before' | 'after'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
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

  removeImage(type: 'before' | 'after'): void {
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

  onSubmit(): void {
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
      error: (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'ไม่ทราบสาเหตุ';
        this.alertService.error('อัปเดตไม่สำเร็จ', errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    
    const baseUrl = environment.apiUrl;
    
    let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    
    if (cleanUrl.startsWith('uploads/')) {
      cleanUrl = cleanUrl.substring('uploads/'.length);
    }
    
    return `${baseUrl}/SafetyReports/images/${cleanUrl}`;
  }
}