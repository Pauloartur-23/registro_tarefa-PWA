<template>
  <div class="task-item" :class="{ done: task.done }">
    <img
      v-if="task.img_url"
      :src="task.img_url"
      class="task-thumbnail"
      alt="Imagem da tarefa"
      title="Ver imagem"
      @click="openDialog"
    />

    <label class="task-label">
      <input
        type="checkbox"
        :checked="task.done"
        @change="$emit('toggle', task.id)"
      />
      <span class="task-title">{{ task.title }}</span>
      <span
        v-if="task.priority && task.priority !== 'normal'"
        class="priority-badge"
        :class="`priority-${task.priority}`"
      >
        {{ priorityLabel }}
      </span>
      <span
        v-if="task.location_label"
        class="task-location-tag"
        :title="task.location_label"
      >
        📍 {{ task.location_label }}
      </span>
      <span
        v-else-if="task.latitude != null && task.longitude != null"
        class="task-coordinates"
      >
        📍 {{ task.latitude.toFixed(4) }}, {{ task.longitude.toFixed(4) }}
      </span>
    </label>

    <div class="task-actions">
      <button
        v-if="task.latitude != null && task.longitude != null"
        class="task-map-toggle"
        type="button"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Ocultar mapa' : 'Ver mapa' }}
      </button>
      <button class="task-edit" @click="$emit('edit', task)">Editar</button>
      <button class="task-remove" @click="$emit('remove', task.id)">
        Remover
      </button>
    </div>

    <TaskLocationMap
      v-if="expanded && task.latitude != null && task.longitude != null"
      class="task-item-map"
      :location="{
        latitude: task.latitude,
        longitude: task.longitude,
        accuracy: task.geolocation_accuracy,
        label: task.location_label,
      }"
    />

    <dialog ref="dialogRef" class="photo-dialog">
      <div class="photo-dialog-content">
        <img :src="task.img_url" alt="Imagem da tarefa" />
        <button type="button" class="photo-dialog-close" @click="closeDialog">
          Fechar
        </button>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import TaskLocationMap from './TaskLocationMap.vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

defineEmits(['toggle', 'remove', 'edit']);

const dialogRef = ref(null);
const expanded = ref(false);

const priorityLabel = computed(() => {
  const labels = { baixa: 'Baixa', alta: 'Alta' };
  return labels[props.task.priority] ?? props.task.priority;
});

function openDialog() {
  dialogRef.value?.showModal();
}

function closeDialog() {
  dialogRef.value?.close();
}
</script>

<style scoped>
.task-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: opacity 0.2s;
  gap: 10px;
}

.task-item-map {
  flex-basis: 100%;
}

.task-location-tag {
  font-size: 0.75rem;
  color: #4a90d9;
  flex-basis: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-map-toggle {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
}

.task-map-toggle:hover {
  text-decoration: underline;
}

.task-thumbnail {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s, border-color 0.2s;
}

.task-thumbnail:hover {
  transform: scale(1.05);
  border-color: #4a90d9;
}

.task-item.done {
  opacity: 0.6;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  flex-wrap: wrap;
}

.task-label input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #4a90d9;
}

.task-title {
  font-size: 1rem;
}

.task-item.done .task-title {
  text-decoration: line-through;
  color: #999;
}

.priority-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.priority-alta {
  background: #fdecea;
  color: #c0392b;
}

.priority-baixa {
  background: #eafaf1;
  color: #27ae60;
}

.task-coordinates {
  font-size: 0.7rem;
  color: #999;
  flex-basis: 100%;
}

.task-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
}

.task-remove:hover {
  text-decoration: underline;
}

.task-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.task-edit {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
}

.task-edit:hover {
  text-decoration: underline;
}

.photo-dialog {
  border: none;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.photo-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.photo-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.photo-dialog-content img {
  max-width: min(80vw, 360px);
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.photo-dialog-close {
  padding: 8px 16px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}
</style>
