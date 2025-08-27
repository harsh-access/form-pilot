export interface ISectionList {
  id: number;
  title: string;
  orderNo: number;
  formStageId?: number; // For compatibility with existing code
  stageName?: string; // For compatibility with existing code
  stageOrderNo?: number; // For compatibility with existing code
  formSectionId?: number; // For compatibility with existing code
  sectionName?: string; // For compatibility with existing code
  sectionOrderNo?: number; // For compatibility with existing code
}

export interface ISubSectionList {
  sectionId?: number;
  id: number;
  title: string;
  orderNo: number;
}

// For compatibility with existing code
export interface IStageList {
  formStageId: number;
  stageName: string;
  stageOrderNo: number;
}
