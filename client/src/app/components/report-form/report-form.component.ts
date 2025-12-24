import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { SafetyApiService } from '../../services/safety-api.service';
import { AlertService } from '../../services/alert.service';
@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent {
  formData = {
    area: '',
    detail: '',
    category: '',
    rank: 'C',
    responsiblePerson: '',
    suggestion: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isAnalyzing = false; 

  constructor(
    private api: SafetyApiService,
    private alertService: AlertService, 
    private router: Router
  ){}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
     
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  askAi() {
    if (!this.formData.detail) {
      this.alertService.toastError('กรุณากรอกรายละเอียดปัญหาก่อนให้ AI วิเคราะห์ครับ');
      return;
    }

    this.isAnalyzing = true;
    this.api.analyzeIssue(this.formData.detail).subscribe({
      next: (res) => {
        this.formData.category = res.category;
        this.formData.rank = res.rank;
        this.formData.suggestion = res.suggestion;
        this.isAnalyzing = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.toastError('AI Error: ' + err.message);
        this.isAnalyzing = false;
      }
    });
  }

  onSubmit() {
    this.api.createReport(this.formData, this.selectedFile!).subscribe({
      next: () => {
        this.alertService.success('แจ้งปัญหาเรียบร้อย!', 'ระบบได้บันทึกข้อมูลของคุณแล้ว');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => this.alertService.error('บันทึกไม่สำเร็จ', err.message)
    });
  }
}