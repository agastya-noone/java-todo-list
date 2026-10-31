package com.todolist;

import com.todolist.model.Priority;
import com.todolist.model.Task;
import com.todolist.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TaskServiceTest {

    @Autowired
    private TaskService taskService;

    private Task testTask;

    @BeforeEach
    void setUp() {
        testTask = new Task();
        testTask.setTitle("Finish Java Assignment");
        testTask.setDescription("Build Spring Boot backend and modern frontend");
        testTask.setPriority(Priority.HIGH);
        testTask.setDueDate(LocalDate.now().plusDays(2));
        testTask.setCompleted(false);
    }

    @Test
    @DisplayName("Test 1: Create a new task and verify persistence")
    void testCreateTask() {
        Task created = taskService.createTask(testTask);

        assertNotNull(created.getId(), "Task ID should not be null after saving");
        assertEquals("Finish Java Assignment", created.getTitle());
        assertEquals(Priority.HIGH, created.getPriority());
        assertFalse(created.isCompleted());
        assertNotNull(created.getCreatedAt(), "CreatedAt timestamp should be populated");
    }

    @Test
    @DisplayName("Test 2: Retrieve all tasks")
    void testGetAllTasks() {
        taskService.createTask(testTask);

        Task second = new Task();
        second.setTitle("Prepare Presentation");
        second.setPriority(Priority.MEDIUM);
        taskService.createTask(second);

        List<Task> allTasks = taskService.getAllTasks(null, null, null);
        assertTrue(allTasks.size() >= 2, "Should retrieve at least 2 tasks");
    }

    @Test
    @DisplayName("Test 3: Update an existing task")
    void testUpdateTask() {
        Task created = taskService.createTask(testTask);

        Task updates = new Task();
        updates.setTitle("Updated Title");
        updates.setDescription("Updated Description");
        updates.setPriority(Priority.LOW);
        updates.setDueDate(LocalDate.now().plusDays(5));
        updates.setCompleted(false);

        Task updated = taskService.updateTask(created.getId(), updates);

        assertEquals("Updated Title", updated.getTitle());
        assertEquals("Updated Description", updated.getDescription());
        assertEquals(Priority.LOW, updated.getPriority());
    }

    @Test
    @DisplayName("Test 4: Mark task as completed and pending")
    void testToggleCompleteTask() {
        Task created = taskService.createTask(testTask);
        assertFalse(created.isCompleted());

        // Complete task
        Task completed = taskService.markTaskCompleted(created.getId(), true);
        assertTrue(completed.isCompleted(), "Task should now be completed");

        // Mark back as pending
        Task pending = taskService.markTaskCompleted(created.getId(), false);
        assertFalse(pending.isCompleted(), "Task should now be pending");
    }

    @Test
    @DisplayName("Test 5: Delete a task")
    void testDeleteTask() {
        Task created = taskService.createTask(testTask);
        Long id = created.getId();

        taskService.deleteTask(id);

        assertThrows(RuntimeException.class, () -> taskService.getTaskById(id));
    }

    @Test
    @DisplayName("Test 6: Filter tasks by completion status and search keyword")
    void testFilterTasks() {
        Task task1 = new Task("Read Documentation", "Read Spring Data JPA docs", Priority.LOW, LocalDate.now());
        task1.setCompleted(true);
        taskService.createTask(task1);

        Task task2 = new Task("Implement Controller", "Write REST endpoints", Priority.HIGH, LocalDate.now().plusDays(1));
        task2.setCompleted(false);
        taskService.createTask(task2);

        // Filter completed
        List<Task> completed = taskService.getAllTasks(true, null, null);
        assertTrue(completed.stream().allMatch(Task::isCompleted));

        // Filter pending
        List<Task> pending = taskService.getAllTasks(false, null, null);
        assertTrue(pending.stream().noneMatch(Task::isCompleted));

        // Search title
        List<Task> searchResults = taskService.getAllTasks(null, "Controller", null);
        assertEquals(1, searchResults.size());
        assertEquals("Implement Controller", searchResults.get(0).getTitle());
    }

    @Test
    @DisplayName("Test 7: Verify task statistics calculation")
    void testTaskStatistics() {
        Task completedTask = new Task("Task A", "Desc A", Priority.MEDIUM, LocalDate.now());
        completedTask.setCompleted(true);
        taskService.createTask(completedTask);

        Task pendingTask = new Task("Task B", "Desc B", Priority.HIGH, LocalDate.now());
        pendingTask.setCompleted(false);
        taskService.createTask(pendingTask);

        Map<String, Object> stats = taskService.getTaskStatistics();
        assertNotNull(stats.get("totalTasks"));
        assertNotNull(stats.get("completedTasks"));
        assertNotNull(stats.get("pendingTasks"));
        assertNotNull(stats.get("completionRate"));

        long total = (long) stats.get("totalTasks");
        long comp = (long) stats.get("completedTasks");
        long pend = (long) stats.get("pendingTasks");

        assertEquals(total, comp + pend);
    }
}
