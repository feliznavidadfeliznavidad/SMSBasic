const gradeSchema = {
    classId: String,
    studentId: String,
    assignments: [
      {
        name: String,
        score: Number,
        weight: Number,
        feedback: String
      }
    ],
    finalGrade: Number
  };