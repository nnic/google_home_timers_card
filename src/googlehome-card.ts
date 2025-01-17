/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionHandlerEvent, getLovelace, handleAction, hasAction, hasConfigOrEntityChanged, HomeAssistant, LovelaceCardEditor, } from 'custom-card-helpers';
import { css, CSSResult, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { html, TemplateResult } from 'lit/html';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION, JSON_ALARMS, JSON_TIMERS, NO_TIMERS } from './const';
import './editor';
import { localize } from './localize/localize';
import type { Alarm, GoogleHomeCardConfig, Timer } from './types';

import './timer-panel';
import './alarm-panel';
import { HassEntity } from 'home-assistant-js-websocket';

/* eslint no-console: 0 */
console.info(
  `%c  GOOGLEHOME-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'googlehome-card-new',
  name: 'Google Home Card New',
  description: 'A custom card for the Google Home community integration.',
});

@customElement('googlehome-card-new')
export class GoogleHomeCardNew extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('googlehome-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // https://lit-element.polymer-project.org/guide/properties
  //@property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: GoogleHomeCardConfig;

  @state() private alarms?: HassEntity;

  @state() private timers?: HassEntity;

  private _hass!: HomeAssistant;

  public set hass(hass: HomeAssistant) {
    this._hass = hass;

    let updated = false;
    const timers = hass.states[this.config?.timerEntity ?? ""];
    const alarms = hass.states[this.config?.entity ?? ""];

    if (timers?.last_updated !== this.timers?.last_updated) {
      updated = true;
      this.timers = hass.states[this.config?.timerEntity ?? ""];
    }
    if (alarms?.last_updated !== this.alarms?.last_updated) {
      updated = true;
      this.alarms = hass.states[this.config?.entity ?? ""];
    }
    if (updated) {
      this.requestUpdate();
    }
  }

  @property({ attribute: false })
  public get hass() { return this._hass; }

  // https://lit-element.polymer-project.org/guide/properties#accessors-custom
  public setConfig(config: GoogleHomeCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Google Home',
      ...config,
    };
  }

  // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit-element.polymer-project.org/guide/templates
  protected render(): TemplateResult | undefined {

    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    if (!this.config.entity && !this.config.timerEntity) {
      return this._showWarning(localize('common.no_entities_warning'));
    }

    const entries = this.generateEntries(this.alarms?.attributes[JSON_ALARMS], this.timers?.attributes[JSON_TIMERS]);

    if (this.config.hideCardIfNoAlarmOrTimers && entries?.length === 0) {
      return;
    }

    return html`
      <ha-card .header=${this.config.name} @action=${this._handleAction} .actionHandler=${actionHandler({ hasHold:
        hasAction(this.config.hold_action), hasDoubleClick: hasAction(this.config.double_tap_action), })} tabindex="0"
        .label=${`Google HomeX: ${this.config.entity || 'No Entity Defined' }`}>
        <div class="entries">
          ${entries.length > 0 ? entries.map(x => x) : html`<div class="info">
            <span class="value">${NO_TIMERS}</span>
          </div>`}
        </div>
      </ha-card>
    `;
  }

  private generateAlarmEntry = (alarm: Alarm): TemplateResult => html`
    <alarm-element .alarm=${alarm} .config=${this.config}></alarm-element>`;

  private generateTimerEntry = (timer: Timer): TemplateResult => html`
    <timer-panel .timer=${timer} .config=${this.config}></timer-panel>`;

  private generateEntries(alarms: Alarm[] = [], timers: any[] = []): TemplateResult[] {

    const entries: TemplateResult[] = [];


    for (const alarm of alarms.filter(x => x.alarm_id !== "alarm/last_missed_alarm_id")) {
      entries.push(this.generateAlarmEntry(alarm));
    }

    for (const timer of timers) {
      entries.push(this.generateTimerEntry(timer));
    }

    return entries;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  // https://lit-element.polymer-project.org/guide/styles
  static get styles(): CSSResult {
    return css`
    ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          outline: none;
        }
        .header {
          display: flex;
          padding: 8px 16px 0;
          justify-content: space-between;
        }
        .no-header {
          padding: 16px 16px 0;
        }

        .entries {
          padding: 0 16px 16px;
          margin-top: -8px;
        }
    `;
  }
}
