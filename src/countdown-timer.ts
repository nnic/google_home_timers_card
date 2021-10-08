import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators";
import { asyncReplace } from "lit/directives/async-replace";
import { Timer } from "./types";
import { countDownGenerator } from './helpers';


@customElement("countdown-timer")
export class CountdownTimer extends LitElement {
    @property({ type: Object })
    timer?: Timer;

    @state()
    private countdownTimer: AsyncGenerator<string, string, unknown> = countDownGenerator(this.timer?.fire_time);

    requestUpdate(name?: PropertyKey, oldValue?: Timer) {
        if (name && name == "timer" && this.timer?.fire_time !== oldValue?.fire_time) {
            this.countdownTimer = countDownGenerator(this.timer?.fire_time);
        }
        return super.requestUpdate(name, oldValue);
    }

    render() {
        return html`${asyncReplace(this.countdownTimer)}`;
    }
}