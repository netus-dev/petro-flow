"use client";

/**
 * @fileoverview Hook de presentación para el módulo Look-a-Head.
 * Orquesta estado, use cases, lógica de cascada de fechas y persistencia.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Task,
  Rig,
  TaskStatus,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "../../domain/entities";
import { lookaheadRepository } from "../../infrastructure/repository";
import {
  GetRigsUseCase,
  GetTasksUseCase,
  CreateTaskUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
} from "../../application/usecases/lookahead.usecases";

const toLocalDatetimeInput = (isoStr: string) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EMPTY_TASK_FORM = {
  description: "",
  start_date: "",
  end_date: "",
  comments: "",
  status: "pending" as TaskStatus,
  previous_task_id: "none" as string,
};

export function useLookahead() {
  // ── Estado de rigs ──────────────────────────────────────────────────────────
  const [rigs, setRigs] = useState<Rig[]>([]);
  const [selectedRigId, setSelectedRigId] = useState<string>("");

  // ── Estado de tareas ────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingRigs, setLoadingRigs] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Estado del dialog de creación ───────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ ...EMPTY_TASK_FORM });
  const [creating, setCreating] = useState(false);

  // ── Use Cases ────────────────────────────────────────────────────────────────
  const getRigsUseCase    = useMemo(() => new GetRigsUseCase(lookaheadRepository), []);
  const getTasksUseCase   = useMemo(() => new GetTasksUseCase(lookaheadRepository), []);
  const createTaskUseCase = useMemo(() => new CreateTaskUseCase(lookaheadRepository), []);
  const updateTaskUseCase = useMemo(() => new UpdateTaskUseCase(lookaheadRepository), []);
  const deleteTaskUseCase = useMemo(() => new DeleteTaskUseCase(lookaheadRepository), []);

  // ── Cargar rigs al montar ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingRigs(true);
      try {
        const list = await getRigsUseCase.execute();
        setRigs(list);
        if (list.length > 0) setSelectedRigId(list[0].id);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingRigs(false);
      }
    };
    load();
  }, [getRigsUseCase]);

  // ── Cargar tareas cuando cambia el rig ──────────────────────────────────────
  const fetchTasks = useCallback(async (rigId: string) => {
    if (!rigId) return;
    setLoadingTasks(true);
    setError(null);
    try {
      const list = await getTasksUseCase.execute(rigId);
      setTasks(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingTasks(false);
    }
  }, [getTasksUseCase]);

  useEffect(() => {
    if (selectedRigId) fetchTasks(selectedRigId);
  }, [selectedRigId, fetchTasks]);

  // ── Stats derivadas ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      tasks.length,
    completed:  tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    pending:    tasks.filter((t) => t.status === "pending").length,
  }), [tasks]);

  // ── Cambio de rig ───────────────────────────────────────────────────────────
  const handleRigChange = (rigId: string) => setSelectedRigId(rigId);

  // ── Crear tarea ─────────────────────────────────────────────────────────────
  const handleCreateTask = useCallback(async () => {
    if (!newTaskForm.description || !newTaskForm.start_date || !newTaskForm.end_date || !selectedRigId) return;

    setCreating(true);
    try {
      const payload: CreateTaskPayload = {
        description: newTaskForm.description,
        start_date: new Date(newTaskForm.start_date).toISOString(),
        end_date: new Date(newTaskForm.end_date).toISOString(),
        rig_id: selectedRigId,
        status: newTaskForm.status,
        comments: newTaskForm.comments || undefined,
      };

      const newTask = await lookaheadRepository.createTask(payload);

      if (newTaskForm.previous_task_id && newTaskForm.previous_task_id !== "none") {
        await lookaheadRepository.updateDependency(newTaskForm.previous_task_id, newTask.id);
      }

      setTasks((prev) => [...prev, newTask]);
      setDialogOpen(false);
      setNewTaskForm({ ...EMPTY_TASK_FORM });
      await fetchTasks(selectedRigId);
    } catch (e: any) {
      setError(e.message || "No se pudo crear la tarea");
    } finally {
      setCreating(false);
    }
  }, [newTaskForm, selectedRigId, fetchTasks]);

  // ── Actualizar tarea (edición manual) ───────────────────────────────────────
  const handleUpdateTask = async (id: string, payload: UpdateTaskPayload) => {
    try {
      const updated = await updateTaskUseCase.execute(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  /**
   * Callback del Gantt: tarea movida/redimensionada (fechas).
   * Se ejecuta al soltar la barra en el Gantt.
   * Utiliza Optimistic Update para ser inmediato.
   */
  const handleGanttTaskUpdate = useCallback(async (
    id: string,
    updates: { text?: string; start?: Date; end?: Date; progress?: number },
    oldStart: Date | null
  ) => {
    // Si no es un cambio de fechas (ej. texto) ignoramos por aquí, 
    // lo manejaremos con el nuevo Modal de Edición.
    if (updates.start === undefined && updates.end === undefined) return;

    const payload: UpdateTaskPayload = {};
    if (updates.start !== undefined) payload.start_date  = updates.start.toISOString();
    if (updates.end   !== undefined) payload.end_date    = updates.end.toISOString();

    if (Object.keys(payload).length === 0) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== id ? t : {
          ...t,
          ...(payload.start_date  !== undefined ? { start_date:  payload.start_date  } : {}),
          ...(payload.end_date    !== undefined ? { end_date:    payload.end_date    } : {}),
        }
      )
    );

    try {
      await lookaheadRepository.updateTask(id, payload);

      const shiftMs = updates.start && oldStart ? updates.start.getTime() - oldStart.getTime() : 0;
      if (shiftMs !== 0) {
        await lookaheadRepository.cascadeTaskDates(tasks, id, shiftMs);
        await fetchTasks(selectedRigId);
      }
    } catch (e: any) {
      setError(e.message || "Error al actualizar la fecha");
      await fetchTasks(selectedRigId);
    }
  }, [tasks, selectedRigId, fetchTasks]);

  // ── EDICIÓN CON MODAL PROPIO ──────────────────────────────────────────────
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskForm, setEditTaskForm] = useState<typeof EMPTY_TASK_FORM>({
    description: "",
    start_date: "",
    end_date: "",
    status: "pending",
    comments: "",
    previous_task_id: "none",
  });
  const [updatingTask, setUpdatingTask] = useState(false);

  const openEditTaskModal = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setEditTaskForm({
      description: task.description,
      start_date: toLocalDatetimeInput(task.start_date),
      end_date: toLocalDatetimeInput(task.end_date),
      status: task.status,
      comments: task.comments || "",
      previous_task_id: task.previous_task_id || "none",
    });
    setEditingTaskId(id);
  }, [tasks]);

  const handleSaveEditTask = useCallback(async () => {
    if (!editingTaskId) return;
    try {
      setUpdatingTask(true);
      setError(null);
      
      const oldTask = tasks.find(t => t.id === editingTaskId);
      const oldPrev = oldTask?.previous_task_id;
      const newPrev = editTaskForm.previous_task_id === "none" ? null : editTaskForm.previous_task_id;

      // Actualizamos todo
      const payload: UpdateTaskPayload = {
        description: editTaskForm.description,
        start_date: new Date(editTaskForm.start_date).toISOString(),
        end_date: new Date(editTaskForm.end_date).toISOString(),
        status: editTaskForm.status,
        comments: editTaskForm.comments || null,
      };

      const updated = await lookaheadRepository.updateTask(editingTaskId, payload);

      // Manejar cambios de dependencia
      if (oldPrev !== newPrev) {
        if (oldPrev) {
          await lookaheadRepository.updateDependency(oldPrev, null); // Desvincular viejo
        }
        if (newPrev) {
          await lookaheadRepository.updateDependency(newPrev, editingTaskId); // Vincular nuevo
        }
      }

      setEditingTaskId(null);
      await fetchTasks(selectedRigId); // aseguramos todo actualizado y cascadas resueltas
    } catch (err: any) {
      setError(err.message || "Error al actualizar tarea");
    } finally {
      setUpdatingTask(false);
    }
  }, [editingTaskId, editTaskForm, selectedRigId, fetchTasks, tasks]);


  // ── Agregar dependencia entre tareas ────────────────────────────────────────
  const handleLinkAdd = useCallback(async (sourceId: string, targetId: string) => {
    try {
      await lookaheadRepository.updateDependency(sourceId, targetId);
      // Actualizar estado local para que el Gantt refleje el link
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === sourceId) return { ...t, next_task_id: targetId };
          if (t.id === targetId) return { ...t, previous_task_id: sourceId };
          return t;
        })
      );
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  // ── Eliminar dependencia ─────────────────────────────────────────────────────
  const handleLinkDelete = useCallback(async (sourceId: string) => {
    try {
      // Limpiar el next_task_id de la fuente y el previous_task_id del destino
      const sourceTask = tasks.find((t) => t.id === sourceId);
      if (!sourceTask?.next_task_id) return;

      const targetId = sourceTask.next_task_id;
      // Limpiar en BD
      await lookaheadRepository.updateDependency(sourceId, null);
      // Limpiar el previous_task_id del destino también
      await lookaheadRepository.updateTask(targetId, { previous_task_id: null });

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === sourceId) return { ...t, next_task_id: null };
          if (t.id === targetId) return { ...t, previous_task_id: null };
          return t;
        })
      );
    } catch (e: any) {
      setError(e.message);
    }
  }, [tasks]);

  // ── Eliminar tarea (soft delete) ─────────────────────────────────────────────
  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      await deleteTaskUseCase.execute(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  }, [deleteTaskUseCase]);

  return {
    // Rigs
    rigs, selectedRigId, handleRigChange, loadingRigs,
    // Tareas
    tasks, loadingTasks, stats, error,
    // Dialog creación
    dialogOpen, setDialogOpen,
    newTaskForm, setNewTaskForm,
    creating, handleCreateTask,
    // Acciones CRUD
    handleUpdateTask,
    handleDeleteTask,
    // Callbacks del Gantt
    handleGanttTaskUpdate,
    handleLinkAdd,
    handleLinkDelete,
    
    // Edición
    editingTaskId,
    setEditingTaskId,
    editTaskForm,
    setEditTaskForm,
    updatingTask,
    openEditTaskModal,
    handleSaveEditTask,
    // Refresco manual
    refresh: () => fetchTasks(selectedRigId),
  };
}
