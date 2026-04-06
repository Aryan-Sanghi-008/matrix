import React, { useCallback, useEffect, useMemo, useState } from "react";
import { completeTask, fetchTasks } from "../api/taskApi.js";
import { fetchPatients } from "../api/patientApi.js";

const ASSIGNED_TASK_ROLES = ["DOCTOR", "NURSE"];

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getAssignee(task) {
  return task?.assignedTo || task?.assignee || task?.assignedUser || "";
}

function belongsToUser(task, user) {
  const assignee = normalize(getAssignee(task));
  if (!assignee) return false;
  const username = normalize(user?.username);
  const fullName = normalize(user?.fullName);
  return assignee === username || assignee === fullName;
}

function formatTime(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleString();
}

export default function AssignedTasksTab({ user }) {
  const [tasks, setTasks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canAccess = ASSIGNED_TASK_ROLES.includes(user?.role);

  const loadData = useCallback(async () => {
    if (!canAccess) {
      setTasks([]);
      setPatients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [allTasks, allPatients] = await Promise.all([
        fetchTasks(),
        fetchPatients(),
      ]);
      setTasks(Array.isArray(allTasks) ? allTasks : []);
      setPatients(Array.isArray(allPatients) ? allPatients : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load assigned work.");
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [loadData]);

  const myTasks = useMemo(() => {
    if (user?.role === "ADMIN" || user?.role === "SUPERVISOR") {
      return tasks.filter((task) => belongsToUser(task, user));
    }
    return tasks;
  }, [tasks, user]);

  // Unified worklist items
  const unifiedWorklist = useMemo(() => {
    const taskItems = myTasks.map((t) => ({
      id: t.id,
      type: "TASK",
      title: t.title,
      priority: t.priority,
      createdAt: t.createdAt,
      completed: t.completed,
    }));

    const patientItems = patients.map((p) => ({
      id: p.id,
      type: "PATIENT_ASSIGNMENT",
      title: `Care for Patient: ${p.name}`,
      priority: p.priority,
      createdAt: p.timestamp,
      completed: false, // Patient care is ongoing until discharged
      details: `Zone: ${p.assignedCareZone}, Room: ${p.assignedRoom}, Symptoms: ${p.symptoms}`,
    }));

    return [...taskItems, ...patientItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [myTasks, patients]);

  const pendingCount = unifiedWorklist.filter((item) => !item.completed).length;

  const markDone = async (taskId) => {
    try {
      await completeTask(taskId);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task,
        ),
      );
    } catch (err) {
      setError(err.message || "Failed to complete task.");
    }
  };

  if (!canAccess) {
    return (
      <div className="assigned-task-state error">
        Only doctors and nurses can access assigned tasks.
      </div>
    );
  }

  return (
    <section className="assigned-task-shell">
      <div className="assigned-task-hero">
        <div>
          <div className="assigned-task-kicker">Unified Worklist</div>
          <h2>My Assigned Work</h2>
          <p>
            Showing tasks and patients assigned to{" "}
            {user?.fullName || user?.username || "you"}.
          </p>
        </div>
        <button className="assigned-task-refresh" onClick={loadData}>
          Refresh
        </button>
      </div>

      {loading && unifiedWorklist.length === 0 ? (
        <div className="assigned-task-state">Loading your work...</div>
      ) : null}
      {error ? <div className="assigned-task-state error">{error}</div> : null}

      {!error && (
        <>
          <div className="assigned-task-stats">
            <div>
              <strong>{unifiedWorklist.length}</strong>
              <span>Total Work Items</span>
            </div>
            <div>
              <strong>{pendingCount}</strong>
              <span>Pending Actions</span>
            </div>
          </div>

          {unifiedWorklist.length === 0 ? (
            <div className="assigned-task-state">
              No work items are assigned to you yet.
            </div>
          ) : (
            <div className="assigned-task-list">
              {unifiedWorklist.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`assigned-task-item ${item.completed ? "done" : "pending"} ${item.type.toLowerCase()}`}
                >
                  <div className="assigned-task-content">
                    <div className="assigned-task-header-row">
                      <span
                        className={`work-type-badge ${item.type.toLowerCase()}`}
                      >
                        {item.type === "TASK" ? "📝 Task" : "🩺 Patient"}
                      </span>
                      <span
                        className={`priority-indicator priority-${item.priority}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <div className="assigned-task-title">{item.title}</div>
                    {item.details && (
                      <div className="assigned-task-details">
                        {item.details}
                      </div>
                    )}
                    <div className="assigned-task-meta">
                      Assigned: {formatTime(item.createdAt)}
                    </div>
                  </div>

                  {item.type === "TASK" && !item.completed && (
                    <button
                      className="assigned-task-complete"
                      onClick={() => markDone(item.id)}
                    >
                      Mark Done
                    </button>
                  )}
                  {item.type === "TASK" && item.completed && (
                    <span className="assigned-task-completed-label">
                      Completed
                    </span>
                  )}
                  {item.type === "PATIENT_ASSIGNMENT" && (
                    <span className="assigned-task-active-badge">
                      Active Care
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
