import { FieldsetService } from 'src/app/components/shared/services/fieldset.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { RxToast } from '@rx/view'; // Removed for simplified POC
import { FileService } from 'src/app/components/shared/services/file-services';
import { fileUpload } from 'src/app/view-modal/GeneralApiModel';
import { IFileUploadContainer, IPropList, ILkpOptionArr } from 'src/app/view-modal/GeneralModels';
import { prepareDynamicFormGroup, whitespaceValidator } from '../fieldset-sidebar/fieldset-propertyList-functions';
import { Columns, Sections } from 'src/app/view-modal/DynamicFormModel';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';
import { SaveChangesModel } from 'src/app/view-modal/EditFormModels';
import { DynamicFormService } from '../../dynamic-form.service';
import { OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';

@Component({
  selector: 'app-sidebar-prop-formgroup',
  templateUrl: './sidebar-prop-formgroup.component.html'
})

export class SidebarPropFormgroupComponent implements OnInit {
  @Input() FormGroupToDisplay: FormGroup;
  @Input() PropList: Array<IPropList>;
  @Input() isActiveTab: number = 0;
  @Input() uniqueStr: string;
  @Input() filesContainer: Array<IFileUploadContainer>;
  @Input() field: Columns;
  @Input() isAddFieldset: boolean;
  @Input() isLicenceSection: boolean;
  @Input() section: Sections;
  @Output() outputFilesContainerChanged = new EventEmitter<Array<IFileUploadContainer>>();
  isDependentDataChanges: boolean = false;
  intialFormValue: object = {};
  allColumns: Columns[] = [];

  constructor(private fb: FormBuilder, private fileService: FileService, private fieldsetService: FieldsetService, private dynamicFormService: DynamicFormService) {

  }

  /// Need to work for the FileUplod Control
  /// As of now this is only used for Tickets & Licences
  /// If we need to use this for other fieldset categories then we need to make this dynamic
  onChildFilesContainerChanged(newFilesContainer: Array<IFileUploadContainer>) {
    this.filesContainer = newFilesContainer;
  }

  ngOnInit(): void {
    this.uniqueStr = this.uniqueStr + '1';
    if (this.isLicenceSection && !this.isAddFieldset) {
      this.setDependency()
    }
  }

  getDependent(prop: string): boolean {
    let dependency = this.PropList.find(x => x.prop == prop).attr.dependentOn;
    return dependency.refValue.includes(this.FormGroupToDisplay.value[dependency.id])
  }

  addNewOption(prop: string, obj: ILkpOptionArr = { id: null, value: null, clientLookupCode: null }) {
    let arr = <FormArray>this.FormGroupToDisplay.get(prop)
    let frm = this.fb.group({
      id: [(obj.id != null ? obj.id : null)],
      value: [obj.id != null ? obj.value : `Option ${arr.length + 1}`, [Validators.required, whitespaceValidator()]],
      clientLookupCode: [obj.clientLookupCode]
    });
    arr.push(frm);
  }

  addAnotherSet(prop: string) {
    (<FormArray>this.FormGroupToDisplay.get(prop)).push(prepareDynamicFormGroup(this.PropList.find(x => x.prop == prop).nestedProps));
  }

  addFieldOption(prop: string, obj: ILkpOptionArr = { id: null, value: null, clientLookupCode: null }) {
    let arr = <FormArray>this.FormGroupToDisplay.get(prop + '.options');
    arr.push(this.fb.group({
      id: Math.max(...arr.controls.map((formGroup: any) => formGroup.get('id').value)) + 1,
      value: [obj.id != null ? obj.value : null, [Validators.required, whitespaceValidator()]],
      clientLookupCode: [obj.clientLookupCode],
    }));
  }

  removeFieldOption(prop: string, idx: number) {
    let options = <FormArray>this.FormGroupToDisplay.get(prop + '.options');
    if (options.length == 2) {
      console.error('At least two options are required');
      return;
    }
    // else
    let selectedOptionBoxId = this.FormGroupToDisplay.get(prop + '.selectedOpt').value;
    let removedOptionId = options.controls[idx].get('id').value;
    if (removedOptionId == selectedOptionBoxId) {
      let ids = options.controls.map((formGroup: any) => formGroup.get('id').value);
      ids.splice(ids.findIndex(x => x == selectedOptionBoxId), 1);
      this.FormGroupToDisplay.get(prop + '.selectedOpt').setValue(Math.min(...ids));
    }
    options.removeAt(idx);
  }

  removeNestedSet(prop: string, idx: number) {
    // needs at least one nested set
    let atLeastOneSet = ['simpleIndQueSet', 'imageIndQueSet', 'videoIndQueSet'];
    if (atLeastOneSet.indexOf(prop) > -1 && (<FormArray>this.FormGroupToDisplay.get(prop)).length == 1) {
      console.error('At least one set is required');
      return;
    }
    (this.FormGroupToDisplay.get(prop) as FormArray).removeAt(idx);
  }

  downloadTicketLicencesData() {
  }

  // File Upload
  isFileUploaded(prop: string, isFileData: boolean = false): boolean {
    let url = this.FormGroupToDisplay.value[prop]
    return url && url != null && url != '' ? true : this.filesContainer.findIndex(x => x.prop == prop) > -1;
  }

  removeFileUrl(prop: string) {
    let idx = this.filesContainer.findIndex(x => x.prop == prop);
    if (idx > -1) this.filesContainer.splice(idx, 1);
    this.FormGroupToDisplay.controls[prop].setValue(null);
  }

  getFileName(prop: string): string {
    let url: string = this.FormGroupToDisplay.value[prop]
    if (url && url != null && url != '')
      return prepareFileName(url.split('/').slice(-1)[0]);

    let idx = this.filesContainer.findIndex(x => x.prop == prop);
    return idx > -1 ? prepareFileName(this.filesContainer[idx].fileData.fileName) : 'No Name';
  }

  onFileChange(data: any, item: IPropList) {
    let apiFileData: fileUpload = { fileName: null, base64Data: null, formFieldId: 0, isConvert: item?.attr?.isConvert !== undefined ? item.attr.isConvert : true };
    var file = null;
    try {
      file = data.srcElement.files[0]
    } catch (e) {
      file = data.target.files[0]
    }
    if (file) {
      apiFileData['fileName'] = file.name;
      if (file.size >= (5000 * 1024))  //5000 Kb
      {
        console.error("File size is larger than 5000 kb. It is not allowed");
        // this.FormGroupToDisplay.value[prop] = this.field[prop];
        return;
      }

      let ext = file.name.split('.').pop().toLowerCase();
      if (["xlsx"].indexOf(ext) == -1) {
        console.error("File type not supported");
        // this.FormGroupToDisplay.value[prop] = this.field[prop];
        return;
      }

      var fileBase64 = "";
      var reader = new FileReader();

      reader.readAsBinaryString(file);
      reader.onload = (readerEvt: any) => {
        fileBase64 = !readerEvt ? btoa(reader['content']) : btoa(readerEvt.target.result);
        if (fileBase64 != null && fileBase64 != '' && apiFileData.fileName != null && apiFileData.fileName != '') {
          apiFileData['base64Data'] = fileBase64;
          this.filesContainer.push({ prop: item.prop, fileData: apiFileData });
        }
      };
    }

    this.outputFilesContainerChanged.emit(this.filesContainer);
  }

  downloadFile(prop: string) {
    const url: string = this.FormGroupToDisplay.value[prop];
    if (url && url != null && url != '') {
      this.fileService.downloadFileFromUrl(url);
    } else if (this.filesContainer.findIndex(x => x.prop == prop) > -1) {
      console.log('Right now your file changes are not saved');
    }
    else {
      console.error('File Not available');
    }
  }

  // Dependency Work
  private setDependency() {

    const idx = this.PropList.findIndex((x) => x?.prop == 'custTypeForDependency');

    if (this.isAddFieldset || this.PropList.length < 1 || idx == -1) return;


    // prepare List
    this.allColumns = this.section.rows.flatMap((x) => x.columns);


    let columnList = this.allColumns.filter((c) => ['DropDown', 'RadioButton', 'SwitchCheckBox'].includes(c.controlType) && c.dependentFormFieldColumns.length <= 0)
    .sort((a, b) => a.tabIndex - b.tabIndex || a.columnIndex - b.columnIndex);

    let drpList: Columns[] = [];
    columnList.some((col) => {
      const flag = col.tabIndex >= this.field.tabIndex;
      if (!flag) drpList.push(col);
      return flag;
    });

    if (drpList.length < 1) {
      // set initial Form values
      this.intialFormValue = JSON.parse(JSON.stringify(this.FormGroupToDisplay.value));

      return;
    }
    // console.log('setDrpList', this.field.formFieldId, columnList, drpList);

    const isAlredyDependent = this.field.dependentFormFieldColumns.length > 0;

    if (isAlredyDependent && (
      this.field.dependentFormFieldColumns[0].action == "Hide" ||
      drpList.findIndex(t => t.formFieldId == this.field.dependentFormFieldColumns[0].refFormFieldId) == -1
    ))
      return;
    else if (isAlredyDependent) {
      this.FormGroupToDisplay.patchValue({
        custTypeForDependency: {
          formFieldId: this.field.formFieldId,
          refFormFieldId:
            this.field.dependentFormFieldColumns[0].refFormFieldId,
          refValue: (this.getControlType(this.field.dependentFormFieldColumns[0].refFormFieldId) == FieldTypeEnum.SwitchCheckBox) ? "45" : this.field.dependentFormFieldColumns[0].refValue,
          // refValue:
          dependencyStatus: true,
        },
      });
    }
    else
      this.FormGroupToDisplay.patchValue({
        custTypeForDependency: {
          formFieldId: this.field.formFieldId,
          refFormFieldId: null,
          refValue: null,
          dependencyStatus: true,
        },
      });

    let dataObject = {
      refFormFieldId: drpList.sort((a, b) => b.tabIndex - a.tabIndex),
      refValue: isAlredyDependent
        ? drpList.find((x) => x.formFieldId == this.field.dependentFormFieldColumns[0].refFormFieldId).lookUps
        : [],
    };
    this.PropList[idx]['attr'] = { dataObject };

    // set initial Form values
    this.intialFormValue = JSON.parse(JSON.stringify(this.FormGroupToDisplay.value));
  }

  private getControlType(refFormFieldId: number): FieldTypeEnum {
    return FieldTypeEnum[this.allColumns
      .find(column => column.formFieldId === refFormFieldId)
      .controlType];
  }

  dependentSelectionPairValueChange(selectedValue: string, prop: string, arrayKey: string, nextDependentListKey: string = null) {
    if (selectedValue == null || selectedValue == 'null' || selectedValue == '') {
      let valueObj = this.FormGroupToDisplay.value['custTypeForDependency'];
      valueObj['refFormFieldId'] = valueObj['refValue'] = null;

      // console.log('while null', valueObj);

      this.FormGroupToDisplay.patchValue({ custTypeForDependency: valueObj });

      this.PropList.find((x) => x.prop == prop).attr.dataObject[nextDependentListKey] = [];
      return;
    }

    let data: any = this.PropList.find((x) => x.prop == prop);
    let dataList: any[] = data.attr.dataObject[arrayKey];
    if (!dataList) return;
    if (nextDependentListKey) {
      data.attr.dataObject[nextDependentListKey] = dataList.find(
        (x) => x.formFieldId.toString() == selectedValue
      ).lookUps;
    }

    let obj = this.FormGroupToDisplay.value['custTypeForDependency'];

    if (arrayKey == 'refValue' && (this.getControlType(obj['refFormFieldId']) == FieldTypeEnum.SwitchCheckBox)) {
      selectedValue == "45" ? "true" : selectedValue;
    }

    obj[arrayKey] = selectedValue ? selectedValue : null;
    if (arrayKey == 'refFormFieldId') {
      obj[arrayKey] = selectedValue ? Number(selectedValue) : null;
      obj[nextDependentListKey] = null;
    }

    // console.log('while value', obj);
    this.FormGroupToDisplay.patchValue({ custTypeForDependency: obj });
  }

  setDepencyStatus(prop: string, propValue: any) {
    // console.log('before',propValue['dependencyStatus'], this.field.dependentFormFieldColumns[0]);
    propValue['dependencyStatus'] = !propValue['dependencyStatus'];
    if (!propValue['dependencyStatus']) {
      propValue['refFormFieldId'] = this.field.dependentFormFieldColumns[0].refFormFieldId;
      propValue['refValue'] = this.field.dependentFormFieldColumns[0].refValue;

      let obj = this.PropList.find(x => x.prop == prop).attr.dataObject;
      obj['refValue'] = obj['refFormFieldId'].find((y: Columns) => y.formFieldId == this.field.dependentFormFieldColumns[0].refFormFieldId).lookUps;
    }
    this.FormGroupToDisplay.patchValue({ [prop]: propValue });
    // console.log(this.FormGroupToDisplay.value[prop]);
  }

}

export function prepareFileName(fileName: string) {
  let ext = fileName.split('.').pop().toLowerCase();
  return fileName.length > 25
    ? fileName.substring(0, 20) + '...' + ext
    : fileName;
}
