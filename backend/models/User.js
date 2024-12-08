const userSchema = {
    uid: String,
    email: String,
    name: String,
    role: String, // 'admin', 'lecturer', 'student'
    photo: String,
    createdAt: Timestamp,
    authProvider: String,
    // Thêm trường cho sinh viên
    studentId: String,
    class: String,
    major: String,
    // Thêm trường cho giảng viên
    teacherId: String,
    department: String,
    subjects: Array
  };