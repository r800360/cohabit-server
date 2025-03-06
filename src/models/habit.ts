export type dayType = "Sun"|"Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat";
export type privacyType = "Private" | "Friends-Only" | "Public";

export interface Habit {
    firebaseId: string,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    reminderTime: Date,
    reminderDays: dayType[],
    streaks: string[],
    privacy: privacyType,
}