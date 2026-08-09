# Quy ước Phát triển (Development Conventions)

Tài liệu này quy định các tiêu chuẩn về **Commit Message**, **Quy trình phân nhánh (Branching Strategy)**, và **Quản lý phiên bản (Semantic Versioning)** áp dụng cho dự án **LegalTrust-VN**. 

Việc tuân thủ quy ước này giúp duy trì lịch sử Git sạch sẽ, dễ theo dõi, tự động hóa quy trình tạo `CHANGELOG.md` và quản lý các release một cách nhất quán.

---

## 1. Quy chuẩn Commit (Conventional Commits)

Dự án áp dụng tiêu chuẩn [Conventional Commits](https://www.conventionalcommits.org/) để định dạng các commit message.

### Cấu trúc cơ bản (Basic Structure)
```
<type>(<scope>): <description>

[body]

[footer(s)]
```

- **`<type>`** (bắt buộc): Loại thay đổi được thực hiện (xem chi tiết tại bảng bên dưới).
- **`<scope>`** (tùy chọn): Phạm vi ảnh hưởng của thay đổi (ví dụ: `rag`, `retriever`, `docs`, `parser`, `ui`, `api`).
- **`<description>`** (bắt buộc): Mô tả ngắn gọn bằng tiếng Việt, viết thường chữ cái đầu tiên, không kết thúc bằng dấu chấm.
- **`[body]`** (tùy chọn): Mô tả chi tiết hơn về các thay đổi, bối cảnh/lý do thực hiện và cách giải quyết (nếu cần).
- **`[footer]`** (tùy chọn): Nơi khai báo các breaking changes hoặc tham chiếu đến các issue liên quan (ví dụ: `Closes #123`, `Refs #45`).

### Các loại commit (Commit Types)

| Loại commit | Ý nghĩa | Mô tả / Khi nào sử dụng |
| :--- | :--- | :--- |
| **`feat`** | Feature | Thêm tính năng mới cho hệ thống. |
| **`fix`** | Bug Fix | Sửa lỗi (bug) trong mã nguồn. |
| **`docs`** | Documentation | Thay đổi liên quan đến tài liệu (README, Wiki, API docs, v.v.). |
| **`style`** | Style | Thay đổi định dạng mã nguồn (formatting, khoảng trắng, dấu chấm phẩy, v.v.) mà không thay đổi logic. |
| **`refactor`** | Refactor | Tái cấu trúc mã nguồn (không sửa lỗi hay thêm tính năng mới). |
| **`perf`** | Performance | Thay đổi mã nguồn nhằm cải thiện hiệu năng (performance). |
| **`test`** | Test | Thêm mới hoặc cập nhật các bộ test (unit/integration tests). |
| **`build`** | Build | Thay đổi cấu hình build system hoặc các dependencies bên ngoài (ví dụ: npm, pip, poetry, maven). |
| **`ci`** | CI | Thay đổi cấu hình CI/CD (GitHub Actions, GitLab CI, v.v.). |
| **`chore`** | Chore | Các tác vụ bảo trì khác không làm thay đổi mã nguồn hoặc file test (ví dụ: cấu hình `.gitignore`, linter). |
| **`revert`** | Revert | Hoàn tác (revert) một commit trước đó. |

### Quy định về Breaking Changes
Nếu commit chứa các breaking changes (thay đổi gây phá vỡ tính tương thích ngược):
1. Thêm dấu `!` ngay sau `<type>` hoặc `<scope>` (ví dụ: `feat(api)!: thay đổi cấu trúc dữ liệu người dùng`).
2. Tại phần `footer`, bắt đầu bằng `BREAKING CHANGE: <mô tả chi tiết về thay đổi và hướng dẫn cập nhật/nâng cấp>`.

### Ví dụ commit message hợp lệ

#### Ví dụ 1: Thêm tính năng mới (feat)
```git
feat(retriever): tích hợp mô hình embedding ViLegalEB cho Retrieval Stage

- Thêm BM25 Retriever và Dense Retriever
- Cấu hình hybrid search để kết hợp kết quả của cả hai
- Thử nghiệm trên tập dữ liệu benchmark pair_classification.jsonl
```

#### Ví dụ 2: Sửa lỗi (fix)
```git
fix(parser): sửa lỗi phân tích cú pháp các điều luật có định dạng đặc biệt

Sửa lỗi regex khiến các điều luật chứa ký tự đặc biệt như '/' bị bỏ qua khi trích xuất thông tin.
Closes #42
```

#### Ví dụ 3: Cập nhật tài liệu (docs)
```git
docs: cập nhật hướng dẫn cài đặt môi trường ảo trong README.md
```

#### Ví dụ 4: Thay đổi lớn phá vỡ tương thích (breaking change)
```git
feat(api)!: thay đổi cấu trúc API trả về của module temporal reasoning

BREAKING CHANGE: Thay đổi định dạng dữ liệu trả về của API `/api/v1/verify` từ flat JSON sang nested JSON để hỗ trợ metadata về thời gian (temporal metadata).
```

---

## 2. Quy trình phân nhánh (Branching Strategy)

Dự án áp dụng mô hình **Git Flow rút gọn (Simplified Git Flow)** để phát triển.

### Các nhánh chính (Long-lived Branches)
- **`main`**: Nhánh chứa mã nguồn ổn định nhất đang chạy trên môi trường Production. Mọi hành động commit trực tiếp vào `main` đều bị chặn. Mọi thay đổi chỉ được tích hợp thông qua Pull Request (PR) sau khi được code review và vượt qua (pass) các bước kiểm tra CI.
- **`develop`**: Nhánh tích hợp (integration branch) các tính năng mới phục vụ cho phiên bản phát hành tiếp theo.

### Các nhánh tạm thời (Short-lived Branches)
Khi phát triển, thành viên dự án tạo nhánh mới từ `develop` (hoặc từ `main` đối với hotfix) theo quy tắc đặt tên sau:

- **Tính năng mới**: `feature/<feature-name>`
  *(Ví dụ: `feature/temporal-parser`)*
- **Sửa lỗi**: `bugfix/<bug-name>`
  *(Ví dụ: `bugfix/pdf-loader-memory-leak`)*
- **Sửa lỗi khẩn cấp (trực tiếp trên main)**: `hotfix/<hotfix-name>`
  *(Ví dụ: `hotfix/expired-api-key`)*
- **Tài liệu**: `docs/<doc-name>`
  *(Ví dụ: `docs/api-specification`)*

---

## 3. Quản lý phiên bản (Semantic Versioning)

Dự án tuân thủ tiêu chuẩn [Semantic Versioning 2.0.0](https://semver.org/). Định dạng của một phiên bản (version format) tuân theo:

$$\mathbf{MAJOR.MINOR.PATCH}$$

Ví dụ: `v1.0.0`

1. **`MAJOR`**: Tăng khi có các thay đổi không tương thích ngược (**breaking changes**).
2. **`MINOR`**: Tăng khi thêm **tính năng mới (features)** nhưng vẫn đảm bảo tương thích ngược.
3. **`PATCH`**: Tăng khi thực hiện các **sửa lỗi (bug fixes)** tương thích ngược.

### Cơ chế tăng phiên bản (Automated/Semi-automated Versioning)
Dựa trên loại commit được merge vào nhánh chính (`main`):
- Nếu có commit chứa `BREAKING CHANGE` hoặc dấu `!` $\rightarrow$ Tăng **`MAJOR`** (ví dụ: `1.2.3` $\rightarrow$ `2.0.0`).
- Nếu có commit loại `feat` $\rightarrow$ Tăng **`MINOR`** (ví dụ: `1.2.3` $\rightarrow$ `1.3.0`).
- Nếu chỉ có các commit loại `fix`, `perf`, `refactor` $\rightarrow$ Tăng **`PATCH`** (ví dụ: `1.2.3` $\rightarrow$ `1.2.4`).

### Hậu tố phiên bản thử nghiệm (Pre-release Versions)
Trước khi phát hành phiên bản chính thức, có thể sử dụng các hậu tố pre-release:
- `v1.0.0-alpha.1`: Phiên bản thử nghiệm nội bộ (Alpha release).
- `v1.0.0-beta.2`: Phiên bản thử nghiệm mở rộng (Beta release).
- `v1.0.0-rc.1` (Release Candidate): Bản ứng viên sẵn sàng triển khai lên Production nếu không phát hiện lỗi nghiêm trọng nào khác.

---

## 4. Quy trình đóng góp & Tạo Pull Request (Contribution & PR Workflow)

1. **Fork/Clone** repository về máy cá nhân (local environment) của bạn.
2. Tạo nhánh (branch) làm việc mới từ nhánh `develop` (hoặc nhánh phát triển được chỉ định):
   ```bash
   git checkout -b feature/ten-tinh-nang
   ```
3. Thực hiện phát triển và commit code. Đảm bảo mỗi commit giải quyết một tác vụ đơn lẻ (atomic commit) và tuân thủ **Quy chuẩn commit (Commit Convention)**.
4. Viết unit test cho các đoạn mã nguồn mới. Đảm bảo tất cả các test case đều vượt qua (pass):
   ```bash
   # Ví dụ lệnh chạy test (nếu sử dụng pytest)
   pytest tests/
   ```
5. Đẩy (push) nhánh lên remote repository:
   ```bash
   git push origin feature/ten-tinh-nang
   ```
6. Tạo **Pull Request (PR)** hướng về nhánh `develop` của repository gốc (upstream).
   - Tiêu đề PR tuân theo cấu trúc: `<type>(<scope>): <tóm tắt ngắn gọn thay đổi>`
   - Mô tả PR (PR Description) chi tiết: Nêu rõ các thay đổi đã thực hiện, tầm ảnh hưởng và đính kèm hình ảnh/video minh họa nếu cần.
7. Chờ code reviewer phê duyệt (approve), phản hồi và giải quyết các yêu cầu thay đổi (nếu có) trước khi PR được merge.
