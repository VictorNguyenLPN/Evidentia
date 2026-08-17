# Convention

## Commit Rule

### 1. Cấu trúc Commit Message
```text
<type>[scope]: <action> <description>
```
- **`type`** (Tag chính): Loại thay đổi chính.
- **`scope`** *(Tùy chọn)*: Phạm vi bị ảnh hưởng, đặt trong dấu ngoặc đơn (VD: `(ui)`, `(api)`, `(rag)`).
- **`action`** (Tag phụ / Hành động): Động từ tiếng Anh ngắn gọn (`add`, `update`, `delete`, `fix`,...).
- **`description`**: Mô tả ngắn gọn nội dung thay đổi.

### 2. Types
- **`feat`**: Thêm tính năng mới cho ứng dụng/hệ thống.
- **`fix`**: Sửa lỗi, khắc phục sự cố hoặc hành vi không mong muốn.
- **`docs`**: Cập nhật tài liệu (README, CONVENTION, code docs,...).
- **`refactor`**: Tái cấu trúc mã nguồn mà không thay đổi tính năng hay sửa lỗi.
- **`style`**: Định dạng code (khoảng trắng, format,...) không ảnh hưởng logic.
- **`test`**: Bổ sung hoặc chỉnh sửa các test case, unit test.
- **`chore`**: Công việc bảo trì lặt vặt, cập nhật cấu hình, quản lý file/thư mục phụ trợ.

### 3. Actions
- **`add`**: Thêm mới file, thư mục, tính năng hoặc tài nguyên.
- **`update`**: Cập nhật, chỉnh sửa nội dung, cấu hình hoặc logic hiện có.
- **`delete` / `remove`**: Xóa bỏ file, đoạn code hoặc tài nguyên thừa.
- **`fix`**: Sửa một lỗi cụ thể.
- **`refactor`**: Tái cấu trúc mã nguồn ở cấp độ chi tiết.

### 4. Thứ tự ưu tiên chọn Types
Khi một commit đụng đến nhiều phạm vi, chọn **Tag chính** theo thứ tự ưu tiên giảm dần sau:

1. **`fix`**: Sửa lỗi hệ thống/logic.
2. **`feat`**: Thêm tính năng mới.
3. **`refactor`**: Tái cấu trúc mã nguồn.
4. **`docs`**: Cập nhật tài liệu.
5. **`style`**: Chỉnh sửa định dạng/format code.
6. **`test`**: Thêm/sửa test suite.
7. **`chore`**: Bảo trì, cập nhật cấu hình build/tooling lặt vặt.

> **Khuyến nghị**: Nếu commit chứa quá nhiều thay đổi thuộc nhiều tag khác nhau, nên tách thành các commit nhỏ độc lập.

### 5. Nguyên tắc chung
- Ngắn gọn, rõ ràng, tập trung vào mô tả thay đổi.
- Sử dụng động từ tiếng Anh dạng nguyên mẫu (`add`, `update`, `delete`, `fix` thay vì `added`, `updated`).
- Viết thường chữ cái đầu sau dấu `:`.

### 6. Ví dụ minh họa

- **`feat`**:
  - `feat: add temporal legal document parser`
  - `feat(api): add endpoint for legal search`

- **`fix`**:
  - `fix: resolve crash when parsing empty pdf`
  - `fix(ui): update search bar button layout`

- **`chore`**:
  - `chore: add .gitignore`
  - `chore: update dependencies in requirements.txt`
  - `chore: delete unused temporary assets`

- **`docs`**:
  - `docs: update README setup instructions`
  - `docs(convention): add commit guidelines`

- **`refactor`**:
  - `refactor: optimize legal retrieval search query`
  - `refactor(reranker): simplify cross-encoder pipeline`

- **`style`**:
  - `style: reformat python code with black`

- **`test`**:
  - `test: add unit tests for query router`