import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import { TimerPanel } from './timer-panel';
import { AlarmPanel } from './alarm-panel';

declare global {
  interface HTMLElementTagNameMap {
    'googlehome-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
    'timer-element': TimerPanel;
    'alarm-element': AlarmPanel;
  }
  interface Window {
    customCards: LovelaceCardConfig[];
  }
}

export interface GoogleHomeCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  entity?: string;
  timerEntity?: string;
  use12hour?: boolean;
  showFireTime?: boolean;
  hideInactiveTimers?: boolean;
  hideInactiveAlarms?: boolean;
  hideCardIfNoAlarmOrTimers?: boolean;
}

export interface Alarm {
  alarm_id: string;
  fire_time: number;
  local_time: string;
  local_time_iso: string;
  status: "none" | "set" | "ringing" | "snoozed" | "inactive";
  label: string;
  recurrence: number[] | null;
}

export interface Timer {
  timer_id: string;
  fire_time: number | null;
  local_time: string | null;
  local_time_iso: string | null;
  status: "none" | "set" | "ringing" | "paused";
  label: string | null;
  duration: number;
}