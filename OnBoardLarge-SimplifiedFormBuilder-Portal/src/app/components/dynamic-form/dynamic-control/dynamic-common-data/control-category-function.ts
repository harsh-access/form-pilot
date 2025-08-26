import { FormTypeEnum } from "src/app/Enums/ApplicationForm.enum";

export interface IControlCategory {
  catId: number,
  catName: string,
  controls: string[],
  isHideControl?: boolean
}

export function getControlCategoryList(categoryId: number = 0, controlName: string = null,formType: number = 0) {
  const staticList: Array<IControlCategory> = [
    { catId: 1, catName: 'Text Box', controls: ['TextBox', 'Email', 'NumericTextBox', 'MultilineTextbox', 'DatePicker', 'ContactNumber'] },
    { catId: 2, catName: 'List Box', controls: ['DropDown'] },
    { catId: 3, catName: 'Single Choice', controls: ['RadioButton'] },
    { catId: 4, catName: 'Multiple Choice', controls: ['MultipleSelectCheckBox'] },
    { catId: 5, catName: 'Label', controls: ['SpecialLable', 'Lable','LinkLable'] },
    { catId: 6, catName: 'I Agree Button', controls: ['LableCheckBox'], isHideControl:   formType == FormTypeEnum.RererenceCheck },
    { catId: 7, catName: 'Document', controls: ['SingleFileUpload', 'DocumentCollection'], isHideControl:   formType == FormTypeEnum.RererenceCheck},
    { catId: 8, catName: 'Skills', controls: ['SwitchCheckBox'], isHideControl:   formType == FormTypeEnum.RererenceCheck },
    { catId: 9, catName: 'Custom PDF', controls: ['ClientReport'], isHideControl: true },
    { catId: 10, catName: 'Slider', controls: ['SingleSlider'] },
    { catId: 100, catName: 'Other', controls: ['Signature', 'ParentSignature', 'Image', 'ImageLabel', 'RxMask', 'DecimalTextBox', 'RxTag', 'RxSelect'], isHideControl: true }
  ];

  // return full list
  if (categoryId == 0 && controlName == null)
    return staticList;

  // while search with both params categoryid and controlName
  if (categoryId != 0 && controlName != null)
    return staticList.filter(cat => cat.catId == categoryId && cat.controls.findIndex(s => s.toLowerCase() == controlName.toLowerCase()) != -1);

  // while search with categoryid
  if (categoryId != 0 && controlName == null)
    return staticList.filter(cat => cat.catId == categoryId);

  // while search with controlName
  if (categoryId == 0 && controlName != null)
    return staticList.filter(cat => cat.controls.findIndex(s => s.toLowerCase() == controlName.toLowerCase()) != -1)
}


