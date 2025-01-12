// task.models.ts

export interface TaskCard {
    id: string | number; // Task service ID
    taskPath: TaskPath;
    taskName: string;
    taskType: TaskType;
    taskKey: string; // Task production ID
    taskStatus: TaskStatus;
    performerId?: string;
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
    InProgress = 'В работе',
    Pause = 'Пауза',
}

export interface TaskTime {
    spent: string;
    planned: string;
}