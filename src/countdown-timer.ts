import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators";
import { asyncReplace } from "lit/directives/async-replace";
import { STRING_HOURS, STRING_MINUTES, STRING_SECONDS, TIMER_IS_DONE } from "./const";
import { Timer } from "./types";

const formatToHumanReadeble = (rt: Date): string => {
    const h = rt.getUTCHours() > 0 ? rt.getUTCHours() + STRING_HOURS : ""
    const m = rt.getUTCMinutes() < 10 && rt.getUTCHours() > 1 ? "0" + rt.getUTCMinutes() : rt.getUTCMinutes();
    const s = rt.getUTCSeconds() < 10 ? "0" + rt.getUTCSeconds() : rt.getUTCSeconds();
    const ts = h + m + STRING_MINUTES + s + STRING_SECONDS;
    return ts;
}

async function* countDown(timestamp = 0) {
    const timeStampMS = timestamp * 1000;
    while (timeStampMS > Date.now()) {
        const delta = new Date(timeStampMS - Date.now());
        yield formatToHumanReadeble(delta);
        await new Promise((r) => setTimeout(r, 1000));
    }
    return TIMER_IS_DONE;
}

@customElement("countdown-timer")
export class CountdownTimer extends LitElement {
    @property({ type: Object })
    timer?: Timer;

    @state()
    private countdownTimer: AsyncGenerator<string, string, unknown> = countDown(this.timer?.fire_time);

    requestUpdate(name?: PropertyKey, oldValue?: Timer) {
        if (name && name == "timer" && this.timer?.fire_time !== oldValue?.fire_time) {
            this.countdownTimer = countDown(this.timer?.fire_time);
        }
        return super.requestUpdate(name, oldValue);
    }

    render() {
        return html`${asyncReplace(this.countdownTimer)}`;
    }
}