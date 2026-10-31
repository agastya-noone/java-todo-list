package com.todolist.repository;

import com.todolist.model.Priority;
import com.todolist.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByOrderByCreatedAtDesc();

    List<Task> findByCompletedOrderByCreatedAtDesc(boolean completed);

    List<Task> findByPriorityOrderByCreatedAtDesc(Priority priority);

    List<Task> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    List<Task> findByCompletedAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(boolean completed, String title);

    long countByCompleted(boolean completed);
}
