import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as xlsx from 'xlsx';
import { ILkpOptionArr } from 'src/app/view-modal/GeneralModels';
import { OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { FormField } from 'src/app/view-modal/DynamicFormModel';
import { OnboardedObjectTypes } from '../../dynamic-form/Sidebars/fieldset-sidebar/fieldset-propertyList-functions';
import { DynamicFormService } from '../../dynamic-form/dynamic-form.service';
import { FileService } from './file-services';



@Injectable()
export class FieldsetService {


  atsPropertyIdData: {
    keywordid: number | null,
    referencenumber: number | null,
    yearexperience: number | null,
    expirydate: number | null,
    issuedate: number | null,
    lastused: number | null,
    document: number | null,
  };


  constructor(private fb: FormBuilder, private dynamicFormService: DynamicFormService, private fileService: FileService) { }

  private setAtsPropertyIdData(isSkillUpload:boolean = false) {
    this.atsPropertyIdData = {
      keywordid: null,
      referencenumber: null,
      yearexperience: null,
      expirydate: null,
      issuedate: null,
      lastused: null,
      document: null,
    };
  }

  public processBulkTicketNLicence(base64Data: string, sectionId: number, lastFieldTabIndex: number, isSwitchBox: boolean = false, isSkillUpload: boolean = false): { isSuccess: boolean, errMsg: string | null, qry: object } {

    this.setAtsPropertyIdData(isSkillUpload);

    let isEditFormIntegration = false;

    const objectName = isSkillUpload ? OnboardedObjects.Skills : OnboardedObjects.LicencesandCertificates;
    const ObjectType = isSkillUpload ? OnboardedObjectTypes.skillname : OnboardedObjectTypes.licencename ;   

    const ticLicModel = { REI: 1, DOC: 4 }

    let fieldGroupId = 0;

    

    const expectedHeaders = []; 

    let processedData = [];
    let FinalData = [];
    let formFieldId = 0;
    let categoryFieldType = isSwitchBox ? 14 : 28;
    let isCategoryMandatory = isSwitchBox ? 1 : 0;
    let categoryRefValue = isSwitchBox ? '45' : 'true';

    const workbook = xlsx.read(base64Data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const headerRow = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];

    const headersMatch = JSON.stringify(headerRow) === JSON.stringify(expectedHeaders);

    if (!headersMatch) {
      console.log("The Excel file headers do not match the expected headers.");
      return {
        isSuccess: false,
        errMsg: "Invalid file!",
        qry: null
      }
    }

    let jsonData = xlsx.utils.sheet_to_json(worksheet);
    jsonData.forEach((ticket) => {
      const category = ticket['Category'] || "IndependentFields";
      if (!processedData[category]) {
        processedData[category] = [];
      }
      processedData[category].push({
        FieldName: !isSkillUpload ? ticket['Licence/Tickets Name'] : ticket['Skill Name'],
        RefNo: ticket['Reference Number'],
        ExpDate: ticket['Expiry Date'],
        IssueDate: ticket['Issue Date'],
        DocUpload1: ticket['Document Upload 1'],
        DocUpload2: ticket['Document Upload 2'],
        AtsMapping: ticket['ATS Mapping']
      });
    });

    for (const category of Object.keys(processedData)) {
      let categoryObj = null;
      let catRefFormFieldId = null;

      let categoryFieldName = '';

      if (category != 'IndependentFields') {
        categoryFieldName = this.processFieldname(category);
        catRefFormFieldId = ++formFieldId;
        categoryObj = { formFieldId: catRefFormFieldId, refFormFieldId: null, applicationFormStageSectionId: sectionId, fieldName: categoryFieldName, fieldType: categoryFieldType, tabIndex: ++lastFieldTabIndex, columnIndex: 1, labelName: category, placeholder: category, questionSpan: 6, answerSpan: 4, maxColumn: 2, rowClass: 'subsection-group', isMandatory: isCategoryMandatory, lookupViewId: 1 };
        FinalData.push(categoryObj);
      }

      processedData[category].forEach((ticket, index) => {

        fieldGroupId++;

        let RefTabIndex = (((Math.ceil((index + 1) / 2) - 1) * 12) + ((index + 1) % 2 == 0 ? 2 : 1)) + lastFieldTabIndex;
        let nextRIETabIndex = RefTabIndex + (ticLicModel.REI * 2);
        let nextDocTabIndex = RefTabIndex + (ticLicModel.DOC * 2);

        const FieldName = ticket['FieldName'];
        const RefNo = ticket['RefNo'];
        const ExpDate = ticket['ExpDate'];
        const IssueDate = ticket['IssueDate'];
        const DocUpload1 = ticket['DocUpload1'];
        const DocUpload2 = ticket['DocUpload2'];
        let AtsMapping = ticket['AtsMapping'] ?? null;

        if (FieldName) {
          let fieldNameObj = null;
          let refNoObj = null;
          let issueDateObj = null;
          let expDateObj = null;
          let docUpload1Obj = null;
          let docUpload2Obj = null;

          if (FieldName) {
            let refFieldName = this.processFieldname(categoryFieldName + FieldName);
            let refFormFieldId = ++formFieldId;
            AtsMapping = (AtsMapping != null && AtsMapping) ? AtsMapping : null;             
            fieldNameObj = {
              formFieldId: refFormFieldId, refFormFieldId: catRefFormFieldId, refValue: (catRefFormFieldId != null ? categoryRefValue : null), applicationFormStageSectionId: sectionId, fieldName: refFieldName, fieldType: 28, tabIndex: RefTabIndex, columnIndex: ((index % 2) + 1), labelName: FieldName, atsPropertyValue: AtsMapping , objectName: isEditFormIntegration ? objectName : "skill", placeholder: FieldName, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 0, lookupViewId: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.keywordid : null, objectType: ObjectType, fieldGroupId: fieldGroupId
            };

            FinalData.push(fieldNameObj);

            if (RefNo) {
              refNoObj = {
                formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'RefNo', fieldType: 11, tabIndex: nextRIETabIndex, columnIndex: ((index % 2) + 1), labelName: 'Reference Number', fieldMaxLength: 100, placeholder: FieldName + ' Reference Number', objectName: isEditFormIntegration ? objectName : "referencenumber", questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.referencenumber : null, objectType: OnboardedObjectTypes.referencenumber, fieldGroupId: fieldGroupId
              };
              FinalData.push(refNoObj);
              nextRIETabIndex = nextRIETabIndex + 2;
            }

            if (ExpDate) {
              expDateObj = { formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'ExpDate', fieldType: 12, tabIndex: nextRIETabIndex, columnIndex: ((index % 2) + 1), labelName: 'Expiry Date', placeholder: FieldName + ' Expiry Date', objectName: isEditFormIntegration ? objectName : "expirydate", questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.expirydate : null, objectType: OnboardedObjectTypes.expirydate, fieldGroupId: fieldGroupId, fieldValidator: 'futuredate' };
              FinalData.push(expDateObj);
              nextRIETabIndex = nextRIETabIndex + 2;
            }

            if (IssueDate) {
              issueDateObj = { formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'IssueDate', fieldType: 12, tabIndex: nextRIETabIndex, columnIndex: ((index % 2) + 1), labelName: 'Issue Date', placeholder: FieldName + ' Issue Date', questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, objectName: isEditFormIntegration ? objectName : null, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.issuedate : null, objectType: OnboardedObjectTypes.issuedate, fieldGroupId: fieldGroupId, fieldValidator: 'pastdate' };
              FinalData.push(issueDateObj);
              nextRIETabIndex = nextRIETabIndex + 2;
            }

            if (DocUpload1) {
              let labelName = FieldName + ' Document Upload';
              let fieldName = refFieldName + 'Img';
              let objectType = OnboardedObjectTypes.frontdocument

              if (DocUpload2) {
                labelName = FieldName + ' Front Document Upload';
                fieldName = refFieldName + 'FrontImg';
              }

              docUpload1Obj = { formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: fieldName, fieldType: 22, tabIndex: nextDocTabIndex, columnIndex: ((index % 2) + 1), labelName: labelName, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, objectName: isEditFormIntegration ? objectName : null, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.document : null, objectType: objectType, integratedTo: 1, fieldGroupId: fieldGroupId  };
              FinalData.push(docUpload1Obj);
              nextDocTabIndex = nextDocTabIndex + 2;
            }

            if (DocUpload2) {
              let labelName = FieldName + ' Document Upload';
              let fieldName = refFieldName + 'Img';
              let objectType = OnboardedObjectTypes.frontdocument
              if (DocUpload1) {
                labelName = FieldName + ' Back Document Upload';
                fieldName = refFieldName + 'BackImg';
                objectType = OnboardedObjectTypes.backdocument
              }

              docUpload2Obj = { formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: fieldName, fieldType: 22, tabIndex: nextDocTabIndex, columnIndex: ((index % 2) + 1), labelName: labelName, objectName: isEditFormIntegration ? objectName : null, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.document : null, objectType: objectType, integratedTo: 1, fieldGroupId: fieldGroupId };
              FinalData.push(docUpload2Obj);
              nextDocTabIndex = nextDocTabIndex + 2;
            }
          }
        }
      })
      lastFieldTabIndex = lastFieldTabIndex + (processedData[category].length + (processedData[category].length % 2)) * 6;
    }

    if (FinalData[0] && FinalData[0].rowClass) FinalData[0].rowClass = null;
    if (FinalData.length == 0) {
      console.log("uploaded empty excel file.");
      return {
        isSuccess: false,
        errMsg: "Invalid file!",
        qry: null
      }
    }
    return {
      isSuccess: true,
      errMsg: null,
      qry: { TicketNLicenceNSkill: FinalData }
    }
  }

  public processSingleTicketNLicence(sectionId: number, data: FormGroup, lastFieldTabIndex: number): { isSuccess: boolean, errMsg: string | null, qry: object } {

    this.setAtsPropertyIdData();

    let ticketNlicFieldSet = [];
    let formFieldId = 0;
    let nextTabIndex = lastFieldTabIndex + 1;
    let isEditFormIntegration = false;  

    let formData = {
      labelName: data.value.labelName,
      referencenumber: data.value.addReferenceNo,
      expirydate: data.value.addExpiryDate,
      issuedate: data.value.addIssueDate,
      frontdocument: data.value.addFrontDoc,
      backdocument: data.value.addBackDoc,
      atsPropertyValue: data.value.atsPropertyValue,
      isRequired: data.value?.isRequired
    }

    let refFieldName = this.processFieldname(formData.labelName);
    let refFormFieldId = ++formFieldId;

    // Licence Name (Switch Box)
    ticketNlicFieldSet.push({ formFieldId: refFormFieldId, refFormFieldId: null, refValue: null, applicationFormStageSectionId: sectionId, fieldName: refFieldName, fieldType: 28, tabIndex: nextTabIndex, columnIndex: 1, labelName: formData.labelName, atsPropertyValue: (formData.atsPropertyValue == null || formData.atsPropertyValue == "") ? null : formData.atsPropertyValue, objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : "skill", placeholder: formData.labelName, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: formData?.isRequired ? 1 : 0, lookupViewId: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.keywordid : null, objectType: OnboardedObjectTypes.licencename });
    nextTabIndex += 2;

    // Reference Number
    if (formData.referencenumber) {
      ticketNlicFieldSet.push({ formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'RefNo', fieldType: 11, tabIndex: nextTabIndex, columnIndex: 1, labelName: 'Reference Number', fieldMaxLength: 100, placeholder: formData.labelName + ' Reference Number', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : "referencenumber", questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.referencenumber : null, objectType: OnboardedObjectTypes.referencenumber });
      nextTabIndex += 2;
    }

    // Expiry Date
    if (formData.expirydate) {
      ticketNlicFieldSet.push({ formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'ExpDate', fieldType: 12, tabIndex: nextTabIndex, columnIndex: 1, labelName: 'Expiry Date', placeholder: formData.labelName + ' Expiry Date', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : "expirydate", questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.expirydate : null, objectType: OnboardedObjectTypes.expirydate, fieldValidator: 'futuredate' });
      nextTabIndex += 2;
    }

    // Issue Date
    if (formData.issuedate) {
      ticketNlicFieldSet.push({ formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'IssueDate', fieldType: 12, tabIndex: nextTabIndex, columnIndex: 1, labelName: 'Issue Date', placeholder: formData.labelName + ' Issue Date', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : null, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.issuedate : null, objectType: OnboardedObjectTypes.issuedate, fieldValidator: 'pastdate' });
      nextTabIndex += 2;
    }

    // Front Document Upload
    if (formData.frontdocument) {
      let labelName = formData.backdocument ? (formData.labelName + ' Front Document Upload') : (formData.labelName + ' Document Upload');
      ticketNlicFieldSet.push({ formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'FrontImg', fieldType: 22, tabIndex: nextTabIndex, columnIndex: 1, labelName: labelName, objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : null, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.document : null, objectType: OnboardedObjectTypes.frontdocument, integratedTo: 1 });
      nextTabIndex += 2;
    }

    // Back Document Upload
    if (formData.backdocument) {
      let labelName = formData.frontdocument ? (formData.labelName + ' Back Document Upload') : (formData.labelName + ' Document Upload');
      ticketNlicFieldSet.push({ formFieldId: ++formFieldId, refFormFieldId: refFormFieldId, refValue: 'true', applicationFormStageSectionId: sectionId, fieldName: refFieldName + 'BackImg', fieldType: 22, tabIndex: nextTabIndex, columnIndex: 1, labelName: labelName, objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : null, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.document : null, objectType: OnboardedObjectTypes.backdocument, integratedTo: 1 });
      nextTabIndex += 2;
    }

    if (ticketNlicFieldSet.length == 0) {
      console.log("Improper Form Data!", data);
      return {
        isSuccess: false,
        errMsg: "Improper form data!",
        qry: null
      }
    }

    return {
      isSuccess: true,
      errMsg: null,
      qry: { TicketNLicenceNSkill: ticketNlicFieldSet }
    }
  }

  public updateSingleTicketNLicence(sectionId: number, data: { labelName: string, ADD: string[], DEL: string[], atsPropertyValue: string, isRequired : boolean}, fieldset: FormField[], lastFieldTabIndex: number): { isSuccess: boolean, errMsg: string | null, qry: object } {

    this.setAtsPropertyIdData();

    let licenseNameField = fieldset.find(x => x.objectType == OnboardedObjectTypes.licencename);
    let refNoField = fieldset.find(x => x.objectType == OnboardedObjectTypes.referencenumber);
    let expDateField = fieldset.find(x => x.objectType == OnboardedObjectTypes.expirydate);
    let issueDateField = fieldset.find(x => x.objectType == OnboardedObjectTypes.issuedate);
    let frontImgUploadField = fieldset.find(x => x.objectType == OnboardedObjectTypes.frontdocument);
    let backImgUploadField = fieldset.find(x => x.objectType == OnboardedObjectTypes.backdocument);
    let isEditFormIntegration = false;

    let removeField = data.DEL.map((del) => {
      switch (del) {
        case "addReferenceNo":
          return refNoField.formFieldId;
        case "addExpiryDate":
          return expDateField.formFieldId;
        case "addIssueDate":
          return issueDateField.formFieldId;
        case "addFrontDoc":
          return frontImgUploadField.formFieldId;
        case "addBackDoc":
          return backImgUploadField.formFieldId;
        default:
          return null;
      }
    }).filter((item) => item !== null);
    

    let addField = data.ADD.map((add) => {
      switch (add) {
        case "addReferenceNo":
          return { applicationFormStageSectionId: sectionId, fieldName: licenseNameField.labelName + 'RefNo', fieldType: 11, tabIndex: 3, columnIndex: 1, labelName: 'Reference Number', fieldMaxLength: 100, placeholder: licenseNameField.labelName + ' Reference Number', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : "referencenumber", questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.referencenumber : null, objectType: OnboardedObjectTypes.referencenumber };
        case "addExpiryDate":
          return { applicationFormStageSectionId: sectionId, fieldName: licenseNameField.labelName + 'ExpDate', fieldType: 12, tabIndex: 7, columnIndex: 1, labelName: 'Expiry Date', placeholder: licenseNameField.labelName + ' Expiry Date', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : "expirydate", questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.expirydate : null, objectType: OnboardedObjectTypes.expirydate, fieldValidator: 'futuredate' };
        case "addIssueDate":
          return { applicationFormStageSectionId: sectionId, fieldName: licenseNameField.labelName + 'IssueDate', fieldType: 12, tabIndex: 5, columnIndex: 1, labelName: 'Issue Date', placeholder: licenseNameField.labelName + ' Issue Date', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : null, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.issuedate : null, objectType: OnboardedObjectTypes.issuedate, fieldValidator: 'pastdate' };
        case "addFrontDoc":
          return { applicationFormStageSectionId: sectionId, fieldName: licenseNameField.labelName + "FrontImg", fieldType: 22, tabIndex: 11, columnIndex: 1, labelName: licenseNameField.labelName + ' Front Document Upload', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : null, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.document : null, objectType: OnboardedObjectTypes.frontdocument, integratedTo: 1 };
        case "addBackDoc":
          return { applicationFormStageSectionId: sectionId, fieldName: licenseNameField.labelName + "BackImg", fieldType: 22, tabIndex: 13, columnIndex: 1, labelName: licenseNameField.labelName + ' Back Document Upload', objectName: isEditFormIntegration ? OnboardedObjects.LicencesandCertificates : null, questionSpan: 6, answerSpan: 4, maxColumn: 2, isMandatory: 1, atsPropertyId: isEditFormIntegration ? this.atsPropertyIdData.document : null, objectType: OnboardedObjectTypes.backdocument, integratedTo: 1 };
        default:
          return null;
      }
    }).filter((item)=>item !== null);
    

    if (addField.length == 0 && removeField.length == 0 && data.labelName == licenseNameField.labelName && data.atsPropertyValue == licenseNameField.atsPropertyValue && data.isRequired == licenseNameField.isRequired) {
      return {
        isSuccess: false,
        errMsg: "No changes made!",
        qry: null
      }
    }

    return {
      isSuccess: true,
      errMsg: null,
      qry: { UpdateTicketNLicenceNSkill: { ADD: addField, DEL: removeField, labelName: data.labelName, refFormFieldId: licenseNameField.formFieldId, fieldGroupId: licenseNameField.fieldGroupId, lastFieldTabIndex: lastFieldTabIndex, atsPropertyValue: (data.atsPropertyValue == "" || data.atsPropertyValue == null) ? null : data.atsPropertyValue, isMandatory : data.isRequired ? 1 :0  } }
    }
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
