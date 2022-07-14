import { IFormWidget, IFormWidgetSettable, $$, DateUtils, l, Assert } from 'coveo-search-ui';
import * as Pikaday from 'pikaday';
declare function require(name: string);
import locales from './utils/locales';

export interface IDatePickerOptions {
    firstDay?: number,
    onChange?: (datePicker: DatePicker) => void,
    langCode?: string,
    format?: string,
    readOnlyInput: boolean,
    yearsBack?: number,
    yearsAhead?: number,
}

export class DatePicker implements IFormWidget, IFormWidgetSettable {
    private element: HTMLInputElement;
    private picker: Pikaday;
    private wasReset = true;
    protected options: IDatePickerOptions = {
        onChange: (datePicker: DatePicker) => { },
        firstDay: 0,
        langCode: 'en',
        format: 'YYYY-MM-DD',
        readOnlyInput: false,
        yearsBack: 100,
        yearsAhead: 0,
    }

    constructor(options: IDatePickerOptions) {
        const { onChange, firstDay, langCode, format, readOnlyInput, yearsBack, yearsAhead } = options;
        this.options.onChange = onChange || this.options.onChange;
        this.options.firstDay = firstDay || this.options.firstDay;
        this.options.langCode = langCode || this.options.langCode;
        this.options.format = format;
        this.options.readOnlyInput = readOnlyInput;
        this.options.yearsBack = yearsBack;
        this.options.yearsAhead = yearsAhead;
        this.buildContent();
    }

    /**
     * Resets the date picker.
     */
    public reset() {
        this.picker.setDate(undefined);
        this.wasReset = true;
        this.options.onChange(this);
    }

    /**
     * Gets the element on which the date picker is bound.
     * @returns {HTMLInputElement} The date picker element.
     */
    public getElement(): HTMLInputElement {
        return this.element;
    }

    /**
     * Gets the currently selected value in the date picker.
     * @returns {string} A textual representation of the currently selected value (`YYYY-MM-DD` format).
     */
    public getValue(): string {
        if (this.wasReset) {
            return '';
        }
        let date = this.picker.getDate();
        return date ? DateUtils.dateForQuery(this.picker.getDate()) : '';
    }

    /**
     * Get the currently selected value in the date picker, as a Date object
     * @returns {Date} A Date object for the current value, or null if the date picker was reset or a date has not been selected initially.
     */
    public getDateValue(): Date {
        if (this.wasReset) {
            return null;
        }
        return this.picker.getDate();
    }

    /**
     * Sets the date picker value.
     * @param date The value to set the date picker to. Must be a
     * [Date](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date) object.
     */
    public setValue(date: Date, preventOnSelect = false) {
        // Assert.exists(date);

        this.picker.setDate(date, preventOnSelect);
        this.wasReset = false;
    }

    /**
     * Gets the element on which the date picker is bound.
     * @returns {HTMLInputElement} The date picker element.
     */
    public build(): HTMLInputElement {
        return this.element;
    }

    protected buildContent() {
        const currentYear = new Date().getFullYear();
        this.element = <HTMLInputElement>$$('input', { className: 'coveo-button', 'aria-label': l('Date') }).el;
        this.element.readOnly = this.options.readOnlyInput;
        this.picker = new Pikaday({
            firstDay: this.options.firstDay,
            field: this.element,
            format: this.options.format,
            yearRange: [currentYear - Math.abs(this.options.yearsBack), currentYear + Math.abs(this.options.yearsAhead)],
            onSelect: () => {
                this.wasReset = false;
                this.options.onChange.call(this, this);
            },
            i18n: {
                previousMonth: l('PreviousMonth'),
                nextMonth: l('NextMonth'),
                months: locales[this.options.langCode].monthNames,
                weekdays: locales[this.options.langCode].dayNames,
                weekdaysShort: locales[this.options.langCode].shortDayNames,
            }
        });
    }
}