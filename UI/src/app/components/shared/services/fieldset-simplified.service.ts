import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormField } from '../../../view-modal/DynamicFormModel';
import { DynamicFormService } from '../../dynamic-form/dynamic-form.service';
import { FileService } from './file-services';

@Injectable()
export class FieldsetSimplifiedService {

  constructor(private fb: FormBuilder, private dynamicFormService: DynamicFormService, private fileService: FileService) { }

  public processBulkTicketNLicence(base64Data: string, sectionId: number, lastFieldTabIndex: number, isSwitchBox: boolean = false, isSkillUpload: boolean = false): { isSuccess: boolean, errMsg: string | null, qry: object } {
    return { isSuccess: false, errMsg: "Bulk upload not supported in simplified POC", qry: {} };
  }

  public processSingleTicketNLicence(sectionId: number, data: FormGroup, lastFieldTabIndex: number): { isSuccess: boolean, errMsg: string | null, qry: object } {
    return { isSuccess: false, errMsg: "Single ticket/licence processing not supported in simplified POC", qry: {} };
  }

  public updateSingleTicketNLicence(sectionId: number, data: { labelName: string, ADD: string[], DEL: string[], atsPropertyValue: string, isRequired : boolean}, fieldset: FormField[], lastFieldTabIndex: number): { isSuccess: boolean, errMsg: string | null, qry: object } {
    return { isSuccess: false, errMsg: "Update ticket/licence processing not supported in simplified POC", qry: {} };
  }

  public processInductionQuestion(formStageId: number, data: FormGroup): { isSuccess: boolean, errMsg: string | null, qry: object } {
    return { isSuccess: false, errMsg: "Induction questions not supported in simplified POC", qry: {} };
  }

  public processupdatedInductionQuestion(currentInductionSection: any, formData: FormGroup): { isSuccess: boolean, errMsg: string | null, qry: object } {
    return { isSuccess: false, errMsg: "Updated induction questions not supported in simplified POC", qry: {} };
  }

  private isInductionOptionChanged(newQue: any, oldQue: any) {
    return false;
  }

  private processFieldname(fieldname: string) {
    return fieldname.replace(/[^a-zA-Z0-9]/g, '')
  }
}
