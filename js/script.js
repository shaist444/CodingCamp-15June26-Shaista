/* ================================================================
   LIFE DASHBOARD — script.js
   Sections:
     0. Theme Toggle (light / dark)
     1. Greeting (time & date)
     2. Focus Timer
     3. To-Do List
     4. Quick Links
================================================================ */


/* ── 0. THEME TOGGLE ─────────────────────────────────────────── */

const THEME_KEY = "dashboard_theme";

const themeToggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggleBtn.textContent = "☀️ Light";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggleBtn.textContent = "🌙 Dark";
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
}

themeToggleBtn.addEventListener("click", () => {
  // Read current state from the DOM, then flip it
  const isLight = document.documentElement.hasAttribute("data-theme");
  const newTheme = isLight ? "dark" : "light";
  localStorage.setItem(THEME_KEY, newTheme);
  applyTheme(newTheme);
});

initTheme();


/* ── 1. GREETING ─────────────────────────────────────────────── */

const NAME_KEY = "dashboard_name";

const nameInput   = document.getElementById("name-input");
const nameSaveBtn = document.getElementById("name-save");
const nameEditBtn = document.getElementById("name-edit");

function getGreetingPhrase(hours) {
  if (hours < 12)       return "Good Morning";
  else if (hours < 17)  return "Good Afternoon";
  else if (hours < 21)  return "Good Evening";
  else                  return "Good Night";
}

function getGreetingEmoji(hours) {
  if (hours < 12)       return "☀️";
  else if (hours < 17)  return "🌤️";
  else if (hours < 21)  return "🌇";
  else                  return "🌙";
}

function updateGreeting() {
  const now   = new Date();
  const hours = now.getHours();
  const name  = localStorage.getItem(NAME_KEY) || "";

  // Build greeting with optional name
  const phrase = getGreetingPhrase(hours);
  const emoji  = getGreetingEmoji(hours);
  const greeting = name
    ? `${phrase}, ${name}! ${emoji}`
    : `${phrase}! ${emoji}`;

  // Format time as HH:MM:SS
  const hh = String(hours).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hh}:${mm}:${ss}`;

  // Format date as "Friday, June 19, 2026"
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  document.getElementById("greeting-text").textContent = greeting;
  document.getElementById("current-time").textContent = timeStr;
  document.getElementById("current-date").textContent = dateStr;
}

function showNameInput() {
  nameInput.style.display  = "";
  nameSaveBtn.style.display = "";
  nameEditBtn.style.display = "none";
  nameInput.focus();
}

function showNameEdit() {
  nameInput.style.display   = "none";
  nameSaveBtn.style.display = "none";
  nameEditBtn.style.display = "";
}

function saveName() {
  const name = nameInput.value.trim();
  if (!name) return; // don't save empty string
  localStorage.setItem(NAME_KEY, name);
  updateGreeting();
  showNameEdit();
}

// Save on button click or Enter key
nameSaveBtn.addEventListener("click", saveName);
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveName();
});

// Edit button brings back the input
nameEditBtn.addEventListener("click", () => {
  const saved = localStorage.getItem(NAME_KEY) || "";
  nameInput.value = saved;
  showNameInput();
});

// On load: if name already saved, show edit button; otherwise show input
function initName() {
  const saved = localStorage.getItem(NAME_KEY);
  if (saved) {
    nameInput.value = saved;
    showNameEdit();
  } else {
    showNameInput();
  }
}

initName();

// Run immediately then update every second
updateGreeting();
setInterval(updateGreeting, 1000);


/* ── 2. FOCUS TIMER ──────────────────────────────────────────── */

const TIMER_MINUTES = 25;
const TIMER_SECONDS_TOTAL = TIMER_MINUTES * 60;

let timerRemaining = TIMER_SECONDS_TOTAL; // seconds left
let timerInterval = null;                 // holds setInterval id
let timerRunning = false;

const timerDisplay = document.getElementById("timer-display");
const btnStart    = document.getElementById("timer-start");
const btnStop     = document.getElementById("timer-stop");
const btnReset    = document.getElementById("timer-reset");

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerRemaining);
}

function startTimer() {
  if (timerRunning) return; // already running
  timerRunning = true;
  timerDisplay.classList.add("running");
  timerDisplay.classList.remove("finished");
  btnStart.disabled = true;
  btnStop.disabled = false;

  timerInterval = setInterval(() => {
    timerRemaining--;
    renderTimer();

    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.classList.remove("running");
      timerDisplay.classList.add("finished");
      timerDisplay.textContent = "Done! 🎉";
      btnStart.disabled = false;
      btnStop.disabled = true;
    }
  }, 1000);
}

function stopTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  timerDisplay.classList.remove("running");
  btnStart.disabled = false;
  btnStop.disabled = true;
}

function resetTimer() {
  stopTimer();
  timerRemaining = TIMER_SECONDS_TOTAL;
  timerDisplay.classList.remove("finished");
  btnStop.disabled = true;
  renderTimer();
}

btnStart.addEventListener("click", startTimer);
btnStop.addEventListener("click", stopTimer);
btnReset.addEventListener("click", resetTimer);

// Initial state
btnStop.disabled = true;
renderTimer();


/* ── 3. TO-DO LIST ───────────────────────────────────────────── */

const TODO_KEY = "dashboard_todos";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function renderTodos() {
  const todos = loadTodos();
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  if (todos.length === 0) {
    list.innerHTML = '<li class="empty-msg">No tasks yet — add one above!</li>';
    return;
  }

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");

    li.innerHTML = `
      <input type="checkbox" ${todo.done ? "checked" : ""} aria-label="Mark task done" />
      <span class="task-text">${escapeHtml(todo.text)}</span>
      <div class="task-actions">
        <button class="btn btn-edit" aria-label="Edit task">✏️</button>
        <button class="btn btn-danger" aria-label="Delete task">🗑</button>
      </div>
    `;

    // Checkbox: toggle done state
    li.querySelector("input[type=checkbox]").addEventListener("change", () => {
      const todos = loadTodos();
      todos[index].done = !todos[index].done;
      saveTodos(todos);
      renderTodos();
    });

    // Edit button: inline editing
    li.querySelector(".btn-edit").addEventListener("click", () => {
      const textSpan = li.querySelector(".task-text");
      const currentText = textSpan.textContent;

      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "edit-input";
      editInput.value = currentText;
      editInput.maxLength = 120;

      li.replaceChild(editInput, textSpan);
      editInput.focus();

      function saveEdit() {
        const newText = editInput.value.trim();
        if (newText) {
          const todos = loadTodos();
          todos[index].text = newText;
          saveTodos(todos);
        }
        renderTodos();
      }

      editInput.addEventListener("blur", saveEdit);
      editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") renderTodos(); // cancel
      });
    });

    // Delete button
    li.querySelector(".btn-danger").addEventListener("click", () => {
      const todos = loadTodos();
      todos.splice(index, 1);
      saveTodos(todos);
      renderTodos();
    });

    list.appendChild(li);
  });
}

function addTodo() {
  const input      = document.getElementById("todo-input");
  const warningEl  = document.getElementById("todo-warning");
  const text       = input.value.trim();

  if (!text) return;

  const todos = loadTodos();

  // Check for duplicate (case-insensitive)
  const isDuplicate = todos.some(
    (t) => t.text.toLowerCase() === text.toLowerCase()
  );

  if (isDuplicate) {
    warningEl.textContent = `⚠️ "${text}" is already in your list.`;
    input.focus();
    // Auto-clear the warning after 3 seconds
    setTimeout(() => { warningEl.textContent = ""; }, 3000);
    return;
  }

  // Clear any previous warning and add the task
  warningEl.textContent = "";
  todos.push({ text, done: false });
  saveTodos(todos);
  input.value = "";
  renderTodos();
}

document.getElementById("todo-add").addEventListener("click", addTodo);
document.getElementById("todo-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

renderTodos();


/* ── 4. QUICK LINKS ──────────────────────────────────────────── */

const LINKS_KEY = "dashboard_links";

function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(LINKS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

function renderLinks() {
  const links = loadLinks();
  const container = document.getElementById("links-container");
  container.innerHTML = "";

  if (links.length === 0) {
    container.innerHTML = '<span class="empty-msg">No links yet — add one above!</span>';
    return;
  }

  links.forEach((link, index) => {
    const chip = document.createElement("div");
    chip.className = "link-chip";
    chip.innerHTML = `
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
        🔗 ${escapeHtml(link.name)}
      </a>
      <button class="remove-link" aria-label="Remove link">✕</button>
    `;

    chip.querySelector(".remove-link").addEventListener("click", () => {
      const links = loadLinks();
      links.splice(index, 1);
      saveLinks(links);
      renderLinks();
    });

    container.appendChild(chip);
  });
}

function addLink() {
  const nameInput = document.getElementById("link-name-input");
  const urlInput  = document.getElementById("link-url-input");

  const name = nameInput.value.trim();
  let url     = urlInput.value.trim();

  if (!name || !url) return;

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const links = loadLinks();
  links.push({ name, url });
  saveLinks(links);

  nameInput.value = "";
  urlInput.value = "";
  renderLinks();
}

document.getElementById("link-add").addEventListener("click", addLink);
document.getElementById("link-url-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addLink();
});

renderLinks();


/* ── UTILITY ─────────────────────────────────────────────────── */

// Prevent XSS when inserting user text into innerHTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
