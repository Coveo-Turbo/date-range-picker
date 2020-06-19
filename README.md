# DateRangePicker

Provides a From and To Date Picker to select a date range.

Disclaimer: This component was built by the community at large and is not an official Coveo JSUI Component. Use this component at your own risk.

## Getting Started

1. Install the component into your project.

```
npm i @coveops/date-range-picker
```

2. Use the Component or extend it

Typescript:

```javascript
import { DateRangePicker, IDateRangePickerOptions } from '@coveops/date-range-picker';
```

Javascript

```javascript
const DateRangePicker = require('@coveops/date-range-picker').DateRangePicker;
```

3. You can also expose the component alongside other components being built in your project.

```javascript
export * from '@coveops/date-range-picker'
```

4. Include the component in your template as follows:

Place the component in your markup:

```html
<div class="CoveoDateRangePicker"></div>
```

## Options

The following options can be configured:

| Option | Required | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | No | string | `fieldFrom-fieldTo` | id of the control |
| `title` | No | string | `NoTitle` | Specifies the title to display at the top of the Component |
| `todayCaption` | No | string | `Today` | Specifies what the caption of "today" radio button should be |
| `thisWeekCaption` | No | string | `This Week` | Specifies what the caption of "thisweek" radio button should be |
| `lastWeekCaption` | No | string | `Last Week` | Specifies what the caption of "lastweek" radio button should be |
| `thisMonthCaption` | No | string | `This Month` | Specifies what the caption of "thismonth" radio button should be |
| `fieldFrom` | Yes | string | `@sysdate` | Index field to use for the from date |
| `fieldTo` | Yes | string | `@sysdate` | Index field to use for the to date|
| `enableRadioButton` | No | boolean | `false` | Show radiobuttons with today, thisweek etc. |
| `enableCollapse` | No | boolean | `false` | Show expand collapse button |
| `langCode` | No | string | `en` | Language code |
| `format` | No | string | `YYYY-MM-DD` | Date format to accept |
| `inputPlaceholder` | No | string | `YYYY-MM-DD` | Date format hint |

## Extending

Extending the component can be done as follows:

```javascript
import { DateRangePicker, IDateRangePickerOptions } from "@coveops/date-range-picker";

export interface IExtendedDateRangePickerOptions extends IDateRangePickerOptions {}

export class ExtendedDateRangePicker extends DateRangePicker {

    protected buildPickerInputSection(): HTMLElement {
      return inputelement;
    }
  
  
    protected buildPickerinputRow(labelCaption: string, id: string, inputElement: HTMLInputElement): HTMLElement {
      return rowelement;
    }
  
    protected buildHeader(): HTMLElement {
      return headerelement;
    }
  
    protected buildEraser(): HTMLElement {
      return eraserelement;
    }
}

```

The following methods can be extended to provide additional functionalities or handle more complex use cases.

### buildPickerInputSection
Build the input selection, normally a picker element

```javascript
protected buildPickerInputSection(): HTMLElement
```

### buildPickerinputRow
Build the input row for the selection for one of the fields

```javascript
protected buildPickerinputRow(labelCaption: string, id: string, inputElement: HTMLInputElement): HTMLElement
```

### buildHeader
Build the header of the component

```javascript  
protected buildHeader(): HTMLElement
```

### buildEraser
Build the eraser component

```javascript
protected buildEraser(): HTMLElement
```

## Contribute

1. Clone the project
2. Copy `.env.dist` to `.env` and update the COVEO_ORG_ID and COVEO_TOKEN fields in the `.env` file to use your Coveo credentials and SERVER_PORT to configure the port of the sandbox - it will use 8080 by default.
3. Build the code base: `npm run build`
4. Serve the sandbox for live development `npm run serve`
or: .\node_modules\.bin\coveops serve --port 6001 --token TOKEN