/* Calendar and display rules shared by the app and regression tests. */
const ScheduleLogic = (() => {
  const days = ["ВОСКРЕСЕНЬЕ", "ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
  const dayNumber = (date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const getDayName = (date) => days[date.getDay()];
  function getWeekNumber(date = new Date()) {
    const weeks = Math.floor((dayNumber(date) - dayNumber(new Date(2026, 7, 31))) / 7);
    return ((weeks % 2) + 2) % 2 + 1;
  }
  function minutes(time) {
    const [h, m] = time.trim().split(":").map(Number);
    return h * 60 + m;
  }
  function getLessonState(entries, week, day, now = new Date()) {
    const sorted = [...entries].sort((a, b) => minutes(a.time.split("-")[0]) - minutes(b.time.split("-")[0]));
    if (!sorted.length) return { kind: "empty" };
    if (week !== getWeekNumber(now) || day !== getDayName(now)) {
      return { kind: "preview", entry: sorted[0] };
    }
    const time = now.getHours() * 60 + now.getMinutes();
    const live = sorted.find((entry) => {
      const [start, end] = entry.time.split("-").map(minutes);
      return time >= start && time < end;
    });
    if (live) return { kind: "live", entry: live, remaining: minutes(live.time.split("-")[1]) - time };
    const next = sorted.find((entry) => minutes(entry.time.split("-")[0]) > time);
    if (next) return { kind: "upcoming", entry: next, remaining: minutes(next.time.split("-")[0]) - time };
    return { kind: "finished" };
  }
  function formatLessonTitle(title) {
    const types = { "лаб.р.": "Лабораторная", "лекц.": "Лекция", "пр.": "Практика" };
    const match = title.match(/\s*\((лаб\.р\.|лекц\.|пр\.)\)\s*$/i);
    const kind = match ? types[match[1].toLowerCase()] : "";
    const name = match ? title.slice(0, match.index).trim() : title;
    const short = name.replace(/\s*\([^)]{60,}\)/g, "").trim();
    return { short, kind, expandable: short !== name || name.length > 64, full: title };
  }
  function formatDaySummary(entries) {
    if (!entries.length) return "Нет занятий";
    const sorted = [...entries].sort((a, b) => minutes(a.time.split("-")[0]) - minutes(b.time.split("-")[0]));
    const count = entries.length;
    const plural = count % 100 >= 11 && count % 100 <= 14 ? "пар" : count % 10 === 1 ? "пара" : [2, 3, 4].includes(count % 10) ? "пары" : "пар";
    const start = sorted[0].time.split("-")[0];
    const end = sorted.reduce((latest, entry) => minutes(entry.time.split("-")[1]) > minutes(latest) ? entry.time.split("-")[1] : latest, sorted[0].time.split("-")[1]);
    return `${count} ${plural} · ${start}–${end}`;
  }
  function getUpcomingExams(items, now = new Date()) {
    return items.filter((item) => {
      const match = item.date?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      if (!match) return false;
      const [, day, month, year] = match.map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && dayNumber(date) >= dayNumber(now);
    }).sort((a, b) => a.date.split(".").reverse().join("").localeCompare(b.date.split(".").reverse().join("")));
  }
  function hasKnownValue(value) {
    return Boolean(value?.trim()) && !/^не указан[аоы]?\.?$/i.test(value.trim());
  }
  return { getDayName, getWeekNumber, getLessonState, formatLessonTitle, formatDaySummary, hasKnownValue, getUpcomingExams };
})();
if (typeof module !== "undefined") module.exports = ScheduleLogic;
