// DOM Elements
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const themeToggle = document.getElementById('theme-toggle');
const filterDropdown = document.getElementById('filter-dropdown');
const lastExportDate = document.createElement('div'); // Element to display last export date
lastExportDate.id = 'last-export-date';
document.querySelector('.container').prepend(lastExportDate); // Add it to the top of the container

// Add Task Function
addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value || new Date().toISOString().split('T')[0]; // Use selected date or current date
  if (taskText !== '') {
    addTask(taskText, 'To Do', dueDate);
    taskInput.value = '';
    dueDateInput.value = ''; // Clear the date input
    saveTasks();
    filterTasks(); // Update the task list based on the current filter
  }
});

// Function to Add a New Task
function addTask(taskText, status = 'To Do', dueDate = '') {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="task-text">${taskText}</span>
    <span class="due-date">${dueDate}</span>
    <select class="status-dropdown">
      <option value="To Do">To Do</option>
      <option value="In Progress">In Progress</option>
      <option value="Done">Done</option>
      <option value="Accepted">Accepted</option>
      <option value="Rejected">Rejected</option>
      <option value="Pending Interview">Pending Interview</option>
      <option value="Employed">Employed</option>
    </select>
    <input type="text" class="edit-input" style="display: none;">
    <button class="delete-btn">🗑️</button>
  `;
  taskList.appendChild(li);

  // Set the initial status and due date
  const statusDropdown = li.querySelector('.status-dropdown');
  statusDropdown.value = status;
  li.querySelector('.due-date').innerText = dueDate;

  // Update status when changed
  statusDropdown.addEventListener('change', () => {
    saveTasks();
    filterTasks(); // Update the task list based on the current filter
  });

  // Delete Task
  const deleteBtn = li.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      li.classList.add('deleting');
      setTimeout(() => {
        taskList.removeChild(li);
        saveTasks();
        filterTasks(); // Update the task list based on the current filter
      }, 300);
    }
  });

  // Edit Task
  const taskTextElement = li.querySelector('.task-text');
  const editInput = li.querySelector('.edit-input');

  taskTextElement.addEventListener('dblclick', () => {
    taskTextElement.style.display = 'none';
    editInput.style.display = 'inline-block';
    editInput.value = taskTextElement.innerText;
    editInput.focus();
  });

  editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      taskTextElement.innerText = editInput.value;
      taskTextElement.style.display = 'inline-block';
      editInput.style.display = 'none';
      saveTasks();
    }
  });

  editInput.addEventListener('blur', () => {
    taskTextElement.innerText = editInput.value;
    taskTextElement.style.display = 'inline-block';
    editInput.style.display = 'none';
    saveTasks();
  });

  return li;
}

// Export as PDF
exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf; // Access jsPDF from the global scope
  const doc = new jsPDF();

  // Add the export date to the PDF
  const exportDate = new Date().toLocaleDateString();
  doc.setFontSize(18);
  doc.text(`Job Hunting To-Do List (Exported on: ${exportDate})`, 10, 10);

  // Loop through tasks and add them to the PDF
  let y = 20;
  taskList.querySelectorAll('li').forEach((li, index) => {
    const taskText = li.querySelector('.task-text').innerText;
    const dueDate = li.querySelector('.due-date').innerText;
    const status = li.querySelector('.status-dropdown').value;
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${taskText} (Due: ${dueDate}, Status: ${status})`, 10, y);
    y += 10;
  });

  // Save the PDF
  doc.save('job-hunting-todo-list.pdf');

  // Save the export date to localStorage and display it
  localStorage.setItem('lastExportDate', exportDate);
  lastExportDate.innerText = `Last Exported on: ${exportDate}`;
});

// Clear All Tasks
clearAllBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all tasks?')) {
    taskList.innerHTML = '';
    saveTasks();
  }
});

// Filter Tasks Function
function filterTasks() {
  const selectedStatus = filterDropdown.value; // Get the selected filter value
  const tasks = document.querySelectorAll('#task-list li');

  tasks.forEach(task => {
    const taskStatus = task.querySelector('.status-dropdown').value;
    if (selectedStatus === 'All' || taskStatus === selectedStatus) {
      task.style.display = 'flex'; // Show the task
    } else {
      task.style.display = 'none'; // Hide the task
    }
  });
}

// Add Event Listener to Filter Dropdown
filterDropdown.addEventListener('change', filterTasks);

// Auto-Clear Tasks Every Saturday
function autoClearTasks() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const lastClearDate = localStorage.getItem('lastClearDate');

  if (dayOfWeek === 6 && lastClearDate !== today.toLocaleDateString()) {
    // It's Saturday, and the list hasn't been cleared today
    taskList.innerHTML = '';
    saveTasks();
    localStorage.setItem('lastClearDate', today.toLocaleDateString());
  }
}

// Save Tasks to Local Storage
function saveTasks() {
  const tasks = [];
  taskList.querySelectorAll('li').forEach(li => {
    tasks.push({
      text: li.querySelector('.task-text').innerText,
      dueDate: li.querySelector('.due-date').innerText,
      status: li.querySelector('.status-dropdown').value,
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load Tasks from Local Storage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => {
    const li = addTask(task.text, task.status, task.dueDate);
  });

  // Load the last export date
  const lastExport = localStorage.getItem('lastExportDate');
  if (lastExport) {
    lastExportDate.innerText = `Last Exported on: ${lastExport}`;
  }
}

// Toggle Dark Mode
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.innerText = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Load tasks when the page loads
window.addEventListener('load', () => {
  loadTasks();
  autoClearTasks(); // Check if it's Saturday and clear tasks if needed
  filterTasks(); // Apply the current filter when the page loads
});