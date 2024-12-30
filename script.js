let timer;
let timeLeft;
let isWorking = true;
let currentSession = 1;
let totalStudyTimeToday = 0;
let lastResetDate = new Date().toDateString();

const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const workTimeInput = document.getElementById("workTime");
const breakTimeInput = document.getElementById("breakTime");
const sessionsInput = document.getElementById("sessions");
const totalStudyTimeDisplay = document.getElementById("totalStudyTime");

function startTimer() {
  const workTime = workTimeInput.value * 60;
  const breakTime = breakTimeInput.value * 60;
  const sessions = sessionsInput.value;

  if (!timer) {
    timeLeft = workTime;
    updateTimerDisplay();
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (isWorking) {
        updateTotalStudyTime();
      }
      if (timeLeft === 0) {
        if (isWorking) {
          if (currentSession < sessions) {
            isWorking = false;
            timeLeft = breakTime;
            alert("Waktu istirahat!");
          } else {
            clearInterval(timer);
            alert("Sesi Pomodoro selesai!");
            resetTimer();
          }
        } else {
          isWorking = true;
          timeLeft = workTime;
          currentSession++;
          alert("Waktu belajar!");
        }
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  isWorking = true;
  currentSession = 1;
  timeLeft = workTimeInput.value * 60;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function updateTotalStudyTime() {
  totalStudyTimeToday++;
  localStorage.setItem("totalStudyTime", totalStudyTimeToday);
  updateTotalStudyTimeDisplay();
}

function updateTotalStudyTimeDisplay() {
  const hours = Math.floor(totalStudyTimeToday / 3600);
  const minutes = Math.floor((totalStudyTimeToday % 3600) / 60);
  totalStudyTimeDisplay.textContent = `Hari ini kamu telah belajar selama: ${hours} jam ${minutes} menit`;
}

function loadTotalStudyTime() {
  const currentDate = new Date().toDateString();
  if (lastResetDate !== currentDate) {
    totalStudyTimeToday = 0;
    lastResetDate = currentDate;
    localStorage.setItem("lastResetDate", lastResetDate);
  } else {
    totalStudyTimeToday = parseInt(localStorage.getItem("totalStudyTime") || "0");
  }
  updateTotalStudyTimeDisplay();
}

function checkAndResetDaily() {
  const currentDate = new Date().toDateString();
  const storedDate = localStorage.getItem("lastResetDate");
  if (storedDate !== currentDate) {
    totalStudyTimeToday = 0;
    localStorage.setItem("totalStudyTime", "0");
    localStorage.setItem("lastResetDate", currentDate);
  }
}

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

// To-Do List with Local Storage
const todoList = document.getElementById("todoList");
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");

function addTodo(text) {
  const li = document.createElement("li");
  li.innerHTML = `
        <span>${text}</span>
        <div class="todo-actions">
            <button class="edit"><i class="fas fa-pencil-alt"></i></button>
            <button class="delete"><i class="fas fa-trash"></i></button>
        </div>
    `;
  todoList.appendChild(li);

  const deleteButton = li.querySelector(".delete");
  deleteButton.addEventListener("click", () => {
    todoList.removeChild(li);
    saveTodos();
  });

  const editButton = li.querySelector(".edit");
  editButton.addEventListener("click", () => {
    const span = li.querySelector("span");
    const newText = prompt("Edit tugas:", span.textContent);
    if (newText !== null && newText.trim() !== "") {
      span.textContent = newText;
      saveTodos();
    }
  });

  saveTodos();
}

function saveTodos() {
  const todos = Array.from(todoList.children).map((li) => li.querySelector("span").textContent);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.forEach((todo) => addTodo(todo));
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text !== "") {
    addTodo(text);
    todoInput.value = "";
  }
});

// Spotify Embedded Player
const spotifyEmbed = document.getElementById("spotifyEmbed");
const playlistUrlInput = document.getElementById("playlistUrl");
const updatePlaylistButton = document.getElementById("updatePlaylist");

function loadSpotifyPlaylist() {
  const playlistUrl = localStorage.getItem("spotifyPlaylistUrl") || "https://open.spotify.com/playlist/4Ohjpnpy1ojsGLYNe3glVJ";
  updateSpotifyEmbed(playlistUrl);
  playlistUrlInput.value = playlistUrl;
}

function updateSpotifyEmbed(url) {
  const playlistId = extractPlaylistId(url);
  spotifyEmbed.innerHTML = `
    <iframe src="https://open.spotify.com/embed/playlist/${playlistId}" 
            width="100%" 
            height="380" 
            frameborder="0" 
            allowtransparency="true" 
            allow="encrypted-media">
    </iframe>
`;
}

function extractPlaylistId(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : "";
}

updatePlaylistButton.addEventListener("click", () => {
  const newUrl = playlistUrlInput.value.trim();
  if (newUrl) {
    localStorage.setItem("spotifyPlaylistUrl", newUrl);
    updateSpotifyEmbed(newUrl);
  }
});

// Smooth scroll to Spotify section when clicking the Spotify icon
document.getElementById("spotify-link").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("spotify").scrollIntoView({
    behavior: "smooth",
  });
});

// Initialize and load data
window.addEventListener("load", () => {
  checkAndResetDaily();
  loadTotalStudyTime();
  loadTodos();
  loadSpotifyPlaylist();
});

// Check and reset at midnight
function scheduleMiddnightReset() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, 
    0,
    0,
    0 
  );
  const msToMidnight = night.getTime() - now.getTime();

  setTimeout(() => {
    checkAndResetDaily();
    loadTotalStudyTime();
    // Schedule the next reset
    scheduleMiddnightReset();
  }, msToMidnight);
}

scheduleMiddnightReset();
