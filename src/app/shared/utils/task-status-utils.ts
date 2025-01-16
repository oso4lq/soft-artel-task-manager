// task-status-utils.ts

import { TaskCard, TaskStatus } from "../models/task.models";

// Apply indices for statuses
// Used in NewTaskComponent, TaskCardComponent

export const TaskStatusOrder: { [key in TaskStatus]: number } = {
    [TaskStatus.Draft]: 1,
    [TaskStatus.Approval]: 2,
    [TaskStatus.Execution]: 3,
    [TaskStatus.Review]: 4,
    [TaskStatus.Deploy]: 5,
    [TaskStatus.Testing]: 6,
    [TaskStatus.Closed]: 7,
};

// Arrange statuses in TaskCard.taskStatuses by their indices
export function sortTaskStatuses(statuses: TaskStatus[]): TaskStatus[] {
    return statuses.sort((a, b) => TaskStatusOrder[a] - TaskStatusOrder[b]);
}

// Find next TaskStatus inside the TaskCard.taskStatuses array
export function getNextTaskStatus(task: TaskCard): TaskStatus | null {
    // Find currentTaskStatus index using TaskStatusOrder
    const currentIndex = task.taskStatuses.indexOf(task.currentTaskStatus);
    // If found and it is not the last, return its next
    if (currentIndex >= 0 && currentIndex < task.taskStatuses.length - 1) {
        return task.taskStatuses[currentIndex + 1];
    }
    console.log('no statuses left');
    return null; // No statuses left
}