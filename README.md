<div align="center">

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-black.svg">
    <img src="assets/logo.svg" alt="Evidentia Logo" width="120" height="120">
  </picture>
</p>

# Evidentia

**Hệ thống trợ lý đa tác tử thông minh chuyên sâu Pháp luật Việt Nam**

🇻🇳 Tiếng Việt | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 [English](README.en.md)

</div>

---

## 1. Giới thiệu tổng quan

Evidentia là nền tảng trợ lý pháp lý ứng dụng kiến trúc đa tác tử kết hợp Đồ thị tri thức và kỹ thuật GraphRAG, được thiết kế chuyên sâu cho hệ thống văn bản quy phạm pháp luật Việt Nam.

Trong bối cảnh pháp lý, việc ứng dụng trực tiếp các mô hình ngôn ngữ lớn thường bộc lộ những rào cản kỹ thuật cơ bản:
- Nguy cơ sinh ảo giác, đưa ra căn cứ pháp lý sai lệch hoặc viện dẫn các điều khoản không có thực.
- Khó kiểm soát mạng lưới văn bản quy phạm pháp luật chằng chéo với nhiều tầng quan hệ: sửa đổi, bổ sung, thay thế, bãi bỏ và hướng dẫn thi hành.
- Khó bảo đảm khả năng kiểm chứng và trích dẫn chuẩn xác đến từng Điều, Khoản, Điểm gắn liền với văn bản còn hiệu lực thi hành.

Evidentia khắc phục các hạn chế này bằng cách tích hợp đồ thị tri thức pháp lý vào quy trình suy luận đa tác tử, đảm bảo mọi phản hồi đều có căn cứ vững chắc, đúng quy định hiện hành và có thể kiểm chứng nguồn gốc.

## 2. Các định hướng và tính năng dự kiến

Evidentia được thiết kế phục vụ công tác nghiên cứu, tra cứu và hỗ trợ tư vấn pháp luật với các nhóm tính năng chính:

### Quy trình điều phối đa tác tử
- Phân tích và phân rã truy vấn: Tách các tình huống pháp lý phức tạp thành các vấn đề độc lập để xử lý song song.
- Định tuyến truy xuất chuyên biệt: Phân bổ yêu cầu tra cứu tới đúng phân vùng dữ liệu và cơ chế tìm kiếm phù hợp.
- Tổng hợp và đối soát căn cứ: Kiểm tra chéo điều kiện áp dụng, đối chiếu tình trạng hiệu lực và xây dựng lập luận pháp lý chặt chẽ.

### Đồ thị tri thức pháp lý và GraphRAG
- Mô hình hóa thứ bậc hiệu lực trong hệ thống văn bản quy phạm pháp luật gồm Hiến pháp, Bộ luật, Luật, Nghị định và Thông tư.
- Quản lý chặt chẽ mạng lưới quan hệ liên văn bản: sửa đổi, bổ sung, thay thế, bãi bỏ, đình chỉ hiệu lực và hướng dẫn thi hành.

### Cơ chế truy xuất kết hợp
- Tích hợp tìm kiếm ngữ nghĩa theo vector, tìm kiếm từ khóa chính xác qua BM25 và duyệt liên kết trên đồ thị tri thức nhằm tối ưu đồng thời độ phủ lẫn độ chuẩn xác của tài liệu viện dẫn.

### Dẫn chứng minh bạch đến cấp độ điều khoản
- Mọi luận điểm trong câu trả lời đều gắn liền với căn cứ pháp lý cụ thể: tên văn bản, số ký hiệu, ngày ban hành cùng Điều, Khoản, Điểm tương ứng.

### Tra cứu và theo dõi văn bản pháp luật
- Cung cấp giao diện tra cứu trực quan, hỗ trợ xem cây mục lục cấu trúc, biểu đồ quan hệ hiệu lực và trạng thái áp dụng theo thời gian thực.

### Hỏi đáp và hỗ trợ thủ tục pháp lý
- Hỗ trợ làm rõ quy định, tra cứu trình tự thủ tục hành chính và gợi ý căn cứ áp dụng cho người dân, doanh nghiệp và người làm công tác pháp luật.

## 3. Đăng ký trải nghiệm sớm

Hệ thống hiện đang trong giai đoạn hoàn thiện để chuẩn bị cho đợt thử nghiệm diện rộng.

Người quan tâm có thể đăng ký nhận thông báo tại cổng thông tin chính thức:

[https://evidentia.io.vn](https://evidentia.io.vn)

<p align="center">
  <img src="assets/early-access-preview.png" alt="Evidentia Early Access Preview" width="850">
</p>

## 4. Tình trạng mã nguồn

Toàn bộ mã nguồn, dữ liệu huấn luyện và hạ tầng dịch vụ của Evidentia hiện được quản lý trong kho lưu trữ nội bộ phục vụ công tác nghiên cứu và phát triển.

Kho lưu trữ GitHub này đóng vai trò là cổng thông tin chính thức, cung cấp tài liệu kỹ thuật tổng quan và cập nhật tiến độ phát hành của dự án.

---

## Liên hệ

- Cổng thông tin: [https://evidentia.io.vn](https://evidentia.io.vn)
- Đơn vị nghiên cứu: NLP & KD Lab
- Quản trị dự án: Victor Nguyen ([VictorNguyenLPN](https://github.com/VictorNguyenLPN))
