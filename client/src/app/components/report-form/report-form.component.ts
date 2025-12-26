import { Component, OnDestroy } from '@angular/core';
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
export class ReportFormComponent implements OnDestroy {
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
  isSubmitting = false;
  fileName = '';
  isListening = false;
  private recognition: any = null;

  constructor(
    private api: SafetyApiService,
    private alertService: AlertService, 
    private router: Router
  ){
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'th-TH'; // Thai language
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.formData.detail += (this.formData.detail ? ' ' : '') + transcript;
        this.isListening = false;
        this.alertService.toastSuccess('รับเสียงเรียบร้อย');
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        
        let errorMessage = 'เกิดข้อผิดพลาดในการรับเสียง';
        switch(event.error) {
          case 'no-speech':
            errorMessage = 'ไม่พบเสียง กรุณาลองอีกครั้ง';
            break;
          case 'audio-capture':
            errorMessage = 'ไม่พบไมโครโฟน กรุณาตรวจสอบอุปกรณ์';
            break;
          case 'not-allowed':
            errorMessage = 'ไม่อนุญาตให้ใช้ไมโครโฟน กรุณาอนุญาตในเบราว์เซอร์';
            break;
          case 'network':
            errorMessage = 'เกิดข้อผิดพลาดจากเครือข่าย';
            break;
        }
        this.alertService.toastError(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  startVoiceInput() {
    if (!this.recognition) {
      this.alertService.toastError('เบราว์เซอร์ของคุณไม่รองรับการรับเสียง กรุณาใช้ Chrome หรือ Edge');
      return;
    }

    if (this.isListening) {
      this.stopVoiceInput();
      return;
    }

    try {
      this.isListening = true;
      this.recognition.start();
      this.alertService.toastSuccess('กำลังฟังเสียง... พูดได้เลย');
    } catch (error: any) {
      this.isListening = false;
      this.alertService.toastError('ไม่สามารถเริ่มรับเสียงได้: ' + error.message);
    }
  }

  stopVoiceInput() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
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
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileName = '';
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  askAi() {
    if (!this.formData.detail || this.formData.detail.trim().length < 10) {
      this.alertService.toastError('กรุณากรอกรายละเอียดปัญหาอย่างน้อย 10 ตัวอักษร');
      return;
    }

    this.isAnalyzing = true;
    this.api.analyzeIssue(this.formData.detail).subscribe({
      next: (res) => {
        this.formData.category = res.category;
        this.formData.rank = res.rank;
        this.formData.suggestion = res.suggestion;
        this.isAnalyzing = false;
        this.alertService.toastSuccess('AI วิเคราะห์เสร็จสิ้น');
      },
      error: (err) => {
        console.error(err);
        this.alertService.toastError('เกิดข้อผิดพลาดในการวิเคราะห์: ' + err.message);
        this.isAnalyzing = false;
      }
    });
  }

  onSubmit() {
    // Validation
    if (!this.formData.area.trim()) {
      this.alertService.toastError('กรุณากรอกพื้นที่ที่พบปัญหา');
      return;
    }

    if (!this.formData.detail.trim()) {
      this.alertService.toastError('กรุณากรอกรายละเอียดปัญหา');
      return;
    }

    this.isSubmitting = true;
    this.api.createReport(this.formData, this.selectedFile!).subscribe({
      next: () => {
        this.alertService.success('แจ้งปัญหาเรียบร้อย!', 'ระบบได้บันทึกข้อมูลของคุณแล้ว');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.alertService.error('บันทึกไม่สำเร็จ', err.message);
        this.isSubmitting = false;
      }
    });
  }

  ngOnDestroy() {
    // Stop voice recognition when component is destroyed
    this.stopVoiceInput();
  }
}