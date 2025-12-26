import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SafetyApiService } from '../../services/safety-api.service';
import { SafetyReport } from '../../models/safety-report';
import { AlertService } from '../../services/alert.service';
import { environment } from '../../../environments/environment';

declare var Chart: any;
declare var jsPDF: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  reports: SafetyReport[] = [];
  filteredReports: SafetyReport[] = [];
  isLoading = true;
  searchQuery = '';
  selectedRank: string | null = null;
  selectedStatus: string | null = null;

  @ViewChild('overviewChart') overviewChartRef!: ElementRef<HTMLCanvasElement>;
  
  private overviewChart: any;

  constructor(
    private api: SafetyApiService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngAfterViewInit(): void {
    if (this.reports.length > 0) {
      this.initCharts();
    }
  }

  loadReports() {
    this.isLoading = true;
    this.api.getAllReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.applyFilters();
        this.isLoading = false;
        setTimeout(() => this.initCharts(), 100);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not loaded. Please install: npm install chart.js');
      return;
    }

    this.initOverviewChart();
  }

  initOverviewChart() {
    if (!this.overviewChartRef?.nativeElement) return;

    const ctx = this.overviewChartRef.nativeElement.getContext('2d');
    if (this.overviewChart) {
      this.overviewChart.destroy();
    }

    const rankA = this.getRankCount('A');
    const rankB = this.getRankCount('B');
    const rankC = this.getRankCount('C');
    const notDone = this.getStatusCount('NotYetDone');
    const onProcess = this.getStatusCount('OnProcess');
    const done = this.getStatusCount('Done');
    const total = this.getTotalCount();

    this.overviewChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Rank A (สูง)', 'Rank B (ปานกลาง)', 'Rank C (ทั่วไป)', 'ยังไม่ดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'],
        datasets: [
          {
            label: 'จำนวนรายการ',
            data: [rankA, rankB, rankC, notDone, onProcess, done],
            backgroundColor: [
              'rgba(220, 53, 69, 0.8)',   // Rank A - Red
              'rgba(255, 193, 7, 0.8)',   // Rank B - Yellow
              'rgba(25, 135, 84, 0.8)',  // Rank C - Green
              'rgba(108, 117, 125, 0.8)', // Not Done - Gray
              'rgba(13, 110, 253, 0.8)',  // On Process - Blue
              'rgba(25, 135, 84, 0.8)'    // Done - Green
            ],
            borderColor: [
              'rgb(220, 53, 69)',
              'rgb(255, 193, 7)',
              'rgb(25, 135, 84)',
              'rgb(108, 117, 125)',
              'rgb(13, 110, 253)',
              'rgb(25, 135, 84)'
            ],
            borderWidth: 2,
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `ภาพรวมทั้งหมด: ${total} รายการ`,
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.parsed.y || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `จำนวน: ${value} รายการ (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            },
            title: {
              display: true,
              text: 'จำนวนรายการ'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }

  getRankCount(rank: string): number {
    if (!this.reports) return 0;
    return this.reports.filter(r => r.rank === rank).length;
  }

  getTotalCount(): number {
    return this.reports.length;
  }

  getStatusCount(status: string): number {
    if (!this.reports) return 0;
    return this.reports.filter(r => r.status === status).length;
  }

  getRecentCount(): number {
    if (!this.reports) return 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.reports.filter(r => {
      if (!r.createdAt) return false;
      const createdDate = new Date(r.createdAt);
      return createdDate >= sevenDaysAgo;
    }).length;
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'NotYetDone': 'ยังไม่ดำเนินการ',
      'OnProcess': 'กำลังดำเนินการ',
      'Done': 'เสร็จสิ้น'
    };
    return statusMap[status] || status;
  }

  applyFilters() {
    let filtered = [...this.reports];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.area?.toLowerCase().includes(query) ||
        r.detail?.toLowerCase().includes(query) ||
        r.responsiblePerson?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query)
      );
    }

    if (this.selectedRank) {
      filtered = filtered.filter(r => r.rank === this.selectedRank);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    this.filteredReports = filtered;
    
    if (this.reports.length > 0) {
      setTimeout(() => this.initCharts(), 100);
    }
  }

  onSearchChange() {
    this.applyFilters();
  }

  onRankFilterChange(rank: string | null) {
    this.selectedRank = rank;
    this.applyFilters();
  }

  onStatusFilterChange(status: string | null) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedRank = null;
    this.selectedStatus = null;
    this.applyFilters();
  }

  deleteItem(id: number) {
    this.alertService.confirm('ยืนยันการลบ?', 'ข้อมูลจะหายไปถาวรและกู้คืนไม่ได้นะครับ')
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.api.deleteReport(id).subscribe({
            next: () => {
              this.alertService.toastSuccess('ลบข้อมูลเรียบร้อย');
              this.loadReports();
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

  getInitials(name: string | null | undefined): string {
    if (!name || name.length === 0) return '?';
    return name.charAt(0).toUpperCase();
  }

  exportChartToPDF() {
    if (!this.overviewChart) {
      this.alertService.toastError('กรุณารอให้ Chart โหลดเสร็จก่อน');
      return;
    }


    try {
      const chartImage = this.overviewChart.toBase64Image('image/png', 1);
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.setFontSize(18);
      pdf.text('ภาพรวม Dashboard - Safety Portal System', pdfWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`วันที่: ${currentDate}`, pdfWidth / 2, 22, { align: 'center' });
      
      const imgWidth = pdfWidth - 40; // Margin 20mm each side
      const imgHeight = (this.overviewChartRef.nativeElement.height / this.overviewChartRef.nativeElement.width) * imgWidth;
      
      const yPosition = 30;
      pdf.addImage(chartImage, 'PNG', 20, yPosition, imgWidth, imgHeight);
      
      const summaryY = yPosition + imgHeight + 15;
      pdf.setFontSize(12);
      pdf.text('สรุปข้อมูล', 20, summaryY);
      
      pdf.setFontSize(10);
      let currentY = summaryY + 8;
      pdf.text(`• รายการทั้งหมด: ${this.getTotalCount()} รายการ`, 25, currentY);
      currentY += 6;
      pdf.text(`• Rank A (สูง): ${this.getRankCount('A')} รายการ`, 25, currentY);
      currentY += 6;
      pdf.text(`• Rank B (ปานกลาง): ${this.getRankCount('B')} รายการ`, 25, currentY);
      currentY += 6;
      pdf.text(`• Rank C (ทั่วไป): ${this.getRankCount('C')} รายการ`, 25, currentY);
      currentY += 6;
      pdf.text(`• ยังไม่ดำเนินการ: ${this.getStatusCount('NotYetDone')} รายการ`, 25, currentY);
      currentY += 6;
      pdf.text(`• กำลังดำเนินการ: ${this.getStatusCount('OnProcess')} รายการ`, 25, currentY);
      currentY += 6;
      pdf.text(`• เสร็จสิ้น: ${this.getStatusCount('Done')} รายการ`, 25, currentY);
      
      const fileName = `Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(fileName);
      
      this.alertService.toastSuccess('ส่งออก PDF เรียบร้อยแล้ว');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      this.alertService.toastError('เกิดข้อผิดพลาดในการส่งออก PDF: ' + error.message);
    }
  }
}