package com.ertriage.controller;

import com.ertriage.config.JwtUtil;
import com.ertriage.model.Task;
import com.ertriage.model.User;
import com.ertriage.repository.TaskRepository;
import com.ertriage.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskRepository taskRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public TaskController(TaskRepository taskRepository, SimpMessagingTemplate messagingTemplate,
            UserRepository userRepository, JwtUtil jwtUtil) {
        this.taskRepository = taskRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Resolves the currently authenticated user from the Authorization header.
     */
    private User resolveCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) return null;
        String username = jwtUtil.getUsername(token);
        return userRepository.findByUsername(username).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(@RequestHeader("Authorization") String authHeader) {
        User currentUser = resolveCurrentUser(authHeader);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User.Role role = currentUser.getRole();
        // ADMIN and SUPERVISOR see all tasks
        if (role == User.Role.ADMIN || role == User.Role.SUPERVISOR) {
            return ResponseEntity.ok(taskRepository.findAllByOrderByCreatedAtDesc());
        }

        // Other roles see only their own tasks (matched by username or fullName)
        List<String> identifiers = new ArrayList<>();
        identifiers.add(currentUser.getUsername());
        if (currentUser.getFullName() != null && !currentUser.getFullName().isBlank()) {
            identifiers.add(currentUser.getFullName());
        }
        return ResponseEntity.ok(taskRepository.findByAssignedToInOrderByCreatedAtDesc(identifiers));
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        String priority = body.getOrDefault("priority", "normal");
        String assignedTo = body.get("assignedTo");
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Task task = new Task(
                title.trim(),
                Task.Priority.valueOf(priority),
                assignedTo == null || assignedTo.trim().isEmpty() ? null : assignedTo.trim());
        Task savedTask = taskRepository.save(task);

        if (savedTask.getAssignedTo() != null && !savedTask.getAssignedTo().isEmpty()) {
            messagingTemplate.convertAndSend("/topic/tasks/" + savedTask.getAssignedTo(), savedTask);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    @PutMapping("/{id}/complete")
    @SuppressWarnings("null")
    public ResponseEntity<Task> completeTask(@PathVariable String id) {
        return taskRepository.findById(id).map(task -> {
            task.setCompleted(true);
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
