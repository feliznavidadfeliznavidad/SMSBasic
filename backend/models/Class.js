const classSchema = {
    classId: String,
    className: String,
    lecturerId: String,
    students: Array, // Array of student UIDs
    subject: String,
    schedule: {
      dayOfWeek: String,
      startTime: String,
      endTime: String
    },
    semester: String,
    year: Number
  };