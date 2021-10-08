/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { LitElement, CSSResult, css, } from 'lit';
import { html, TemplateResult } from 'lit/html';
import { customElement, property, state } from 'lit/decorators';
import { HomeAssistant, fireEvent, LovelaceCardEditor,  } from 'custom-card-helpers';

import { GoogleHomeCardConfig } from './types';

const options = {
  required: {
    icon: 'tune',
    name: 'Required',
    secondary: 'Required options for this card to function',
    show: true,
  },
  appearance: {
    icon: 'palette',
    name: 'Appearance',
    secondary: 'Customize the name, icon, etc',
    show: false,
  },
};

@customElement('googlehome-card-editor')
export class GoogleHomeCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: GoogleHomeCardConfig;
  @state() private _toggle?: boolean;
  @state() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: GoogleHomeCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _timerEntity(): string {
    return this._config?.timerEntity || '';
  }

  get _use12hour(): boolean {
    return this._config?.use12hour || false;
  }

  get _showFireTime(): boolean {
    return this._config?.showFireTime || false;
  }

  get _hideInactiveTimers(): boolean {
    return this._config?.hideInactiveTimers || false;
  }

  get _hideInactiveAlarms(): boolean {
    return this._config?.hideInactiveAlarms || false;
  }

  get _hideCardIfNoAlarmOrTimers(): boolean {
    return this._config?.hideCardIfNoAlarmOrTimers || false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    // The climate more-info has ha-switch and paper-dropdown-menu elements that are lazy loaded unless explicitly done here
    this._helpers.importMoreInfoControl('climate');

    return html`
      <div class="card-config">
        <div class="option" @click=${this._toggleOption} .option=${'required'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.required.icon}`}></ha-icon>
            <div class="title">${options.required.name}</div>
          </div>
          <div class="secondary">${options.required.secondary}</div>
        </div>
        ${options.required.show
          ? html`
              <div class="values">
                  <ha-entity-picker
                    label="Alarm Entity ${this._config?.timerEntity === undefined ? "(Required)" : ""}"
                    .hass="${this.hass}"
                    .value="${this._entity}"
                    .configValue=${"entity"}
                    .includeDomains=${["sensor"]}
                    @change="${this._valueChanged}"
                    allow-custom-entity></ha-entity-picker>
                  <ha-entity-picker
                    label="Timer Entity ${this._config?.entity === undefined ? "(Required)" : ""}"
                    .hass="${this.hass}"
                    .value="${this._timerEntity}"
                    .configValue=${"timerEntity"}
                    .includeDomains=${["sensor"]}
                    @change="${this._valueChanged}"
                    allow-custom-entity></ha-entity-picker>
            </div>
            `
          : ''}
        <div class="option" @click=${this._toggleOption} .option=${'appearance'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.appearance.icon}`}></ha-icon>
            <div class="title">${options.appearance.name}</div>
          </div>
          <div class="secondary">${options.appearance.secondary}</div>
        </div>
        ${options.appearance.show
          ? html`
              <div class="values">
                <paper-input
                  label="Name (Optional)"
                  .value=${this._name}
                  .configValue=${'name'}
                  @value-changed=${this._valueChanged}
                ></paper-input>

                <br/>
              <ha-formfield .label=${`Use 12 hour`}>
                  <ha-switch
                    .checked=${this._use12hour}
                    .configValue=${'use12hour'}
                    @change=${this._valueChanged}
                  ></ha-switch>
                </ha-formfield>
                <br/>
                <ha-formfield .label=${`Show timer fire time`}>
                  <ha-switch
                    .checked=${this._showFireTime}
                    .configValue=${'showFireTime'}
                    @change=${this._valueChanged}
                  ></ha-switch>
                </ha-formfield>
                <br/>
                <ha-formfield .label=${`Hide inactive alarms`}>
                  <ha-switch
                    .checked=${this._hideInactiveAlarms}
                    .configValue=${'hideInactiveAlarms'}
                    @change=${this._valueChanged}
                  ></ha-switch>
                </ha-formfield>
                <br/>
                <ha-formfield .label=${`Hide inactive timers`}>
                  <ha-switch
                    .checked=${this._hideInactiveTimers}
                    .configValue=${'hideInactiveTimers'}
                    @change=${this._valueChanged}
                  ></ha-switch>
                </ha-formfield>
                <br/>
                <ha-formfield .label=${`Hide card if no active alarms or timers`}>
                  <ha-switch
                    .checked=${this._hideCardIfNoAlarmOrTimers}
                    .configValue=${'hideCardIfNoAlarmOrTimers'}
                    @change=${this._valueChanged}
                  ></ha-switch>
                </ha-formfield>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _toggleOption(ev): void {
    this._toggleThing(ev, options);
  }

  private _toggleThing(ev, optionList): void {
    const show = !optionList[ev.target.option].show;
    for (const [key] of Object.entries(optionList)) {
      optionList[key].show = false;
    }
    optionList[ev.target.option].show = show;
    this._toggle = !this._toggle;
  }

  private _valueChanged(ev): void {

    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue !== undefined) {
      if (target.value === '') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [target.configValue]: removed, ...rest } = this._config;
        // delete this._config[target.configValue];
        this._config = rest as GoogleHomeCardConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }
      ha-formfield {
        padding-bottom: 8px;
      }
    `;
  }
}
