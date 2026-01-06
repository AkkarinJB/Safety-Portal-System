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
    reportDate: new Date().toISOString().split('T')[0], 
    detail: '',
    category: '',
    stop6: 6, 
    rank: 'C',
    suggestion: '',
    responsiblePerson: '',
    status: 'NotYetDone'
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isAnalyzing = false;
  isSubmitting = false;
  fileName = '';
  isListening = false;
  isListeningSuggestion = false; 
  private recognition: any = null;
  private recognitionSuggestion: any = null; 

  constructor(
    private api: SafetyApiService,
    private alertService: AlertService, 
    private router: Router
  ){
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'th-TH';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.formData.detail += (this.formData.detail ? ' ' : '') + transcript;
        this.isListening = false;
        this.alertService.toastSuccess('รับเสียงเรียบร้อย');
      };

      this.recognition.onerror = (event: any) => {
        this.handleSpeechError(event.error, 'detail');
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognitionSuggestion = new SpeechRecognition();
      this.recognitionSuggestion.lang = 'th-TH';
      this.recognitionSuggestion.continuous = false;
      this.recognitionSuggestion.interimResults = false;

      this.recognitionSuggestion.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.formData.suggestion += (this.formData.suggestion ? ' ' : '') + transcript;
        this.isListeningSuggestion = false;
        this.alertService.toastSuccess('รับเสียงเรียบร้อย');
      };

      this.recognitionSuggestion.onerror = (event: any) => {
        this.handleSpeechError(event.error, 'suggestion');
      };

      this.recognitionSuggestion.onend = () => {
        this.isListeningSuggestion = false;
      };
    }
  }

  private handleSpeechError(error: string, type: string) {
    console.error('Speech recognition error:', error);
    if (type === 'detail') {
      this.isListening = false;
    } else {
      this.isListeningSuggestion = false;
    }
    
    let errorMessage = 'เกิดข้อผิดพลาดในการรับเสียง';
    switch(error) {
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
  }

  startVoiceInput(type: 'detail' | 'suggestion' = 'detail') {
    const recognition = type === 'detail' ? this.recognition : this.recognitionSuggestion;
    const isListening = type === 'detail' ? this.isListening : this.isListeningSuggestion;

    if (!recognition) {
      this.alertService.toastError('เบราว์เซอร์ของคุณไม่รองรับการรับเสียง กรุณาใช้ Chrome หรือ Edge');
      return;
    }

    if (isListening) {
      this.stopVoiceInput(type);
      return;
    }

    try {
      if (type === 'detail') {
        this.isListening = true;
        this.recognition.start();
      } else {
        this.isListeningSuggestion = true;
        this.recognitionSuggestion.start();
      }
      this.alertService.toastSuccess('กำลังฟังเสียง... พูดได้เลย');
    } catch (error: any) {
      if (type === 'detail') {
        this.isListening = false;
      } else {
        this.isListeningSuggestion = false;
      }
      this.alertService.toastError('ไม่สามารถเริ่มรับเสียงได้: ' + error.message);
    }
  }

  stopVoiceInput(type: 'detail' | 'suggestion' = 'detail') {
    if (type === 'detail' && this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else if (type === 'suggestion' && this.recognitionSuggestion && this.isListeningSuggestion) {
      this.recognitionSuggestion.stop();
      this.isListeningSuggestion = false;
    }
  }

  onFileSelected(event: any) {
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
    if (!this.formData.area.trim()) {
      this.alertService.toastError('กรุณากรอกพื้นที่ที่พบปัญหา');
      return;
    }

    if (!this.formData.detail.trim()) {
      this.alertService.toastError('กรุณากรอกรายละเอียดปัญหา');
      return;
    }

    this.isSubmitting = true;
    this.api.createReport(this.formData, this.selectedFile || undefined).subscribe({
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
    this.stopVoiceInput('detail');
    this.stopVoiceInput('suggestion');
  }
}