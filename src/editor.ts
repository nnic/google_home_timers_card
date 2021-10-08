/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { LitElement, CSSResult, css, } from 'lit';
import { html, TemplateResult } from 'lit/html';
import { customElement, property, state } from 'lit/decorators';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';

import { GoogleHomeCardConfig } from './types';

const options = {
  required: {
    icon: 'tune',
    name: 'Required',
    secondary: 'Required options for this card to function',
    show: true,
  },
  actions: {
    icon: 'gesture-tap-hold',
    name: 'Actions',
    secondary: 'Perform actions based on tapping/clicking',
    show: false,
    options: {
      tap: {
        icon: 'gesture-tap',
        name: 'Tap',
        secondary: 'Set the action to perform on tap',
        show: false,
      },
      hold: {
        icon: 'gesture-tap-hold',
        name: 'Hold',
        secondary: 'Set the action to perform on hold',
        show: false,
      },
      double_tap: {
        icon: 'gesture-double-tap',
        name: 'Double Tap',
        secondary: 'Set the action to perform on double tap',
        show: false,
      },
    },
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

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: 'more-info' };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: 'none' };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: 'none' };
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    // The climate more-info has ha-switch and paper-dropdown-menu elements that are lazy loaded unless explicitly done here
    this._helpers.importMoreInfoControl('climate');

    // You can restrict on domain type
    const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'sensor');

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
                <paper-dropdown-menu
                  label="Alarm Entity (Required)"
                  @value-changed=${this._valueChanged}
                  .configValue=${'entity'}
                >
                  <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
                    ${entities.map(entity => {
                      return html`
                        <paper-item>${entity}</paper-item>
                      `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu
                  label="Timer Entity (Required)"
                  @value-changed=${this._valueChanged}
                  .configValue=${'timerEntity'}
                >
                  <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._timerEntity)}>
                    ${entities.map(entity => {
                      return html`
                        <paper-item>${entity}</paper-item>
                      `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>

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
            </div>
            `
          : ''}
        <div class="option" @click=${this._toggleOption} .option=${'actions'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.actions.icon}`}></ha-icon>
            <div class="title">${options.actions.name}</div>
          </div>
          <div class="secondary">${options.actions.secondary}</div>
        </div>
        ${options.actions.show
          ? html`
              <div class="values">
                <div class="option" @click=${this._toggleAction} .option=${'tap'}>
                  <div class="row">
                    <ha-icon .icon=${`mdi:${options.actions.options.tap.icon}`}></ha-icon>
                    <div class="title">${options.actions.options.tap.name}</div>
                  </div>
                  <div class="secondary">${options.actions.options.tap.secondary}</div>
                </div>
                ${options.actions.options.tap.show
                  ? html`
                      <div class="values">
                        <paper-item>Action Editors Coming Soon</paper-item>
                      </div>
                    `
                  : ''}
                <div class="option" @click=${this._toggleAction} .option=${'hold'}>
                  <div class="row">
                    <ha-icon .icon=${`mdi:${options.actions.options.hold.icon}`}></ha-icon>
                    <div class="title">${options.actions.options.hold.name}</div>
                  </div>
                  <div class="secondary">${options.actions.options.hold.secondary}</div>
                </div>
                ${options.actions.options.hold.show
                  ? html`
                      <div class="values">
                        <paper-item>Action Editors Coming Soon</paper-item>
                      </div>
                    `
                  : ''}
                <div class="option" @click=${this._toggleAction} .option=${'double_tap'}>
                  <div class="row">
                    <ha-icon .icon=${`mdi:${options.actions.options.double_tap.icon}`}></ha-icon>
                    <div class="title">${options.actions.options.double_tap.name}</div>
                  </div>
                  <div class="secondary">${options.actions.options.double_tap.secondary}</div>
                </div>
                ${options.actions.options.double_tap.show
                  ? html`
                      <div class="values">
                        <paper-item>Action Editors Coming Soon</paper-item>
                      </div>
                    `
                  : ''}
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
                <br />
                <ha-formfield .label=${`Toggle warning ${this._show_warning ? 'off' : 'on'}`}>
                  <ha-switch
                    .checked=${this._show_warning !== false}
                    .configValue=${'show_warning'}
                    @change=${this._valueChanged}
                  ></ha-switch>
                </ha-formfield>
                <ha-formfield .label=${`Toggle error ${this._show_error ? 'off' : 'on'}`}>
                  <ha-switch
                    .checked=${this._show_error !== false}
                    .configValue=${'show_error'}
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

  private _toggleAction(ev): void {
    this._toggleThing(ev, options.actions.options);
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
    console.log("Test");
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    console.log("Test 2");
    if (target.configValue !== undefined) {
      console.log("Target checked: " + target.checked);
      if (target.value === '') {
        delete this._config[target.configValue];
      } else {
        console.log("Config Before: ", this._config);
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
        console.log("Config After: ", this._config);
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
