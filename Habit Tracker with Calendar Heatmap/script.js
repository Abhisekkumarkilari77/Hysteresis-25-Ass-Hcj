
const STORAGE_KEYS = {
  HABITS: "habitTracker.habits",
  COMPLETIONS: "habitTracker.completions",
  META: "habitTracker.meta",
};

const todayDateString = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const formatDateLong = (iso) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const dateToKey = (d) => d.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const diffDays = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  const ms = db.setHours(0, 0, 0, 0) - da.setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

let habits = [];
let completions = {};
let meta = {
  longestStreak: 0,
};

function loadState() {
  try {
    const habitsRaw = localStorage.getItem(STORAGE_KEYS.HABITS);
    const completionsRaw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    const metaRaw = localStorage.getItem(STORAGE_KEYS.META);

    habits = habitsRaw ? JSON.parse(habitsRaw) : [];
    completions = completionsRaw ? JSON.parse(completionsRaw) : {};
    meta = metaRaw
      ? { longestStreak: 0, ...JSON.parse(metaRaw) }
      : { longestStreak: 0 };
  } catch (e) {
    console.error("Failed to load habit tracker state", e);
    habits = [];
    completions = {};
    meta = { longestStreak: 0 };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  localStorage.setItem(STORAGE_KEYS.META, JSON.stringify(meta));
}

const els = {};

function cacheDom() {
  els.currentDate = document.getElementById("currentDate");
  els.motivationLine = document.getElementById("motivationLine");

  els.addHabitForm = document.getElementById("addHabitForm");
  els.habitNameInput = document.getElementById("habitNameInput");
  els.habitDescriptionInput = document.getElementById(
    "habitDescriptionInput"
  );
  els.habitStartDateInput = document.getElementById("habitStartDateInput");
  els.habitFrequencyInput = document.getElementById("habitFrequencyInput");

  els.todaySummary = document.getElementById("todaySummary");
  els.todayHabitList = document.getElementById("todayHabitList");
  els.todayHabitsEmpty = document.getElementById("todayHabitsEmpty");

  els.rangeYearBtn = document.getElementById("rangeYearBtn");
  els.rangeMonthBtn = document.getElementById("rangeMonthBtn");
  els.heatmapGrid = document.getElementById("heatmapGrid");
  els.heatmapEmpty = document.getElementById("heatmapEmpty");

  els.currentStreakValue = document.getElementById("currentStreakValue");
  els.currentStreakNote = document.getElementById("currentStreakNote");
  els.longestStreakValue = document.getElementById("longestStreakValue");
  els.completedTodayValue = document.getElementById("completedTodayValue");
  els.completedTodayNote = document.getElementById("completedTodayNote");
  els.completionRateValue = document.getElementById("completionRateValue");

  els.tooltip = document.getElementById("tooltip");
}

function updateHeader() {
  const today = new Date();
  els.currentDate.textContent = formatDateLong(today);

  const quotes = [
    "Small steps repeated quietly change everything.",
    "Showing up today is enough.",
    "Consistency beats intensity every time.",
    "You don’t have to do it all, just something.",
    "Gentle progress still counts as progress.",
  ];
  const idx = today.getDate() % quotes.length;
  els.motivationLine.textContent = quotes[idx];
}

function renderTodayList() {
  const todayKey = todayDateString();
  const todayCompletions = new Set(completions[todayKey] || []);

  const activeHabits = habits.filter((h) => h.active !== false);
  els.todayHabitList.innerHTML = "";

  if (!activeHabits.length) {
    els.todayHabitsEmpty.style.display = "block";
    els.todaySummary.textContent =
      "Add at least one habit to see it here each day.";
    return;
  }

  els.todayHabitsEmpty.style.display = "none";

  let completedCount = 0;
  activeHabits.forEach((habit) => {
    const li = document.createElement("li");
    li.className = "habit-item";
    li.dataset.habitId = habit.id;

    const isCompleted = todayCompletions.has(habit.id);
    if (isCompleted) {
      li.classList.add("completed");
      completedCount += 1;
    }

    const left = document.createElement("div");
    left.className = "habit-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = isCompleted;
    checkbox.setAttribute("aria-label", `Mark ${habit.name} complete`);

    checkbox.addEventListener("change", () =>
      toggleCompletionForToday(habit.id)
    );

    const main = document.createElement("div");
    main.className = "habit-main";

    const name = document.createElement("div");
    name.className = "habit-name";
    name.textContent = habit.name;

    const desc = document.createElement("div");
    desc.className = "habit-description";
    if (habit.description) {
      desc.textContent = habit.description;
    } else {
      desc.textContent = "Tap the pencil to add a note.";
      desc.style.opacity = "0.85";
    }

    const meta = document.createElement("div");
    meta.className = "habit-meta";
    meta.textContent = `Since ${formatDateLong(habit.startDate)}`;

    main.appendChild(name);
    main.appendChild(desc);
    main.appendChild(meta);

    left.appendChild(checkbox);
    left.appendChild(main);

    const actions = document.createElement("div");
    actions.className = "habit-actions";

    const pausePill = document.createElement("button");
    pausePill.type = "button";
    pausePill.className = "pill" + (habit.active === false ? " paused" : "");
    pausePill.textContent = habit.active === false ? "Paused" : "Active";
    pausePill.title =
      habit.active === false
        ? "Resume tracking this habit"
        : "Pause this habit (it will be hidden from Today)";
    pausePill.addEventListener("click", () => toggleHabitActive(habit.id));

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-icon";
    editBtn.innerHTML = "✏️<span>Edit</span>";
    editBtn.addEventListener("click", () => editHabit(habit.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-icon";
    deleteBtn.innerHTML = "🗑<span>Delete</span>";
    deleteBtn.addEventListener("click", () => deleteHabit(habit.id));

    actions.appendChild(pausePill);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(actions);

    els.todayHabitList.appendChild(li);
  });

  const summary =
    completedCount === 0
      ? "A single tiny checkmark keeps your streak alive."
      : completedCount === activeHabits.length
      ? "Beautiful — everything you planned for today is done."
      : `${completedCount} of ${activeHabits.length} habits completed so far.`;
  els.todaySummary.textContent = summary;
}

function addHabitFromForm(e) {
  e.preventDefault();

  const name = els.habitNameInput.value.trim();
  const description = els.habitDescriptionInput.value.trim();
  const startDateRaw = els.habitStartDateInput.value;

  if (!name) return;

  const habit = {
    id: `habit_${Date.now()}`,
    name,
    description,
    startDate: startDateRaw || todayDateString(),
    active: true,
    frequency: els.habitFrequencyInput.value || "daily",
  };

  habits.push(habit);
  saveState();
  renderTodayList();
  renderHeatmap();
  renderStats();

  els.addHabitForm.reset();
}

function findHabitIndex(id) {
  return habits.findIndex((h) => h.id === id);
}

function toggleHabitActive(id) {
  const idx = findHabitIndex(id);
  if (idx === -1) return;
  habits[idx].active = habits[idx].active === false ? true : false;
  saveState();
  renderTodayList();
  renderHeatmap();
  renderStats();
}

function editHabit(id) {
  const idx = findHabitIndex(id);
  if (idx === -1) return;
  const habit = habits[idx];

  const newName = (window.prompt("Edit habit name", habit.name) || "").trim();
  if (!newName) return;

  const newDesc = window.prompt(
    "Edit habit description (optional)",
    habit.description || ""
  );

  habit.name = newName;
  habit.description = newDesc ? newDesc.trim() : "";

  saveState();
  renderTodayList();
  renderHeatmap();
}

function deleteHabit(id) {
  const idx = findHabitIndex(id);
  if (idx === -1) return;
  const habit = habits[idx];

  const ok = window.confirm(
    `Delete "${habit.name}" and its history from this tracker?`
  );
  if (!ok) return;

  habits.splice(idx, 1);
  Object.keys(completions).forEach((dateKey) => {
    completions[dateKey] = (completions[dateKey] || []).filter(
      (hid) => hid !== id
    );
    if (!completions[dateKey].length) {
      delete completions[dateKey];
    }
  });

  saveState();
  renderTodayList();
  renderHeatmap();
  renderStats();
}

function toggleCompletionForToday(habitId) {
  const todayKey = todayDateString();
  const list = completions[todayKey] || [];
  const idx = list.indexOf(habitId);

  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(habitId);
  }

  completions[todayKey] = list;
  if (!list.length) {
    delete completions[todayKey];
  }

  recomputeStreaks();
  saveState();
  renderTodayList();
  renderHeatmap();
  renderStats(true);
}

function recomputeStreaks() {
  const daysWithCompletion = Object.keys(completions).filter(
    (k) => completions[k] && completions[k].length > 0
  );
  if (!daysWithCompletion.length) {
    meta.longestStreak = Math.max(meta.longestStreak || 0, 0);
    return;
  }

  daysWithCompletion.sort();

  let longest = meta.longestStreak || 0;
  let currentStreak = 0;
  let lastDate = null;
  for (const dateStr of daysWithCompletion) {
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const gap = diffDays(lastDate, dateStr);
      if (gap === 1) {
        currentStreak += 1;
      } else if (gap > 1) {
        currentStreak = 1;
      }
    }
    lastDate = dateStr;
    if (currentStreak > longest) longest = currentStreak;
  }

  meta.longestStreak = longest;
}

function getCurrentStreak() {
  const todayKey = todayDateString();
  let streak = 0;
  let cursor = new Date(todayKey);

  while (true) {
    const key = dateToKey(cursor);
    if (completions[key] && completions[key].length > 0) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return streak;
}

let currentRange = "year";

function getHeatmapRange() {
  const today = new Date();
  if (currentRange === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = today;
    return { start, end };
  }

  const end = today;
  const start = addDays(new Date(), -364);
  return { start, end };
}

function getCompletionIntensityForDate(dateKey) {
  const dayCompletions = completions[dateKey] || [];
  if (!dayCompletions.length || !habits.length) return { level: 0, pct: 0 };

  const activeOnDate = habits.filter((h) => {
    if (h.active === false) return false;
    return h.startDate <= dateKey;
  });

  if (!activeOnDate.length) return { level: 0, pct: 0 };

  const completedUnique = new Set(dayCompletions);
  const pct = Math.min(
    100,
    Math.round((completedUnique.size / activeOnDate.length) * 100)
  );

  let level = 0;
  if (pct >= 1 && pct < 50) level = 1;
  else if (pct >= 50 && pct < 100) level = 2;
  else if (pct === 100) level = 3;

  return { level, pct };
}

function renderHeatmap() {
  els.heatmapGrid.innerHTML = "";

  const { start, end } = getHeatmapRange();
  const totalDays = diffDays(start, end) + 1;
  if (totalDays <= 0) return;

  const weeksCount = Math.ceil(totalDays / 7);
  const startDay = start.getDay();
  const offsetToMonday = (startDay + 6) % 7;
  let cursor = addDays(start, -offsetToMonday);

  let hasAnyCompletion = false;

  for (let w = 0; w < weeksCount + 1; w++) {
    const weekCol = document.createElement("div");
    weekCol.className = "heatmap-week";

    for (let i = 0; i < 7; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "heatmap-day";

      const key = dateToKey(cursor);
      const withinRange =
        cursor >= new Date(start.toDateString()) &&
        cursor <= new Date(end.toDateString());

      if (!withinRange) {
        cell.style.visibility = "hidden";
      } else {
        const { level, pct } = getCompletionIntensityForDate(key);
        cell.classList.add(`level-${level}`);

        const hasCompletion =
          completions[key] && completions[key].length > 0 && level > 0;
        if (hasCompletion) {
          cell.classList.add("has-completion");
          hasAnyCompletion = true;
        }

        cell.dataset.date = key;
        cell.dataset.pct = pct.toString();

        cell.setAttribute(
          "aria-label",
          `${formatDateLong(cursor)}: ${pct}% of habits completed`
        );

        cell.addEventListener("mouseenter", (ev) =>
          showTooltipForCell(ev, key)
        );
        cell.addEventListener("mouseleave", hideTooltip);
        cell.addEventListener("focus", (ev) => showTooltipForCell(ev, key));
        cell.addEventListener("blur", hideTooltip);
        cell.addEventListener("mousemove", moveTooltipWithPointer);
      }

      weekCol.appendChild(cell);
      cursor = addDays(cursor, 1);
    }

    els.heatmapGrid.appendChild(weekCol);
  }

  els.heatmapEmpty.style.display = hasAnyCompletion ? "none" : "block";
}

function showTooltipForCell(event, dateKey) {
  const t = els.tooltip;
  const rect = event.currentTarget.getBoundingClientRect();

  const dayCompletions = completions[dateKey] || [];
  const { pct } = getCompletionIntensityForDate(dateKey);

  const completedCount = new Set(dayCompletions).size;
  const activeOnDate = habits.filter(
    (h) => h.active !== false && h.startDate <= dateKey
  );
  const totalPossible = activeOnDate.length;

  const dateLabel = formatDateLong(dateKey);
  const pctLabel = totalPossible ? `${pct}%` : "0%";

  let completedLine = "No habits completed";
  if (completedCount === 1) completedLine = "1 habit completed";
  else if (completedCount > 1)
    completedLine = `${completedCount} habits completed`;

  t.innerHTML = `
    <div class="tooltip-heading">${dateLabel}</div>
    <div class="tooltip-row">
      <span class="tooltip-label">Completion</span>
      <span class="tooltip-strong">${pctLabel}</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">Details</span>
      <span>${completedLine}</span>
    </div>
  `;

  const x = rect.left + rect.width / 2;
  const y = rect.top - 10;

  positionTooltip(x, y);
  t.dataset.visible = "true";
  t.setAttribute("aria-hidden", "false");
}

function moveTooltipWithPointer(event) {
  const x = event.clientX;
  const y = event.clientY - 14;
  positionTooltip(x, y);
}

function positionTooltip(x, y) {
  const t = els.tooltip;
  const padding = 8;
  const rect = t.getBoundingClientRect();

  let tx = x - rect.width / 2;
  let ty = y - rect.height;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (tx < padding) tx = padding;
  if (tx + rect.width + padding > vw) tx = vw - rect.width - padding;
  if (ty < padding) ty = padding;
  if (ty + rect.height + padding > vh) ty = vh - rect.height - padding;

  t.style.left = `${tx}px`;
  t.style.top = `${ty}px`;
}

function hideTooltip() {
  els.tooltip.dataset.visible = "false";
  els.tooltip.setAttribute("aria-hidden", "true");
}

function renderStats(skipRecomputeLongest) {
  if (!skipRecomputeLongest) {
    recomputeStreaks();
  }

  const currentStreak = getCurrentStreak();
  const longestStreak = meta.longestStreak || 0;
  const todayKey = todayDateString();
  const todaysCompletions = completions[todayKey] || [];

  const completedTodayUnique = new Set(todaysCompletions).size;

  els.currentStreakValue.textContent =
    currentStreak === 1 ? "1 day" : `${currentStreak} days`;
  els.longestStreakValue.textContent =
    longestStreak === 1 ? "1 day" : `${longestStreak} days`;
  els.completedTodayValue.textContent = `${completedTodayUnique}`;

  if (currentStreak === 0) {
    els.currentStreakNote.textContent =
      "Your next completed day will start a new streak.";
  } else if (currentStreak < longestStreak) {
    els.currentStreakNote.textContent =
      "You’re building momentum again. Keep the chain going.";
  } else if (currentStreak > 0) {
    els.currentStreakNote.textContent =
      "You’re currently at your best streak so far.";
  }

  if (completedTodayUnique === 0) {
    els.completedTodayNote.textContent =
      "Even one small check today keeps your streak alive.";
  } else {
    els.completedTodayNote.textContent =
      "You can always gently add more, but what you've done already counts.";
  }
  const allDates = Object.keys(completions);
  let totalCompletions = 0;
  allDates.forEach((d) => {
    totalCompletions += new Set(completions[d]).size;
  });

  if (!habits.length || !allDates.length) {
    els.completionRateValue.textContent = "0%";
    return;
  }
  const earliestStart = habits.reduce((min, h) => {
    return !min || h.startDate < min ? h.startDate : min;
  }, null);

  const daysTracked = diffDays(earliestStart, todayKey) + 1;
  const possibleCheckins = daysTracked * habits.length;

  const pct =
    possibleCheckins > 0
      ? Math.round((totalCompletions / possibleCheckins) * 100)
      : 0;

  els.completionRateValue.textContent = `${Math.min(100, Math.max(0, pct))}%`;
}

function wireEvents() {
  els.addHabitForm.addEventListener("submit", addHabitFromForm);

  els.rangeYearBtn.addEventListener("click", () => {
    currentRange = "year";
    els.rangeYearBtn.classList.add("chip-active");
    els.rangeMonthBtn.classList.remove("chip-active");
    renderHeatmap();
  });

  els.rangeMonthBtn.addEventListener("click", () => {
    currentRange = "month";
    els.rangeMonthBtn.classList.add("chip-active");
    els.rangeYearBtn.classList.remove("chip-active");
    renderHeatmap();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  updateHeader();
  loadState();
  wireEvents();
  els.habitStartDateInput.value = todayDateString();

  renderTodayList();
  renderHeatmap();
  renderStats();
});

