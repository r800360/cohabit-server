export type DayType = "Sun"|"Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat";
export type PrivacyType = "Private" | "Friends-Only" | "Public";

export interface Habit {
    firebaseId: string,
    email: string,
    title: string,
    description?: string,
    startDate: Date,
    endDate: Date,
    reminderTime: Date,
    reminderDays: DayType[],
    streaks: string[],
    privacy: PrivacyType,
}