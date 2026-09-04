import type { ISODate } from "./types";

export function todayISO(): ISODate {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

// Segunda-feira como início da semana. Retorna a data (ISO) da segunda.
export function weekStartISO(dateISO: ISODate): ISODate {
  const d = new Date(dateISO + "T00:00:00");
  const day = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function sameWeek(a: ISODate, b: ISODate): boolean {
  return weekStartISO(a) === weekStartISO(b);
}

export function daysAgo(dateISO: ISODate): number {
  const then = new Date(dateISO + "T00:00:00").getTime();
  const now = new Date(todayISO() + "T00:00:00").getTime();
  return Math.round((now - then) / 86400000);
}
