export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  roomsAssigned: string[];
  assistantsAssigned: string[];
  patients: string[];
}
