const dayOrder = [
  "ПОНЕДЕЛЬНИК",
  "ВТОРНИК",
  "СРЕДА",
  "ЧЕТВЕРГ",
  "ПЯТНИЦА",
];

const state = {
  week: 1,
  day: dayOrder[0],
  data: null,
  session: null,
  view: "day",
};

const weekButtons = document.querySelectorAll(".week-btn");
const themeCycle = document.getElementById("themeCycle");
const viewButtons = document.querySelectorAll(".view-btn");
const dayChips = document.getElementById("dayChips");
const classesWrap = document.getElementById("classes");
const classesPanel = classesWrap.closest(".panel");
const weekPanel = document.getElementById("weekPanel");
const weekClasses = document.getElementById("weekClasses");
const sessionWrap = document.getElementById("session");
const daySummary = document.getElementById("daySummary");
const todayHint = document.getElementById("todayHint");
const groupName = document.getElementById("groupName");
const todayLabel = document.getElementById("todayLabel");
const todayDate = document.getElementById("todayDate");
const nextClassTitle = document.getElementById("nextClassTitle");
const nextClassMeta = document.getElementById("nextClassMeta");
const nextLabel = document.getElementById("nextLabel");
const schedulePanels = document.querySelectorAll(".schedule-panel");
const sessionPanel = document.getElementById("sessionPanel");
const subgroupButtons = document.querySelectorAll(".subgroup-btn");
const subgroupToggle = document.getElementById("subgroupToggle");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchClear = document.getElementById("searchClear");
const examModal = document.getElementById("examModal");
const examBackdrop = document.getElementById("examBackdrop");
const examClose = document.getElementById("examClose");
const examTitle = document.getElementById("examTitle");
const examBody = document.getElementById("examBody");
const openTeachers = document.getElementById("openTeachers");
const teachersOverlay = document.getElementById("teachersOverlay");
const teachersBack = document.getElementById("teachersBack");
const teachersList = document.getElementById("teachersList");
const teacherModal = document.getElementById("teacherModal");
const teacherModalBackdrop = document.getElementById("teacherModalBackdrop");
const teacherModalClose = document.getElementById("teacherModalClose");
const teacherModalTitle = document.getElementById("teacherModalTitle");
const teacherModalBody = document.getElementById("teacherModalBody");

let teacherModalHideTimer = null;

const THEME_KEY = "schedule_theme";
const VIEW_KEY = "schedule_view";
const SUBGROUP_KEY = "schedule_subgroup";

const examMaterials = {
  "Введение в высшую математику": {
    themes: ["Пределы и производные", "Интегралы", "Ряды и простые уравнения"],
    materials: ["Конспект лекций", "Сборник задач", "Чек-лист формул"],
    tips: ["Прорешать типовые задачи", "Собрать шпаргалку формул"],
  },
  "История России": {
    themes: ["Основные эпохи", "Ключевые реформы", "Исторические личности"],
    materials: ["Конспект лекций", "Краткий план ответа", "Таймлайн событий"],
    tips: ["Учить даты блоками", "Готовить ответы по билетам"],
  },
  "Механика": {
    themes: ["Кинематика", "Динамика", "Законы сохранения"],
    materials: ["Лекции", "Практикум", "Типовые задачи"],
    tips: ["Решить 10 задач по каждой теме", "Повторить формулы"],
  },
  "Введение в технику физического эксперимента": {
    themes: ["Погрешности", "Методы измерений", "Обработка данных"],
    materials: ["Методичка", "Лабораторные отчеты", "Список терминов"],
    tips: ["Повторить обозначения", "Подготовить шаблон отчета"],
  },
};

const teachersData = [
  {
    name: "Кубрикова Анна Сергеевна",
    subjects: ["Основы российской государственности"],
    department: "Правоведения",
    position: "старший преподаватель",
  },
  {
    name: "Сизых Ирина Сергеевна",
    subjects: ["История России"],
    department: "Истории и гуманитарных наук",
    position: "старший преподаватель",
  },
  {
    name: "Медников Дмитрий Михайлович",
    subjects: ["Иностранный язык"],
    department: "Делового иностранного языка",
    position: "старший преподаватель",
  },
  {
    name: "Подпорина Наталья Михайловна",
    subjects: ["Иностранный язык"],
    department: "Делового иностранного языка",
    position: "старший преподаватель",
  },
  {
    name: "Лозовой Александр Александрович",
    subjects: ["Физическая культура и спорт"],
    department: "Физического воспитания и спорта",
    position: "старший преподаватель",
  },
  {
    name: "Жданов Олег Николаевич",
    subjects: ["Введение в высшую математику"],
    department: "Безопасности информационных технологий",
    position: "доцент",
  },
  {
    name: "Семенкова Арина Алексеевна",
    subjects: ["Общий физический практикум"],
    department: "Технической физики (Радиофизика и электроника)",
    position: "преподаватель",
  },
  {
    name: "Охоткина Евгения Александровна",
    subjects: ["Общий физический практикум", "Введение в технику физического эксперимента"],
    department: "Технической физики (Радиофизика и электроника)",
    position: "преподаватель",
  },
  {
    name: "Золотова Ольга Павловна",
    subjects: ["Информационные технологии в науке и образовании"],
    department: "Технической физики (Электричество и магнетизм)",
    position: "преподаватель",
  },
  {
    name: "Лукьянов Михаил Михайлович",
    subjects: ["Информационные технологии в науке и образовании"],
    department: "Информационные технологии в науке и образовании",
    position: "преподаватель",
  },
  {
    name: "Телегин Сергей Владимирович",
    subjects: ["Механика"],
    department: "Технической физики (Молекулярная физика)",
    position: "преподаватель",
  },
];

function setWeek(week) {
  state.week = week;
  weekButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.week) === week);
  });
  toggleView("schedule");
  renderClasses();
  renderWeek();
}

function toggleView(view) {
  const isSession = view === "session";
  schedulePanels.forEach((panel) => panel.classList.toggle("is-hidden", isSession));
  sessionPanel.classList.toggle("is-hidden", !isSession);
  subgroupToggle.classList.toggle("is-hidden", isSession);
  localStorage.setItem(VIEW_KEY, view);
  if (isSession) {
    weekPanel.classList.add("is-hidden");
    classesPanel.classList.add("is-hidden");
    dayChips.classList.add("is-hidden");
  } else {
    setScheduleView(state.view);
  }
}

function setDay(day) {
  state.day = day;
  [...dayChips.children].forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.day === day);
  });
  todayHint.textContent = "";
  renderClasses();
}

function parseStartMinutes(timeRange) {
  if (!timeRange) return 0;
  const [start] = timeRange.split("-");
  const [h, m] = start.split(":").map(Number);
  return h * 60 + m;
}

function parseEndMinutes(timeRange) {
  if (!timeRange) return 0;
  const parts = timeRange.split("-");
  if (parts.length < 2) return parseStartMinutes(timeRange);
  const [h, m] = parts[1].split(":").map(Number);
  return h * 60 + m;
}

function getProgressPercent(startMinutes, endMinutes, nowMinutes) {
  if (endMinutes <= startMinutes) return 0;
  if (nowMinutes <= startMinutes) return 0;
  if (nowMinutes >= endMinutes) return 100;
  return Math.round(((nowMinutes - startMinutes) / (endMinutes - startMinutes)) * 100);
}

function normalizeLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitEntry(raw) {
  const lines = normalizeLines(raw);
  return {
    title: lines[0] || "Без названия",
    details: lines.slice(1),
  };
}

function getEntryId(entry) {
  if (entry?._id === undefined || entry._id === null) return "";
  return `entry-${entry._id}`;
}

function getDisplayLinesForEntry(entry) {
  const { title, details } = splitEntry(entry.raw);
  const subgroupInfo = parseSubgroupLines(details);
  let displayLines = [];

  if (state.subgroup === "all") {
    displayLines = [...subgroupInfo.plain];
    if (subgroupInfo.hasMarkers) {
      if (subgroupInfo.map[1].length) {
        displayLines.push(`Подгруппа 1: ${subgroupInfo.map[1].join("; ")}`);
      }
      if (subgroupInfo.map[2].length) {
        displayLines.push(`Подгруппа 2: ${subgroupInfo.map[2].join("; ")}`);
      }
    }
  } else {
    const subgroup = Number(state.subgroup);
    if (subgroupInfo.hasMarkers) {
      const subgroupLines = subgroupInfo.map[subgroup] || [];
      if (!subgroupLines.length) {
        return null;
      }
      displayLines = [...subgroupInfo.plain, ...subgroupLines];
    } else {
      displayLines = [...subgroupInfo.plain];
    }
  }

  return { title, displayLines };
}

function createClassCard(entry, displayLines, title) {
  const card = document.createElement("div");
  card.className = "class-card";
  const entryId = getEntryId(entry);
  if (entryId) {
    card.id = entryId;
    card.dataset.entryId = entryId;
  }

  const time = document.createElement("div");
  time.className = "class-time";
  time.textContent = entry.time;

  const titleEl = document.createElement("div");
  titleEl.className = "class-title";
  titleEl.textContent = title;

  const linesWrap = document.createElement("div");
  linesWrap.className = "class-lines";
  displayLines.forEach((line) => {
    const span = document.createElement("span");
    span.textContent = line;
    linesWrap.appendChild(span);
  });

  card.appendChild(time);
  card.appendChild(titleEl);
  card.appendChild(linesWrap);

  const progress = document.createElement("div");
  progress.className = "class-progress-fill";
  const startMinutes = parseStartMinutes(entry.time);
  const endMinutes = parseEndMinutes(entry.time);
  card.dataset.progressStart = String(startMinutes);
  card.dataset.progressEnd = String(endMinutes);
  card.dataset.progressDay = entry.day;
  card.dataset.progressWeek = String(entry.week);
  card.appendChild(progress);
  card.classList.add("has-progress");
  return card;
}

function parseSubgroupLines(details) {
  const info = { hasMarkers: false, map: { 1: [], 2: [] }, plain: [] };
  details.forEach((line) => {
    const match = line.match(/\s*-\s*([12])\s*$/);
    if (match) {
      info.hasMarkers = true;
      const subgroup = Number(match[1]);
      info.map[subgroup].push(line.replace(/\s*-\s*[12]\s*$/, ""));
    } else {
      info.plain.push(line);
    }
  });
  return info;
}

function entryMatchesSubgroup(entry, subgroup) {
  if (subgroup === "all") return true;
  const { details } = splitEntry(entry.raw);
  const info = parseSubgroupLines(details);
  if (!info.hasMarkers) return true;
  return (info.map[Number(subgroup)] || []).length > 0;
}

function getEntriesForDay(week, day) {
  return state.data.schedule
    .filter((entry) => entry.week === week && entry.day === day)
    .filter((entry) => entryMatchesSubgroup(entry, state.subgroup))
    .sort((a, b) => parseStartMinutes(a.time) - parseStartMinutes(b.time));
}

function pickDefaultDay(week) {
  const now = new Date();
  const dayIndex = now.getDay();
  const todayName = dayOrder[dayIndex - 1];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (todayName) {
    const todayEntries = getEntriesForDay(week, todayName);
    if (todayEntries.length) {
      const lastEnd = Math.max(...todayEntries.map((entry) => parseEndMinutes(entry.time)));
      if (nowMinutes <= lastEnd) {
        return todayName;
      }
    }
  }

  const startIndex = Math.max(dayIndex - 1, 0);
  for (let i = startIndex; i < dayOrder.length; i += 1) {
    const day = dayOrder[i];
    const entries = getEntriesForDay(week, day);
    if (entries.length) return day;
  }

  return dayOrder[0];
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeCycle) {
    const labels = { light: "Свет", dark: "Тьма", nord: "Норд" };
    themeCycle.textContent = `Тема: ${labels[theme] || theme}`;
  }
  localStorage.setItem(THEME_KEY, theme);
}

function getNextTheme(theme) {
  const order = ["light", "dark", "nord"];
  const index = order.indexOf(theme);
  if (index === -1) return order[0];
  return order[(index + 1) % order.length];
}

function renderDayChips() {
  dayChips.innerHTML = "";
  dayOrder.forEach((day) => {
    const chip = document.createElement("button");
    chip.className = "day-chip";
    chip.textContent = day;
    chip.dataset.day = day;
    chip.addEventListener("click", () => setDay(day));
    dayChips.appendChild(chip);
  });
}

function renderClasses() {
  if (!state.data) return;
  const entries = getEntriesForDay(state.week, state.day);

  if (entries.length) {
    const first = entries[0].time;
    const last = entries[entries.length - 1].time;
    daySummary.textContent = `${entries.length} пар(ы) • ${first}–${last.split("-")[1]}`;
  } else {
    daySummary.textContent = "Нет занятий";
  }

  updateHeroDay();

  classesWrap.innerHTML = "";
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Сегодня можно выдохнуть — пар нет.";
    classesWrap.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const info = getDisplayLinesForEntry(entry);
    if (!info) return;
    const card = createClassCard(entry, info.displayLines, info.title);
    classesWrap.appendChild(card);
  });

  renderNextClass(entries);
  updateLiveProgress();
}

function updateHeroDay() {
  const today = new Date();
  const dayIndex = today.getDay();
  const todayName = dayOrder[dayIndex - 1];
  const isToday = todayName === state.day;

  todayLabel.textContent = todayName || "Сегодня";
  const formattedDate = today.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
  const formattedTime = today.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  todayDate.innerHTML = `<span>${formattedDate}</span><span>${formattedTime}</span>`;
  todayHint.textContent = isToday ? "Сегодня" : state.day;
}

function renderNextClass(entries) {
  if (!entries.length) {
    nextLabel.textContent = "Следующая пара";
    nextClassTitle.textContent = "Пар нет";
    nextClassMeta.textContent = "Можно отдыхать.";
    return;
  }

  const now = new Date();
  const todayDay = dayOrder[now.getDay() - 1];
  const isToday = todayDay === state.day;

  const entriesWithMinutes = entries.map((entry) => ({
    ...entry,
    start: parseStartMinutes(entry.time),
  }));

  if (isToday) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming = entriesWithMinutes.find((entry) => entry.start > nowMinutes);
    if (upcoming) {
      const { title, details } = splitEntry(upcoming.raw);
      const subgroupInfo = parseSubgroupLines(details);
      const detailLine =
        state.subgroup === "all"
          ? subgroupInfo.plain[0] || subgroupInfo.map[1][0] || subgroupInfo.map[2][0] || "Без аудитории"
          : subgroupInfo.plain[0] ||
            (subgroupInfo.map[Number(state.subgroup)] || [])[0] ||
            "Без аудитории";
      nextLabel.textContent = "Следующая пара";
      nextClassTitle.textContent = title;
      nextClassMeta.textContent = `${upcoming.time} • ${detailLine}`;
      return;
    }

    nextLabel.textContent = "Пары на сегодня";
    nextClassTitle.textContent = "Все закончились";
    nextClassMeta.textContent = "Можно выдохнуть.";
    return;
  }

  const first = entriesWithMinutes[0];
  const { title, details } = splitEntry(first.raw);
  const subgroupInfo = parseSubgroupLines(details);
  const detailLine =
    state.subgroup === "all"
      ? subgroupInfo.plain[0] || subgroupInfo.map[1][0] || subgroupInfo.map[2][0] || "Без аудитории"
      : subgroupInfo.plain[0] ||
        (subgroupInfo.map[Number(state.subgroup)] || [])[0] ||
        "Без аудитории";
  nextLabel.textContent = "Первая пара";
  nextClassTitle.textContent = title;
  nextClassMeta.textContent = `${first.time} • ${detailLine}`;
}

function renderSession() {
  if (!state.session) return;
  const items = state.session.session_upcoming || [];
  sessionWrap.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Все экзамены уже прошли.";
    sessionWrap.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "session-item";
    card.addEventListener("click", () => openExamModal(item));

    const title = document.createElement("div");
    title.className = "session-title";
    title.textContent = item.subject;

    const meta = document.createElement("div");
    meta.className = "session-meta";
    meta.textContent = `${item.date} • ${item.time} • ${item.type} • ${item.room} • ${item.teacher}`;

    card.appendChild(title);
    card.appendChild(meta);
    sessionWrap.appendChild(card);
  });
}

function normalizeSearch(text) {
  return text.toLowerCase().replace(/ё/g, "е");
}

function renderSearchResults(query) {
  if (!state.data) return;
  const trimmed = query.trim();
  if (!trimmed) {
    searchResults.innerHTML = "";
    return;
  }
  const needle = normalizeSearch(trimmed);
  const results = state.data.schedule
    .filter((entry) => entryMatchesSubgroup(entry, state.subgroup))
    .filter((entry) => {
      const { title, details } = splitEntry(entry.raw);
      const hay = normalizeSearch(
        [title, ...details, entry.time, entry.day, `Неделя ${entry.week}`].join(" ")
      );
      return hay.includes(needle);
    })
    .slice(0, 50);

  searchResults.innerHTML = "";
  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "Ничего не найдено.";
    searchResults.appendChild(empty);
    return;
  }

  results.forEach((entry) => {
    const info = getDisplayLinesForEntry(entry);
    if (!info) return;
    const item = document.createElement("div");
    item.className = "search-item";
    item.addEventListener("click", () => {
      setWeek(entry.week);
      setScheduleView("day");
      setDay(entry.day);
      requestAnimationFrame(() => {
        const targetId = getEntryId(entry);
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    const title = document.createElement("div");
    title.className = "search-title";
    title.textContent = info.title;

    const meta = document.createElement("div");
    meta.className = "search-meta";
    const detail = info.displayLines[0] || "Без аудитории";
    meta.textContent = `${entry.day} • ${entry.time} • ${entry.week} неделя • ${detail}`;

    item.appendChild(title);
    item.appendChild(meta);
    searchResults.appendChild(item);
  });
}

function getWeekDayOrder(weekEntries) {
  const orderMap = dayOrder.reduce((acc, day, index) => {
    acc[day] = index;
    return acc;
  }, {});
  const uniqueDays = [...new Set(weekEntries.map((entry) => entry.day))];
  return uniqueDays.sort((a, b) => {
    const aOrder = orderMap[a];
    const bOrder = orderMap[b];
    if (aOrder === undefined && bOrder === undefined) return a.localeCompare(b);
    if (aOrder === undefined) return 1;
    if (bOrder === undefined) return -1;
    return aOrder - bOrder;
  });
}

function renderWeek() {
  if (!state.data) return;
  const weekEntries = state.data.schedule
    .filter((entry) => entry.week === state.week)
    .filter((entry) => entryMatchesSubgroup(entry, state.subgroup))
    .sort((a, b) => parseStartMinutes(a.time) - parseStartMinutes(b.time));

  weekClasses.innerHTML = "";
  if (!weekEntries.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Нет пар на этой неделе.";
    weekClasses.appendChild(empty);
    return;
  }

  const orderedDays = getWeekDayOrder(weekEntries);
  orderedDays.forEach((day) => {
    const dayWrap = document.createElement("div");
    dayWrap.className = "week-day";

    const title = document.createElement("div");
    title.className = "week-day-title";
    title.textContent = day;
    dayWrap.appendChild(title);

    weekEntries
      .filter((entry) => entry.day === day)
      .forEach((entry) => {
        const info = getDisplayLinesForEntry(entry);
        if (!info) return;
        const card = createClassCard(entry, info.displayLines, info.title);
        dayWrap.appendChild(card);
      });

    weekClasses.appendChild(dayWrap);
  });
  updateLiveProgress();
}

function updateLiveProgress() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayName = dayOrder[now.getDay() - 1];
  let dayFinished = false;
  if (todayName && state.data?.schedule) {
    const lastEnd = state.data.schedule
      .filter((entry) => entry.week === state.week && entry.day === todayName)
      .reduce((max, entry) => Math.max(max, parseEndMinutes(entry.time)), 0);
    dayFinished = lastEnd > 0 && nowMinutes > lastEnd;
  }
  document.querySelectorAll(".class-card[data-progress-start]").forEach((card) => {
    const start = Number(card.dataset.progressStart);
    const end = Number(card.dataset.progressEnd);
    const cardDay = card.dataset.progressDay;
    const cardWeek = Number(card.dataset.progressWeek);
    const isToday = cardDay === todayName && cardWeek === state.week;
    const percent = isToday && !dayFinished ? getProgressPercent(start, end, nowMinutes) : 0;
    const fill = card.querySelector(".class-progress-fill");
    if (fill) {
      fill.style.width = `${percent}%`;
    }
    card.classList.toggle("is-live", isToday && !dayFinished && nowMinutes >= start && nowMinutes <= end);
  });
}

function setScheduleView(view) {
  state.view = view;
  viewButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
  const isWeek = view === "week";
  dayChips.classList.toggle("is-hidden", isWeek);
  classesPanel.classList.toggle("is-hidden", isWeek);
  weekPanel.classList.toggle("is-hidden", !isWeek);
  if (isWeek) {
    renderWeek();
  } else {
    renderClasses();
  }
}

function openExamModal(item) {
  examTitle.textContent = item.subject;
  examBody.innerHTML = "";

  const meta = document.createElement("div");
  meta.className = "modal-meta";
  meta.textContent = `${item.date} • ${item.time} • ${item.type} • ${item.room} • ${item.teacher}`;
  examBody.appendChild(meta);

  const defaults = {
    themes: ["Повторить ключевые темы", "Список вопросов из билетов"],
    materials: ["Конспект лекций", "Методичка", "Практика с задачами"],
    tips: ["Сделать план ответа", "Разделить подготовку на блоки"],
  };
  const material = examMaterials[item.subject] || defaults;

  const sections = [
    { title: "Темы", items: material.themes },
    { title: "Материалы", items: material.materials },
    { title: "Советы", items: material.tips },
  ];

  sections.forEach((section) => {
    const wrap = document.createElement("div");
    wrap.className = "modal-section";
    const title = document.createElement("div");
    title.className = "modal-section-title";
    title.textContent = section.title;
    const list = document.createElement("ul");
    list.className = "modal-list";
    section.items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
    wrap.appendChild(title);
    wrap.appendChild(list);
    examBody.appendChild(wrap);
  });

  examModal.classList.remove("is-hidden");
}

function closeExamModal() {
  examModal.classList.add("is-hidden");
}

function renderTeachers() {
  if (!teachersList) return;
  teachersList.innerHTML = "";
  teachersData.forEach((teacher) => {
    const card = document.createElement("div");
    card.className = "teacher-item";
    const name = document.createElement("div");
    name.className = "teacher-name";
    name.textContent = teacher.name;
    const subjects = document.createElement("div");
    subjects.className = "teacher-subjects";
    subjects.textContent = teacher.subjects.join(", ");
    const dept = document.createElement("div");
    dept.className = "teacher-dept";
    dept.textContent = teacher.department || "Кафедра не указана";
    card.appendChild(name);
    card.appendChild(subjects);
    card.appendChild(dept);
    card.addEventListener("click", () => {
      openTeacherModal(teacher);
    });
    teachersList.appendChild(card);
  });
}

function openTeachersOverlay() {
  if (!teachersOverlay) return;
  renderTeachers();
  teachersOverlay.classList.remove("is-hidden");
  requestAnimationFrame(() => {
    teachersOverlay.classList.add("is-visible");
  });
  document.body.classList.add("is-overlay-open");
}

function closeTeachersOverlay() {
  if (!teachersOverlay) return;
  teachersOverlay.classList.remove("is-visible");
  const onEnd = () => {
    teachersOverlay.classList.add("is-hidden");
    teachersOverlay.removeEventListener("transitionend", onEnd);
  };
  teachersOverlay.addEventListener("transitionend", onEnd);
  document.body.classList.remove("is-overlay-open");
}

function openTeacherModal(teacher) {
  if (!teacherModal || !teacherModalTitle || !teacherModalBody) return;
  if (teacherModalHideTimer) {
    clearTimeout(teacherModalHideTimer);
    teacherModalHideTimer = null;
  }
  teacherModalTitle.textContent = teacher.name;
  teacherModalBody.innerHTML = "";

  const subjectsBlock = document.createElement("div");
  subjectsBlock.className = "teacher-modal-block";
  const subjectsLabel = document.createElement("div");
  subjectsLabel.className = "teacher-modal-label";
  subjectsLabel.textContent = "Дисциплины";
  const subjectsValue = document.createElement("div");
  subjectsValue.className = "teacher-modal-value";
  subjectsValue.textContent = teacher.subjects.join(", ");
  subjectsBlock.appendChild(subjectsLabel);
  subjectsBlock.appendChild(subjectsValue);

  const departmentBlock = document.createElement("div");
  departmentBlock.className = "teacher-modal-block";
  const departmentLabel = document.createElement("div");
  departmentLabel.className = "teacher-modal-label";
  departmentLabel.textContent = "Кафедра";
  const departmentValue = document.createElement("div");
  departmentValue.className = "teacher-modal-value";
  departmentValue.textContent = teacher.department || "Кафедра не указана";
  departmentBlock.appendChild(departmentLabel);
  departmentBlock.appendChild(departmentValue);

  const positionBlock = document.createElement("div");
  positionBlock.className = "teacher-modal-block";
  const positionLabel = document.createElement("div");
  positionLabel.className = "teacher-modal-label";
  positionLabel.textContent = "Должность";
  const positionValue = document.createElement("div");
  positionValue.className = "teacher-modal-value";
  positionValue.textContent = teacher.position || "Должность не указана";
  positionBlock.appendChild(positionLabel);
  positionBlock.appendChild(positionValue);

  teacherModalBody.appendChild(subjectsBlock);
  teacherModalBody.appendChild(departmentBlock);
  teacherModalBody.appendChild(positionBlock);
  teacherModal.classList.remove("is-hidden");
  teacherModal.classList.add("is-visible");
}

function closeTeacherModal() {
  if (!teacherModal) return;
  teacherModal.classList.remove("is-visible");
  if (teacherModalHideTimer) {
    clearTimeout(teacherModalHideTimer);
  }
  teacherModalHideTimer = setTimeout(() => {
    teacherModal.classList.add("is-hidden");
    teacherModalHideTimer = null;
  }, 200);
}

function enableMobileSwipeBack() {
  if (!teachersOverlay) return;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  if (!isTouchDevice) return;

  const EDGE_SIZE = 24;
  const TRIGGER_DISTANCE = 70;
  const MAX_VERTICAL_DRIFT = 35;
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const shouldTrack = () =>
    !teachersOverlay.classList.contains("is-hidden") &&
    teachersOverlay.classList.contains("is-visible");

  teachersOverlay.addEventListener("touchstart", (event) => {
    if (!shouldTrack()) return;
    const touch = event.touches[0];
    if (!touch || touch.clientX > EDGE_SIZE) {
      tracking = false;
      return;
    }
    tracking = true;
    startX = touch.clientX;
    startY = touch.clientY;
  });

  teachersOverlay.addEventListener("touchmove", (event) => {
    if (!tracking) return;
    const touch = event.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (deltaX < 0) {
      tracking = false;
      return;
    }

    if (deltaX > TRIGGER_DISTANCE && Math.abs(deltaY) < MAX_VERTICAL_DRIFT) {
      tracking = false;
      if (teacherModal && teacherModal.classList.contains("is-visible")) {
        closeTeacherModal();
      } else {
        closeTeachersOverlay();
      }
    }
  });

  teachersOverlay.addEventListener("touchend", () => {
    tracking = false;
  });
}

function setTodayDefaults() {
  todayHint.textContent = "";
  state.day = pickDefaultDay(state.week);
}

async function init() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  async function safeFetch(url, fallback) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      return fallback || null;
    }
  }

  state.data = await safeFetch("data/schedule.json", window.SCHEDULE_DATA);
  state.session = await safeFetch("data/session_upcoming.json", window.SESSION_DATA);

  if (state.data?.schedule) {
    state.data.schedule.forEach((entry, index) => {
      entry._id = index;
    });
  }

  if (!state.data) {
    classesWrap.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Не удалось загрузить расписание.";
    classesWrap.appendChild(empty);
    return;
  }

  if (state.data.meta?.group) {
    groupName.textContent = state.data.meta.group;
  }

  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
  setTheme(initialTheme);

  if (themeCycle) {
    themeCycle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || initialTheme;
      setTheme(getNextTheme(current));
    });
  }

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => setScheduleView(btn.dataset.view));
  });

  subgroupButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.subgroup = btn.dataset.subgroup;
      subgroupButtons.forEach((item) =>
        item.classList.toggle("active", item.dataset.subgroup === state.subgroup)
      );
      localStorage.setItem(SUBGROUP_KEY, state.subgroup);
      renderClasses();
      renderWeek();
      renderSearchResults(searchInput.value);
    });
  });

  weekButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.week === "session") {
        weekButtons.forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        toggleView("session");
        return;
      }
      setWeek(Number(btn.dataset.week));
    });
  });

  renderDayChips();
  const storedSubgroup = localStorage.getItem(SUBGROUP_KEY) || "all";
  state.subgroup = storedSubgroup;
  subgroupButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.subgroup === storedSubgroup)
  );

  setWeek(1);
  setTodayDefaults();
  setDay(state.day);

  const storedView = localStorage.getItem(VIEW_KEY);
  if (storedView === "session") {
    weekButtons.forEach((btn) => {
      if (btn.dataset.week === "session") btn.classList.add("active");
      else btn.classList.remove("active");
    });
    toggleView("session");
  }
  renderSession();
  renderWeek();
  updateHeroDay();
  setInterval(updateHeroDay, 60 * 1000);
  setInterval(updateLiveProgress, 30 * 1000);

  if (searchInput) {
    searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchResults.innerHTML = "";
      searchInput.focus();
    });
  }

  if (examClose) examClose.addEventListener("click", closeExamModal);
  if (examBackdrop) examBackdrop.addEventListener("click", closeExamModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExamModal();
  });
  if (openTeachers) openTeachers.addEventListener("click", openTeachersOverlay);
  if (teachersBack) teachersBack.addEventListener("click", closeTeachersOverlay);
  if (teacherModalClose) teacherModalClose.addEventListener("click", closeTeacherModal);
  if (teacherModalBackdrop) teacherModalBackdrop.addEventListener("click", closeTeacherModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTeachersOverlay();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTeacherModal();
  });
  enableMobileSwipeBack();

  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
}

init();
