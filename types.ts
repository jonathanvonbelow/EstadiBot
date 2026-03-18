export type UnitId = 'unit1' | 'unit2' | 'unit3' | 'unit4' | 'unit5';
export type ViewMode = 'chat' | 'analysis' | 'examples' | 'resources';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface Unit {
  id: UnitId;
  title: string;
  description: string;
  topics: string[];
  content: string; // Markdown content from PDF
}

export interface ResourceLink {
  title: string;
  url: string;
  description: string;
}

export interface ResourceCategory {
  title: string;
  icon: any;
  links: ResourceLink[];
}

export interface DataColumn {
  name: string;
  type: 'number' | 'string';
  data: (string | number)[];
}

export interface Dataset {
  name: string;
  columns: DataColumn[];
  rowCount: number;
}

export interface DescriptiveStats {
  column: string;
  mean?: number;
  median?: number;
  mode?: string;
  variance?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  range?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  count: number;
  missing: number;
}