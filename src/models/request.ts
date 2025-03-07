export type StatusType = "accepted"|"rejected"|"pending";

export interface Request {
    senderId: string,
    receiverId: string,
    status: StatusType
}