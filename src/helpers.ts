import { STRING_HOURS, STRING_MINUTES, STRING_SECONDS, TIMER_IS_DONE, WEEKDAYS } from "./const";

export const formatToHumanReadableTime = (rt: Date): string => {
    const h = rt.getUTCHours() > 0 ? rt.getUTCHours() + STRING_HOURS : ""
    const m = rt.getUTCMinutes() < 10 && rt.getUTCHours() > 1 ? "0" + rt.getUTCMinutes() : rt.getUTCMinutes();
    const s = rt.getUTCSeconds() < 10 ? "0" + rt.getUTCSeconds() : rt.getUTCSeconds();
    const ts = h + m + STRING_MINUTES + s + STRING_SECONDS;
    return ts;
}

export async function* countDownGenerator(timestamp = 0) {
    const timeStampMS = timestamp * 1000;
    while (timeStampMS > Date.now()) {
        const delta = new Date(timeStampMS - Date.now());
        yield formatToHumanReadableTime(delta);
        await new Promise((r) => setTimeout(r, 1000));
    }
    return TIMER_IS_DONE;
}


export const formatAlarmTime = (ts: number, isAmpm?: boolean) => {
    const d = new Date(ts * 1000);
    const time = d.toLocaleString(window.navigator.language, { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: isAmpm })
    return time
}

export const formatAlarmRecurance = (recurrence: number[]) => {
    let result = "";

    const weekdays = [1, 2, 3, 4, 5];

    if (recurrence?.length >= 7) {
        result = "Every day";
    } else if (weekdays.every(x => recurrence.includes(x))) {
        result = "Weekdays";
    } else {
        result = recurrence?.map(x => WEEKDAYS[x]).join(", ") ?? "";
    }

    return result;
}