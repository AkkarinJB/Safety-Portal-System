import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { SafetyApiService } from '../../services/safety-api.service';
import { AlertService } from '../../services/alert.service';
import { CreateReportForm } from '../../models/create-report-form';
import { 
  SpeechRecognition, 
  SpeechRecognitionConstructor,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  WindowWithSpeechRecognition 
} from '../../models/speech-recognition';
import { AiAnalysisResult } from '../../models/api-responses';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent implements OnDestroy {
  formData: CreateReportForm = {
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
  private recognition: SpeechRecognition | null = null;
  private recognitionSuggestion: SpeechRecognition | null = null; 

  constructor(
    private api: SafetyApiService,
    private alertService: AlertService, 
    private router: Router
  ){
    this.initSpeechRecognition();
  }

  initSpeechRecognition(): void {
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'th-TH';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        this.formData.detail += (this.formData.detail ? ' ' : '') + transcript;
        this.isListening = false;
        this.alertService.toastSuccess('รับเสียงเรียบร้อย');
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.handleSpeechError(event.error, 'detail');
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognitionSuggestion = new SpeechRecognition();
      this.recognitionSuggestion.lang = 'th-TH';
      this.recognitionSuggestion.continuous = false;
      this.recognitionSuggestion.interimResults = false;

      this.recognitionSuggestion.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        this.formData.suggestion += (this.formData.suggestion ? ' ' : '') + transcript;
        this.isListeningSuggestion = false;
        this.alertService.toastSuccess('รับเสียงเรียบร้อย');
      };

      this.recognitionSuggestion.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.handleSpeechError(event.error, 'suggestion');
      };

      this.recognitionSuggestion.onend = () => {
        this.isListeningSuggestion = false;
      };
    }
  }

  private handleSpeechError(error: string, type: 'detail' | 'suggestion'): void {
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

  startVoiceInput(type: 'detail' | 'suggestion' = 'detail'): void {
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
      if (type === 'detail' && this.recognition) {
        this.isListening = true;
        this.recognition.start();
      } else if (type === 'suggestion' && this.recognitionSuggestion) {
        this.isListeningSuggestion = true;
        this.recognitionSuggestion.start();
      }
      this.alertService.toastSuccess('กำลังฟังเสียง... พูดได้เลย');
    } catch (error: unknown) {
      if (type === 'detail') {
        this.isListening = false;
      } else {
        this.isListeningSuggestion = false;
      }
      const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
      this.alertService.toastError('ไม่สามารถเริ่มรับเสียงได้: ' + errorMessage);
    }
  }

  stopVoiceInput(type: 'detail' | 'suggestion' = 'detail'): void {
    if (type === 'detail' && this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else if (type === 'suggestion' && this.recognitionSuggestion && this.isListeningSuggestion) {
      this.recognitionSuggestion.stop();
      this.isListeningSuggestion = false;
    }
  }

  onFileSelected(event: Event): void {
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

      this.selectedFile = file;
      this.fileName = file.name;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileName = '';
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  askAi(): void {
    if (!this.formData.detail || this.formData.detail.trim().length < 10) {
      this.alertService.toastError('กรุณากรอกรายละเอียดปัญหาอย่างน้อย 10 ตัวอักษร');
      return;
    }

    this.isAnalyzing = true;
    this.api.analyzeIssue(this.formData.detail).subscribe({
      next: (res: AiAnalysisResult) => {
        this.formData.category = res.category;
        this.formData.rank = res.rank;
        this.formData.suggestion = res.suggestion;
        this.isAnalyzing = false;
        this.alertService.toastSuccess('AI วิเคราะห์เสร็จสิ้น');
      },
      error: (err: unknown) => {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'ไม่ทราบสาเหตุ';
        this.alertService.toastError('เกิดข้อผิดพลาดในการวิเคราะห์: ' + errorMessage);
        this.isAnalyzing = false;
      }
    });
  }

  onSubmit(): void {
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
      error: (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'ไม่ทราบสาเหตุ';
        this.alertService.error('บันทึกไม่สำเร็จ', errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  ngOnDestroy() {
    this.stopVoiceInput('detail');
    this.stopVoiceInput('suggestion');
  }
}