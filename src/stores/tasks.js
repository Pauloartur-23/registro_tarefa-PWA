import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import tasksApi from '../api/tasksApi.js';
import { buildLocationPayload } from '../utils/location.js';

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const filterText = ref('');
  const onlyWithLocation = ref(false);

  const pendingTasks = computed(() => tasks.value.filter((t) => !t.done));
  const completedTasks = computed(() => tasks.value.filter((t) => t.done));

  const priorityOrder = ['alta', 'normal', 'baixa'];
  const priorityLabels = { alta: 'Alta', normal: 'Normal', baixa: 'Baixa' };

  const filteredTasks = computed(() => {
    const term = filterText.value.trim().toLowerCase();
    return tasks.value.filter((t) => {
      if (onlyWithLocation.value && t.latitude == null) return false;
      if (!term) return true;
      const priority = t.priority || 'normal';
      const priorityLabel = priorityLabels[priority] ?? priority;
      return (
        t.title.toLowerCase().includes(term) ||
        priority.toLowerCase().includes(term) ||
        priorityLabel.toLowerCase().includes(term)
      );
    });
  });

  const filteredPendingTasks = computed(() =>
    filteredTasks.value.filter((t) => !t.done),
  );
  const filteredCompletedTasks = computed(() =>
    filteredTasks.value.filter((t) => t.done),
  );

  function groupByPriority(taskList) {
    return priorityOrder
      .map((priority) => ({
        priority,
        label: priorityLabels[priority],
        tasks: taskList.filter((t) => (t.priority || 'normal') === priority),
      }))
      .filter((group) => group.tasks.length > 0);
  }

  const pendingGroups = computed(() => groupByPriority(filteredPendingTasks.value));
  const completedGroups = computed(() =>
    groupByPriority(filteredCompletedTasks.value),
  );

  async function fetchTasks() {
    loading.value = true;
    error.value = null;
    try {
      const response = await tasksApi.getAll();
      tasks.value = response.data;
    } catch (err) {
      error.value = 'Erro ao carregar tarefas.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function addTask({
    title,
    priority = 'normal',
    imgAttachmentKey,
    location,
  } = {}) {
    if (!title?.trim()) return;
    error.value = null;
    try {
      const locationPayload = buildLocationPayload(location);
      const response = await tasksApi.create(
        title.trim(),
        priority,
        imgAttachmentKey,
        locationPayload,
      );
      tasks.value.push(response.data);
    } catch (err) {
      error.value = 'Erro ao adicionar tarefa.';
      console.error(err);
    }
  }

  async function toggleTask(id) {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;
    error.value = null;
    try {
      const response = await tasksApi.update(id, { done: !task.done });
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) tasks.value[index] = response.data;
    } catch (err) {
      error.value = 'Erro ao atualizar tarefa.';
      console.error(err);
    }
  }

  async function removeTask(id) {
    error.value = null;
    try {
      await tasksApi.remove(id);
      tasks.value = tasks.value.filter((t) => t.id !== id);
    } catch (err) {
      error.value = 'Erro ao remover tarefa.';
      console.error(err);
    }
  }

  async function updateTask(
    id,
    {
      title,
      imgAttachmentKey,
      removeImage = false,
      priority,
      location,
      removeLocation = false,
    } = {},
  ) {
    if (title !== undefined && !title.trim()) return;
    error.value = null;
    const payload = {};
    if (title !== undefined) payload.title = title.trim();
    if (removeImage) {
      payload.img_attachment_key = null;
    } else if (imgAttachmentKey != null) {
      payload.img_attachment_key = imgAttachmentKey;
    }
    if (priority !== undefined) payload.priority = priority;
    if (removeLocation) {
      Object.assign(payload, buildLocationPayload(null));
    } else if (location) {
      Object.assign(payload, buildLocationPayload(location));
    }
    try {
      const response = await tasksApi.update(id, payload);
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) tasks.value[index] = response.data;
    } catch (err) {
      error.value = 'Erro ao editar tarefa.';
      console.error(err);
    }
  }

  return {
    tasks,
    loading,
    error,
    filterText,
    onlyWithLocation,
    pendingTasks,
    completedTasks,
    filteredTasks,
    filteredPendingTasks,
    filteredCompletedTasks,
    pendingGroups,
    completedGroups,
    fetchTasks,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
  };
});
