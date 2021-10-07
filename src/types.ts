import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import { TimerPanel } from './googlehome-card';

declare global {
  interface HTMLElementTagNameMap {
    'googlehome-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
    'timer-element': TimerPanel;
  }
  interface Window {
    customCards: LovelaceCardConfig[];
  }
}

// TODO Add your configuration elements here for type-checking
export interface GoogleHomeCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  entity?: string;
  timerEntity?: string;
  use12hour?: boolean;
  showFireTime?: boolean;

  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface Alarm {
  alarm_id: string;
  fire_time: number;
  local_time: string;
  local_time_iso: string;
  status: "none" | "set" | "ringing" | "snoozed" | "inactive";
  label: string;
  recurrence: number[];
}

export interface Timer {
  timer_id: string;
  fire_time: number;
  local_time: string;
  local_time_iso: string;
  status: "none" | "set" | "ringing" | "paused";
  label: string;
  duration: number;
}