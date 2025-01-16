// icon-utils.ts

import { ProductType, TaskStatus, TaskType } from "../models/task.models";

// Map ProductTypes to iconId
export const productIconMap: { [key in ProductType]: string } = {
  [ProductType.iOS]: 'icon-prod-ios',
  [ProductType.Android]: 'icon-prod-android',
  [ProductType.WebSite]: 'icon-prod-website',
  [ProductType.BackEnd]: 'icon-prod-backend',
  [ProductType.WebApp]: 'icon-prod-webapp',
  [ProductType.iOSLoadedLogo]: 'icon-prod-ios-loaded-logo',
};

// Map TaskType to iconId and color
export const taskTypeIconMap: {
  [key in TaskType]: { iconId: string, color?: string }
} = {
  [TaskType.Frontend]: { iconId: 'icon-type-frontend' },
  [TaskType.Backend]: { iconId: 'icon-type-backend' },
  [TaskType.Testing]: { iconId: 'icon-type-qa' },
  [TaskType.Design]: { iconId: 'icon-type-design' },
  [TaskType.Analytics]: { iconId: 'icon-type-analitics' },
  [TaskType.BlockingBug]: { iconId: 'icon-type-bug', color: '#FF0000' },
  [TaskType.CriticalBug]: { iconId: 'icon-type-bug', color: '#A90C26' },
  [TaskType.MajorBug]: { iconId: 'icon-type-bug', color: '#ED4E4E' },
  [TaskType.MinorBug]: { iconId: 'icon-type-bug', color: '#FF7002' },
  [TaskType.TrivialBug]: { iconId: 'icon-type-bug', color: '#B0B0B0' },
};

// Map TaskStatus to iconId and color
export const taskStatusIconMap: { [key in TaskStatus]: string } = {
  [TaskStatus.Draft]: 'icon-status-draft',
  [TaskStatus.Approval]: 'icon-status-approval',
  [TaskStatus.Execution]: 'icon-status-execution',
  [TaskStatus.Review]: 'icon-status-review',
  [TaskStatus.Deploy]: 'icon-status-deploy',
  [TaskStatus.Testing]: 'icon-status-test',
  [TaskStatus.Closed]: 'icon-status-closed',
};