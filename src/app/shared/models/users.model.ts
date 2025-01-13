// task.models.ts

export interface UserData {
    id: string | null | undefined;
    username: string;
    img: string;
    email: string;
    telegram: string;
    tasks?: string[]; // Array with tasks IDs created by this user
}