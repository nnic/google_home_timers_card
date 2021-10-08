import { LitElement, html, CSSResult, css } from "lit";
import { customElement, property } from "lit/decorators";
import { ICON_TIMER, ICON_ALARM_DONE, ICON_LABEL, ICON_ALARM_TIME, ICON_DURATION } from "./const";
import { GoogleHomeCardConfig, Timer } from "./types";
import './countdown-timer';

@customElement("timer-panel")
export class TimerPanel extends LitElement {

    @property({ type: Object })
    timer?: Timer;

    @property({ type: Object })
    config?: GoogleHomeCardConfig;

    timerNameTemplate() {
        return this.timer?.label != null ? html`
                <div>
                    <span class="title">
                        <ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_LABEL}"></ha-icon>
                        ${this.timer.label}
                    </span>
                </div>` : "";
    }

    alarmTimeTemplate() {
        return this.config?.showFireTime ? html`
        <span class="fireTime">
            <ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_ALARM_TIME}"></ha-icon>
            ${this.timer?.local_time.split(" ")[1]}
        </span>` : ""
    }

    timerIcon() {
        let timerIcon = ICON_TIMER;
        const remainingTime = new Date((this.timer?.fire_time ?? 0 * 1000) - Date.now());

        if (Math.sign(Number(remainingTime)) == -1) {
            timerIcon = ICON_ALARM_DONE
        }

        return timerIcon;
    }

    render() {
        if (this.config?.hideInactiveTimers && this.timer?.status === "none") {
            return;
        }
        return html`
                <div>
                    ${this.timerNameTemplate()}
                    <div class="info">
                        <div class="icon">
                            <ha-icon style="--mdc-icon-size: 24px;" icon="${this.timerIcon()}"></ha-icon>
                        </div>
                        <div class="timer">
                            <span class="timeLeft">
                                <countdown-timer .timer=${this.timer}></countdown-timer>
                            </span>
                            <span class="duration">
                                <ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_DURATION}"></ha-icon>
                                ${this.timer?.duration}
                            </span>
                            ${this.alarmTimeTemplate()}
                        </div>
                    </div>
                </div>
          `;
    }

    static get styles(): CSSResult {
        return css`
        .icon {
            color: var(--state-icon-color, #44739e);
            line-height: 40px;
            width: 40px;
            text-align: center;
          }
        .timer {
          font-size: 20px;
          display: flex;
          margin-left: 16px;
        margin-right: 8px;
        align-items: center;
        }
        .timeLeft {
            padding-right: 16px;
        }
        .duration, .fireTime {
            font-size: 0.7em;
            line-height: normal;
            padding-right: 16px;
          }
          .info {
            display: flex;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            line-height: 28px;
            align-items: center;
          }
          .title {
            color: var(--secondary-text-color);
            font-size: 1.2em;
            padding: 0 10px;
            text-transform: capitalize;
            font-weight: 500;
          }
  `}

}