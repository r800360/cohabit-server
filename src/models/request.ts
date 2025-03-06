export type statusType = "accepted"|"rejected"|"pending";

export interface Request {
    senderId: string,
    receiverId: string,
    status: statusType
}