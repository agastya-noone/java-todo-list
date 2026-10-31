package com.todolist.controller;

import com.todolist.model.Priority;
import com.todolist.model.Task;
import com.todolist.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * GET /api/tasks
     * Get all tasks with optional filters: completed, search keyword, priority
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Priority priority) {
        List<Task> tasks = taskService.getAllTasks(completed, search, priority);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/stats
     * Get task statistics: total, completed, pending, completionRate
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTaskStatistics() {
        return ResponseEntity.ok(taskService.getTaskStatistics());
    }

    /**
     * GET /api/tasks/{id}
     * Get a specific task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    /**
     * POST /api/tasks
     * Create a new task with validation
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task createdTask = taskService.createTask(task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    /**
     * PUT /api/tasks/{id}
     * Update an existing task
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task taskDetails) {
        Task updatedTask = taskService.updateTask(id, taskDetails);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * PATCH /api/tasks/{id}/complete
     * Mark a task as completed (or pending if body { "completed": false } is supplied)
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Task> markTaskComplete(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Boolean> body) {
        boolean completed = true;
        if (body != null && body.containsKey("completed")) {
            completed = body.get("completed");
        }
        Task updatedTask = taskService.markTaskCompleted(id, completed);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * DELETE /api/tasks/{id}
     * Delete a task by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of(
                "message", "Task deleted successfully",
                "id", id.toString()
        ));
    }
}
