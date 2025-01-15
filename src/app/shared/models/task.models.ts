// task.models.ts

export interface TaskCard {
    id: string | null | undefined; // Task service ID
    taskPath: TaskPath;
    taskName: string;
    taskType: TaskType;
    taskKey: string; // Task production ID
    taskStatuses: TaskStatus[];
    currentTaskStatus: TaskStatus;
    performerId?: string | null | undefined;
    inProgress?: boolean | null;
    taskTime: TaskTime;
    createdAt: string;
}

export interface TaskPath {
    projectName: string;
    productName: ProductType;
    version: number;
    feature: string;
}

export enum ProductType {
    iOS = 'iOS',
    Android = 'Android',
    WebSite = 'WebSite',
    BackEnd = 'BackEnd',
    WebApp = 'WebApp',
    iOSLoadedLogo = 'iOS (loaded logo)',
}

export enum TaskType {
    Frontend = 'Frontend',
    Backend = 'Backend',
    Testing = 'Тестирование',
    Design = 'Дизайн',
    Analytics = 'Аналитика',
    BlockingBug = 'Ошибка блокирующая',
    CriticalBug = 'Ошибка критическая',
    MajorBug = 'Ошибка значительная',
    MinorBug = 'Ошибка незначительная',
    TrivialBug = 'Ошибка тривиальная',
}

export enum TaskStatus {
    Draft = 'Черновик',
    Approval = 'Согласование',
    Execution = 'Исполнение',
    Review = 'Ревью',
    Deploy = 'Деплой',
    Testing = 'Тестирование',
    Closed = 'Закрыто',
}

export interface TaskTime {
    spent: string;
    planned: string;
}

export interface CounterDoc {
    group: string;
    nextNumber: number;
}