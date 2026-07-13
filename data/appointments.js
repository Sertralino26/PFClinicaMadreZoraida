export const appointments = [];

export const addAppointment = (appointment) => {
  appointments.push({
    id: String(Date.now()),
    ...appointment
  });
};
