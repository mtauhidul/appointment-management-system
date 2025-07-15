import dummyData from "@/lib/dummyData.json";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore";
import { useStatusStore } from "@/lib/store/useStatusStore";
import { createEmptyAvailability } from "@/lib/types/doctor";

const loadDummyData = () => {
  const doctorStore = useDoctorStore.getState();
  const roomStore = useRoomStore.getState();
  const statusStore = useStatusStore.getState();

  if (doctorStore.doctors.length === 0) {
    dummyData.doctors.forEach((doctor) => 
      doctorStore.addDoctor({
        ...doctor,
        availability: createEmptyAvailability(),
      })
    );
  }

  if (roomStore.rooms.length === 0) {
    dummyData.rooms.forEach((room) => roomStore.addRoom(room));
  }

  if (statusStore.statuses.length === 0) {
    dummyData.statuses.forEach((status) => statusStore.addStatus(status));
  }
};

export default loadDummyData;
