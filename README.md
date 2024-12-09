
# Student Management System (SMS)

## Mô tả Dự án

**Student Management System (SMS)** là một hệ thống quản lý sinh viên với hai thành phần chính: **Frontend** và **Backend**.

- **Frontend**: Xây dựng bằng **React.js** và sử dụng **Bootstrap** để thiết kế giao diện.
- **Backend**: Xây dựng bằng **Node.js** và tích hợp với **Firebase** để quản lý dữ liệu.

## Hướng dẫn Cài đặt và Chạy Dự án

### 1. Cài đặt các thành phần
1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/feliznavidadfeliznavidad/SMSBasic.git
   ```

2. **Cài đặt Frontend**:
   ```bash
   cd project/final
   npm install
   ```

3. **Cài đặt Backend**:
   ```bash
   cd backend
   npm install
   ```

### 2. Chạy dự án

1. **Copy 2 file có chứa Key vào thư mục backend**:


### 3. Chạy dự án

1. **Khởi động Backend**:
   - Chuyển vào thư mục `backend` và chạy lệnh:
     ```bash
   node server.js
     ```
   - Đảm bảo backend đã khởi động trước khi chuyển sang frontend.

2. **Khởi động Frontend**:
   - Chuyển vào thư mục `project/final` và chạy lệnh:
     ```bash
     npm start
     ```

3. Truy cập ứng dụng tại: `http://localhost:3000`

## Công nghệ Sử dụng

| Thành phần       | Công nghệ                |
|------------------|--------------------------|
| **Frontend**     | React.js, Bootstrap      |
| **Backend**      | Node.js, Firebase        |

## Lưu ý
- Đảm bảo cài đặt Node.js phiên bản mới nhất để tránh lỗi trong quá trình cài đặt và chạy dự án.
- Firebase cần được cấu hình trước khi khởi chạy backend. Chỉnh sửa file cấu hình Firebase nếu cần thiết.