export interface Room {
  id: string;
  number: number;
  doctorsAssigned: string[];
  patientAssigned?: string;
  status: string;
  isEmergency: boolean;
  color: string;
  statusTime: Date;
  statusOrder: number;
}
