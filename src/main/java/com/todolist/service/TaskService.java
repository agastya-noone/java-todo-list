package com.todolist.service;

import com.todolist.model.Priority;
import com.todolist.model.Task;

import java.util.List;
import java.util.Map;

public interface TaskService {

    List<Task> getAllTasks(Boolean completed, String search, Priority priority);

    Task getTaskById(Long id);

    Task createTask(Task task);

    Task updateTask(Long id, Task taskDetails);

    Task markTaskCompleted(Long id, boolean completed);

    void deleteTask(Long id);

    Map<String, Object> getTaskStatistics();
}
