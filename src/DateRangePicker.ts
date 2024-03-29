import {
  ComponentOptions,
  Component,
  $$,
  l,
  DateUtils,
  IPopulateBreadcrumbEventArgs,
  BreadcrumbEvents,
  IQuerySuccessEventArgs,
  QueryEvents,
  IBuildingQueryEventArgs,
  Assert,
  IComponentBindings,
  Utils,
  IAttributeChangedEventArg,
  Model
} from 'coveo-search-ui';
import { lazyComponent } from '@coveops/turbo-core';
import { IDateRangePickerRadioOptions, DateRangePickerRadio } from './DateRangePickerRadio';
import { DateRangePickerActionCause, IDateRangePickerAnalyticsArgs, IRadioSelectEventArgs, DateRangePickerEvent } from './events/DateRangePickerEvents';
import { SVGIcons } from './utils/SVGIcons';
import { DatePicker } from './DatePicker';

export interface IDateRangePickerOptions extends IDateRangePickerRadioOptions {
  id?: string;
  title?: string;
  fieldFrom: string;
  fieldTo: string;
  enableRadioButton?: boolean;
  enableCollapse?: boolean;
  langCode?: string;
  format?: string;
  inputPlaceholder?: string;
  firstDay?: number;
  startCaption?: string;
  endCaption?: string;
  readOnlyInput?: boolean;
  yearsBack?: number;
  yearsAhead?: number;
}

@lazyComponent
export class DateRangePicker extends Component {
  static ID = 'DateRangePicker';
  static options: IDateRangePickerOptions = {
    /**
    * Specifies a unique identifier for the Component. Among other things, this identifier serves the purpose of saving the
    * component state in the URL hash.
    *
    * Default value is the concatenation of {@link RangePicker.options.fieldFrom} and {@link RangePicker.options.fieldTo} option value.
    */
    id: ComponentOptions.buildStringOption({
      postProcessing: (value: string, options: IDateRangePickerOptions) => value || _.unique([options.fieldFrom, options.fieldTo]).join('-')
    }),

    /**
     * Specifies the title to display at the top of the Component.
     *
     * Default value is the localized string for `"NoTitle"`.
     */
    title: ComponentOptions.buildLocalizedStringOption({ defaultValue: l('NoTitle') }),

    /**
     * Specifies what the caption of "today" radio button should be.
     *
     * Default value is the string `"Today"`.
     */
    todayCaption: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'Today' }),

    /**
     * Specifies what the caption of "thisweek" radio button should be.
     *
     * Default value is the string `"This Week"`.
     */
    thisWeekCaption: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'This Week' }),

    /**
     * Specifies what the caption of "lastweek" radio button should be.
     *
     * Default value is the string `"Last Week"`.
     */
    lastWeekCaption: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'Last Week' }),

    /**
     * Specifies what the caption of "thismonth" radio button should be.
     *
     * Default value is the string `"This Month"`.
     */
    thisMonthCaption: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'This Month' }),

    /**
     * Specifies the index field whose values the Facet should use.
     * This field will be used to filter out all results with inferior value.
     *
     * The field should represent numerical values for this component to work.
     *
     * Default value is the string `"@sysdate"`.
     */
    fieldFrom: ComponentOptions.buildLocalizedStringOption({ defaultValue: '@sysdate', required: true }),

    /**
     * Specifies the index field whose values the Facet should use.
     * This field will be used to filter out all results with superior value.
     *
     * The field should represent numerical values for this component to work.
     *
     * Default value is the string `"@sysdate"`.
     */
    fieldTo: ComponentOptions.buildLocalizedStringOption({ defaultValue: '@sysdate', required: true }),
    /**
     * Specifies the index field whose values the Facet should use.
     * This field will be used to filter out all results with superior value.
     *
     * The field should represent boolean values for this component to work.
     *
     * Default value is the boolean `"false"`.
     */
    enableRadioButton: ComponentOptions.buildBooleanOption({ defaultValue: false, required: false }),

    /**
     * Specifies if the Collapse/Expand button should be displayed.
     *
     * The field should represent boolean values for this component to work.
     *
     * Default value is the boolean `"false"`.
     */
    enableCollapse: ComponentOptions.buildBooleanOption({ defaultValue: false, required: false }),

    langCode: ComponentOptions.buildStringOption({ defaultValue: 'en' }),

    format: ComponentOptions.buildStringOption({ defaultValue: 'YYYY-MM-DD' }),

    inputPlaceholder: ComponentOptions.buildStringOption({ defaultValue: 'YYYY-MM-DD' }),

    firstDay: ComponentOptions.buildNumberOption({ defaultValue: 0 }),

    startCaption: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'Start', required: false }),

    endCaption: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'End', required: false }),

    readOnlyInput: ComponentOptions.buildBooleanOption({ defaultValue: true }),

    yearsBack: ComponentOptions.buildNumberOption({ defaultValue: 100 }),

    yearsAhead: ComponentOptions.buildNumberOption({ defaultValue: 0 }),
  };
  // Default value for from and to
  static DEFAULT: number = -1;

  private from: number = DateRangePicker.DEFAULT;
  private to: number = DateRangePicker.DEFAULT;
  private radio: number = DateRangePicker.DEFAULT;
  private fromInput: DatePicker;
  private toInput: DatePicker;
  private eraserElement: HTMLElement | undefined;
  private rangePickerQueryStateAttribute: string = '';
  private rangePickerRadio: DateRangePickerRadio;

  constructor(public element: HTMLElement, public options: IDateRangePickerOptions, public bindings: IComponentBindings) {
    super(element, DateRangePicker.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(element, DateRangePicker, options);

    this.rangePickerRadio = new DateRangePickerRadio(this.root, this.options);

    this.fromInput = this.buildInput(this.getId('start'));
    this.toInput = this.buildInput(this.getId('end'));

    this.initQueryEvents();
    this.initQueryStateEvents();
  }

  createDom() {
    this.buildFacetContent();
    this.updateAppearanceDependingOnState();
    this.fromInput.reset();
    this.toInput.reset();
  }

  /**
   * Resets the Component by reseting its inputs and redrawing the component.
   *
   * @param {boolean} [executeQuery=true] Specifies whether to execute the query once the component has been reset
   */
  reset(executeQuery: boolean = true) {
    this.ensureDom();
    this.fromInput.reset();
    this.toInput.reset();

    if (this.shouldRenderRadioPicker()) {
      this.rangePickerRadio.reset();
    }

    const range = { from: DateRangePicker.DEFAULT, to: DateRangePicker.DEFAULT, radio: DateRangePicker.DEFAULT };

    this.logger.info('reset', executeQuery);
    this.onChange(range, DateRangePickerActionCause.facetRangeClear, executeQuery);
    this.updateAppearanceDependingOnState();
  }

  private buildFacetContent() {
    const headerElement = this.buildHeader();
    this.element.appendChild(headerElement);

    this.buildContent();
  }

  private buildContent() {
    const innerContent = $$('div', { className: 'inner-content' });

    if (this.shouldRenderRadioPicker()) {
      innerContent.append(this.rangePickerRadio.build());
    }

    innerContent.append(this.buildPickerInputSection());
    this.element.appendChild(innerContent.el);
  }

  private shouldRenderRadioPicker(): boolean {
    Assert.exists(this.options.enableRadioButton);
    return this.options.enableRadioButton as boolean;
  }

  protected buildPickerInputSection(): HTMLElement {
    const inputSection = $$('div', { className: 'input-section' });

    inputSection.append(this.buildPickerinputRow(this.options.startCaption, this.getId('start'), this.fromInput.getElement()));
    inputSection.append(this.buildPickerinputRow(this.options.endCaption, this.getId('end'), this.toInput.getElement()));

    return inputSection.el;
  }

  private getId(extra?: string): string {
    return `${this.options.id}${extra ? '-' + extra : ''}`;
  }

  protected buildPickerinputRow(labelCaption: string, id: string, inputElement: HTMLInputElement): HTMLElement {
    const inputRow = $$('div', { className: 'flex input-row' });
    inputRow.append($$('div', { className: 'input-label' }, l(labelCaption)).el);
    inputRow.append(inputElement);
    inputRow.append($$('label', { for: id, className: 'calendar-icon' }, SVGIcons.icons.calendar).el);
    // inputRow.append(this.buildEraser());
    return inputRow.el;
  }

  protected buildHeader(): HTMLElement {
    const header = $$('div', { className: 'coveo-facet-header' });

    const titleSection = $$('div', { className: 'coveo-facet-header-title-section' });
    titleSection.append($$('div', { className: 'coveo-facet-header-title' }, this.options.title as string).el);
    titleSection.append($$('div', { className: 'coveo-facet-header-wait-animation', style: 'visibility:hidden' }).el);
    header.append(titleSection.el);

    header.append(this.buildEraser());
    return header.el;
  }

  protected buildEraser(): HTMLElement {
    this.eraserElement = $$(
      'div',
      { title: l('Clear', this.options.title), className: 'coveo-facet-header-eraser' },
      SVGIcons.icons.facetClear
    ).el;

    const svgElement = this.eraserElement.querySelector('svg');
    if (svgElement) {
      svgElement.classList.add('coveo-facet-header-eraser-svg');
    }

    const args: IDateRangePickerAnalyticsArgs = {
      rangeFieldFrom: this.options.fieldFrom,
      rangeFieldTo: this.options.fieldTo,
      rangePickerTitle: this.options.title as string,
      rangePickerState: `${this.from}-${this.to}`
    };

    $$(this.eraserElement).on('click', () => {
      this.usageAnalytics.logCustomEvent({ name: DateRangePickerActionCause.facetRangeClear, type: 'customEventType' }, args, this.root);
      this.reset();
    });
    return this.eraserElement;
  }

  protected buildInput(id: string) {
    const pickerElement = new DatePicker({
      onChange: () => this.handleInputChange(),
      format: this.options.format,
      firstDay: this.options.firstDay,
      langCode: this.options.langCode,
      readOnlyInput: this.options.readOnlyInput,
      yearsBack: this.options.yearsBack,
      yearsAhead: this.options.yearsAhead,
    });
    if (this.options.inputPlaceholder) {
      pickerElement.getElement().setAttribute('placeholder', this.options.inputPlaceholder);
    }
    pickerElement.getElement().setAttribute('id', id);
    return pickerElement;
  }

  private updateAppearanceDependingOnState() {
    Assert.exists(this.eraserElement);
    const isActive = Utils.isNonEmptyString(this.fromInput.getValue() + this.toInput.getValue());

    $$(this.element).toggleClass('coveo-active', isActive);
    $$(this.eraserElement as HTMLElement).toggleClass('coveo-facet-header-eraser-visible', isActive);
  }

  private onChange(range: IRadioSelectEventArgs, actionCause: string, executeQuery: boolean = true): void {
    this.queryStateModel.set(this.rangePickerQueryStateAttribute, range);
    if (executeQuery) {
      this.triggerNewQuery(() =>
        this.usageAnalytics.logCustomEvent(
          { name: actionCause, type: 'customEventType' },
          {
            rangeFieldFrom: this.options.fieldFrom,
            rangeFieldTo: this.options.fieldTo,
            rangePickerTitle: this.options.title as string,
            rangePickerState: `${this.from}-${this.to}`
          },
          this.root
        )
      );
    }
  }

  public triggerNewQuery(beforeExecuteQuery: () => void) {
    this.queryController.executeQuery({ ignoreWarningSearchEvent: true, beforeExecuteQuery: beforeExecuteQuery });
  }

  private getQuery(): string | null {
    if (this.from === DateRangePicker.DEFAULT && this.to === DateRangePicker.DEFAULT) {
      return null;
    }

    const query = [];
    if (this.from !== DateRangePicker.DEFAULT) {
      const fromDate = new Date(this.from);
      query.push(this.options.fieldFrom + ' >= ' + DateUtils.dateForQuery(fromDate));
    }
    if (this.to !== DateRangePicker.DEFAULT) {
      const toDate = new Date(this.to);
      query.push(this.options.fieldTo + ' <= ' + DateUtils.dateForQuery(toDate));
    }
    return query.join(' AND ');
  }

  private handleBuildingQuery(args: IBuildingQueryEventArgs) {
    const query = this.getQuery();
    if (query !== null) {
      args.queryBuilder.advancedExpression.add(query);
    }
  }

  private handleDeferredQuerySuccess(args: IQuerySuccessEventArgs) {
    this.ensureDom();
    if (this.from === DateRangePicker.DEFAULT) {
      this.fromInput.reset();
      this.fromInput.getElement().value = '';
    } else {
      (this.fromInput as any)['setValue'](new Date(this.from), true);
    }

    if (this.to === DateRangePicker.DEFAULT) {
      this.toInput.reset();
      this.toInput.getElement().value = '';
    } else {
      (this.toInput as any)['setValue'](new Date(this.to), true);
    }

    if (this.radio === DateRangePicker.DEFAULT) {
      this.rangePickerRadio.reset();
    } else {
      this.rangePickerRadio.setValue(this.radio);
    }

    this.updateAppearanceDependingOnState();
  }

  private initQueryEvents() {
    this.bind.onRootElement(DateRangePickerEvent.inputChange, (args: IRadioSelectEventArgs) => {
      // this.queryStateModel.set(this.rangePickerQueryStateAttribute, args);
    });

    this.bind.onRootElement(DateRangePickerEvent.radioSelect, (args: IRadioSelectEventArgs) => {
      this.logger.info('radioSelect', args);
      this.onChange(args, DateRangePickerActionCause.facetRangeRadioSelect, true);
    });
    this.bind.onRootElement(QueryEvents.deferredQuerySuccess, (args: IQuerySuccessEventArgs) => this.handleDeferredQuerySuccess(args));
    this.bind.onRootElement(QueryEvents.buildingQuery, (args: IBuildingQueryEventArgs) => this.handleBuildingQuery(args));
    this.bind.onRootElement(BreadcrumbEvents.populateBreadcrumb, (args: IPopulateBreadcrumbEventArgs) =>
      this.handlePopulateBreadcrumb(args)
    );
    this.bind.onRootElement(BreadcrumbEvents.clearBreadcrumb, () => this.handleClearBreadcrumb());
  }

  private initQueryStateEvents() {
    this.rangePickerQueryStateAttribute = this.options.id + ':rangePicker';

    this.queryStateModel.registerNewAttribute(this.rangePickerQueryStateAttribute, {
      from: DateRangePicker.DEFAULT,
      to: DateRangePicker.DEFAULT,
      radio: DateRangePicker.DEFAULT
    });
    const eventName = this.queryStateModel.getEventName(Model.eventTypes.changeOne + this.rangePickerQueryStateAttribute);

    this.bind.onRootElement(eventName, (args: IAttributeChangedEventArg) => {
      this.handleQueryStateChanged(args.value);
    });
  }

  private handleQueryStateChanged(state: IRadioSelectEventArgs) {
    this.ensureDom();
    const from = Number(state.from);
    const to = Number(state.to);
    const radio = Number(state.radio);

    if (!isNaN(from) && DateUtils.isValid(new Date(from))) {
      this.from = from;
    } else {
      this.from = DateRangePicker.DEFAULT;
    }

    if (!isNaN(to) && DateUtils.isValid(new Date(to))) {
      this.to = to;
    } else {
      this.to = DateRangePicker.DEFAULT;
    }

    if (!isNaN(radio) && this.rangePickerRadio.isValid(radio)) {
      this.radio = radio;
    } else {
      this.radio = DateRangePicker.DEFAULT;
    }
  }

  private handlePopulateBreadcrumb(args: IPopulateBreadcrumbEventArgs) {
    const breadcrumb = this.populateBreadcrumb();
    if (breadcrumb !== null) {
      args.breadcrumbs.push({
        element: breadcrumb
      });
    }
  }

  private hasEmptyState(): boolean {
    return this.from === DateRangePicker.DEFAULT && this.to === DateRangePicker.DEFAULT;
  }

  private populateBreadcrumb(): HTMLElement | null {
    if (this.hasEmptyState()) {
      return null;
    }
    const range: string[] = [];

    /* Here, handling date format;
        - we dont have at this level the same library as in CustomDatePicker to handle the date format string
        - we are therefore using the values generated by CustomDatePicker
    */
    if (this.from !== DateRangePicker.DEFAULT) {
      const fromDate = new Date(this.from);
      try {
        range.push(l('From').toLowerCase() + ' ' + this.fromInput.getValue());
      } catch (e) {
        range.push('from ' + DateUtils.dateForQuery(fromDate));
      }
    }

    if (this.to !== DateRangePicker.DEFAULT) {
      const toDate = new Date(this.to);
      try {
        range.push(l('To').toLowerCase() + ' ' + this.toInput.getValue());
      } catch (e) {
        range.push('to ' + DateUtils.dateForQuery(toDate));
      }
    }

    const element = $$('div', { className: 'coveo-facet-breadcrumb coveo-breadcrumb-item vin-breadcrumb' });

    const title = $$('span', { className: 'coveo-facet-breadcrumb-title' }, this.options.title + ': ');
    element.append(title.el);

    const value = $$('span', { className: 'coveo-dynamic-facet-breadcrumb-value' });
    title.append(value.el);

    value.on('click', () => {
      this.reset();
    });

    const caption = $$('span', { className: 'coveo-facet-breadcrumb-caption' }, range.join(' - '));
    value.append(caption.el);

    const eraser = $$('span', { className: 'coveo-dynamic-facet-breadcrumb-value-clear' });
    eraser.setHtml(`<span class="coveo-dynamic-facet-breadcrumb-value-clear"><svg focusable="false" enable-background="new 0 0 13 13" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clear"><title>Clear</title><g fill="currentColor"><path d="m7.881 6.501 4.834-4.834c.38-.38.38-1.001 0-1.381s-1.001-.38-1.381 0l-4.834 4.834-4.834-4.835c-.38-.38-1.001-.38-1.381 0s-.38 1.001 0 1.381l4.834 4.834-4.834 4.834c-.38.38-.38 1.001 0 1.381s1.001.38 1.381 0l4.834-4.834 4.834 4.834c.38.38 1.001.38 1.381 0s .38-1.001 0-1.381z"></path></g></svg></span>`);
    value.append(eraser.el);

    return element.el;
  }

  private handleClearBreadcrumb() {
    this.reset(false);
  }

  private handleInputChange(): void {
    try {
      (this.fromInput as any)['wasReset'] = false;
      (this.toInput as any)['wasReset'] = false;
    } catch (error) {
      this.logger.error('Unable to reset the inputs');
    }

    this.ensureDom();

    if (this.shouldRenderRadioPicker()) {
      this.rangePickerRadio.reset();
    }

    const range: IRadioSelectEventArgs = {
      from: this.fromInput.getValue() ? new Date(this.fromInput.getValue()).getTime() : DateRangePicker.DEFAULT,
      to: this.toInput.getValue() ? new Date(this.toInput.getValue()).getTime() : DateRangePicker.DEFAULT,
      radio: DateRangePicker.DEFAULT
    };

    this.bind.trigger(this.root, DateRangePickerEvent.inputChange, range);
    const executeQuery = range.from !== this.from || range.to !== this.to;
    this.logger.info('Input change', range, this.from, this.to, executeQuery);
    this.onChange(range, DateRangePickerActionCause.facetRangeInputChange, executeQuery);
  }
}