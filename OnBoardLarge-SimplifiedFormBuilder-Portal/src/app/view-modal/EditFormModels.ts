export interface SaveChangesModel{
  applicationFormId:number;
  query:string;
  isPDFChangeRequired:boolean;
}

/** Stages Query */
export interface StageQuery{
  add?: {};
  update?:UpdateQuery;
  reorder?:Array<ReorderQuery>;
  delete?:number;
}

export interface UpdateQuery{
  id:number;
  prop:object
}

export interface ReorderQuery{
  id:number;
  orderNo:number
}
