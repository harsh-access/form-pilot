import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FormField {
  id: number;
  type: number;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  columnIndex: number;
  tabIndex: number;
}

export interface SubSection {
  id: number;
  title: string;
  orderNo: number;
  formFields: FormField[];
}

export interface Section {
  id: number;
  title: string;
  orderNo: number;
  subSections: SubSection[];
}

@Injectable({
  providedIn: 'root'
})
export class SimplifiedFormService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  
  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/api/Sections`);
  }
  
  createSection(section: {sectionName: string}): Observable<Section> {
    return this.http.post<Section>(`${this.apiUrl}/api/Sections`, section);
  }
  
  updateSection(sectionId: number, section: {sectionName: string}): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/api/Sections/${sectionId}`, section);
  }
  
  deleteSection(sectionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/Sections/${sectionId}`);
  }
  
  createFormField(sectionId: number, subSectionId: number, field: any): Observable<FormField> {
    return this.http.post<FormField>(`${this.apiUrl}/api/FormFields?sectionId=${sectionId}&subSectionId=${subSectionId}`, field);
  }
  
  updateFormField(formFieldId: number, sectionId: number, subSectionId: number, field: any): Observable<FormField> {
    return this.http.put<FormField>(`${this.apiUrl}/api/FormFields/${formFieldId}?sectionId=${sectionId}&subSectionId=${subSectionId}`, field);
  }
  
  deleteFormField(formFieldId: number, sectionId: number, subSectionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/FormFields/${formFieldId}?sectionId=${sectionId}&subSectionId=${subSectionId}`);
  }

  getAIAssistance(currentForm: any, userPrompt: string): Observable<AIAssistanceResponse> {
    const request = {
      currentForm: currentForm,
      userPrompt: userPrompt
    };
    return this.http.post<AIAssistanceResponse>(`${this.apiUrl}/api/AIFoundryAPI/assist`, request);
  }
}

export interface AIAssistanceResponse {
  type: 'Updated' | 'Ask_User';
  previousData: any;
  newData?: any;
  summary: string;
}
