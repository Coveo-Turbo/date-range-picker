export interface IDateRangePickerAnalyticsArgs {
  rangeFieldTo: string;
  rangeFieldFrom: string;
  rangePickerTitle: string;
  rangePickerState: string;
}

export interface IDateInputChangeEventArgs {
  from: number;
  to: number;
}

export interface IRadioSelectEventArgs extends IDateInputChangeEventArgs {
  radio: number;
}

export class DateRangePickerEvent {
  static inputChange = 'inputChange';
  static radioSelect = 'radioSelect';
  static clear = 'clear';
}

export class DateRangePickerActionCause {
  static facetRangeClear = 'facetRangeClear';
  static facetRangeRadioSelect = 'facetRangeRadioSelect';
  static facetRangeInputChange = 'facetRangeInputChange';
}
