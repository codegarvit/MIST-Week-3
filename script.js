// Study Planner - Javascript

let tasks = [];
let selectedDate = null;
let currentFilter = 'all';

// Initialize app
window.addEventListener('load', initializeApp);

function initializeApp() {
    updateDateDisplay();
    setDefaultDate();
    renderCalendar();
}

// Update today's date display
function updateDateDisplay() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', options);
}

// Set today as default date
function setDefaultDate() {
    const today = new Date();
    const todayString = formatDateForInput(today);
    document.getElementById('dateInput').value = todayString;
}

// Helper: Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper: Format date for display
function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper: Format time to 12-hour format
function formatTimeDisplay(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Add task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const subjectSelect = document.getElementById('subjectSelect');
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');

    // Validation
    if (!taskInput.value.trim()) {
        alert('Please enter a task name!');
        return;
    }

    if (!subjectSelect.value) {
        alert('Please select a subject!');
        return;
    }

    if (!dateInput.value) {
        alert('Please select a date!');
        return;
    }

    // Create task object
    const task = {
        id: Date.now(),
        name: taskInput.value.trim(),
        subject: subjectSelect.value,
        date: dateInput.value,
        time: timeInput.value,
        completed: false
    };

    // Add to tasks array
    tasks.push(task);

    // Clear form
    taskInput.value = '';
    subjectSelect.value = '';
    timeInput.value = '';
    setDefaultDate();

    // Update UI
    renderTasks();
    renderCalendar();
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;

    if (filter === 'selected' && !selectedDate) {
        alert('Please click on a date in the calendar!');
        return;
    }

    renderTasks();
}

// Get filtered tasks
function getFilteredTasks() {
    let filtered = [];

    if (currentFilter === 'all') {
        filtered = tasks;
    } else if (currentFilter === 'today') {
        const today = new Date();
        const todayString = formatDateForInput(today);
        filtered = tasks.filter(task => task.date === todayString);
    } else if (currentFilter === 'selected' && selectedDate) {
        filtered = tasks.filter(task => task.date === selectedDate);
    }

    // Sort by date, then by time
    return filtered.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.time || '').localeCompare(b.time || '');
    });
}

// Render tasks
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const tasksList2 = document.getElementById('tasksList2');
    const taskFilterInfo = document.getElementById('taskFilterInfo');
    const taskFilterInfo2 = document.getElementById('taskFilterInfo2');

    const filteredTasks = getFilteredTasks();

    // Update filter info
    let filterText = 'Showing: All Tasks';
    if (currentFilter === 'today') {
        filterText = 'Showing: Today\'s Tasks';
    } else if (currentFilter === 'selected' && selectedDate) {
        filterText = `Showing: Tasks for ${formatDateDisplay(selectedDate)}`;
    }

    taskFilterInfo.textContent = filterText;
    if (taskFilterInfo2) taskFilterInfo2.textContent = filterText;

    // Empty state
    if (filteredTasks.length === 0) {
        const emptyHTML = '<p class="text-gray-500 text-center py-8">No tasks for this filter!</p>';
        tasksList.innerHTML = emptyHTML;
        if (tasksList2) tasksList2.innerHTML = emptyHTML;
        return;
    }

    // Generate task HTML
    const taskHTML = filteredTasks.map(task => createTaskElement(task)).join('');
    
    tasksList.innerHTML = taskHTML;
    if (tasksList2) tasksList2.innerHTML = taskHTML;
}

// Create task element HTML
function createTaskElement(task) {
    const timeHTML = task.time ? `<div class="text-xs font-bold text-gray-600 mt-2">⏰ ${formatTimeDisplay(task.time)}</div>` : '';
    const completedClass = task.completed ? 'opacity-50' : '';

    return `
        <div class="task-card ${task.subject} p-3 rounded-lg fade-in ${completedClass}">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="font-bold text-sm text-gray-800 ${task.completed ? 'line-through' : ''}">
                        ${escapeHtml(task.name)}
                    </h3>
                    <p class="text-xs text-gray-700 mt-1">
                        ${task.subject.toUpperCase()} · ${formatDateDisplay(task.date)}
                    </p>
                    ${timeHTML}
                </div>
                <div class="flex items-center gap-1 ml-2">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                        onchange="toggleTask(${task.id})" 
                        class="w-4 h-4 cursor-pointer">
                    <button onclick="deleteTask(${task.id})" 
                        class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-all">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle task completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
        renderCalendar();
    }
}

// Render calendar
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Update month/year display
    monthYear.textContent = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = '';

    // Empty cells before month
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateString = formatDateForInput(currentDate);
        const isToday = currentDate.toDateString() === today.toDateString();
        const isSelected = dateString === selectedDate;

        // Get subjects for this date
        const dayTasks = tasks.filter(task => task.date === dateString);
        const uniqueSubjects = [...new Set(dayTasks.map(task => task.subject))];

        // Create colored dots
        const dotsHTML = uniqueSubjects.map(subject => 
            `<div class="w-1.5 h-1.5 rounded-full dot-${subject}"></div>`
        ).join('');

        const dotsContainer = dotsHTML ? `<div class="flex gap-1 mt-1 flex-wrap justify-center">${dotsHTML}</div>` : '';

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                onclick="selectDate('${dateString}')">
                <div class="font-semibold text-sm">${day}</div>
                ${dotsContainer}
            </div>
        `;
    }

    calendar.innerHTML = calendarHTML;
}

// Select date from calendar
function selectDate(dateString) {
    selectedDate = dateString;
    currentFilter = 'selected';
    renderCalendar();
    renderTasks();
    document.getElementById('selectedDateBtn').textContent = formatDateDisplay(dateString);
}

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}