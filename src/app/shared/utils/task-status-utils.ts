// task-status-utils.ts

import { TaskStatus } from "../models/task.models";

// Apply indices for statuses
// Used in NewTaskComponent and TaskCardComponent

export const TaskStatusOrder: { [key in TaskStatus]: number } = {
    [TaskStatus.Draft]: 1,
    [TaskStatus.Approval]: 2,
    [TaskStatus.Execution]: 3,
    [TaskStatus.Review]: 4,
    [TaskStatus.Deploy]: 5,
    [TaskStatus.Testing]: 6,
    [TaskStatus.Closed]: 7,
    // [TaskStatus.InProgress]: 8,
    // [TaskStatus.Pause]: 9,
};

export function sortTaskStatuses(statuses: TaskStatus[]): TaskStatus[] {
    return statuses.sort((a, b) => TaskStatusOrder[a] - TaskStatusOrder[b]);
}
