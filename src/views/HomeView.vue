<template>
  <div>
    <p v-if="store.error" class="error-message">
      {{ store.error }}
      <button type="button" class="retry-button" @click="store.fetchTasks()">
        Tentar novamente
      </button>
    </p>

    <p v-if="store.loading" class="loading-message">Carregando tarefas...</p>

    <template v-else>
      <input
        v-model="store.filterText"
        type="search"
        class="search-input"
        placeholder="Buscar tarefas..."
      />

      <label class="location-filter">
        <input type="checkbox" v-model="store.onlyWithLocation" />
        Somente com localização
      </label>

      <section v-if="store.filteredPendingTasks.length > 0">
        <h2 class="section-title">
          Pendentes ({{ store.filteredPendingTasks.length }})
        </h2>
        <div
          v-for="group in store.pendingGroups"
          :key="group.priority"
          class="priority-group"
        >
          <h3 class="group-title">
            {{ group.label }} ({{ group.tasks.length }})
          </h3>
          <TaskItem
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            @toggle="handleToggle"
            @remove="handleRemove"
            @edit="handleEdit"
          />
        </div>
      </section>

      <section v-if="store.filteredCompletedTasks.length > 0">
        <h2 class="section-title">
          Concluídas ({{ store.filteredCompletedTasks.length }})
        </h2>
        <div
          v-for="group in store.completedGroups"
          :key="group.priority"
          class="priority-group"
        >
          <h3 class="group-title">
            {{ group.label }} ({{ group.tasks.length }})
          </h3>
          <TaskItem
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            @toggle="handleToggle"
            @remove="handleRemove"
            @edit="handleEdit"
          />
        </div>
      </section>

      <p v-if="store.tasks.length === 0" class="empty-message">
        Nenhuma tarefa cadastrada. Toque no botão + para adicionar.
      </p>
      <p
        v-else-if="store.tasks.length > 0 && store.filteredTasks.length === 0"
        class="empty-message"
      >
        Nenhuma tarefa corresponde a "{{ store.filterText }}".
      </p>
    </template>

    <InstallButton />
    <button
      type="button"
      class="fab"
      aria-label="Adicionar atividade"
      title="Adicionar atividade"
      @click="router.push({ name: 'task-add' })"
    >
      +
    </button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TaskItem from '../components/TaskItem.vue';
import InstallButton from '../components/InstallButton.vue';
import { useTasksStore } from '../stores/tasks.js';

const store = useTasksStore();
const router = useRouter();

onMounted(() => {
  store.fetchTasks();
});

function handleEdit(task) {
  router.push({ name: 'task-edit', params: { id: task.id } });
}

function handleToggle(id) {
  store.toggleTask(id);
}

function handleRemove(id) {
  store.removeTask(id);
}
</script>

<style scoped>
.section-title {
  font-size: 1rem;
  color: #666;
  margin-bottom: 12px;
  margin-top: 20px;
}

.priority-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 8px;
}

.empty-message {
  text-align: center;
  color: #999;
  margin-top: 40px;
  font-size: 0.95rem;
}

.error-message {
  color: #c0392b;
  background-color: #fdecea;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4a90d9;
}

.location-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  margin-bottom: 12px;
}

.loading-message {
  color: #666;
  font-size: 0.9rem;
  padding: 8px 0;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background-color: #4a90d9;
  color: white;
  font-size: 2rem;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s, transform 0.2s;
}

.fab:hover {
  background-color: #357abd;
  transform: scale(1.05);
}

.retry-button {
  margin-left: 8px;
  padding: 4px 10px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
