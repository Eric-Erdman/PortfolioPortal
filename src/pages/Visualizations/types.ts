export interface CattleData {
  SHORT_DESC: string;
  DOMAINCAT_DESC: string;
  YEAR: number;
  VALUE: number;
}

export interface PropertyTaxData {
  DOMAINCAT_DESC: string;
  YEAR: number;
  VALUE: number;
}

export interface OperationsData {
  DOMAINCAT_DESC: string;
  YEAR: number;
  VALUE: number;
}

export interface VisualizationProps {
  selectedColor: 'custom1' | 'custom2' | 'custom3';
}
