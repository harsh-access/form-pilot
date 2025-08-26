import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RxToast } from '@rx/view';
import { FileService } from 'src/app/components/shared/services/file-services';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';
import { Columns, DynamicForm } from 'src/app/view-modal/DynamicFormModel';
import { ApiResponseModel } from 'src/app/view-modal/GeneralApiModel';
import { DynamicFormService } from '../../dynamic-form.service';
declare var window: any;

@Component({
  selector: 'app-field-control',
  templateUrl: './field-control.component.html',
  styleUrls: ['./field-control.component.css'],
})
export class FieldControlComponent implements OnInit {

  @Input() dynamicForm !: DynamicForm;
  @Input() field!: FormField;
  @Input() conditionalFlag: String = '';
  @Output() updatedField = new EventEmitter<Columns>();

  datePickerValue !: Date
  isVideoOrImageField: boolean = false;

  constructor( private toast: RxToast, private dynamicFormService: DynamicFormService, private fileService: FileService) {
  }

  ngOnInit(): void {  
    this.checkAndAddLookupValue();
    this.setToolTip();
    this.checkIfVideoOrImageField();
  }

  checkIfVideoOrImageField() {
    this.isVideoOrImageField = ((this.field.imagePath != null && this.field.imagePath != '') || (this.field.videoId > 0));
  }

  setToolTip(){
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipTriggerList.forEach(x=>{
      new window.bootstrap.Tooltip(x);
    });
  }

  checkImageExt(field: FormField, fileExt:string){
    return (field.defaultValue != undefined && field.defaultValue != '' && field.defaultValue != null) && field.defaultValue.includes(fileExt)
  }


  clickIAgreeButton(field: FormField) {
    if ((!field.isSignatureRequired || field.additionalInfo != null)  && (field.value == null || field.value == 46)) field.value = 45; else field.value = 46;
  }

  valueChangeForDependent(field: FormField) {
    this.updatedField.emit(field);
  }

  /**  Template Methods   **/
  setFieldValue(lkp: any) {
    if (this.field.value == null) return lkp.id;
    let values: string[] = this.field.value.toString().split(",");
    if (!values.includes(lkp.id.toString())) return this.field.value + ',' + lkp.id
    return values.filter(x => x != lkp.id).toString();
  }

  checkAndAddLookupValue() {
    if (FieldTypeEnum[this.field.controlType] == FieldTypeEnum.SwitchCheckBox) {
      if (this.field.lookupViewId && this.field.lookupViewId == 1 && this.field.lookUps  && this.field.lookUps?.length == 1){
        return
      }
      let arr1 = [
        {
          id: 45,
          value: "Yes",
          lookupViewId: 1,
          lookupKeyId: 0,
          refValueId: 0,
          clientId: 0
        }
      ]
      this.field["lookUps"] = [];
      this.field.lookUps.push(...arr1);
    }
    else if (this.field.lookupViewId && this.field.lookupViewId == 1) {
      if (this.field.lookUps && this.field.lookUps.length > 0)
        return;

      let arr = [
        {
          id: 45,
          value: "Yes",
          lookupViewId: 1,
          lookupKeyId: 0,
          refValueId: 0,
          clientId: 0
        },
        {
          id: 46,
          value: "No",
          lookupViewId: 1,
          lookupKeyId: 0,
          refValueId: 0,
          clientId: 0,
        }
      ]
      this.field["lookUps"] = [];
      this.field.lookUps.push(...arr);
    }
    
  }

  /**validation methods */
  public dateOnly(event: any) {
    if (event.target.value.match('^[0-9]{2}/[0-9]{2}/[0-9]{4}$') == null)
      event.target.value = '';
  }

  public numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  public decimalPoint(event: any) {
    event.target.value = parseFloat(event.target.value).toFixed(2);
    if (isNaN(event.target.value))
      event.target.value = null
  }

  public decimalNumberOnly(key: any): boolean {
    var keycode = (key.which) ? key.which : key.keyCode;
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    }
    else {
      var parts = key.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      return true;
    }
  }

  /** Css Class Methods */
  public getQuestionSpan(column: any): any {
    if (column.questionSpan)
      return column.questionSpan;
  }

  public getRowClass(row: any): any {
    if (row.rowClass != "" && row.rowClass != null)
      return row.rowClass;
    return "";
  }

  public getAnswerSpan(column: any): any {
    if (column.answerSpan)
      return column.answerSpan;
  }

  public getFieldClass(column: any): any {
    if (column.fieldClass != "" && column.fieldClass != null)
      return column.fieldClass;
    return "";
  }

  getFileUploadClass(field: FormField) {
    if (field.fieldName == 'visaimage') return 'w-100'
    return field.maxColumn && field.maxColumn < 4 ? `w-${(field.maxColumn * 25) + 25} ms-auto` : 'w-100';
  }

  /** Get Special Conditial Css Class **/
  getConditionalCSSFlag(field: FormField) {
    let flag = '';
    switch (field.fieldName) {
      case 'visasummary': flag = 'mx-auto'
        break;
      default:
        break;
    }
    return flag;
  }


  downloadFile(field: FormField) {
    const url: string = field.defaultValue;
    if (url && url != null && url != '') {
      this.dynamicFormService.postDownloadUploadedFile({ FileUrl: url }).subscribe((res: ApiResponseModel) => {
        if (res && res.isSuccess == true) {
          this.fileService.downloadFileFromUrl(res.message);
        } else {
          this.toast.show('File Not available', { status: 'error' });
        }
      });
    }
    else {
      this.toast.show('File Not available', { status: 'error' });
    }
  }

}
