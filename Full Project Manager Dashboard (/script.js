
const Storage = (() => {
  const KEY = "pmDashboard_v1";

  const defaultState = () => ({
    projects: [],
    tasks: [],
    team: [
      { id: "u1", name: "Alex Morgan", role: "Product Manager" },
      { id: "u2", name: "Jordan Lee", role: "Tech Lead" },
      { id: "u3", name: "Taylor Kim", role: "QA Engineer" }
    ],
    preferences: {
      theme: "light",
      lastView: "dashboard",
      showActivity: true,
      showDeadlines: true,
      role: "manager"
    },
    dashboardState: {
      lastOpenedProjectId: null
    },
    activity: [],
    notifications: []
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch {
      console.warn("Corrupted local storage, resetting.");
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }

  function update(updater) {
    const state = load();
    const newState = updater(structuredClone(state));
    save(newState);
    return newState;
  }

  return { load, save, update };
})();
let appState = Storage.load();

const Utils = {
  id(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  },
  todayISO() {
    return new Date().toISOString().slice(0, 10);
  },
  diffInDays(a, b) {
    const da = new Date(a);
    const db = new Date(b);
    return Math.round((da - db) / (1000 * 60 * 60 * 24));
  },
  formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  },
  clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
  },
  exportCsv(filename, rows) {
    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            if (cell == null) return "";
            const s = String(cell).replace(/"/g, '""');
            if (/[",\n]/.test(s)) return `"${s}"`;
            return s;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  addActivity(type, message, meta = {}) {
    const entry = {
      id: Utils.id("act"),
      type,
      message,
      meta,
      timestamp: new Date().toISOString()
    };
    appState = Storage.update((s) => {
      s.activity.unshift(entry);
      s.activity = s.activity.slice(0, 80);
      s.notifications.unshift(entry);
      s.notifications = s.notifications.slice(0, 30);
      return s;
    });
    UI.renderActivity();
    UI.renderNotifications();
  }
};

const Projects = {
  getAll() {
    return appState.projects;
  },
  getById(id) {
    return appState.projects.find((p) => p.id === id) || null;
  },
  create(data) {
    const project = {
      id: Utils.id("prj"),
      name: data.name,
      manager: data.manager,
      startDate: data.startDate || Utils.todayISO(),
      deadline: data.deadline || "",
      status: data.status || "planning",
      progress: 0,
      priority: data.priority || "medium",
      archived: false
    };
    appState = Storage.update((s) => {
      s.projects.push(project);
      s.dashboardState.lastOpenedProjectId = project.id;
      return s;
    });
    Utils.addActivity("project_create", `Project created: ${project.name}`, { projectId: project.id });
    UI.refreshAll();
  },
  update(id, partial) {
    appState = Storage.update((s) => {
      const p = s.projects.find((x) => x.id === id);
      if (p) Object.assign(p, partial);
      return s;
    });
    UI.refreshAll();
  },
  remove(id) {
    const proj = Projects.getById(id);
    appState = Storage.update((s) => {
      s.projects = s.projects.filter((p) => p.id !== id);
      s.tasks = s.tasks.filter((t) => t.projectId !== id);
      if (s.dashboardState.lastOpenedProjectId === id) {
        s.dashboardState.lastOpenedProjectId = s.projects[0]?.id || null;
      }
      return s;
    });
    if (proj) {
      Utils.addActivity("project_delete", `Project deleted: ${proj.name}`, { projectId: proj.id });
    }
    UI.refreshAll();
  },
  recalcProgress(projectId) {
    const tasks = Tasks.getByProject(projectId);
    if (!tasks.length) {
      Projects.update(projectId, { progress: 0 });
      return;
    }
    const done = tasks.filter((t) => t.status === "completed").length;
    const progress = Math.round((done / tasks.length) * 100);
    Projects.update(projectId, { progress });
  }
};

const Tasks = {
  getAll() {
    return appState.tasks;
  },
  getByProject(projectId) {
    return appState.tasks.filter((t) => t.projectId === projectId);
  },
  create(data) {
    const task = {
      id: Utils.id("tsk"),
      projectId: data.projectId,
      title: data.title,
      description: data.description || "",
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate || "",
      priority: data.priority || "medium",
      status: data.status || "todo"
    };
    appState = Storage.update((s) => {
      s.tasks.push(task);
      return s;
    });
    Utils.addActivity("task_create", `Task added: ${task.title}`, {
      projectId: task.projectId,
      taskId: task.id
    });
    Projects.recalcProgress(task.projectId);
  },
  update(id, partial) {
    let projectId;
    appState = Storage.update((s) => {
      const t = s.tasks.find((x) => x.id === id);
      if (t) {
        projectId = t.projectId;
        Object.assign(t, partial);
      }
      return s;
    });
    if (projectId) {
      Projects.recalcProgress(projectId);
    }
  },
  remove(id) {
    let removed = null;
    appState = Storage.update((s) => {
      const idx = s.tasks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        removed = s.tasks[idx];
        s.tasks.splice(idx, 1);
      }
      return s;
    });
    if (removed) {
      Utils.addActivity("task_delete", `Task deleted: ${removed.title}`, {
        projectId: removed.projectId,
        taskId: removed.id
      });
      Projects.recalcProgress(removed.projectId);
    }
  }
};

const Team = {
  getAll() {
    return appState.team;
  },
  getById(id) {
    return appState.team.find((m) => m.id === id) || null;
  },
  create(data) {
    const member = {
      id: Utils.id("mem"),
      name: data.name,
      role: data.role || "Member"
    };
    appState = Storage.update((s) => {
      s.team.push(member);
      return s;
    });
    Utils.addActivity("member_create", `Team member added: ${member.name}`, {
      memberId: member.id
    });
    UI.refreshAll();
  }
};

const UI = (() => {
  const els = {};

  function cacheElements() {
    els.sidebar = document.querySelector(".sidebar");
    els.sidebarToggle = document.getElementById("sidebarToggle");
    els.navButtons = Array.from(document.querySelectorAll(".nav-item"));
    els.topTitle = document.querySelector(".topbar__title");
    els.globalSearch = document.getElementById("globalSearch");
    els.roleToggle = document.getElementById("roleToggle");
    els.roleLabel = document.getElementById("roleLabel");
    els.themeToggle = document.getElementById("themeToggle");
    els.settingsThemeToggle = document.getElementById("settingsThemeToggle");
    els.settingShowActivity = document.getElementById("setting-showActivity");
    els.settingShowDeadlines = document.getElementById("setting-showDeadlines");
    els.kpi = {
      totalProjects: document.querySelector('[data-kpi="totalProjects"]'),
      activeProjects: document.querySelector('[data-kpi="activeProjects"]'),
      completedProjects: document.querySelector('[data-kpi="completedProjects"]'),
      overdueTasks: document.querySelector('[data-kpi="overdueTasks"]'),
      teamUtilization: document.querySelector('[data-kpi="teamUtilization"]')
    };
    els.projectStatusFilter = document.getElementById("projectStatusFilter");
    els.projectPriorityFilter = document.getElementById("projectPriorityFilter");
    els.projectSort = document.getElementById("projectSort");
    els.addProjectBtn = document.getElementById("addProjectBtn");
    els.emptyAddProjectBtn = document.getElementById("emptyAddProjectBtn");
    els.projectsTableBody = document.querySelector("#projectsTable tbody");
    els.projectsEmptyState = document.getElementById("projectsEmptyState");
    els.taskProjectSelect = document.getElementById("taskProjectSelect");
    els.addTaskBtn = document.getElementById("addTaskBtn");
    els.kanbanLists = {
      todo: document.getElementById("kanban-todo"),
      in_progress: document.getElementById("kanban-in_progress"),
      review: document.getElementById("kanban-review"),
      completed: document.getElementById("kanban-completed")
    };
    els.teamDirectory = document.getElementById("teamDirectory");
    els.addMemberBtn = document.getElementById("addMemberBtn");
    els.deadlineList = document.getElementById("deadlineList");
    els.activityFeed = document.getElementById("activityFeed");
    els.chartProject = document.getElementById("projectProgressChart");
    els.chartTasks = document.getElementById("taskCompletionChart");
    els.chartTeam = document.getElementById("teamWorkloadChart");
    els.modalBackdrop = document.getElementById("modalBackdrop");
    els.modalContainer = document.getElementById("modalContainer");
    els.notifBtn = document.getElementById("notifBtn");
    els.notifPanel = document.getElementById("notifPanel");
    els.notifCloseBtn = document.getElementById("notifCloseBtn");
    els.notifList = document.getElementById("notifList");
    els.exportProjectsCsvBtn = document.getElementById("exportProjectsCsvBtn");
    els.exportTasksCsvBtn = document.getElementById("exportTasksCsvBtn");
  }
  function switchView(viewName) {
    const views = {
      dashboard: "view-dashboard",
      projects: "view-projects",
      tasks: "view-tasks",
      team: "view-team",
      reports: "view-reports",
      settings: "view-settings"
    };
    Object.values(views).forEach((id) =>
      document.getElementById(id).classList.remove("view--active")
    );
    const targetId = views[viewName] || "view-dashboard";
    document.getElementById(targetId).classList.add("view--active");

    els.navButtons.forEach((btn) =>
      btn.classList.toggle("nav-item--active", btn.dataset.view === viewName)
    );

    const titles = {
      dashboard: "Dashboard",
      projects: "Projects",
      tasks: "Tasks",
      team: "Team",
      reports: "Reports",
      settings: "Settings"
    };
    els.topTitle.textContent = titles[viewName] || "Dashboard";

    appState = Storage.update((s) => {
      s.preferences.lastView = viewName;
      return s;
    });
  }
  function applyTheme() {
    const theme = appState.preferences.theme || "light";
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }

  function toggleTheme() {
    appState = Storage.update((s) => {
      s.preferences.theme = s.preferences.theme === "dark" ? "light" : "dark";
      return s;
    });
    applyTheme();
  }

  function applyRole() {
    const role = appState.preferences.role || "manager";
    els.roleLabel.textContent = role === "manager" ? "Manager View" : "Member View";
    document.body.classList.toggle("role-member", role === "member");
  }

  function toggleRole() {
    appState = Storage.update((s) => {
      s.preferences.role = s.preferences.role === "manager" ? "member" : "manager";
      return s;
    });
    applyRole();
  }
  function renderKpis() {
    const projects = Projects.getAll();
    const tasks = Tasks.getAll();
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "in_progress").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;
    const today = Utils.todayISO();
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "completed"
    ).length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const teamSize = Team.getAll().length || 1;
    const utilization = Utils.clamp(Math.round((inProgress / (teamSize * 5)) * 100), 0, 120);

    els.kpi.totalProjects.textContent = totalProjects;
    els.kpi.activeProjects.textContent = activeProjects;
    els.kpi.completedProjects.textContent = completedProjects;
    els.kpi.overdueTasks.textContent = overdueTasks;
    els.kpi.teamUtilization.textContent = `${utilization}%`;
  }
  function renderProjectsTable() {
    const projects = Projects.getAll();
    if (!projects.length) {
      els.projectsEmptyState.style.display = "block";
      els.projectsTableBody.innerHTML = "";
      return;
    }
    els.projectsEmptyState.style.display = "none";

    const statusFilter = els.projectStatusFilter.value;
    const priorityFilter = els.projectPriorityFilter.value;
    const sort = els.projectSort.value;

    let rows = [...projects];
    if (statusFilter !== "all") {
      rows = rows.filter((p) => p.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      rows = rows.filter((p) => p.priority === priorityFilter);
    }

    rows.sort((a, b) => {
      if (sort.startsWith("deadline")) {
        const dir = sort.endsWith("asc") ? 1 : -1;
        return (a.deadline || "").localeCompare(b.deadline || "") * dir;
      }
      if (sort.startsWith("progress")) {
        const dir = sort.endsWith("asc") ? 1 : -1;
        return (a.progress - b.progress) * dir;
      }
      return 0;
    });

    els.projectsTableBody.innerHTML = "";
    rows.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.manager || "-"}</td>
        <td>${Utils.formatDate(p.startDate)}</td>
        <td>${Utils.formatDate(p.deadline)}</td>
        <td>
          <span class="badge badge--status-${p.status}">${renderStatusLabel(p.status)}</span>
        </td>
        <td>
          <div class="progress-pill">
            <div class="progress-pill__bar">
              <div class="progress-pill__bar-fill" style="width:${Utils.clamp(
                p.progress,
                0,
                100
              )}%"></div>
            </div>
            <span>${Utils.clamp(p.progress, 0, 100)}%</span>
          </div>
        </td>
        <td>
          <span class="badge badge--priority-${p.priority}">${renderPriorityLabel(
            p.priority
          )}</span>
        </td>
        <td>
          <button class="icon-btn icon-btn--small" data-action="edit">Edit</button>
          <button class="icon-btn icon-btn--small" data-action="delete">⋯</button>
        </td>
      `;
      tr.querySelector('[data-action="edit"]').addEventListener("click", () => openProjectModal(p));
      tr.querySelector('[data-action="delete"]').addEventListener("click", () => {
        if (confirm("Delete project and all its tasks?")) {
          Projects.remove(p.id);
        }
      });
      els.projectsTableBody.appendChild(tr);
    });
  }

  function renderStatusLabel(status) {
    return {
      planning: "Planning",
      in_progress: "In Progress",
      completed: "Completed",
      on_hold: "On Hold"
    }[status] || status;
  }

  function renderPriorityLabel(priority) {
    return {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical"
    }[priority] || priority;
  }
  let dragTaskId = null;

  function renderTaskProjectSelect() {
    const select = els.taskProjectSelect;
    const projects = Projects.getAll();
    select.innerHTML = "";
    projects.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
    const preferred =
      appState.dashboardState.lastOpenedProjectId || projects[0]?.id || null;
    if (preferred) {
      select.value = preferred;
      appState = Storage.update((s) => {
        s.dashboardState.lastOpenedProjectId = preferred;
        return s;
      });
    }
  }

  function renderKanban() {
    Object.values(els.kanbanLists).forEach((col) => (col.innerHTML = ""));
    const projectId = els.taskProjectSelect.value;
    if (!projectId) return;
    const tasks = Tasks.getByProject(projectId);
    tasks.forEach((t) => {
      const card = document.createElement("article");
      card.className = "kanban-card";
      card.draggable = true;
      card.dataset.taskId = t.id;
      const dueDays = t.dueDate ? Utils.diffInDays(t.dueDate, Utils.todayISO()) : null;
      const dueLabel =
        dueDays == null
          ? "-"
          : dueDays < 0
          ? `${Math.abs(dueDays)}d overdue`
          : dueDays === 0
          ? "Due today"
          : `Due in ${dueDays}d`;
      const dueClass =
        dueDays == null
          ? ""
          : dueDays < 0
          ? "chip--due-overdue"
          : dueDays <= 2
          ? "chip--due-soon"
          : "";
      const assignee = t.assigneeId ? Team.getById(t.assigneeId) : null;

      card.innerHTML = `
        <div class="kanban-card__title">${t.title}</div>
        <div class="kanban-card__meta">
          <span>${renderPriorityLabel(t.priority)}</span>
          <span>${Utils.formatDate(t.dueDate)}</span>
        </div>
        <div class="kanban-card__footer">
          <span class="chip chip--assignee">${assignee ? assignee.name : "Unassigned"}</span>
          <span class="chip ${dueClass}">${dueLabel}</span>
        </div>
      `;
      card.addEventListener("dragstart", () => {
        dragTaskId = t.id;
      });
      card.addEventListener("dragend", () => {
        dragTaskId = null;
      });
      card.addEventListener("dblclick", () => openTaskModal(t));

      els.kanbanLists[t.status]?.appendChild(card);
    });
  }

  function setupKanbanDnD() {
    Object.entries(els.kanbanLists).forEach(([status, el]) => {
      const column = el.parentElement;
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("kanban-drop-target");
      });
      column.addEventListener("dragleave", () => {
        column.classList.remove("kanban-drop-target");
      });
      column.addEventListener("drop", () => {
        column.classList.remove("kanban-drop-target");
        if (!dragTaskId) return;
        const task = appState.tasks.find((t) => t.id === dragTaskId);
        if (!task) return;
        const newStatus = status;
        if (task.status !== newStatus) {
          Tasks.update(task.id, { status: newStatus });
          Utils.addActivity("task_move", `Task moved to ${renderStatusLabel(newStatus)}`, {
            taskId: task.id,
            projectId: task.projectId
          });
          renderKanban();
        }
      });
    });
  }
  function renderTeamDirectory() {
    const members = Team.getAll();
    const tasks = Tasks.getAll();
    els.teamDirectory.innerHTML = "";
    members.forEach((m) => {
      const assigned = tasks.filter((t) => t.assigneeId === m.id);
      const active = assigned.filter((t) => t.status !== "completed");
      const completed = assigned.filter((t) => t.status === "completed");
      const load = active.length;
      const availabilityClass =
        load <= 2 ? "availability-dot--high" : load <= 5 ? "availability-dot--medium" : "availability-dot--low";
      const card = document.createElement("article");
      card.className = "member-card";
      card.innerHTML = `
        <div class="member-card__header">
          <div class="member-card__avatar">${m.name
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}</div>
          <div class="member-card__meta">
            <span>${m.name}</span>
            <span>${m.role}</span>
          </div>
        </div>
        <div class="member-card__stats">
          <span><strong>${assigned.length}</strong> tasks</span>
          <span><strong>${completed.length}</strong> done</span>
        </div>
        <div class="member-card__stats">
          <span><span class="availability-dot ${availabilityClass}"></span>Availability</span>
          <span>${load === 0 ? "Free" : load <= 2 ? "Light" : load <= 5 ? "Balanced" : "At capacity"}</span>
        </div>
      `;
      els.teamDirectory.appendChild(card);
    });
  }
  function renderDeadlines() {
    const tasks = Tasks.getAll();
    const today = Utils.todayISO();
    const interesting = tasks
      .filter((t) => t.dueDate && t.status !== "completed")
      .map((t) => ({
        task: t,
        diff: Utils.diffInDays(t.dueDate, today)
      }))
      .sort((a, b) => a.task.dueDate.localeCompare(b.task.dueDate))
      .slice(0, 20);

    els.deadlineList.innerHTML = "";
    interesting.forEach(({ task, diff }) => {
      const li = document.createElement("div");
      li.className = "deadline-item";
      const status =
        diff < 0 ? "Overdue" : diff === 0 ? "Due today" : diff <= 2 ? "Due soon" : "Upcoming";
      const statusClass =
        diff < 0
          ? "badge--deadline-overdue"
          : diff <= 2
          ? "badge--deadline-soon"
          : "";
      const project = Projects.getById(task.projectId);
      li.innerHTML = `
        <div>
          <div class="deadline-item__title">${task.title}</div>
          <div class="deadline-item__project">${project ? project.name : ""}</div>
        </div>
        <div class="deadline-item__meta">
          <span>${Utils.formatDate(task.dueDate)}</span>
          <span class="badge ${statusClass}">${status}</span>
        </div>
      `;
      els.deadlineList.appendChild(li);
    });
  }

  function renderActivity() {
    const show = appState.preferences.showActivity !== false;
    const panel = els.activityFeed?.closest(".panel");
    if (panel) panel.style.display = show ? "" : "none";
    els.activityFeed.innerHTML = "";
    appState.activity.slice(0, 40).forEach((a) => {
      const item = document.createElement("div");
      item.className = "activity-item";
      const ts = new Date(a.timestamp);
      item.innerHTML = `
        <div class="activity-item__text">${a.message}</div>
        <div class="activity-item__timestamp">${ts.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}</div>
      `;
      els.activityFeed.appendChild(item);
    });
  }
  function renderNotifications() {
    els.notifList.innerHTML = "";
    if (!appState.notifications.length) {
      const p = document.createElement("p");
      p.textContent = "No recent notifications.";
      p.style.fontSize = "12px";
      p.style.color = "var(--color-text-muted)";
      els.notifList.appendChild(p);
      return;
    }
    appState.notifications.forEach((n) => {
      const div = document.createElement("div");
      div.className = "notif-item";
      const ts = new Date(n.timestamp);
      div.innerHTML = `
        <span>${n.message}</span>
        <span class="notif-item__time">${ts.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}</span>
      `;
      els.notifList.appendChild(div);
    });
  }
  function drawBarChart(canvas, labels, values, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    if (!values.length) return;

    const padding = 24 * dpr;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const maxVal = Math.max(...values, 1);
    const barWidth = innerWidth / (values.length * 1.6);
    const gap = barWidth * 0.6;

    ctx.font = `${11 * dpr}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    values.forEach((v, i) => {
      const x = padding + i * (barWidth + gap) + barWidth / 2;
      const h = (v / maxVal) * innerHeight;
      const y = height - padding - h;

      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, "#1f4f82");
      grad.addColorStop(1, "#0f766e");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, y, barWidth, h, 4 * dpr);
      ctx.fill();

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
        "--color-text-muted"
      );
      ctx.fillText(labels[i].slice(0, 10), x, height - padding + 4 * dpr);
    });
  }

  function renderCharts() {
    const projects = Projects.getAll();
    drawBarChart(
      els.chartProject,
      projects.map((p) => p.name),
      projects.map((p) => Utils.clamp(p.progress, 0, 100))
    );

    const tasks = Tasks.getAll();
    const completed = tasks.filter((t) => t.status === "completed").length;
    const total = tasks.length || 1;
    drawBarChart(
      els.chartTasks,
      ["Completed", "Remaining"],
      [completed, total - completed]
    );

    const members = Team.getAll();
    drawBarChart(
      els.chartTeam,
      members.map((m) => m.name.split(" ")[0]),
      members.map((m) => Tasks.getAll().filter((t) => t.assigneeId === m.id).length)
    );
  }
  function openModal({ title, bodyHtml, onSubmit, submitLabel = "Save" }) {
    const formId = `modal_form_${Utils.id("f")}`;
    els.modalContainer.innerHTML = `
      <div class="modal__header">
        <h3>${title}</h3>
        <button class="icon-btn icon-btn--small" data-modal-close>✕</button>
      </div>
      <form id="${formId}" class="modal__body form-grid">
        ${bodyHtml}
        <div class="error-text" data-error></div>
      </form>
      <div class="modal__footer">
        <button class="secondary-btn" data-modal-close type="button">Cancel</button>
        <button class="primary-btn" data-modal-submit type="submit" form="${formId}">${submitLabel}</button>
      </div>
    `;
    els.modalBackdrop.hidden = false;

    const form = els.modalContainer.querySelector("form");
    const errorEl = els.modalContainer.querySelector("[data-error]");

    function close() {
      els.modalBackdrop.hidden = true;
    }

    els.modalContainer
      .querySelectorAll("[data-modal-close]")
      .forEach((btn) => btn.addEventListener("click", close));

    els.modalBackdrop.onclick = (e) => {
      if (e.target === els.modalBackdrop) close();
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errorEl.textContent = "";
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      const maybeError = onSubmit?.(data);
      if (maybeError) {
        errorEl.textContent = maybeError;
      } else {
        close();
      }
    });
  }

  function openProjectModal(existing) {
    const isEdit = Boolean(existing);
    const bodyHtml = `
      <label>
        Name
        <input name="name" required value="${existing?.name || ""}" />
      </label>
      <label>
        Project manager
        <input name="manager" value="${existing?.manager || ""}" />
      </label>
      <div class="form-row-2">
        <label>
          Start date
          <input type="date" name="startDate" value="${existing?.startDate || Utils.todayISO()}" />
        </label>
        <label>
          Deadline
          <input type="date" name="deadline" value="${existing?.deadline || ""}" />
        </label>
      </div>
      <div class="form-row-2">
        <label>
          Status
          <select name="status">
            <option value="planning" ${existing?.status === "planning" ? "selected" : ""}>Planning</option>
            <option value="in_progress" ${existing?.status === "in_progress" ? "selected" : ""}>In Progress</option>
            <option value="completed" ${existing?.status === "completed" ? "selected" : ""}>Completed</option>
            <option value="on_hold" ${existing?.status === "on_hold" ? "selected" : ""}>On Hold</option>
          </select>
        </label>
        <label>
          Priority
          <select name="priority">
            <option value="low" ${existing?.priority === "low" ? "selected" : ""}>Low</option>
            <option value="medium" ${!existing || existing?.priority === "medium" ? "selected" : ""}>Medium</option>
            <option value="high" ${existing?.priority === "high" ? "selected" : ""}>High</option>
            <option value="critical" ${existing?.priority === "critical" ? "selected" : ""}>Critical</option>
          </select>
        </label>
      </div>
    `;
    openModal({
      title: isEdit ? "Edit Project" : "New Project",
      bodyHtml,
      submitLabel: isEdit ? "Save" : "Create",
      onSubmit(data) {
        if (!data.name?.trim()) return "Project name is required.";
        const payload = {
          name: data.name.trim(),
          manager: data.manager.trim(),
          startDate: data.startDate || Utils.todayISO(),
          deadline: data.deadline || "",
          status: data.status,
          priority: data.priority
        };
        if (isEdit) {
          Projects.update(existing.id, payload);
          Utils.addActivity("project_update", `Project updated: ${payload.name}`, {
            projectId: existing.id
          });
        } else {
          Projects.create(payload);
        }
        renderProjectsTable();
        renderKpis();
        renderTaskProjectSelect();
        renderCharts();
      }
    });
  }

  function openTaskModal(existing) {
    const isEdit = Boolean(existing);
    const members = Team.getAll();
    const projects = Projects.getAll();
    const bodyHtml = `
      <label>
        Project
        <select name="projectId" required>
          ${projects
            .map(
              (p) =>
                `<option value="${p.id}" ${
                  (existing?.projectId || els.taskProjectSelect.value) === p.id ? "selected" : ""
                }>${p.name}</option>`
            )
            .join("")}
        </select>
      </label>
      <label>
        Title
        <input name="title" required value="${existing?.title || ""}" />
      </label>
      <label>
        Description
        <textarea name="description">${existing?.description || ""}</textarea>
      </label>
      <div class="form-row-2">
        <label>
          Assignee
          <select name="assigneeId">
            <option value="">Unassigned</option>
            ${members
              .map(
                (m) =>
                  `<option value="${m.id}" ${
                    existing?.assigneeId === m.id ? "selected" : ""
                  }>${m.name}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>
          Priority
          <select name="priority">
            <option value="low" ${existing?.priority === "low" ? "selected" : ""}>Low</option>
            <option value="medium" ${!existing || existing?.priority === "medium" ? "selected" : ""}>Medium</option>
            <option value="high" ${existing?.priority === "high" ? "selected" : ""}>High</option>
            <option value="critical" ${existing?.priority === "critical" ? "selected" : ""}>Critical</option>
          </select>
        </label>
      </div>
      <div class="form-row-2">
        <label>
          Due date
          <input type="date" name="dueDate" value="${existing?.dueDate || ""}" />
        </label>
        <label>
          Status
          <select name="status">
            <option value="todo" ${existing?.status === "todo" ? "selected" : ""}>To Do</option>
            <option value="in_progress" ${existing?.status === "in_progress" ? "selected" : ""}>In Progress</option>
            <option value="review" ${existing?.status === "review" ? "selected" : ""}>Review</option>
            <option value="completed" ${existing?.status === "completed" ? "selected" : ""}>Completed</option>
          </select>
        </label>
      </div>
    `;
    openModal({
      title: isEdit ? "Edit Task" : "New Task",
      bodyHtml,
      submitLabel: isEdit ? "Save" : "Create",
      onSubmit(data) {
        if (!data.title?.trim()) return "Task title is required.";
        const payload = {
          projectId: data.projectId,
          title: data.title.trim(),
          description: data.description.trim(),
          assigneeId: data.assigneeId || null,
          dueDate: data.dueDate || "",
          priority: data.priority,
          status: data.status
        };
        if (isEdit) {
          Tasks.update(existing.id, payload);
          Utils.addActivity("task_update", `Task updated: ${payload.title}`, {
            taskId: existing.id,
            projectId: payload.projectId
          });
        } else {
          Tasks.create(payload);
        }
        renderKanban();
        renderKpis();
        renderDeadlines();
        renderTeamDirectory();
        renderCharts();
      }
    });
  }

  function openMemberModal() {
    const bodyHtml = `
      <label>
        Name
        <input name="name" required />
      </label>
      <label>
        Role
        <input name="role" value="Member" />
      </label>
    `;
    openModal({
      title: "Add Team Member",
      bodyHtml,
      onSubmit(data) {
        if (!data.name?.trim()) return "Name is required.";
        Team.create({
          name: data.name.trim(),
          role: data.role.trim() || "Member"
        });
        renderTeamDirectory();
        renderCharts();
      }
    });
  }
  function handleGlobalSearch(value) {
    const q = value.trim().toLowerCase();
    if (!q) return;
    const projects = Projects.getAll();
    const tasks = Tasks.getAll();
    const members = Team.getAll();

    const foundProject = projects.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.manager && p.manager.toLowerCase().includes(q))
    );
    if (foundProject) {
      switchView("projects");
      return;
    }
    const foundTask = tasks.find(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
    if (foundTask) {
      els.taskProjectSelect.value = foundTask.projectId;
      switchView("tasks");
      renderKanban();
      return;
    }
    const foundMember = members.find(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.role && m.role.toLowerCase().includes(q))
    );
    if (foundMember) {
      switchView("team");
    }
  }
  function exportProjectsCsv() {
    const rows = [
      [
        "ID",
        "Name",
        "Manager",
        "Start Date",
        "Deadline",
        "Status",
        "Progress %",
        "Priority"
      ]
    ];
    Projects.getAll().forEach((p) => {
      rows.push([
        p.id,
        p.name,
        p.manager,
        p.startDate,
        p.deadline,
        p.status,
        p.progress,
        p.priority
      ]);
    });
    Utils.exportCsv("projects.csv", rows);
  }

  function exportTasksCsv() {
    const rows = [
      [
        "ID",
        "Project ID",
        "Project Name",
        "Title",
        "Description",
        "Assignee ID",
        "Assignee Name",
        "Due Date",
        "Priority",
        "Status"
      ]
    ];
    const projects = Projects.getAll();
    const members = Team.getAll();
    Tasks.getAll().forEach((t) => {
      const p = projects.find((x) => x.id === t.projectId);
      const m = t.assigneeId ? members.find((x) => x.id === t.assigneeId) : null;
      rows.push([
        t.id,
        t.projectId,
        p?.name || "",
        t.title,
        t.description,
        t.assigneeId || "",
        m?.name || "",
        t.dueDate,
        t.priority,
        t.status
      ]);
    });
    Utils.exportCsv("tasks.csv", rows);
  }
  function applySettingsFromState() {
    els.settingShowActivity.checked = appState.preferences.showActivity !== false;
    els.settingShowDeadlines.checked = appState.preferences.showDeadlines !== false;
    const deadlinesPanel = els.deadlineList?.closest(".panel");
    if (deadlinesPanel) {
      deadlinesPanel.style.display = els.settingShowDeadlines.checked ? "" : "none";
    }
  }
  function refreshAll() {
    cacheElements();
    renderKpis();
    renderProjectsTable();
    renderTaskProjectSelect();
    renderKanban();
    renderTeamDirectory();
    renderDeadlines();
    renderActivity();
    renderNotifications();
    renderCharts();
    applySettingsFromState();
  }

  function bindEvents() {
    els.sidebarToggle.addEventListener("click", () => {
      els.sidebar.classList.toggle("sidebar--collapsed");
    });
    els.navButtons.forEach((btn) =>
      btn.addEventListener("click", () => switchView(btn.dataset.view))
    );
    els.themeToggle.addEventListener("click", toggleTheme);
    els.settingsThemeToggle.addEventListener("click", toggleTheme);
    els.roleToggle.addEventListener("click", toggleRole);
    els.globalSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleGlobalSearch(e.target.value);
      }
    });
    [els.projectStatusFilter, els.projectPriorityFilter, els.projectSort].forEach((el) =>
      el.addEventListener("change", renderProjectsTable)
    );
    els.addProjectBtn.addEventListener("click", () => openProjectModal());
    els.emptyAddProjectBtn.addEventListener("click", () => openProjectModal());
    els.taskProjectSelect.addEventListener("change", () => {
      appState = Storage.update((s) => {
        s.dashboardState.lastOpenedProjectId = els.taskProjectSelect.value || null;
        return s;
      });
      renderKanban();
    });
    els.addTaskBtn.addEventListener("click", () => openTaskModal());
    setupKanbanDnD();
    els.addMemberBtn.addEventListener("click", openMemberModal);
    els.notifBtn.addEventListener("click", () => {
      els.notifPanel.hidden = !els.notifPanel.hidden;
    });
    els.notifCloseBtn.addEventListener("click", () => {
      els.notifPanel.hidden = true;
    });
    document.addEventListener("click", (e) => {
      if (
        !els.notifPanel.hidden &&
        !els.notifPanel.contains(e.target) &&
        !els.notifBtn.contains(e.target)
      ) {
        els.notifPanel.hidden = true;
      }
    });
    els.exportProjectsCsvBtn.addEventListener("click", exportProjectsCsv);
    els.exportTasksCsvBtn.addEventListener("click", exportTasksCsv);
    els.settingShowActivity.addEventListener("change", () => {
      appState = Storage.update((s) => {
        s.preferences.showActivity = els.settingShowActivity.checked;
        return s;
      });
      renderActivity();
    });
    els.settingShowDeadlines.addEventListener("change", () => {
      appState = Storage.update((s) => {
        s.preferences.showDeadlines = els.settingShowDeadlines.checked;
        return s;
      });
      applySettingsFromState();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== els.globalSearch) {
        e.preventDefault();
        els.globalSearch.focus();
        return;
      }
      const mapping = {
        "1": "dashboard",
        "2": "projects",
        "3": "tasks",
        "4": "team",
        "5": "reports",
        "6": "settings"
      };
      if (mapping[e.key]) {
        switchView(mapping[e.key]);
        return;
      }
      if (e.key.toLowerCase() === "n" && document.activeElement.tagName !== "INPUT") {
        if (document.getElementById("view-projects").classList.contains("view--active")) {
          openProjectModal();
        }
      }
      if (e.key.toLowerCase() === "t" && document.activeElement.tagName !== "INPUT") {
        if (document.getElementById("view-tasks").classList.contains("view--active")) {
          openTaskModal();
        }
      }
    });

    window.addEventListener("resize", () => {
      renderCharts();
    });
  }

  return {
    cacheElements,
    refreshAll,
    bindEvents,
    renderActivity,
    renderNotifications
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  UI.cacheElements();
  (function initialPreferences() {
    const prefs = appState.preferences || {};
    document.documentElement.setAttribute(
      "data-theme",
      prefs.theme === "dark" ? "dark" : "light"
    );
    const roleLabel = document.getElementById("roleLabel");
    if (roleLabel) {
      roleLabel.textContent = prefs.role === "member" ? "Member View" : "Manager View";
    }
  })();

  UI.refreshAll();
  UI.bindEvents();
  const lastView = appState.preferences.lastView || "dashboard";
  const btn = document.querySelector(`.nav-item[data-view="${lastView}"]`);
  if (btn) btn.click();
});

