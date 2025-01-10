// task.models.ts

export interface TaskCard {
    taskPath: TaskPath;
    taskName: string;
    taskType: TaskType;
    taskKey: string; // Task ID
    taskStatus: TaskStatus;
    performerId?: string;
    taskTime: TaskTime;
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