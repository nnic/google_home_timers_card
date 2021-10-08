import { LitElement, html, CSSResult, css } from "lit";
import { customElement, property } from "lit/decorators";
import { Alarm, GoogleHomeCardConfig } from "./types";
import './countdown-timer';
import { formatAlarmRecurance, formatAlarmTime } from "./helpers";
import { ICON_ALARM, ICON_LABEL, ICON_NEXT } from "./const";

@customElement("alarm-element")
export class AlarmPanel extends LitElement {

  @property({ type: Object })
  alarm!: Alarm;

  @property({ type: Object })
  config?: GoogleHomeCardConfig;

  alarmNameTemplate() {
    return this.alarm.label != null ? html`
        <div>
          <span class="title">
            <ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_LABEL}"></ha-icon>
            ${this.alarm.label}
          </span>
        </div>` : "";
  }

  nextAlarmTemplate() {
    return this.alarm.recurrence != null ? html`
            <ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_NEXT}"></ha-icon>
        ` : ""
  }

  render() {
    if (this.config?.hideInactiveAlarms && this.alarm.status === "inactive") {
      return;
    }
    const formattedTime = formatAlarmTime(this.alarm.fire_time, this.config?.use12hour);
    return html`
        <div class="status-${this.alarm.status}">
          ${this.alarmNameTemplate()}
          <div class="info">
            <div class="icon">
              <ha-icon style="padding: 0 5px 0 0; --mdc-icon-size: 24px;" icon="${ICON_ALARM}"></ha-icon>
            </div>
            <div class="alarm">
              <span class="formattedTime">
                ${formattedTime}
              </span>
              <span class="next">
                ${this.nextAlarmTemplate()}
                ${formatAlarmRecurance(this.alarm.recurrence)}
              </span>
            </div>
          </div>
        </div>
          `;
  }

  static get styles(): CSSResult {
    return css`
        .status-inactive {
          color: var(--disabled-text-color);
        }

        .status-inactive .icon {
          color: var(--disabled-text-color);
        }

        .status-inactive .title {
          color: var(--disabled-text-color);
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
            width: 40px;
            text-align: center;
        }
        .info {
            display: flex;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            line-height: 28px;
            align-items: center;
          }
        .value {
          font-size: 28px;
          margin-right: 4px;
        }
        .alarm {
          font-size: 20px;
          display: flex;
          margin-left: 16px;
          margin-right: 8px;
          align-items: center;
        }
        .title {
          color: var(--secondary-text-color);
          font-size: 1.2em;
          padding: 0 10px;
          text-transform: capitalize;
          font-weight: 500;
        }
        .next {
          font-size: 0.7em;
          line-height: normal;
          padding-right: 16px;
          overflow: hidden;
          white-space: wrap;
          text-overflow: ellipsis;
        }
        .formattedTime {
          padding-right: 16px;
        }
  `}

}