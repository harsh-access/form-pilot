import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DynamicForm } from 'src/app/view-modal/DynamicFormModel';
import { SimplifiedFormService } from '../../services/simplified-form.service';

@Injectable()
export class DynamicFormService {
  private formData: any = {
    id: 1,
    title: 'Sample Form',
    applicationFormId: 1,
    applicationFormName: 'Sample Form',
    applicationFormInfo: {
      formType: 1,
      templateDescription: 1,
      lastModifiedDate: new Date().toISOString(),
      userName: 'Test User',
      formTemplateType: null,
      isFreeForm: false
    },
    sections: [
      {
        id: 1,
        title: 'Client Information',
        orderNo: 1,
        formStageId: 1,
        stageName: 'Client Information',
        stageOrderNo: 1,
        sections: [
          {
            id: 1,
            orderNo: 1,
            title: 'Basic Details',
            formSectionId: 1,
            sectionName: 'Basic Details',
            sectionOrderNo: 1,
            sectionKeyName: 'basic-details',
            formFields: []
          }
        ]
      }
    ]
  };

  constructor(
    private http: HttpClient,
    private simplifiedFormService: SimplifiedFormService
  ) { }

  getOfficeLookup(params?: any): Observable<any[]> {
    return of([]);
  }

  getForm(params?: any): Observable<any> {
    return of(JSON.parse(JSON.stringify(this.formData)));
  }

  getEditableFormId(params?: any): Observable<any> {
    return of({ isSuccess: true, data: 1 });
  }

  postSaveForm(form: any): Observable<any> {
    console.log('Saving form:', form);
    return of({ isSuccess: true, message: 'Form saved successfully' });
  }

  postSectionChanges(data: any): Observable<any> {
    console.log('Saving section changes:', data);
    console.log('Current sections before update:', this.formData.sections.length);
    
    if (data.query && typeof data.query === 'string') {
      try {
        const queryObj = JSON.parse(data.query);
        console.log('Parsed query object:', queryObj);
        if (queryObj.add && queryObj.add.stageName) {
          const newSection = {
            id: this.formData.sections.length + 1,
            title: queryObj.add.stageName,
            orderNo: this.formData.sections.length + 1,
            formStageId: this.formData.sections.length + 1,
            stageName: queryObj.add.stageName,
            stageOrderNo: this.formData.sections.length + 1,
            sections: []
          };
          this.formData.sections.push(newSection);
          console.log('Added new section:', newSection);
          console.log('Total sections after update:', this.formData.sections.length);
        }
      } catch (e) {
        console.error('Error parsing query:', e);
      }
    }
    
    return of({ isSuccess: true, message: 'Section changes saved successfully' });
  }

  postStageChanges(data: any): Observable<any> {
    console.log('Saving stage changes:', data);
    return of({ isSuccess: true, message: 'Stage changes saved successfully' });
  }

  postSaveFieldsetChanges(data: any): Observable<any> {
    console.log('Saving fieldset changes:', data);
    return of({ isSuccess: true, message: 'Fieldset changes saved successfully' });
  }

  postTestApplicant(applicant: any): Observable<any> {
    console.log('Test applicant:', applicant);
    return of({ isSuccess: true, message: 'Test applicant created successfully' });
  }

  postTestReferee(applicant: any): Observable<any> {
    console.log('Test referee:', applicant);
    return of({ isSuccess: true, message: 'Test referee created successfully' });
  }

  getDiscardForm(params?: any): Observable<any> {
    console.log('Discarding form:', params);
    return of({ isSuccess: true, message: 'Form discarded successfully' });
  }

  getPublishForm(params?: any): Observable<any> {
    console.log('Publishing form:', params);
    return of({ isSuccess: true, message: 'Form published successfully' });
  }

  getDiscardRefereeForm(params?: any): Observable<any> {
    console.log('Discarding referee form:', params);
    return of({ isSuccess: true, message: 'Referee form discarded successfully' });
  }

  getPublishRefereeForm(params?: any): Observable<any> {
    console.log('Publishing referee form:', params);
    return of({ isSuccess: true, message: 'Referee form published successfully' });
  }

  getAtsMappings(params?: any): Observable<any> {
    return of({});
  }

  getAtsDetailsForExcel(params?: any): Observable<any> {
    return of({});
  }

  postSaveLookupChanges(lookupData: any): Promise<any> {
    console.log('Saving lookup changes:', lookupData);
    return Promise.resolve({ isSuccess: true, message: 'Lookup changes saved successfully' });
  }

  postSaveUploadedFile(fileUpload: any): Promise<any> {
    console.log('Saving uploaded file:', fileUpload);
    return Promise.resolve({ isSuccess: true, message: 'File uploaded successfully' });
  }

  postDownloadUploadedFile(params?: any): Observable<any> {
    console.log('Downloading uploaded file:', params);
    return of({ isSuccess: true, message: 'File downloaded successfully' });
  }

  createBackgroundCheckStage(params?: any): Observable<any> {
    console.log('Creating background check stage:', params);
    return of({ isSuccess: true, message: 'Background check stage created successfully' });
  }

  postSaveDependencyUpdates(form: any): Promise<any> {
    console.log('Saving dependency updates:', form);
    return Promise.resolve({ isSuccess: true, message: 'Dependency updates saved successfully' });
  }

  createField(sectionId: number, subSectionId: number, field: any): Observable<any> {
    return this.simplifiedFormService.createFormField(sectionId, subSectionId, field);
  }

  updateField(formFieldId: number, sectionId: number, subSectionId: number, field: any): Observable<any> {
    return this.simplifiedFormService.updateFormField(formFieldId, sectionId, subSectionId, field);
  }

  deleteField(formFieldId: number, sectionId: number, subSectionId: number): Observable<any> {
    return this.simplifiedFormService.deleteFormField(formFieldId, sectionId, subSectionId);
  }
}
