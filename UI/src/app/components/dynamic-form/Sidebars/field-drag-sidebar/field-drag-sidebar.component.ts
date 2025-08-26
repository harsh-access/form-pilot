import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Columns, SubSection } from 'src/app/view-modal/DynamicFormModel';
import { RxToast } from '@rx/view';
import { IPropList } from 'src/app/view-modal/GeneralModels';
declare var window: any;

interface IFieldReorderRequestModel {
  formFieldId: number;
  tabIndex: number;
  columnIndex: number;
}

interface IDragRawModel extends Columns {
  childs: IDragRawModel[];
}

@Component({
  selector: 'app-field-drag-sidebar',
  templateUrl: './field-drag-sidebar.component.html',
  styleUrls: ['./field-drag-sidebar.component.css']
})
export class FieldDragSidebarComponent implements OnInit {

  bsCanvas: any;
  isShowComponent: boolean=false;
  isActiveTab: number = 0;
  propList: Array<IPropList> = [];
  PropsEditForm:FormGroup;
  @Input() section : SubSection = null;
  @Input() sidebarPosition : string = 'end';
  @Output() updateDragFieldSidebar = new EventEmitter<{ status: boolean, data : any }>();
  isSaveEnabled: boolean = false;
  intialFormValue: any={};

  columnList:Columns[]=[];
  generalDocIDX:number = -1;
  refFieldsList:Array<IDragRawModel> = [];
  dependentFields:Array<IDragRawModel> = [];
  showChildId:number[] = [];

  constructor(private fb:FormBuilder, private toast:RxToast) {  }

  ngOnInit(): void {
    this.openCanvas();
    this.verifyFormChangeDetection();
  }

  verifyFormChangeDetection() {
    if(this.PropsEditForm != undefined)
    this.PropsEditForm.valueChanges.subscribe(val => {
      this.isSaveEnabled = JSON.stringify(this.intialFormValue) != JSON.stringify(this.PropsEditForm.value);
    });
  }

  openCanvas() {
    this.bsCanvas = new window.bootstrap.Offcanvas(document.getElementById('DragFieldSidebarCanvas'));
    if(this.section==null || this.section == undefined) {this.cancelChanges(); return;}
    this.intialMainSetup();
    if (this.propList.length > 0){
      this.isShowComponent = true;
      this.bsCanvas.show();
    }
    else
      this.cancelChanges();
  }

  private intialMainSetup() {
    if(!this.setModelAndFormGroup()) return;

    // set PopertyList
    this.propList = [{ propType: 'DnD', prop: 'reorderArr', propLabel: '' }] ;
    this.intialFormValue = JSON.parse(JSON.stringify(this.PropsEditForm.value));
  }

  private setModelAndFormGroup() {

    // intialSetup for the field-set
    if(!this.intialDataSetup()) return false;

    this.PropsEditForm = this.fb.group({
      reorderArr:this.fb.array(this.getDragList())
    });

    return true;
  }

  getDragList(){
    const dragList = JSON.parse(JSON.stringify(this.refFieldsList));
    return dragList;
  }

  private intialDataSetup() {

    this.columnList = this.section.rows.flatMap(x=>x.columns);
    this.generalDocIDX = this.columnList.findIndex(val => val.fieldName.toUpperCase() == 'GENERALDOCUMENTS');

    this.refFieldsList = this.section.rows.flatMap(x => x.columns.filter(y => (y.dependentFormFieldColumns.length == 0 && y.fieldName.toUpperCase() != 'GENERALDOCUMENTS' ))).map(s => ({ ...s, childs: [] }));
    let status = true;
    this.section.rows.forEach(row => {
      if (!status) return;
        row.columns.forEach(col => {
          if (!status) return;
          if (col.dependentFormFieldColumns.length > 0) {
            const arr = this.findAllObjectIndexesById(this.refFieldsList, col.dependentFormFieldColumns[0].refFormFieldId);
            if (arr.length < 1 || arr.length > 2) { status = false; return; }
            switch (arr.length) {
              case 1:
                this.refFieldsList[arr[0]].childs.push({ ...col, childs:[]});
                break;
              case 2:
                this.refFieldsList[arr[0]].childs[arr[1]].childs.push({ ...col, childs:[]});
                break;
              default:
                status = false; return;
                break;
            }
          }
        });
    });

    if(!status){
      this.toast.show('This sub-section is restricted for the rearrangement', {status:'error'});
      this.refFieldsList = [];
      return status;
    }
    console.log(this.refFieldsList);
    return status;

  }


  getFlateStructuredOrderList():IFieldReorderRequestModel[] {
    if(!this.section.maxColumn || this.section.maxColumn == null || this.section.maxColumn == undefined)
    return [];

    let reOrderArr:IDragRawModel[]  = this.PropsEditForm.get('reorderArr').value;
    console.log(this.section.maxColumn,reOrderArr);

    if(reOrderArr.length == 0 ) return [];

    let finalArray: Array<IFieldReorderRequestModel>= [];

    const isMoreThanOneLevelNesting = reOrderArr.some( val => this.getNestingLevelForElement(val) > 1);
    if (isMoreThanOneLevelNesting){
      let currentTabIndex: number = 0;
      reOrderArr.forEach((element,idx) => {
        finalArray.push({ formFieldId: element.formFieldId, tabIndex: ++currentTabIndex, columnIndex: 1 });
        if(element.childs.length == 0) return;
        const arr = this.prepareUpdatedOrderedList(element.childs, currentTabIndex);
        currentTabIndex = Math.max(...arr.map( obj => obj.tabIndex ));
        finalArray.push(...arr);
      });
    }
    else
      finalArray.push(...this.prepareUpdatedOrderedList(reOrderArr));

    /* Required Static Changes */

    if(this.generalDocIDX != -1){
        finalArray.sort((a, b) => a.tabIndex > b.tabIndex ? 1 : -1).forEach((field, idx) => { if(idx == 0) field.columnIndex =1; field.tabIndex += 1; })
        finalArray.push({ formFieldId: this.columnList[this.generalDocIDX].formFieldId, tabIndex: 1, columnIndex: 1 });
    }

    return finalArray;
  }


  // this logic is targeted for the skill, ticket & licence type of section
  // same columnindex is applied to their dependent
  // if there any other type max colum found it will reset the counter
  private prepareUpdatedOrderedList(reOrderArr:IDragRawModel[], currentTabIndex:number=0) : IFieldReorderRequestModel[]{
    const sectionMax = this.section.maxColumn ;
    let finalArray: Array<IFieldReorderRequestModel>= []
    let counter: number = 0;
    let maxDepentedCount: number = 0;

    // Re-Order DocumentCollection Controls & Push them to the Last
    let uploadCollectionControls:number[] = reOrderArr.filter(item => item.controlType == "DocumentCollection").map(item => item.formFieldId);
    reOrderArr = this.reOrderDocumentCollection(reOrderArr,uploadCollectionControls);

    reOrderArr.forEach((col, idx) => {
      if (counter >= col.maxColumn || (idx != 0 && col.maxColumn != reOrderArr[idx - 1].maxColumn)) {
        counter = 0;
        currentTabIndex = (sectionMax * maxDepentedCount) + currentTabIndex;
        maxDepentedCount = 0;
      }
      finalArray.push({ formFieldId: col.formFieldId, tabIndex: ++currentTabIndex, columnIndex: ++counter });

      if (col.childs.length > 0) {
        maxDepentedCount = Math.max( maxDepentedCount , col.childs.length) ;
        let childTabIdx = currentTabIndex;
        col.childs.forEach(child => {
          childTabIdx += sectionMax;
          finalArray.push({ formFieldId: child.formFieldId, tabIndex: childTabIdx, columnIndex: col.childs.some(val => val.columnIndex != col.columnIndex ) ? child.columnIndex : counter  });
        })
      }
    });

    return finalArray;
  }

  /** Re-Order Document Collection Controls **/
  private reOrderDocumentCollection(reOrderData:IDragRawModel[],uploadCollectionControls:number[]):IDragRawModel[]{
    if(uploadCollectionControls.length == 0 || (uploadCollectionControls.length === reOrderData.length)){
      return reOrderData;
    }

    let endResult: Array<IDragRawModel>= [];
    let count = 1;
    let removeControls = reOrderData.filter(item => uploadCollectionControls.includes(item.formFieldId));
    reOrderData = reOrderData.filter(item => !uploadCollectionControls.includes(item.formFieldId));

    // Reset The Tab Index of all elements
    reOrderData.forEach(item => {
      item.tabIndex = count;
      endResult.push(item);
      count++;
    });
    removeControls.forEach(item => {
      item.tabIndex = count;
      endResult.push(item);
      count++;
    });
    return endResult;
  }

  /** Final Buttons */
  saveChanges(){
    const data:IFieldReorderRequestModel[]= this.getFlateStructuredOrderList();
    console.log( this.section.rows.flatMap(x=>x.columns).length, data);
    if(!data || data.length < 1 || data.length != this.section.rows.flatMap(x=>x.columns).length) {
      this.toast.show('Functional issue occured',{status:'error'});
      this.cancelChanges();
      return;
    };
    this.updateDragFieldSidebar.emit({ status:true, data: data });
    this.bsCanvas.hide();
  }

  cancelChanges() {
    this.bsCanvas.hide();
    this.updateDragFieldSidebar.emit({ status:false, data: [] });
  }

  /* CDK Methods */
  dndOnItemDrop(event: CdkDragDrop<any[]>, prop:string, arr:Array<IDragRawModel>){
    const updatedValue = { ...this.PropsEditForm.value };
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.PropsEditForm.setValue({ ...this.PropsEditForm.value });
  }

  /** Recursive mehtods */
  private getNestingLevelForElement(element: IDragRawModel): number {
    if (element.childs.length === 0)
      return 0; // Return 0 for elements with no children.

    return element.childs.reduce((maxChildLevel, child) => {
      return Math.max(maxChildLevel, this.getNestingLevelForElement(child));
    }, 0) + 1;
  }

  private findAllObjectIndexesById(arr, idToFind, currentIndex = []):number[] {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const currentPath = [...currentIndex, i];

        if (item.formFieldId === idToFind) {
          return currentPath;
        }

        if (item.childs && item.childs.length > 0) {
          const result = this.findAllObjectIndexesById(item.childs, idToFind, currentPath);
          if (result.length > 0) {
            return result;
          }
        }
      }
      return [];
  }
}
