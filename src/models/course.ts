export interface Course {
    code: string;
    name: string;
    schedule: { day: string; time: string }[];
}