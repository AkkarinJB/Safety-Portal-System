import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SafetyReport } from '../models/safety-report';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SafetyApiService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  private mapRankEnumToString(reports: SafetyReport[]): SafetyReport[] {
    const rankMap: { [key: number]: string } = { 0: 'A', 1: 'B', 2: 'C' };
    return reports.map(r => ({
      ...r,
      rank: rankMap[Number(r.rank)] || String(r.rank),
      stop6: r.stop6 || 6 
    }));
  }

  getAllReports(): Observable<SafetyReport[]> {
    return this.http.get<SafetyReport[]>(`${this.apiUrl}/SafetyReports`).pipe(
      map(reports => this.mapRankEnumToString(reports))
    );
  }

  getReportById(id: number): Observable<SafetyReport> {
    return this.http.get<SafetyReport>(`${this.apiUrl}/SafetyReports/${id}`).pipe(
      map(report => ({
        ...report,
        rank: { 0: 'A', 1: 'B', 2: 'C' }[Number(report.rank)] || String(report.rank),
        stop6: report.stop6 || 6 
      }))
    );
  }

  createReport(data: any, file?: File): Observable<any> {
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
    return this.http.post(`${this.apiUrl}/SafetyReports`, formData);
  }

 
  updateReport(id: number, data: any, fileBefore?: File, fileAfter?: File): Observable<any> {
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
    
    return this.http.put(`${this.apiUrl}/SafetyReports/${id}`, formData);
  }


  analyzeIssue(detail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Ai/analyze`, JSON.stringify(detail), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteReport(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/SafetyReports/${id}`);
}
}
