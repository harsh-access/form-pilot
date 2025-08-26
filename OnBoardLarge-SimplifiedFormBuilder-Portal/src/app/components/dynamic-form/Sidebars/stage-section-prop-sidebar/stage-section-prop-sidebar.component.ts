import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ISectionSidebarModel, IStageSidebarModel } from 'src/app/view-modal/SidebarModels/StageSideBarModel';
import { getSectionPropertyList, getStagePropertyList } from '../../dynamic-control/dynamic-common-data/edit-propertyList-function';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
// import { RxToast } from '@rx/view'; // Removed for simplified POC
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { IPropList } from 'src/app/view-modal/GeneralModels';
declare var window: any;

@Component({
  selector: 'app-stage-section-prop-sidebar',
  templateUrl: './stage-section-prop-sidebar.component.html'
})
export class StagePropSidebarComponent implements OnInit {
  bsCanvas: any;
  @Input() isSectionSidebar : boolean = false;
  @Input() model : IStageSidebarModel | ISectionSidebarModel = null;
  @Input() sidebarPosition : string = 'end';
  @Input() modelList : Array<any> = [];
  @Output() updateStageSidebar = new EventEmitter<{ status: boolean, data : any}>();

  PropsEditForm:FormGroup ;
  propList: Array<IPropList> = [];
  isSaveEnabled: boolean = false;
  isNewAddtion:boolean = false;
  isActiveTab: number = 0;
  intialFormValue: any={};

  constructor(private fb : FormBuilder){}

  ngOnInit(): void {
    this.setModelAndFormGroup();
    this.openCanvas();
    this.verifyFormChangeDetection();
  }

  setModelAndFormGroup() {
    if (this.isSectionSidebar) {
      this.isNewAddtion =  this.modelList.findIndex(x=>x.formSectionId == 0) == -1 ? false : true;
      this.model = this.model as ISectionSidebarModel;
      this.PropsEditForm = this.fb.group({
        sectionName: [null, [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
        formStageId: [null]
      });
    }
    else {
      this.isNewAddtion =  this.modelList.findIndex(x=>x.formStageId == 0) == -1 ? false : true;
      this.model = this.model as IStageSidebarModel;
      this.PropsEditForm = this.fb.group({
        stageName: [null, [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]]
      });
    }
  }

  verifyFormChangeDetection() {
    this.PropsEditForm.valueChanges.subscribe(val => {
      this.isSaveEnabled = JSON.stringify(this.intialFormValue) != JSON.stringify(this.PropsEditForm.value);
    });
  }

  openCanvas() {
    this.bsCanvas = new window.bootstrap.Offcanvas(document.getElementById('stageSectionSideBarCanvas'));
    this.setValuesToForm();
    if (this.propList.length > 0)
      this.bsCanvas.show();

    if(this.model == null || this.propList.length < 1)
      this.cancelChanges();
  }

  private setValuesToForm() {
    // set PopertyList
    this.propList = this.isSectionSidebar ? getSectionPropertyList(this.isNewAddtion) : getStagePropertyList() ;

    // set values to form
    this.PropsEditForm.patchValue(this.model);

    // set initial Form values
    this.intialFormValue = JSON.parse(JSON.stringify(this.PropsEditForm.value));
  }

  /** Save Process */
  private saveStageProcess(){
    if(this.modelList.findIndex(x=>x.title && x.title.toLowerCase() == this.PropsEditForm.value.stageName.toString().toLowerCase()) != -1 ){
      console.error(`${this.PropsEditForm.value.stageName} section already exists`)
      return null;
    }
    return {status:true, data: { stageName : this.PropsEditForm.value.stageName }};
  }

  private saveSectionProcess(){

    if(this.modelList.findIndex(x=>x.title && x.title.toLowerCase() == this.PropsEditForm.value.sectionName.toString().toLowerCase()) != -1 && this.intialFormValue.sectionName != this.PropsEditForm.value.sectionName ){
      console.error(`${this.PropsEditForm.value.sectionName} sub-section is already exist`)
      return null;
    }

    return {
      status: true,
      data: {
        sectionName: this.PropsEditForm.value.sectionName,
        ...(this.isNewAddtion && { formStageId: this.PropsEditForm.value.formStageId })
      }
    };
  }

  /** Final Buttons */
  saveChanges(){
    if(!this.PropsEditForm || this.PropsEditForm.invalid) {
      console.error('Please Fill required values')
      return;
    }
    let passedObject  = this.isSectionSidebar ?  this.saveSectionProcess() : this.saveStageProcess() ;
    if(!passedObject) return;

    console.log(passedObject);
    // return;
    this.updateStageSidebar.emit(passedObject);
    this.bsCanvas.hide();
  }

  cancelChanges() {
    this.bsCanvas.hide();
    this.updateStageSidebar.emit({ status:false, data: null });
  }

  /* CDK Methods */
  dndDrop(event: CdkDragDrop<any[]>, prop:string){
    const updatedValue = { ...this.PropsEditForm.value };
    moveItemInArray(updatedValue[prop], event.previousIndex, event.currentIndex);
    this.PropsEditForm.setValue(updatedValue);
  }
}
