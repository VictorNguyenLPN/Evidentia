# Commit Convention

Tài liệu này quy định các tiêu chuẩn về **Commit Message**, **Quy trình phân nhánh (Branching Strategy)**, và **Quản lý phiên bản (Semantic Versioning)** áp dụng cho dự án **LegalTrust-VN**. 

Việc tuân thủ các quy định này giúp giữ cho lịch sử Git sạch sẽ, dễ theo dõi, tự động hóa việc tạo `CHANGELOG.md` và quản lý các bản phát hành (releases) một cách nhất quán.

---

## 1. Conventional Commits

Chúng ta áp dụng tiêu chuẩn [Conventional Commits](https://www.conventionalcommits.org/) để định dạng các commit message.

### Cấu trúc cơ bản
```
<type>(<scope>): <description>

[body]

[footer(s)]
```

- **`<type>`** (Bắt buộc): Loại thay đổi được thực hiện (xem danh sách bên dưới).
- **`<scope>`** (Tùy chọn): Phạm vi ảnh hưởng của thay đổi (ví dụ: `rag`, `retriever`, `docs`, `parser`, `ui`, `api`).
- **`<description>`** (Bắt buộc): Mô tả ngắn gọn bằng tiếng Việt, bắt đầu bằng chữ thường, không kết thúc bằng dấu chấm.
- **`[body]`** (Tùy chọn): Mô tả chi tiết hơn về thay đổi, lý do tại sao thực hiện thay đổi và cách giải quyết.
- **`[footer]`** (Tùy chọn): Nơi khai báo các Breaking Changes hoặc tham chiếu các Issue liên quan (ví dụ: `Closes #123`, `Refs #45`).

### Các Loại Commit (`type`)

| Loại Commit | Ý nghĩa | Khi nào sử dụng |
| :--- | :--- | :--- |
| **`feat`** | Feature | Thêm một tính năng mới cho hệ thống. |
| **`fix`** | Bug Fix | Sửa một lỗi (bug) trong code. |
| **`docs`** | Documentation | Chỉ thay đổi tài liệu (README, Wiki, JSDoc, v.v.). |
| **`style`** | Code Style | Thay đổi không ảnh hưởng đến logic code (formatting, khoảng trắng, dấu chấm phẩy, v.v.). |
| **`refactor`** | Refactoring | Tái cấu trúc mã nguồn mà không sửa lỗi hay thêm tính năng mới. |
| **`perf`** | Performance | Thay đổi mã nguồn nhằm cải thiện hiệu năng chạy của hệ thống. |
| **`test`** | Testing | Thêm mới hoặc sửa đổi các bộ unit/integration test. |
| **`build`** | Build System | Thay đổi ảnh hưởng đến hệ thống build hoặc các thư viện phụ thuộc (ví dụ: npm, pip, poetry, maven). |
| **`ci`** | Continuous Integration | Thay đổi cấu hình CI/CD (GitHub Actions, GitLab CI, v.v.). |
| **`chore`** | Maintenance | Các công việc nhỏ khác không làm thay đổi mã nguồn hoặc file test (ví dụ: `.gitignore`, cấu hình linter). |
| **`revert`** | Revert | Thu hồi (revert) một commit trước đó. |

### Quy định về Breaking Changes
Nếu commit chứa thay đổi làm phá vỡ tính tương thích ngược (Breaking Changes):
1. Thêm dấu `!` sau `<type>` hoặc `<scope>` (ví dụ: `feat(api)!: thay đổi cấu trúc dữ liệu người dùng`).
2. Trong phần `footer`, bắt đầu bằng `BREAKING CHANGE: <mô tả chi tiết sự thay đổi và hướng dẫn chuyển đổi>`.

### Ví dụ Commit Messages hợp lệ

#### Ví dụ 1: Thêm tính năng mới (Feature)
```git
feat(retriever): tích hợp mô hình embedding ViLegalEB cho Retrieval Stage

- Thêm BM25 retriever và Dense retriever
- Cấu hình hybrid search kết hợp kết quả của cả hai
- Thử nghiệm trên tập dữ liệu benchmark pair_classification.jsonl
```

#### Ví dụ 2: Sửa lỗi (Bug Fix)
```git
fix(parser): sửa lỗi phân tích cú pháp các điều luật có định dạng đặc biệt

Sửa lỗi regex khiến các điều luật chứa ký tự đặc biệt như '/' bị bỏ qua khi trích xuất thông tin.
Closes #42
```

#### Ví dụ 3: Thay đổi tài liệu
```git
docs: cập nhật hướng dẫn cài đặt môi trường ảo trong README.md
```

#### Ví dụ 4: Breaking Change
```git
feat(api)!: thay đổi cấu trúc API trả về của module temporal reasoning

BREAKING CHANGE: Thay đổi định dạng dữ liệu trả về của API `/api/v1/verify` từ JSON phẳng sang cấu trúc lồng nhau để hỗ trợ metadata thời gian.
```

---

## 2. Quy định Phân nhánh

Dự án áp dụng mô hình **Git Flow rút gọn** để phát triển.

### Các nhánh chính (Long-lived Branches)
- **`main`**: Nhánh chứa mã nguồn ổn định nhất đang chạy trên môi trường Product. Mọi commit trực tiếp vào `main` đều bị cấm. Thay đổi chỉ được đưa vào thông qua Pull Request (PR) sau khi đã được review và pass CI.
- **`develop`**: Nhánh tích hợp các tính năng mới phục vụ cho phiên bản tiếp theo.

### Nhánh tạm thời (Short-lived Branches)
Khi phát triển, lập trình viên tạo nhánh mới từ `develop` (hoặc `main` tùy theo cấu hình cụ thể) theo quy tắc đặt tên sau:

- **Tính năng mới**: `feature/<tên-tính-năng>`
  *(Ví dụ: `feature/temporal-parser`)*
- **Sửa lỗi**: `bugfix/<tên-lỗi>`
  *(Ví dụ: `bugfix/pdf-loader-memory-leak`)*
- **Sửa lỗi khẩn cấp trực tiếp trên main**: `hotfix/<tên-lỗi>`
  *(Ví dụ: `hotfix/expired-api-key`)*
- **Tài liệu**: `docs/<tên-tài-liệu>`
  *(Ví dụ: `docs/api-specification`)*

---

## 3. Quy chế Quản lý Phiên bản (Semantic Versioning)

Dự án tuân thủ tiêu chuẩn [Semantic Versioning 2.0.0](https://semver.org/). Định dạng của một phiên bản là:

$$\mathbf{MAJOR.MINOR.PATCH}$$

Ví dụ: `v1.0.0`

1. **`MAJOR` (Phiên bản chính)**: Tăng khi có các thay đổi **không tương thích ngược** (Breaking Changes).
2. **`MINOR` (Phiên bản phụ)**: Tăng khi thêm **tính năng mới** nhưng vẫn **tương thích ngược** với các phiên bản cũ.
3. **`PATCH` (Phiên bản vá lỗi)**: Tăng khi thực hiện các **sửa lỗi (bug fixes)** tương thích ngược.

### Quy định tăng phiên bản tự động/bán tự động
Dựa trên loại commit đã merge vào nhánh chính:
- Nếu có commit chứa `BREAKING CHANGE` hoặc `!` $\rightarrow$ Tăng **`MAJOR`** (ví dụ: `1.2.3` $\rightarrow$ `2.0.0`).
- Nếu có commit loại `feat` $\rightarrow$ Tăng **`MINOR`** (ví dụ: `1.2.3` $\rightarrow$ `1.3.0`).
- Nếu chỉ có các commit loại `fix`, `perf`, `refactor` $\rightarrow$ Tăng **`PATCH`** (ví dụ: `1.2.3` $\rightarrow$ `1.2.4`).

### Hậu tố phiên bản thử nghiệm (Pre-releases)
Trước khi phát hành bản chính thức, có thể gắn thêm hậu tố:
- `v1.0.0-alpha.1`: Phiên bản thử nghiệm nội bộ đầu tiên.
- `v1.0.0-beta.2`: Phiên bản thử nghiệm mở rộng, sửa lỗi ổn định.
- `v1.0.0-rc.1` (Release Candidate): Bản ứng viên sẵn sàng lên Production nếu không phát hiện lỗi nghiêm trọng nào khác.

---

## 4. Quy trình Đóng góp & Tạo Pull Request

1. **Fork/Clone** dự án về local máy của bạn.
2. Tạo nhánh làm việc mới từ `develop` (hoặc nhánh được chỉ định):
   ```bash
   git checkout -b feature/ten-tính-nang
   ```
3. Thực hiện phát triển và commit định kỳ. Đảm bảo mỗi commit giải quyết một đơn vị công việc rõ ràng và tuân thủ **Commit Convention**.
4. Viết unit test cho các đoạn code mới thêm vào. Đảm bảo chạy pass tất cả các test case hiện tại:
   ```bash
   # Ví dụ lệnh chạy test (nếu sử dụng pytest)
   pytest tests/
   ```
5. Đẩy nhánh lên remote repository:
   ```bash
   git push origin feature/ten-tính-nang
   ```
6. Tạo **Pull Request (PR)** hướng về nhánh `develop` trên kho lưu trữ gốc.
   - Tiêu đề PR tuân thủ cấu trúc: `<type>(<scope>): <tóm tắt ngắn gọn tính năng>`
   - Mô tả PR đầy đủ: Mô tả những gì bạn đã làm, ảnh hưởng như thế nào và đính kèm các ảnh chụp màn hình/video minh họa nếu có.
7. Đợi code reviewer phê duyệt và xử lý các phản hồi nếu có trước khi được merge.
