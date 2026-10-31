/**
 * TaskFlow - Full-Stack To-Do List Application
 * Frontend JavaScript interacting with Spring Boot REST API
 */

(function () {
    'use strict';

    // API Configuration
    // If the frontend is served by Spring Boot, window.location.origin is http://localhost:8080
    // If served via live server (e.g., port 5500), fallback to http://localhost:8080
    const API_BASE_URL = (window.location.port === '8080' || window.location.hostname === '')
        ? '/api/tasks'
        : 'http://localhost:8080/api/tasks';

    // Application State
    const state = {
        tasks: [],
        filter: 'all',          // 'all', 'pending', 'completed'
        priorityFilter: 'ALL',  // 'ALL', 'HIGH', 'MEDIUM', 'LOW'
        searchQuery: '',
        sortBy: 'createdAt_desc',
        taskToDelete: null,
        isEditing: false
    };

    // DOM Elements - initialized after DOM is ready
    const elements = {};

    function initElements() {
        elements.backendStatus = document.getElementById('backendStatus');
        elements.connectionBanner = document.getElementById('connectionBanner');
        elements.connectionErrorText = document.getElementById('connectionErrorText');
        elements.retryConnectionBtn = document.getElementById('retryConnectionBtn');

        // Stats
        elements.statTotal = document.getElementById('statTotal');
        elements.statCompleted = document.getElementById('statCompleted');
        elements.statPending = document.getElementById('statPending');
        elements.statProgress = document.getElementById('statProgress');

        // Search & Filters
        elements.searchInput = document.getElementById('searchInput');
        elements.clearSearchBtn = document.getElementById('clearSearchBtn');
        elements.pillButtons = document.querySelectorAll('.pill-btn');
        elements.priorityFilter = document.getElementById('priorityFilter');
        elements.sortBy = document.getElementById('sortBy');
        elements.taskCountBadge = document.getElementById('taskCountBadge');

        // Task List & States
        elements.taskList = document.getElementById('taskList');
        elements.loadingIndicator = document.getElementById('loadingIndicator');
        elements.emptyState = document.getElementById('emptyState');
        elements.emptyAddBtn = document.getElementById('emptyAddBtn');

        // Task Modal & Form
        elements.openAddModalBtn = document.getElementById('openAddModalBtn');
        elements.taskModal = document.getElementById('taskModal');
        elements.closeModalBtn = document.getElementById('closeModalBtn');
        elements.cancelModalBtn = document.getElementById('cancelModalBtn');
        elements.taskForm = document.getElementById('taskForm');
        elements.modalTitle = document.getElementById('modalTitle');
        elements.saveTaskBtn = document.getElementById('saveTaskBtn');
        elements.saveBtnText = document.getElementById('saveBtnText');
        elements.taskId = document.getElementById('taskId');
        elements.taskTitle = document.getElementById('taskTitle');
        elements.titleError = document.getElementById('titleError');
        elements.taskDescription = document.getElementById('taskDescription');
        elements.taskDueDate = document.getElementById('taskDueDate');
        elements.completedToggleGroup = document.getElementById('completedToggleGroup');
        elements.taskCompleted = document.getElementById('taskCompleted');

        // Delete Modal
        elements.deleteModal = document.getElementById('deleteModal');
        elements.deleteTaskTitle = document.getElementById('deleteTaskTitle');
        elements.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        elements.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

        // Toasts
        elements.toastContainer = document.getElementById('toastContainer');
    }

    // =========================================================================
    // API Client Functions (Fetch API)
    // =========================================================================

    /**
     * Fetch all tasks from backend with query parameters
     */
    async function apiFetchTasks() {
        const params = new URLSearchParams();
        if (state.filter === 'completed') params.append('completed', 'true');
        if (state.filter === 'pending') params.append('completed', 'false');
        if (state.priorityFilter !== 'ALL') params.append('priority', state.priorityFilter);
        if (state.searchQuery.trim()) params.append('search', state.searchQuery.trim());

        const url = `${API_BASE_URL}?${params.toString()}`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to load tasks: HTTP ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Fetch statistics calculated by the backend
     */
    async function apiFetchStats() {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch stats: HTTP ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Create a task
     */
    async function apiCreateTask(taskData) {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const msg = errData.message || (errData.details ? Object.values(errData.details).join(', ') : 'Failed to create task');
            throw new Error(msg);
        }
        return await response.json();
    }

    /**
     * Update an existing task
     */
    async function apiUpdateTask(id, taskData) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const msg = errData.message || 'Failed to update task';
            throw new Error(msg);
        }
        return await response.json();
    }

    /**
     * Toggle task completion status (PATCH /api/tasks/{id}/complete)
     */
    async function apiToggleTaskComplete(id, completed) {
        const response = await fetch(`${API_BASE_URL}/${id}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ completed: completed })
        });

        if (!response.ok) {
            throw new Error(`Failed to update task status: HTTP ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Delete a task
     */
    async function apiDeleteTask(id) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete task: HTTP ${response.status}`);
        }
        return await response.json();
    }

    // =========================================================================
    // UI Helpers & Notifications
    // =========================================================================

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconSvg = type === 'success'
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : type === 'error'
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

        toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function setBackendStatus(status, message) {
        elements.backendStatus.className = `status-badge ${status}`;
        elements.backendStatus.querySelector('.status-label').textContent = message;

        if (status === 'connected') {
            elements.connectionBanner.classList.add('hidden');
        } else if (status === 'offline') {
            elements.connectionBanner.classList.remove('hidden');
            if (message) elements.connectionErrorText.textContent = message;
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }

    function formatDate(dateStr) {
        if (!dateStr) return null;
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const date = new Date(year, month, day);
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            }
        } catch (e) {
            return dateStr;
        }
        return dateStr;
    }

    function getDueDateStatus(dueDateStr, completed) {
        if (!dueDateStr || completed) return { text: formatDate(dueDateStr), className: '' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parts = dueDateStr.split('-');
        const dueDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `Overdue (${Math.abs(diffDays)}d ago)`, className: 'overdue' };
        } else if (diffDays === 0) {
            return { text: 'Due Today', className: 'today' };
        } else if (diffDays === 1) {
            return { text: 'Due Tomorrow', className: '' };
        } else {
            return { text: `Due ${formatDate(dueDateStr)}`, className: '' };
        }
    }

    // =========================================================================
    // Core Rendering & Data Fetching
    // =========================================================================

    async function loadData() {
        elements.loadingIndicator.classList.remove('hidden');
        elements.emptyState.classList.add('hidden');

        try {
            // Fetch stats and tasks concurrently
            const [tasks, stats] = await Promise.all([
                apiFetchTasks(),
                apiFetchStats()
            ]);

            state.tasks = tasks;
            setBackendStatus('connected', 'Backend Connected');
            renderStats(stats);
            renderTasks();
        } catch (error) {
            console.error('Error fetching data:', error);
            setBackendStatus('offline', 'Backend Offline');
            elements.taskList.innerHTML = '';
            showToast('Cannot connect to Spring Boot backend.', 'error');
        } finally {
            elements.loadingIndicator.classList.add('hidden');
        }
    }

    function renderStats(stats) {
        elements.statTotal.textContent = stats.totalTasks ?? 0;
        elements.statCompleted.textContent = stats.completedTasks ?? 0;
        elements.statPending.textContent = stats.pendingTasks ?? 0;
        elements.statProgress.textContent = `${stats.completionRate ?? 0}%`;
    }

    function sortTasks(tasks) {
        const sorted = [...tasks];
        switch (state.sortBy) {
            case 'createdAt_desc':
                return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
            case 'createdAt_asc':
                return sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
            case 'dueDate_asc':
                return sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.localeCompare(b.dueDate);
                });
            case 'priority_desc':
                const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                return sorted.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
            default:
                return sorted;
        }
    }

    function renderTasks() {
        elements.taskList.innerHTML = '';
        const sortedTasks = sortTasks(state.tasks);

        elements.taskCountBadge.textContent = sortedTasks.length;

        if (sortedTasks.length === 0) {
            elements.emptyState.classList.remove('hidden');
            return;
        }

        elements.emptyState.classList.add('hidden');

        sortedTasks.forEach(task => {
            const card = createTaskCard(task);
            elements.taskList.appendChild(card);
        });
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        const priorityLower = (task.priority || 'MEDIUM').toLowerCase();
        card.className = `task-card priority-${priorityLower} ${task.completed ? 'completed' : ''}`;
        card.dataset.id = task.id;

        const dueStatus = getDueDateStatus(task.dueDate, task.completed);

        card.innerHTML = `
            <div class="task-checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle completed">
            </div>

            <div class="task-body">
                <div class="task-header">
                    <span class="badge badge-${priorityLower}">${task.priority}</span>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                </div>

                ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}

                <div class="task-meta">
                    ${dueStatus ? `
                        <span class="due-date-meta ${dueStatus.className}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${dueStatus.text}
                        </span>
                    ` : ''}
                </div>
            </div>

            <div class="task-actions">
                <button class="action-btn edit-btn" title="Edit Task" aria-label="Edit Task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                </button>
                <button class="action-btn delete-btn" title="Delete Task" aria-label="Delete Task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        // Checkbox event
        const checkbox = card.querySelector('.task-checkbox');
        checkbox.addEventListener('change', async () => {
            const newStatus = checkbox.checked;
            try {
                await apiToggleTaskComplete(task.id, newStatus);
                showToast(newStatus ? 'Task marked as completed!' : 'Task marked as pending.', 'success');
                await loadData();
            } catch (err) {
                checkbox.checked = !newStatus; // revert
                showToast('Failed to update task status.', 'error');
            }
        });

        // Edit button
        card.querySelector('.edit-btn').addEventListener('click', () => {
            openEditModal(task);
        });

        // Delete button
        card.querySelector('.delete-btn').addEventListener('click', () => {
            openDeleteModal(task);
        });

        return card;
    }

    // =========================================================================
    // Modal & Form Handlers
    // =========================================================================

    function openAddModal() {
        state.isEditing = false;
        elements.modalTitle.textContent = 'Create New Task';
        elements.saveBtnText.textContent = 'Save Task';
        elements.taskForm.reset();
        elements.taskId.value = '';
        elements.titleError.classList.add('hidden');
        elements.completedToggleGroup.classList.add('hidden');

        // Default priority: MEDIUM
        const mediumRadio = elements.taskForm.querySelector('input[name="priority"][value="MEDIUM"]');
        if (mediumRadio) mediumRadio.checked = true;

        elements.taskModal.classList.remove('hidden');
        elements.taskTitle.focus();
    }

    function openEditModal(task) {
        state.isEditing = true;
        elements.modalTitle.textContent = 'Edit Task';
        elements.saveBtnText.textContent = 'Update Task';
        elements.titleError.classList.add('hidden');

        elements.taskId.value = task.id;
        elements.taskTitle.value = task.title || '';
        elements.taskDescription.value = task.description || '';
        elements.taskDueDate.value = task.dueDate || '';

        const priorityRadio = elements.taskForm.querySelector(`input[name="priority"][value="${task.priority || 'MEDIUM'}"]`);
        if (priorityRadio) priorityRadio.checked = true;

        elements.completedToggleGroup.classList.remove('hidden');
        elements.taskCompleted.checked = !!task.completed;

        elements.taskModal.classList.remove('hidden');
        elements.taskTitle.focus();
    }

    function closeModal() {
        elements.taskModal.classList.add('hidden');
        elements.taskForm.reset();
    }

    function setButtonLoading(btn, isLoading, loadingText = null, originalText = null) {
        if (!btn) return;
        btn.disabled = !!isLoading;
        if (loadingText && isLoading) {
            const textTarget = btn.querySelector('span') || btn;
            textTarget.textContent = loadingText;
        } else if (originalText && !isLoading) {
            const textTarget = btn.querySelector('span') || btn;
            textTarget.textContent = originalText;
        }
    }

    async function handleFormSubmit(e) {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        // Reliably locate the submit button across browser implementations
        const submitBtn = (e && e.submitter)
            || document.getElementById('saveTaskBtn')
            || (e && e.target && e.target.querySelector && e.target.querySelector('button[type="submit"]'))
            || document.querySelector('#taskModal button[type="submit"]')
            || document.querySelector('#taskForm button[type="submit"]')
            || elements.saveTaskBtn;

        const titleInput = document.getElementById('taskTitle') || elements.taskTitle;
        const title = titleInput ? titleInput.value.trim() : '';

        const titleError = document.getElementById('titleError') || elements.titleError;
        if (!title) {
            if (titleError) titleError.classList.remove('hidden');
            if (titleInput) titleInput.focus();
            return;
        }
        if (titleError) titleError.classList.add('hidden');

        const formEl = (e && e.target) || document.getElementById('taskForm') || elements.taskForm;
        const priority = formEl?.querySelector('input[name="priority"]:checked')?.value || 'MEDIUM';

        const descInput = document.getElementById('taskDescription') || elements.taskDescription;
        const description = descInput ? descInput.value.trim() : '';

        const dueDateInput = document.getElementById('taskDueDate') || elements.taskDueDate;
        const dueDate = (dueDateInput && dueDateInput.value) ? dueDateInput.value : null;

        const payload = {
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate
        };

        const defaultSaveText = state.isEditing ? 'Update Task' : 'Save Task';

        // 1. Loading state with explicit null check
        if (submitBtn) {
            submitBtn.disabled = true;
            const textTarget = submitBtn.querySelector('span') || submitBtn;
            if (textTarget) {
                textTarget.textContent = 'Saving...';
            }
        }

        try {
            if (state.isEditing) {
                const idInput = document.getElementById('taskId') || elements.taskId;
                const id = idInput ? idInput.value : '';
                const completedCheckbox = document.getElementById('taskCompleted') || elements.taskCompleted;
                payload.completed = completedCheckbox ? completedCheckbox.checked : false;
                await apiUpdateTask(id, payload);
                showToast('Task updated successfully!', 'success');
            } else {
                await apiCreateTask(payload);
                showToast('New task added successfully!', 'success');
            }

            closeModal();
            await loadData();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            // 2. Finally/completion block with explicit null check
            if (submitBtn) {
                submitBtn.disabled = false;
                const textTarget = submitBtn.querySelector('span') || submitBtn;
                if (textTarget) {
                    textTarget.textContent = defaultSaveText;
                }
            }
        }
    }

    // =========================================================================
    // Delete Modal Handlers
    // =========================================================================

    function openDeleteModal(task) {
        state.taskToDelete = task;
        const deleteTitleEl = document.getElementById('deleteTaskTitle') || elements.deleteTaskTitle;
        if (deleteTitleEl) {
            deleteTitleEl.textContent = `"${task.title}"`;
        }
        const deleteModalEl = document.getElementById('deleteModal') || elements.deleteModal;
        deleteModalEl?.classList.remove('hidden');
    }

    function closeDeleteModal() {
        const deleteModalEl = document.getElementById('deleteModal') || elements.deleteModal;
        deleteModalEl?.classList.add('hidden');
        state.taskToDelete = null;
    }

    async function handleConfirmDelete() {
        if (!state.taskToDelete) return;

        const id = state.taskToDelete.id;
        const deleteBtn = document.getElementById('confirmDeleteBtn')
            || document.querySelector('#deleteModal .btn-danger')
            || elements.confirmDeleteBtn;

        if (deleteBtn) {
            deleteBtn.disabled = true;
            const textTarget = deleteBtn.querySelector('span') || deleteBtn;
            if (textTarget) textTarget.textContent = 'Deleting...';
        }

        try {
            await apiDeleteTask(id);
            showToast('Task deleted successfully.', 'info');
            closeDeleteModal();
            await loadData();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            if (deleteBtn) {
                deleteBtn.disabled = false;
                const textTarget = deleteBtn.querySelector('span') || deleteBtn;
                if (textTarget) textTarget.textContent = 'Delete';
            }
        }
    }

    // =========================================================================
    // Event Listeners Initialization
    // =========================================================================

    function setupEventListeners() {
        // Modal toggles
        elements.openAddModalBtn?.addEventListener('click', openAddModal);
        elements.emptyAddBtn?.addEventListener('click', openAddModal);
        elements.closeModalBtn?.addEventListener('click', closeModal);
        elements.cancelModalBtn?.addEventListener('click', closeModal);
        elements.taskForm?.addEventListener('submit', handleFormSubmit);

        // Delete modal
        elements.cancelDeleteBtn?.addEventListener('click', closeDeleteModal);
        elements.confirmDeleteBtn?.addEventListener('click', handleConfirmDelete);

        // Close on clicking backdrop
        elements.taskModal?.addEventListener('click', (e) => {
            if (e.target === elements.taskModal) closeModal();
        });
        elements.deleteModal?.addEventListener('click', (e) => {
            if (e.target === elements.deleteModal) closeDeleteModal();
        });

        // Keyboard navigation (Esc to close)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!elements.taskModal?.classList.contains('hidden')) closeModal();
                if (!elements.deleteModal?.classList.contains('hidden')) closeDeleteModal();
            }
        });

        // Search Input (with debounce)
        let debounceTimer;
        elements.searchInput?.addEventListener('input', () => {
            const query = elements.searchInput.value;
            state.searchQuery = query;
            elements.clearSearchBtn?.classList.toggle('hidden', !query);

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadData();
            }, 300);
        });

        elements.clearSearchBtn?.addEventListener('click', () => {
            if (elements.searchInput) elements.searchInput.value = '';
            state.searchQuery = '';
            elements.clearSearchBtn?.classList.add('hidden');
            loadData();
        });

        // Status Filter Pills
        elements.pillButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.pillButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.filter = btn.dataset.filter;
                loadData();
            });
        });

        // Priority Filter Dropdown
        elements.priorityFilter?.addEventListener('change', () => {
            state.priorityFilter = elements.priorityFilter.value;
            loadData();
        });

        // Sort Control
        elements.sortBy?.addEventListener('change', () => {
            state.sortBy = elements.sortBy.value;
            renderTasks();
        });

        // Retry Connection
        elements.retryConnectionBtn?.addEventListener('click', () => {
            loadData();
        });
    }

    // Bootstrapping
    function bootstrap() {
        initElements();
        setupEventListeners();
        loadData();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

})();
