import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SafetyReport } from '../models/safety-report';
import { CreateReportForm } from '../models/create-report-form';
import { UpdateReportForm } from '../models/update-report-form';
import { 
  CreateReportResponse, 
  UpdateReportResponse, 
  DeleteReportResponse,
  AiAnalysisResult 
} from '../models/api-responses';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SafetyApiService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  private mapRankEnumToString(reports: SafetyReport[]): SafetyReport[] {
    const rankMap: Readonly<Record<number, string>> = { 0: 'A', 1: 'B', 2: 'C' };
    const statusMap: Readonly<Record<number, string>> = { 
      0: 'NotYetDone', 
      1: 'OnProcess', 
      2: 'Done' 
    };
    return reports.map((r: SafetyReport): SafetyReport => {
      let rankValue: string = r.rank as string;
      if (typeof r.rank === 'number') {
        rankValue = rankMap[r.rank] ?? String(r.rank);
      }
      
      let statusValue: string = r.status as string;
      if (typeof r.status === 'number') {
        statusValue = statusMap[r.status] ?? String(r.status);
      } else if (!r.status) {
        statusValue = 'NotYetDone';
      }
      
      return {
        ...r,
        rank: rankValue,
        status: statusValue,
        stop6: r.stop6 ?? 6 
      };
    });
  }

  getAllReports(): Observable<SafetyReport[]> {
    return this.http.get<SafetyReport[]>(`${this.apiUrl}/SafetyReports`).pipe(
      map((reports: SafetyReport[]) => this.mapRankEnumToString(reports))
    );
  }

  getReportById(id: number): Observable<SafetyReport> {
    return this.http.get<SafetyReport>(`${this.apiUrl}/SafetyReports/${id}`).pipe(
      map((report: SafetyReport) => {
        let rankValue = report.rank;
        if (typeof report.rank === 'number') {
          rankValue = { 0: 'A', 1: 'B', 2: 'C' }[report.rank] || String(report.rank);
        }
        
        const statusMap: { [key: number]: string } = { 
          0: 'NotYetDone', 
          1: 'OnProcess', 
          2: 'Done' 
        };
        let statusValue = report.status;
        if (typeof report.status === 'number') {
          statusValue = statusMap[report.status] || String(report.status);
        } else if (!report.status) {
          statusValue = 'NotYetDone';
        }
        
        // Map stop6
        let stop6Value = report.stop6;
        if (typeof report.stop6 === 'string') {
          const parsed = parseInt(report.stop6);
          stop6Value = isNaN(parsed) ? report.stop6 : parsed;
        } else if (!report.stop6) {
          stop6Value = 6;
        }
        
        return {
          ...report,
          rank: rankValue,
          status: statusValue,
          stop6: stop6Value,
          category: report.category || ''
        };
      })
    );
  }

  createReport(data: CreateReportForm, file?: File): Observable<CreateReportResponse> {
    const formData = new FormData();
    formData.append('area', data.area);
    formData.append('reportDate', data.reportDate);
    formData.append('detail', data.detail);
    formData.append('category', data.category || '');
    formData.append('stop6', data.stop6.toString());
    formData.append('rank', data.rank);
    formData.append('suggestion', data.suggestion || '');
    formData.append('responsiblePerson', data.responsiblePerson);
    formData.append('status', data.status || 'NotYetDone');
    if (file) {
      formData.append('imageBefore', file);
    }
    return this.http.post<CreateReportResponse>(`${this.apiUrl}/SafetyReports`, formData);
  }

 
  updateReport(id: number, data: UpdateReportForm, fileBefore?: File, fileAfter?: File): Observable<UpdateReportResponse> {
    const formData = new FormData();
    
    if (data.area) formData.append('area', data.area);
    if (data.reportDate) formData.append('reportDate', data.reportDate);
    if (data.detail) formData.append('detail', data.detail);
    if (data.category) formData.append('category', data.category);
    if (data.stop6 !== undefined) formData.append('stop6', data.stop6.toString());
    if (data.rank) formData.append('rank', data.rank);
    if (data.suggestion) formData.append('suggestion', data.suggestion);
    if (data.responsiblePerson) formData.append('responsiblePerson', data.responsiblePerson);
    if (data.status) formData.append('status', data.status);
    
    if (fileBefore) {
      formData.append('imageBefore', fileBefore);
    }
    if (fileAfter) {
      formData.append('imageAfter', fileAfter);
    }
    
    return this.http.put<UpdateReportResponse>(`${this.apiUrl}/SafetyReports/${id}`, formData);
  }


  analyzeIssue(detail: string): Observable<AiAnalysisResult> {
    return this.http.post<AiAnalysisResult>(`${this.apiUrl}/Ai/analyze`, JSON.stringify(detail), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteReport(id: number): Observable<DeleteReportResponse> {
    return this.http.delete<DeleteReportResponse>(`${this.apiUrl}/SafetyReports/${id}`);
  }
}
