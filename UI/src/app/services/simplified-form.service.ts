import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimplifiedFormService {
  constructor(private http: HttpClient) {}
  
  getSections(): Observable<any[]> {
    return this.http.get<any[]>('api/Sections');
  }
  
  createSection(section: {sectionName: string}): Observable<any> {
    return this.http.post('api/Sections', section);
  }
  
  updateSection(sectionId: number, section: {sectionName: string}): Observable<any> {
    return this.http.put(`api/Sections/${sectionId}`, section);
  }
  
  deleteSection(sectionId: number): Observable<any> {
    return this.http.delete(`api/Sections/${sectionId}`);
  }
  
  createFormField(sectionId: number, subSectionId: number, field: any): Observable<any> {
    return this.http.post(`api/FormFields?sectionId=${sectionId}&subSectionId=${subSectionId}`, field);
  }
  
  updateFormField(formFieldId: number, sectionId: number, subSectionId: number, field: any): Observable<any> {
    return this.http.put(`api/FormFields/${formFieldId}?sectionId=${sectionId}&subSectionId=${subSectionId}`, field);
  }
  
  deleteFormField(formFieldId: number, sectionId: number, subSectionId: number): Observable<any> {
    return this.http.delete(`api/FormFields/${formFieldId}?sectionId=${sectionId}&subSectionId=${subSectionId}`);
  }
}
