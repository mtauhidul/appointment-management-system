export interface Room {
  id: string;
  number: number;
  doctorsAssigned: string[];
  patientAssigned?: string;
  doctorStatuses: {
    [doctorId: string]: {
      status: string;
      statusOrder: number;
      statusTime: number;
    };
  };
  isEmergency: boolean;
}
