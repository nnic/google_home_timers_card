/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionHandlerEvent, getLovelace, handleAction, hasAction, hasConfigOrEntityChanged, HomeAssistant, LovelaceCardEditor, } from 'custom-card-helpers';
import { css, CSSResult, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { html, TemplateResult } from 'lit/html';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION, ICON_ALARM, ICON_LABEL, ICON_NEXT, JSON_ALARMS, JSON_NAME, JSON_RECURRENCE, JSON_TIMERS, NO_TIMERS, STRING_HOURS, STRING_MINUTES, STRING_SECONDS, WEEKDAYS } from './const';
import './editor';
import { localize } from './localize/localize';
import type { Alarm, GoogleHomeCardConfig, Timer } from './types';

import './timer-panel';

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


// TODO Name your custom element
@customElement('googlehome-card-new')
export class GoogleHomeCardNew extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('googlehome-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit-element.polymer-project.org/guide/properties
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: GoogleHomeCardConfig;

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
      use12hour: true,
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
  protected render(): TemplateResult {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    const stateAlarms = this.hass.states[this.config.entity ?? ""];
    const stateTimers = this.hass.states[this.config.timerEntity ?? ""];

    const entries = this.generateEntries(stateAlarms.attributes[JSON_ALARMS], stateTimers.attributes[JSON_TIMERS]);

    return html`
      <ha-card .header=${this.config.name} @action=${this._handleAction} .actionHandler=${actionHandler({
      hasHold:
        hasAction(this.config.hold_action), hasDoubleClick: hasAction(this.config.double_tap_action),
    })} tabindex="0"
        .label=${`Google Home: ${this.config.entity || 'No Entity Defined'}`}>
        <div class="entries">
          ${entries.length > 0 ? entries.map(x => x) : html`<div class="info">
            <span class="value">${NO_TIMERS}</span>
          </div>`}
        </div>
      </ha-card>
    `;
  }

  // private get_alarms_or_timers_attirbute_from_entity(entityId: string) {

  //   var attributes = this.hass.states[entityId].state.attributes;

  //   return attributes
  // }

  private getTimeDelta(timestamp: number): Date {
    return new Date((timestamp * 1000) - Date.now());
  }

  private formatToHumanReadeble(rt: Date): string {
    const h = rt.getUTCHours() > 0 ? rt.getUTCHours() + STRING_HOURS : ""
    const m = rt.getUTCMinutes() < 10 && rt.getUTCHours() > 1 ? "0" + rt.getUTCMinutes() : rt.getUTCMinutes();
    const s = rt.getUTCSeconds() < 10 ? "0" + rt.getUTCSeconds() : rt.getUTCSeconds();
    const ts = h + m + STRING_MINUTES + s + STRING_SECONDS;
    return ts;
  }

  private formatAlarmTime(ts: number, isAmpm?: boolean): string {
    const d = new Date(ts * 1000);
    const time = d.toLocaleString(window.navigator.language, { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: isAmpm })
    return time
  }

  private generateAlarmEntry(alarm: Alarm): TemplateResult {

    const formattedTime = this.formatAlarmTime(alarm.fire_time, this.config.use12hour)

    const alarmName = alarm[JSON_NAME] != null ? html`
      <div style="margin: 0 15px 0 15px;">
        <span class="title">
          <ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_LABEL}"></ha-icon>
          ${alarm[JSON_NAME]}
        </span>
      </div>` : "";

    let recurrence = "";

    const alarmNext = alarm.recurrence != null ? html`
      <ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_NEXT}"></ha-icon>` : ""

    const weekdays = [1, 2, 3, 4, 5];

    if (alarm.recurrence?.length >= 7) {
      recurrence = "Every day";
    } else if (weekdays.every(x => alarm.recurrence.includes(x))) {
      recurrence = "Weekdays";
    } else {
      recurrence = alarm[JSON_RECURRENCE]?.map(x => WEEKDAYS[x]).join(", ") ?? "";
    }

    const entry = html`
    <div class="status-${alarm.status}">
      ${alarmName}
      <div class="info" style="margin: -5px 0 -5px;">
        <div class="icon">
          <ha-icon style="padding: 0 5px 0 0; --mdc-icon-size: 24px;" icon="${ICON_ALARM}"></ha-icon>
        </div>
        <div class="alarm">${formattedTime}<span class="next">${alarmNext}${recurrence}</span></div>
      </div>
    </div>
    `;

    return entry
  }

  private generateTimerEntry = (timer: Timer): TemplateResult => html`
    <timer-panel .timer=${timer} .showFireTime=${this.config.showFireTime}></timer-panel>`;

  private generateEntries(alarms: Alarm[] = [], timers: any[] = []): TemplateResult[] {

    const entries: TemplateResult[] = [];

    for (const alarm of alarms) {
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
        .name {
          color: var(--secondary-text-color);
          line-height: 40px;
          font-weight: 500;
          font-size: 16px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .icon {
          color: var(--state-icon-color, #44739e);
          line-height: 40px;
        }
        .entries {
          padding: 16px;
          padding-top: 0px;
        }
        .info {
          display: flex;
          padding: 0px 16px 16px;
          overflow: hidden;
          margin-top: -4px;
          white-space: nowrap;
          text-overflow: ellipsis;
          line-height: 28px;
        }
        .value {
          font-size: 28px;
          margin-right: 4px;
        }
        .alarm {
          font-size: 20px;
          margin: 8px 4px -5px;
          text-transform: capitalize;
        }
        .title {
          color: var(--secondary-text-color);
          font-size: 1.2em;
          padding: 0 5px 0 5px;
          text-transform: capitalize;
          font-weight: 500;
        }
        .next {
          font-size: 0.7em;
          padding: 0 5px 15px 5px;
          overflow: hidden;
          white-space: wrap;
          text-overflow: ellipsis;
        }

        .status-inactive {
          color: var(--disabled-text-color);
        }

        .status-inactive .icon {
          color: var(--disabled-text-color);
        }

        .status-inactive .title {
          color: var(--disabled-text-color);
        }
    `;
  }
}
