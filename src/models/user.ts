import { Habit } from "./habit";
import { Course } from "./course";

export interface User {
    firebaseId: string;
    name: string;
    email: string;
    friendList: string[];
    habitList: Habit[];
    courseList: Course[];
    blockedList: string[];
    focusGroups: string[];
  }