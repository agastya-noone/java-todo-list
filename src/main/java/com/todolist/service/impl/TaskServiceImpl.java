package com.todolist.service.impl;

import com.todolist.exception.ResourceNotFoundException;
import com.todolist.model.Priority;
import com.todolist.model.Task;
import com.todolist.repository.TaskRepository;
import com.todolist.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Task> getAllTasks(Boolean completed, String search, Priority priority) {
        List<Task> tasks = taskRepository.findAllByOrderByCreatedAtDesc();

        return tasks.stream()
                .filter(task -> completed == null || task.isCompleted() == completed)
                .filter(task -> priority == null || task.getPriority() == priority)
                .filter(task -> {
                    if (search == null || search.trim().isEmpty()) {
                        return true;
                    }
                    String query = search.trim().toLowerCase();
                    boolean titleMatches = task.getTitle() != null && task.getTitle().toLowerCase().contains(query);
                    boolean descMatches = task.getDescription() != null && task.getDescription().toLowerCase().contains(query);
                    return titleMatches || descMatches;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
    }

    @Override
    public Task createTask(Task task) {
        if (task.getPriority() == null) {
            task.setPriority(Priority.MEDIUM);
        }
        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(Long id, Task taskDetails) {
        Task existingTask = getTaskById(id);

        if (taskDetails.getTitle() != null && !taskDetails.getTitle().trim().isEmpty()) {
            existingTask.setTitle(taskDetails.getTitle().trim());
        }
        existingTask.setDescription(taskDetails.getDescription());
        if (taskDetails.getPriority() != null) {
            existingTask.setPriority(taskDetails.getPriority());
        }
        existingTask.setDueDate(taskDetails.getDueDate());
        existingTask.setCompleted(taskDetails.isCompleted());

        return taskRepository.save(existingTask);
    }

    @Override
    public Task markTaskCompleted(Long id, boolean completed) {
        Task existingTask = getTaskById(id);
        existingTask.setCompleted(completed);
        return taskRepository.save(existingTask);
    }

    @Override
    public void deleteTask(Long id) {
        Task existingTask = getTaskById(id);
        taskRepository.delete(existingTask);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getTaskStatistics() {
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByCompleted(true);
        long pendingTasks = taskRepository.countByCompleted(false);
        double completionRate = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("pendingTasks", pendingTasks);
        stats.put("completionRate", Math.round(completionRate * 10.0) / 10.0);

        return stats;
    }
}
