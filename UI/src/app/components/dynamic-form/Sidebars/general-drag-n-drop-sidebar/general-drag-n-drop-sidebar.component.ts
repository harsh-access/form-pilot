import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxToast } from '@rx/view';
import { IPropList } from 'src/app/view-modal/GeneralModels';
declare var window: any;

@Component({
  selector: 'app-general-drag-n-drop-sidebar',
  templateUrl: './general-drag-n-drop-sidebar.component.html',
  styleUrls: ['./general-drag-n-drop-sidebar.component.css']
})
export class GeneralDragNDropSidebarComponent implements OnInit  {

  bsCanvas: any;
  @Input() sidebarPosition : string = 'end';
  @Input() modelList : Array<{id:number, value:any, orderNo?:number}> = [];
  @Output() updateDnDSidebar = new EventEmitter<{ status: boolean, data : Array<{id:number, orderNo:number}> }>();

  isSaveEnabled: boolean = false;
  isActiveTab: number = 0;
  propList: Array<IPropList> = [];
  PropsEditForm:FormGroup ;
  intialFormValue: any={};

  constructor(private fb : FormBuilder, private toast : RxToast){}

  ngOnInit(): void {
    this.openCanvas();
  }

  verifyFormChangeDetection() {
    this.PropsEditForm.valueChanges.subscribe(val => {
      this.isSaveEnabled = JSON.stringify(this.intialFormValue) != JSON.stringify(this.PropsEditForm.value);
    });
  }

  openCanvas() {
    this.bsCanvas = new window.bootstrap.Offcanvas(document.getElementById('generalDragDropSideBar'));
    if (this.modelList.length == 0){
      this.cancelChanges(); return;
    }
    this.setValuesToForm();
    if (this.propList.length > 0)
      this.bsCanvas.show();
    else{
        this.cancelChanges(); return;
    }
    this.verifyFormChangeDetection();
  }

  setModelAndFormGroup() {
    this.PropsEditForm = this.fb.group({
      reorderArr: this.fb.array(this.modelList.map((item, idx)=>({
        id: item.id,
        value: item.value,
        orderNo: item.orderNo ? item.orderNo : idx + 1
      }))),
    });
  }

  private setValuesToForm() {
    // setup form & Model
    this.setModelAndFormGroup();

    // set PopertyList
    this.propList = [{ propType: 'DnD', prop: 'reorderArr', propLabel: '' }] ;

    // set initial Form values
    this.intialFormValue = JSON.parse(JSON.stringify(this.PropsEditForm.value));
  }

    saveProcess(): Array<{id:number,orderNo:number}> {
      if(JSON.stringify(this.intialFormValue.reorderArr) == JSON.stringify(this.PropsEditForm.value.reorderArr)) return [];
      this.PropsEditForm.value.reorderArr = this.PropsEditForm.value.reorderArr.map((t, idx)=>({id: t.id, orderNo: idx + 1}));
      return this.PropsEditForm.value.reorderArr;
    }

    /** Final Buttons */
    saveChanges(){
      if(this.PropsEditForm.invalid) {
        this.toast.show('Please Fill required values',{status : 'error'})
        return;
      }

      const passedObject  = this.saveProcess();
      if(passedObject.length == 0) {this.cancelChanges(); return;}
      console.log(passedObject);
      this.updateDnDSidebar.emit({status:true, data: passedObject});
      this.bsCanvas.hide();
    }

    cancelChanges() {
      this.bsCanvas.hide();
      this.updateDnDSidebar.emit({ status:false, data: [] });
    }

    /* CDK Methods */
    dropAction(event: CdkDragDrop<any[]>, prop:string){
      const updatedValue = { ...this.PropsEditForm.value };
      moveItemInArray(updatedValue[prop], event.previousIndex, event.currentIndex);
      this.PropsEditForm.setValue(updatedValue);
    }
}
