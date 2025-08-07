export interface Status {
  id: string;
  name: string;
  color: string;
  activityType: string;
  hasSound?: boolean;
  // Trigger Configuration for Patient Flow
  isStartTrigger?: boolean;     // ⏱️ Starts patient timing when assigned to room
  isEndTrigger?: boolean;       // ⏹️ Ends patient timing when assigned to room
  isQueueTrigger?: boolean;     // 👥 Triggers next patient from queue when assigned to room
}
