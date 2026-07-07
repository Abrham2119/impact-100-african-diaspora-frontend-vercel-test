export type NotificationChannel = 'EMAIL' | 'PUSH' | 'IN_APP';
export type NotificationType = 'SYSTEM' | 'ACCOUNT' | 'SECURITY' | 'MESSAGE';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
