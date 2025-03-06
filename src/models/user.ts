import { Habit } from "./habit";

export interface User {
    firebaseId: string;
    name: string;
    email: string;
    friendList: string[];
    habitList: Habit[];
    blockedList: string[];
    // courseList: Course[];
    // focusGroups: string[];
  }
  