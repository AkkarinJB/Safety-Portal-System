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
  
  status: any = 0;

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
    }
  }

  loadReport(id: number) {
    this.api.getReportById(id).subscribe(data => {
      this.report = data;
      if (data.status === 'Done') this.status = 2;
      else if (data.status === 'OnProcess') this.status = 1;
      else this.status = 0;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageAfterPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.report) return;

    this.api.updateReport(this.report.id!, this.status, this.selectedFile!).subscribe({
      next: () => {
        this.alertService.success('อัปเดตงานเรียบร้อย!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => alert('เกิดข้อผิดพลาด: ' + err.message)
    });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${url}`;
  }
}