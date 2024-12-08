const attendanceSchema = {
    classId: String,
    date: Timestamp,
    students: [
      {
        studentId: String,
        status: String, // 'present', 'absent', 'late'
        note: String
      }
    ]
  };