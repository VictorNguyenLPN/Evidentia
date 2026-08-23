## Entry Test

- Số lượng: 20 câu
- Điểm: 100 (5đ/câu)
- Thời gian: 60 Phút
- Độ khó: Dễ, Trung bình, Nâng cao

| #  | Chủ đề                      |
| -- | --------------------------- |
| 1  | Toán / Logic                |
| 2  | Xác suất                    |
| 3  | Thống kê                    |
| 4  | Đại số tuyến tính           |
| 5  | Machine Learning            |
| 6  | Loss / Optimization         |
| 7  | Deep Learning               |
| 8  | NLP / Embedding             |
| 9  | Information Retrieval       |
| 10 | RAG                         |
| 11 | RAG Evaluation              |
| 12 | Chunking / Retrieval        |
| 13 | Hallucination               |
| 14 | Agent                       |
| 15 | Agentic RAG                 |
| 16 | Legal RAG                   |
| 17 | Temporal / Updating         |
| 18 | Research Thinking           |
| 19 | System Design               |
| 20 | Attitude / Research mindset |

---

### 1. Toán / Logic

Một mô hình dự đoán có xác suất đúng 80% trên mỗi câu hỏi. Nếu mô hình trả lời 5 câu độc lập, xác suất nó trả lời đúng ít nhất 4 câu là bao nhiêu?

Cho biết công thức phân phối nhị thức (Binomial Distribution):
$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k} = \frac{n!}{k!(n-k)!} p^k (1-p)^{n-k}$$

> Yêu cầu: trình bày từng bước cách tính

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Gọi $X$ là số câu trả lời đúng trong $n = 5$ câu hỏi độc lập.
* Do các câu độc lập và xác suất đúng mỗi câu là cố định $p = 0.8$ (suy ra xác suất sai $q = 1 - p = 0.2$), biến ngẫu nhiên $X$ tuân theo phân phối nhị thức: $X \sim \text{Binomial}(n=5, p=0.8)$.
* Áp dụng công thức phân phối nhị thức:
  $$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$
* Xác suất mô hình trả lời đúng ít nhất 4 câu là:
  $$P(X \ge 4) = P(X = 4) + P(X = 5)$$
* Tính từng thành phần:
  * $P(X = 4) = \binom{5}{4} (0.8)^4 (0.2)^1 = 5 \times 0.4096 \times 0.2 = 0.4096 \quad (40.96\%)$
  * $P(X = 5) = \binom{5}{5} (0.8)^5 (0.2)^0 = 1 \times 0.32768 \times 1 = 0.32768 \quad (32.768\%)$
* Tổng xác suất:
  $$P(X \ge 4) = 0.4096 + 0.32768 = 0.73728 \quad (\approx 73.73\%)$$

2. Tiêu chí chấm:
* 2.0đ: Xác định đúng biến ngẫu nhiên, các tham số ($n=5, p=0.8, q=0.2$) và thiết lập đúng $P(X \ge 4) = P(X = 4) + P(X = 5)$.
* 2.0đ: Thay số và tính đúng các xác suất thành phần ($P(X=4) = 0.4096$ và $P(X=5) = 0.32768$).
* 1.0đ: Đưa ra kết quả cuối cùng chính xác: $0.73728$ (hoặc $73.728\% / \approx 73.73\%$).

---

### 2. Xác suất

Một hệ thống RAG có:

* Xác suất retriever tìm được document chứa thông tin cần thiết: 0.8
* Khi đã tìm được document đúng, xác suất LLM sử dụng đúng thông tin đó: 0.9

Giả sử hai sự kiện này độc lập, xác suất hệ thống trả lời đúng là bao nhiêu?

Cho biết quy tắc nhân xác suất cho hai sự kiện độc lập $A$ và $B$:
$$P(A \cap B) = P(A) \cdot P(B)$$
và công thức tổng quát với xác suất có điều kiện:
$$P(A \cap B) = P(A) \cdot P(B \mid A)$$

Câu hỏi phụ: Trong hệ thống thực tế, giả định “độc lập” này có hợp lý không? Vì sao?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Tính toán xác suất:
  * Gọi $A$ là biến cố "Retriever tìm đúng document" $\Rightarrow P(A) = 0.8$.
  * Gọi $B$ là biến cố "LLM sử dụng đúng thông tin và trả lời đúng" với điều kiện đã có document đúng $\Rightarrow P(B|A) = 0.9$.
  * Với giả thiết của đề bài, xác suất hệ thống trả lời đúng là:
    $$P(\text{Correct}) = P(A \cap B) = P(A) \times P(B|A) = 0.8 \times 0.9 = 0.72 \quad (72\%)$$
* Trả lời câu hỏi phụ:
  * Giả định độc lập này KHÔNG hoàn toàn hợp lý trong thực tế vì các lý do:
    1. Độ khó/Mơ hồ của Query (Query Complexity & Ambiguity): Với những câu hỏi khó, phức tạp hoặc mơ hồ, cả Retriever lẫn LLM Generator đều có xu hướng dễ thất bại cùng lúc (correlated failure modes).
    2. Chất lượng và Độ nhiễu của Context (Context Noise & Fragmentation): Khi Retriever lấy về tài liệu đúng một phần nhưng bị phân mảnh, lẫn tạp âm hoặc thông tin mâu thuẫn, LLM sẽ khó tổng hợp hơn nhiều và dễ bị hallucination/distraction.
    3. Parametric Bias của LLM: LLM có thể tự trả lời đúng nhờ kiến thức tiền huấn luyện (parametric memory) dù Retriever tìm sai; ngược lại, Retriever lấy đúng nhưng LLM vẫn có thể bịa đặt do định kiến nội tại.

2. Tiêu chí chấm:
* 2.0đ: Tính đúng xác suất hệ thống $0.72$ ($72\%$).
* 3.0đ: Trả lời đúng câu hỏi phụ (khẳng định không thực tế và phân tích được ít nhất 2 lý do hợp lý như query complexity, context noise, parametric bias).

---

### 3. Thống kê

Bạn đánh giá hai hệ thống RAG trên cùng một benchmark:

* Model A: Accuracy = 82%
* Model B: Accuracy = 84%

Bạn có thể kết luận B tốt hơn A không?

Hãy nêu ít nhất 2 lý do tại sao sự khác biệt 2% có thể chưa đủ để kết luận.

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Kết luận: CHƯA THỂ KẾT LUẬN Model B tốt hơn Model A một cách chắc chắn chỉ dựa trên chênh lệch 2% accuracy.
* Các lý do (nêu tối thiểu 2 trong các lý do sau):
  1. Kích thước mẫu & Ý nghĩa thống kê (Sample Size & Statistical Significance): Nếu tập test nhỏ (ví dụ $N = 100$, 2% chỉ tương đương 2 câu hỏi), sự khác biệt có thể hoàn toàn do nhiễu ngẫu nhiên trong chọn mẫu (sampling noise). Cần thực hiện kiểm định giả thuyết thống kê (Statistical Significance Test như McNemar's test, Paired t-test hoặc Bootstrap hypothesis testing) để xác nhận $p$-value $< 0.05$.
  2. Tính bất định của LLM (LLM Generation Variance): LLM sinh chuỗi có tính ngẫu nhiên (temperature $> 0$), cùng một mô hình chạy qua các seed khác nhau có thể biến thiên từ $1-3\%$. Cần báo cáo kết quả trung bình và độ lệch chuẩn ($\text{Mean} \pm \text{Std}$) qua nhiều lần chạy (multiple runs).
  3. Phân phối lỗi và Độ nghiêm trọng (Error Distribution & Severity): Accuracy tổng thể có thể che giấu các lỗi nghiêm trọng. Model B có thể đúng hơn ở các câu hỏi dễ nhưng lại sai ở các câu hỏi cốt lõi, hoặc sinh ra các lỗi hallucination nguy hiểm hơn Model A.
  4. Nhiễu từ bộ đánh giá (Evaluation Noise): Nếu sử dụng LLM-as-a-judge hoặc rule-based matching, bản thân bộ đánh giá cũng có sai số và độ lệch (evaluator bias/variance).

2. Tiêu chí chấm:
* 1.0đ: Đưa ra kết luận chính xác ("Chưa thể kết luận").
* 4.0đ: Trình bày rõ ràng ít nhất 2 lý do khoa học chuẩn mực (2.0đ cho mỗi lý do hợp lý).

---

### 4. Đại số tuyến tính

Cho hai embedding:

$$
A=(1,2,3),\qquad B=(2,1,3)
$$

Cho biết công thức Cosine Similarity và khoảng cách Euclidean giữa hai vector $A, B \in \mathbb{R}^n$:
$$\text{Cosine}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \cdot \sqrt{\sum_{i=1}^n B_i^2}}$$
$$d_{\text{Euclidean}}(A, B) = \|A - B\|_2 = \sqrt{\sum_{i=1}^n (A_i - B_i)^2}$$

1. Tính cosine similarity giữa A và B.
2. Cosine similarity dùng để đo điều gì trong embedding-based retrieval?
3. Vì sao cosine similarity có thể phù hợp hơn Euclidean distance trong một số bài toán embedding?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
1. Tính Cosine Similarity:
   * Tích vô hướng (Dot Product):
     $$A \cdot B = (1 \times 2) + (2 \times 1) + (3 \times 3) = 2 + 2 + 9 = 13$$
   * Độ dài vector (Norms):
     $$\|A\| = \sqrt{1^2 + 2^2 + 3^2} = \sqrt{1 + 4 + 9} = \sqrt{14}$$
     $$\|B\| = \sqrt{2^2 + 1^2 + 3^2} = \sqrt{4 + 1 + 9} = \sqrt{14}$$
   * Cosine Similarity:
     $$\text{Cosine}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{13}{\sqrt{14} \times \sqrt{14}} = \frac{13}{14} \approx 0.9286$$
2. Ý nghĩa trong embedding-based retrieval:
   * Đo góc giữa hai vector, đại diện cho sự tương đồng về mặt hướng / định hướng ngữ nghĩa (semantic direction / orientation) giữa query và document trong không gian tiềm ẩn, bỏ qua sự khác biệt về độ lớn (magnitude/norm) của vector.
3. Vì sao phù hợp hơn Euclidean Distance:
   * Euclidean distance phụ thuộc trực tiếp vào độ lớn vector ($\|A - B\|$). Trong NLP, độ dài vector embedding thường bị ảnh hưởng bởi độ dài đoạn văn (document length), tần suất xuất hiện từ hoặc thuộc tính mô hình. Hai đoạn văn cùng nói về một nội dung nhưng một đoạn ngắn, một đoạn dài có thể có khoảng cách Euclidean lớn.
   * Cosine similarity đã được chuẩn hóa độ dài (length-normalized), giúp hệ thống tập trung hoàn toàn vào nội dung ngữ nghĩa mà không bị thiên lệch bởi độ dài tài liệu.

2. Tiêu chí chấm:
* 2.0đ: Tính đúng Cosine Similarity ra $\frac{13}{14} \approx 0.9286$ kèm đầy đủ các bước tính tích vô hướng và độ dài.
* 1.5đ: Nêu đúng ý nghĩa của Cosine Similarity (đo góc/hướng ngữ nghĩa).
* 1.5đ: Phân tích đúng ưu điểm của Cosine Similarity so với Euclidean Distance (khắc phục độ lệch do độ dài văn bản / norm vector).

---

### 5. Machine Learning

Phân biệt:

* Training set
* Validation set
* Test set

Nếu một nhóm nghiên cứu dùng test set để lựa chọn hyperparameter, vấn đề gì sẽ xảy ra?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Phân biệt 3 tập dữ liệu:
  * Training set (Tập huấn luyện): Dữ liệu được mô hình trực tiếp sử dụng để học và cập nhật các trọng số nội tại (weights/parameters) thông qua thuật toán tối ưu (Backpropagation / Gradient Descent).
  * Validation set / Dev set (Tập kiểm định): Dữ liệu độc lập với training set, dùng để đánh giá mô hình trong quá trình huấn luyện nhằm điều chỉnh siêu tham số (hyperparameters: learning rate, chunk size, top-$k$, số layers,...), lựa chọn checkpoint tốt nhất và thực hiện Early Stopping.
  * Test set (Tập kiểm thử): Dữ liệu độc lập hoàn toàn, chỉ được sử dụng duy nhất một lần ở bước cuối cùng để đánh giá khách quan khả năng tổng quát hóa (generalization) của mô hình cuối cùng trên dữ liệu thực tế chưa từng thấy.
* Vấn đề khi dùng Test set để chọn Hyperparameter:
  * Gây ra hiện tượng Rò rỉ dữ liệu (Data Leakage / Data Snooping) và Overfitting trên tập Test.
  * Siêu tham số được chọn sẽ bị "học vẹt" hoặc tối ưu riêng cho tập test đó. Kết quả đánh giá trên test set sẽ bị thiên vị lạc quan (optimistically biased), dẫn đến điểm số báo cáo trong nghiên cứu rất cao nhưng hệ thống sẽ hoạt động kém khi triển khai thực tế (poor real-world generalization).

2. Tiêu chí chấm:
* 3.0đ: Phân biệt chính xác chức năng của 3 tập (1.0đ cho mỗi tập: Training, Validation, Test).
* 2.0đ: Chỉ ra đúng hiện tượng Data Leakage / Overfitting trên Test set và giải thích hậu quả (kết quả đánh giá sai lệch, mất khả năng tổng quát hóa).

---

### 6. Loss & Optimization

Một mô hình có training loss giảm liên tục:

```text
Epoch 1: 0.82
Epoch 2: 0.61
Epoch 3: 0.43
Epoch 4: 0.31
Epoch 5: 0.21
```

nhưng validation loss:

```text
Epoch 1: 0.85
Epoch 2: 0.63
Epoch 3: 0.57
Epoch 4: 0.71
Epoch 5: 0.93
```

Hiện tượng gì đang xảy ra?

Bạn sẽ xử lý như thế nào?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Hiện tượng đang xảy ra: Overfitting (Quá khớp).
  * Mô hình bắt đầu học thuộc lòng nhiễu và đặc trưng riêng biệt của tập training thay vì học các quy luật tổng quát. Điểm tối ưu đạt được tại Epoch 3 (Validation loss thấp nhất = 0.57). Từ Epoch 4 trở đi, dù Training loss tiếp tục giảm sâu (0.31 $\to$ 0.21) nhưng Validation loss lại tăng vọt (0.71 $\to$ 0.93).
* Cách xử lý (nêu ít nhất 3-4 giải pháp cụ thể):
  1. Early Stopping: Dừng quá trình huấn luyện khi Validation loss bắt đầu tăng sau một số epoch (patience) và khôi phục checkpoint tốt nhất tại Epoch 3.
  2. Regularization (Chính quy hóa): Áp dụng $L_2$ Regularization (Weight Decay), Dropout trong mạng neural để giảm thiểu việc mô hình dựa quá mức vào một số trọng số lớn.
  3. Thu thập thêm dữ liệu & Data Augmentation: Bổ sung dữ liệu hoặc tạo dữ liệu tăng cường để mô hình học được phân phối tổng quát hơn.
  4. Giảm độ phức tạp mô hình (Reduce Model Capacity): Giảm bớt số lượng layers, hidden dimensions hoặc số parameters.
  5. Điều chỉnh Learning Rate / LR Scheduler: Giảm learning rate hoặc dùng Cosine Annealing để bước nhảy tối ưu mượt mà hơn.

2. Tiêu chí chấm:
* 2.0đ: Xác định chính xác hiện tượng Overfitting và chỉ ra điểm bùng phát sau Epoch 3.
* 3.0đ: Đề xuất ít nhất 3 phương pháp xử lý chuẩn xác, khả thi trong thực tế (Early stopping, Regularization, Data augmentation, Model capacity, LR scheduling).

---

### 7. Deep Learning

Cho biết công thức Scaled Dot-Product Attention trong Transformer:
$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Dựa vào ý tưởng trên, giải thích ngắn gọn tại sao Transformer sử dụng attention mechanism thay vì chỉ sử dụng RNN/LSTM để xử lý chuỗi (tập trung vào ý tưởng chính, không cần chứng minh lại công thức toán).

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Hạn chế của RNN/LSTM:
  1. Nút thắt xử lý tuần tự (Sequential Bottleneck): RNN/LSTM bắt buộc phải tính toán tuần tự từ từ đầu đến từ cuối ($h_t$ phụ thuộc $h_{t-1}$), không thể song song hóa hiệu quả trên GPU, khiến việc huấn luyện trên văn bản dài rất chậm.
  2. Mất mát thông tin tầm xa (Information Bottleneck & Long-range Dependencies): Toàn bộ ngữ cảnh của câu dài bị nén vào một hidden state có kích thước cố định, dẫn đến hiện tượng quên thông tin ở đầu câu và triệt tiêu đạo hàm (vanishing gradient).
* Ý tưởng chính của Attention (Self-Attention) trong Transformer:
  1. Kết nối trực tiếp giữa mọi vị trí (Direct $O(1)$ Connection): Mỗi từ trong chuỗi có thể "chú ý" trực tiếp đến tất cả các từ khác trong toàn bộ văn bản bất kể khoảng cách, thông qua cơ chế so khớp Query (yêu cầu tìm kiếm) với Key (chỉ mục đặc trưng) để lấy tổng có trọng số của Value (nội dung thông tin).
  2. Song song hóa tối đa (Full Parallelization): Toàn bộ ma trận chuỗi được tính toán đồng thời trên phần cứng hiện đại.
  3. Biểu diễn ngữ cảnh động (Context-aware Dynamic Representation): Vector biểu diễn của một từ được cập nhật linh hoạt dựa trên mức độ liên quan ngữ nghĩa với các từ xung quanh.

2. Tiêu chí chấm:
* 2.5đ: Phân tích rõ 2 hạn chế cơ bản của RNN/LSTM (tính tuần tự không song song được và vấn đề nén thông tin tầm xa).
* 2.5đ: Giải thích rõ ý tưởng cốt lõi của Attention (kết nối trực tiếp mọi vị trí, cơ chế Query-Key-Value, xử lý song song, ngữ cảnh hóa vector).

---

### 8. NLP / Embedding

Hai câu:

> A. “The company terminated the employee.”

> B. “The employee was dismissed by the company.”

Nếu sử dụng sentence embedding, ta kỳ vọng embedding của A và B gần hay xa nhau?

Tại sao?

Câu hỏi phụ: Nếu hai câu có từ vựng rất khác nhau nhưng cùng ý nghĩa, phương pháp embedding nào có lợi thế hơn so với keyword matching?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Kỳ vọng: Embedding của câu A và câu B sẽ RẤT GẦN NHAU (Cosine similarity cao, tiệm cận 1).
* Giải thích lý do:
  * Mặc dù cấu trúc ngữ pháp khác nhau (Câu A là thể chủ động, Câu B là thể bị động) và từ vựng khác nhau ("terminated" vs "dismissed by"), hai câu có ngữ nghĩa tương đương hoàn toàn (semantic equivalence / paraphrase).
  * Các mô hình Sentence Embedding hiện đại (như SBERT, OpenAI text-embedding, BGE) được huấn luyện bằng cơ chế Contrastive Learning trên các cặp câu đồng nghĩa để kéo gần vector biểu diễn của các câu có cùng ý nghĩa trong không gian tiềm ẩn (latent semantic space).
* Trả lời câu hỏi phụ:
  * Dense Semantic Embedding (Sentence Bi-Encoders / Dense Retrieval) có lợi thế vượt trội hoàn toàn so với Keyword Matching (BM25, TF-IDF).
  * *Lý do:* Keyword matching chỉ đếm sự trùng lặp từ ngữ bề mặt (lexical overlap); khi hai câu dùng từ đồng nghĩa hoàn toàn khác nhau ("terminated" vs "dismissed"), điểm tương đồng từ khóa sẽ bằng 0. Trong khi đó, Dense Embedding ánh xạ ngữ nghĩa vào không gian vector liên tục, giúp nhận diện được từ đồng nghĩa, ngữ cảnh và các cách diễn đạt tương đương.

2. Tiêu chí chấm:
* 1.5đ: Khẳng định đúng kỳ vọng ("Rất gần nhau").
* 1.5đ: Giải thích thỏa đáng dựa trên bản chất ngữ nghĩa tương đương và cơ chế biểu diễn vector câu.
* 2.0đ: Trả lời đúng câu hỏi phụ (nêu rõ Dense Embedding và phân tích hạn chế của lexical overlap trong keyword matching).

---

### 9. Information Retrieval

Một search engine trả về:

```text
Query: "thời hạn hiệu lực của Luật X"

Top-5:
1. Luật X
2. Nghị định hướng dẫn Luật X
3. Luật Y
4. Bài viết giải thích Luật X
5. Luật X sửa đổi
```

Bạn sẽ dùng những metric nào để đánh giá hệ thống retrieval?

Cho biết công thức của các metrics:
* $\text{Recall@}k = \frac{|\text{Retrieved}_k \cap \text{Relevant}|}{|\text{Relevant}|}$
* $\text{MRR@}k = \frac{1}{|Q|} \sum_{i=1}^{|Q|} \frac{1}{\text{rank}_i}$ (với $\text{rank}_i$ là vị trí của tài liệu liên quan đầu tiên trong top-$k$)
* $\text{nDCG@}k = \frac{\text{DCG@}k}{\text{IDCG@}k}$ trong đó $\text{DCG@}k = \sum_{i=1}^k \frac{2^{\text{rel}_i} - 1}{\log_2(i + 1)}$

Dựa vào các công thức trên, hãy giải thích sự khác nhau giữa Recall@k, MRR@k và nDCG@k.

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Các metric đánh giá hệ thống retrieval:
  * Recall@k, Precision@k, Mean Reciprocal Rank (MRR@k), Normalized Discounted Cumulative Gain (nDCG@k), Mean Average Precision (MAP@k), Hit Rate@k.
* Sự khác nhau giữa 3 metric cốt lõi:
  1. Recall@k:
     * *Định nghĩa:* Đo tỷ lệ tài liệu liên quan được tìm thấy trong Top-$k$ so với TỔNG SỐ tài liệu liên quan thực tế có trong toàn bộ cơ sở dữ liệu.
     * *Đặc trưng:* Dùng nhãn nhị phân (Binary: 0 hoặc 1). Không quan tâm đến thứ tự của các tài liệu trong Top-$k$ (chỉ cần xuất hiện là được tính).
  2. MRR@k (Mean Reciprocal Rank):
     * *Định nghĩa:* Đo vị trí (rank) của tài liệu liên quan ĐẦU TIÊN xuất hiện trong danh sách Top-$k$, tính bằng công thức $\text{RR} = \frac{1}{\text{rank}_1}$ (và lấy trung bình trên tập truy vấn).
     * *Đặc trưng:* Phù hợp với bài toán Factoid QA hoặc Search dạng tra cứu nhanh, nơi người dùng chỉ cần tìm thấy 1 kết quả đúng đầu tiên càng sớm càng tốt; các tài liệu đúng đứng sau vị trí đầu tiên không làm tăng điểm số.
  3. nDCG@k (Normalized Discounted Cumulative Gain):
     * *Định nghĩa:* Đo chất lượng toàn bộ danh sách xếp hạng Top-$k$, hỗ trợ mức độ liên quan nhiều cấp độ (Graded Relevance: ví dụ 0 = không liên quan, 1 = liên quan một phần, 2 = rất liên quan, 3 = hoàn hảo) và áp dụng hệ số phạt giảm dần theo logarit của vị trí rank ($\text{Discount} = \frac{1}{\log_2(\text{rank} + 1)}$). Sau đó chuẩn hóa với thứ hạng lý tưởng (IDCG).
     * *Đặc trưng:* Phù hợp nhất khi các tài liệu có mức độ giá trị khác nhau và tài liệu quan trọng nhất bắt buộc phải đứng ở vị trí cao nhất.

2. Tiêu chí chấm:
* 1.0đ: Liệt kê đầy đủ các metric retrieval tiêu chuẩn.
* 4.0đ: Phân biệt chính xác, sâu sắc 3 metric (Recall@k không xét thứ hạng, MRR@k chỉ xét vị trí kết quả đúng đầu tiên, nDCG@k xét toàn bộ thứ hạng kèm mức độ liên quan phân cấp).

---

### 10. RAG cơ bản

Hãy mô tả pipeline của một hệ thống RAG cơ bản từ lúc user nhập:

> “Điều kiện để được hưởng trợ cấp thất nghiệp là gì?”

cho tới khi hệ thống tạo câu trả lời.

Bạn nên đề cập tối thiểu:

query -> retrieval -> context -> generation

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
Quy trình pipeline RAG cơ bản gồm 4 giai đoạn nối tiếp:

```text
[User Query] ──> [1. Query Embedding] ──> [2. Vector Retrieval (ANN Search)]
                                                         │
[Final Answer] <── [4. LLM Generation] <── [3. Context Augmentation & Prompt]
```

1. Giai đoạn 1: Xử lý Query (Query Embedding):
   * Hệ thống nhận câu hỏi: *“Điều kiện để được hưởng trợ cấp thất nghiệp là gì?”*.
   * Tiền xử lý (chuẩn hóa câu) và đưa qua Embedding Model để tạo vector biểu diễn ngữ nghĩa $v_q \in \mathbb{R}^d$.
2. Giai đoạn 2: Truy hồi tài liệu (Retrieval & Filtering):
   * Vector $v_q$ được đưa vào Vector Database (Milvus, Qdrant, FAISS) để tính toán độ tương đồng (Cosine Similarity / Dot Product) với các chunks văn bản pháp luật đã index.
   * Trích xuất Top-$k$ chunks có độ tương đồng cao nhất (chứa các điều khoản về bảo hiểm thất nghiệp trong Luật Việc làm).
   * *(Tùy chọn)*: Qua Reranker (Cross-Encoder) để tái xếp hạng chính xác Top 3-5 chunks liên quan nhất.
3. Giai đoạn 3: Đóng gói Ngữ cảnh (Context Augmentation & Prompt Construction):
   * Trích xuất nội dung văn bản và metadata (Tên luật, Điều, Khoản) từ các chunks đã chọn.
   * Ghép vào Prompt Template hoàn chỉnh:
     * *System Prompt:* Quy định vai trò trợ lý pháp lý, yêu cầu chỉ trả lời dựa trên context được cấp, dẫn nguồn điều khoản, không bịa đặt.
     * *Context:* Toàn bộ các đoạn trích luật vừa tìm được.
     * *User Query:* Câu hỏi gốc của người dùng.
4. Giai đoạn 4: Sinh câu trả lời (Generation):
   * Gửi Prompt hoàn chỉnh tới LLM (GPT-4, Claude, Gemini, Qwen,...).
   * LLM đọc hiểu context, tổng hợp các điều kiện pháp lý (chấm dứt HĐLĐ, đã đóng BHTN đủ thời gian, đã nộp hồ sơ đúng hạn, chưa tìm được việc làm) và sinh câu trả lời rõ ràng kèm trích dẫn (ví dụ: *Theo Điều 49 Luật Việc làm 2013...*).

2. Tiêu chí chấm:
* 1.0đ: Trình bày đúng bước Query Embedding và tiền xử lý.
* 1.5đ: Trình bày đúng bước Retrieval (Vector database, ANN search, similarity metric, top-$k$, rerank).
* 1.0đ: Trình bày đúng cách xây dựng Context và đóng gói Prompt hoàn chỉnh.
* 1.5đ: Trình bày đúng bước Generation và câu trả lời đầu ra có trích dẫn điều khoản.

---

### 11. RAG Evaluation

Một RAG system có kết quả:

| Metric             | Score |
| ------------------ | ----: |
| Retrieval Recall@5 |   95% |
| Answer Accuracy    |   72% |
| Hallucination Rate |   18% |

Retriever có vẻ rất tốt nhưng answer accuracy vẫn thấp.

Bạn sẽ kiểm tra những thành phần nào để tìm nguyên nhân?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
Mặc dù Retrieval Recall@5 đạt 95% nhưng Answer Accuracy chỉ đạt 72% và Hallucination Rate lên tới 18%. Cần kiểm tra có hệ thống các thành phần sau để xác định điểm nghẽn:

1. Chiến lược Chunking & Ngữ cảnh phân mảnh (Chunking Strategy & Fragmentation):
   * *Hiện tượng:* Chunk quá nhỏ hoặc bị cắt đứt giữa câu khiến thông tin bị thiếu vế loại trừ/điều kiện áp dụng ("trừ trường hợp..."), hoặc mất tiêu đề Chương/Điều dẫn đến LLM suy diễn sai.
2. Hiện tượng "Lost in the Middle" & Nhiễu trong Context (Context Noise & Distractors):
   * *Hiện tượng:* Dù tài liệu đúng nằm trong Top 5, nhưng nó nằm ở vị trí giữa (rank 3, 4) bị bao vây bởi các đoạn không liên quan. LLM thường chú ý mạnh vào đầu và cuối prompt, bỏ quên thông tin ở giữa hoặc bị phân tâm bởi các đoạn gây nhiễu.
3. Prompt Engineering & Ràng buộc Grounding (Prompt Grounding Constraints):
   * *Hiện tượng:* System prompt chưa đủ nghiêm ngặt, thiếu chỉ thị cấm bịa đặt (*"Chỉ trả lời dựa trên CONTEXT được cung cấp, nếu không đủ thông tin thì nêu rõ chưa đủ dữ liệu"*).
4. Định kiến Parametric của LLM (Parametric Bias vs Context Conflict):
   * *Hiện tượng:* LLM ưu tiên sử dụng kiến thức tiền huấn luyện (parametric memory) hơn là thông tin trong context, đặc biệt khi context mâu thuẫn nhẹ với dữ liệu pre-train.
5. Năng lực suy luận & Cấu hình LLM (LLM Capacity & Generation Parameters):
   * *Hiện tượng:* Model đang dùng có năng lực reasoning yếu hoặc thiết lập `temperature` quá cao dẫn tới việc sinh từ ngẫu nhiên.
6. Chất lượng của Bộ đánh giá & Ground Truth (Evaluation / Benchmark Quality):
   * *Hiện tượng:* Bộ ground truth có thể bị sai nhãn, hoặc evaluator (nếu dùng LLM-as-a-judge) chấm điểm quá khắt khe / chấm sai ngữ nghĩa.

2. Tiêu chí chấm:
* 5.0đ: Nêu và phân tích sâu sắc ít nhất 4 nhóm nguyên nhân cụ thể ở các tầng khác nhau (Chunking/Fragmentation, Context Noise/Lost in the Middle, Prompting/Grounding, Parametric Bias/LLM Capacity, Benchmark Quality). Mỗi nhóm nguyên nhân 1.25đ.

---

### 12. Chunking

Bạn cần xây dựng RAG cho văn bản pháp luật Việt Nam.

Một văn bản có cấu trúc:

```text
Chương I
    Điều 1
    Điều 2
Chương II
    Điều 3
    Điều 4
        Khoản 1
        Khoản 2
            Điểm a
            Điểm b
```

Bạn sẽ chunk văn bản như thế nào?

Tại sao không đơn giản chia mỗi 500 tokens một chunk?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Chiến lược chunking đề xuất cho văn bản luật:
  1. Hierarchical / Structure-Aware Chunking (Chunking theo cấu trúc phân cấp pháp lý):
     * Đơn vị chunk chuẩn tự nhiên trong văn bản pháp luật là cấp Điều (Article).
     * Nếu một Điều quá dài (> 800–1000 tokens) hoặc chứa nhiều quy định độc lập, tách thành cấp Khoản (Clause).
     * Tuyệt đối không tách rời cấp Điểm (Point) ra khỏi Khoản chứa nó, vì Điểm chỉ là liệt kê thành phần điều kiện của Khoản.
  2. Bảo tồn Breadcrumb & Metadata trong từng Chunk:
     * Mỗi chunk bắt buộc phải được gắn kèm cây phân cấp (breadcrumb header) và metadata:
       ```text
       [Văn bản: Luật Doanh nghiệp 2020 | Số: 59/2020/QH14]
       [Chương II: Thành lập doanh nghiệp]
       [Điều 17: Quyền thành lập, góp vốn, mua cổ phần...]
       [Khoản 2: Tổ chức, cá nhân sau đây không có quyền thành lập...]
       Nội dung: Điểm a, Điểm b...
       ```
* Tại sao KHÔNG NÊN chia cố định mỗi 500 tokens một chunk:
  1. Cắt đứt tính toàn vẹn ngữ nghĩa (Semantic & Logical Fragmentation): Chia 500 tokens thuần túy sẽ cắt ngang một Điều/Khoản, làm đứt đoạn giữa chủ thể áp dụng và chế tài, hoặc tách rời quy định chung khỏi điều khoản loại trừ ("trừ trường hợp quy định tại Khoản 2 Điều này..."), dẫn tới LLM hiểu sai bản chất pháp lý.
  2. Mất nguồn gốc dẫn chứng (Loss of Legal Grounding & Hierarchy): Một chunk 500 tokens nằm lưng chừng sẽ không có thông tin thuộc Luật nào, Chương nào, Điều nào, khiến LLM không thể trích dẫn chính xác điều khoản nguồn.
  3. Nhiễu ranh giới embedding (Boundary Noise): Nửa đầu chunk thuộc Điều 3, nửa sau thuộc Điều 4. Vector embedding của chunk này sẽ là sự pha trộn hỗn tạp giữa hai nội dung khác nhau, làm giảm nghiêm trọng độ chính xác của retrieval.

2. Tiêu chí chấm:
* 2.5đ: Đề xuất phương pháp chunking cấu trúc chuẩn xác (cấp Điều/Khoản, bảo toàn logic Điểm, đính kèm breadcrumb metadata).
* 2.5đ: Phân tích rõ ràng 3 lý do fixed-size chunking thất bại trong miền pháp luật (phân mảnh logic, mất nguồn trích dẫn, nhiễu embedding ranh giới).

---

### 13. Hallucination

RAG trả lời:

> “Theo Luật X, người lao động được nghỉ 15 ngày phép mỗi năm.”

Nhưng document được retrieve chỉ nói:

> “Người lao động được nghỉ 12 ngày phép mỗi năm.”

LLM đã tạo ra thông tin 15 ngày.

Theo bạn lỗi nằm chủ yếu ở:

A. Retrieval
B. Generation
C. Knowledge base
D. Có thể là nhiều thành phần

Hãy giải thích lựa chọn của bạn và cách debug.

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Lựa chọn: B. Generation (hoặc D. Có thể là nhiều thành phần nếu giải thích đầy đủ các yếu tố liên quan, nhưng lỗi trực tiếp và cốt lõi nhất là ở khâu Generation).
* Giải thích lựa chọn:
  * Document được retrieve đã chứa thông tin chính xác, đầy đủ và tường minh: *"Người lao động được nghỉ 12 ngày phép mỗi năm"*. Retriever và Knowledge Base đã hoàn thành tốt nhiệm vụ.
  * Việc LLM sinh ra con số "15 ngày" là hiện tượng Faithfulness Hallucination / Parametric Memory Intrusion: LLM đã không bám sát (unfaithful) vào context được cấp mà bị ảnh hưởng bởi tri thức tiền huấn luyện (ví dụ: nhớ nhầm quy định nghỉ phép 14-16 ngày đối với công việc nặng nhọc/độc hại, hoặc luật của quốc gia khác).
* Quy trình Debug và Khắc phục:
  1. Kiểm tra Raw Prompt gửi tới LLM: In log toàn bộ prompt thực tế gửi đến API xem đoạn text "12 ngày" có thực sự nằm trong context không (loại trừ lỗi cắt chuỗi hoặc prompt formatting).
  2. Siết chặt System Prompt (Strict Grounding Instruction):
     * Thêm chỉ thị bắt buộc: *"Chỉ sử dụng các dữ kiện có trong CONTEXT. Tuyệt đối không tự suy diễn hoặc dùng kiến thức ngoài context để thay đổi số liệu."*
  3. Hạ Temperature: Thiết lập `temperature = 0.0` để hạn chế tính ngẫu nhiên và sáng tạo của LLM khi trả lời các dữ kiện số liệu.
  4. Thêm lớp Verifier / Fact-Checking tự động:
     * Áp dụng module kiểm tra độ trung thực (Faithfulness Checker / NLI) so sánh đối chiếu trực tiếp các thực thể số (Entity/Number comparison: 15 vs 12) giữa câu trả lời và context trước khi trả về cho người dùng.

2. Tiêu chí chấm:
* 1.0đ: Chọn đúng đáp án (B hoặc D kèm lập luận chặt chẽ).
* 2.0đ: Giải thích rõ bản chất lỗi Generation (Retriever làm đúng, LLM bị can thiệp bởi parametric memory).
* 2.0đ: Trình bày quy trình debug và giải pháp khắc phục thực tế (Check raw prompt, siết prompt, temperature = 0, NLI verifier).

---

### 14. Agent

Theo bạn, điểm khác biệt quan trọng nhất giữa:

LLM + RAG

và

Agentic RAG

là gì?

Hãy đưa ra một ví dụ query mà Agentic RAG có thể xử lý tốt hơn RAG pipeline cố định.

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Điểm khác biệt quan trọng nhất:
  * LLM + RAG (Standard / Vanilla RAG): Là một pipeline tuyến tính, thụ động, 1 chiều (Single-pass & Static): `Query -> Retrieve 1 lần -> Generate`. Hệ thống không có khả năng tự đánh giá context lấy về, không thể tự phân rã bài toán, không có vòng lặp phản hồi (no feedback loop) và không tự gọi công cụ bổ trợ.
  * Agentic RAG: Là một hệ thống tự chủ, có khả năng suy luận đa bước và thích ứng động (Autonomous, Multi-step Reasoning & Adaptive Loop):
    1. Planning & Decomposition: Tự động chia nhỏ query phức tạp thành chuỗi các nhiệm vụ con.
    2. Tool Use & Dynamic Routing: Tự quyết định gọi công cụ phù hợp (Vector search, BM25, Knowledge Graph, Calculator, Temporal Validator).
    3. Reflection & Self-Correction: Tự kiểm tra xem thông tin đã đủ trả lời chưa; nếu chưa đủ hoặc mâu thuẫn, Agent tự động viết lại query (Query Rewriting) để tìm kiếm tiếp cho đến khi hoàn thành.
* Ví dụ query Agentic RAG xử lý vượt trội:
  * *Ví dụ query:* “So sánh mức đóng bảo hiểm xã hội bắt buộc của một nhân viên văn phòng và một công nhân khai thác khoáng sản hầm lò theo quy định năm 2024, và văn bản nào quy định sự khác biệt này?”
  * *Vì sao RAG cố định thất bại:* RAG cố định chỉ search 1 lần bằng toàn bộ câu hỏi dài, thường chỉ lấy được một vài chunk chung trong Luật BHXH mà bỏ sót Nghị định/Thông tư quy định về danh mục nghề nặng nhọc, độc hại, nguy hiểm.
  * *Cách Agentic RAG giải quyết:*
    1. Phân rã query thành: (a) Mức đóng BHXH chuẩn của lao động bình thường, (b) Quy định về chế độ ưu đãi/ngành nghề hầm lò, (c) Kiểm tra hiệu lực văn bản năm 2024.
    2. Thực hiện 2-3 lượt retrieval độc lập cho từng nguồn văn bản.
    3. Đối chiếu và tổng hợp câu trả lời hoàn chỉnh kèm dẫn nguồn chi tiết từng văn bản.

2. Tiêu chí chấm:
* 3.0đ: Phân biệt rõ ràng bản chất (Tuyến tính 1 lần vs Tự chủ, phân rã bài toán, gọi công cụ, phản hồi lặp multi-step).
* 2.0đ: Đưa ra ví dụ query đa bước, so sánh phức tạp và giải thích thuyết phục tại sao Agentic RAG làm tốt hơn.

---

### 15. Agentic RAG

User hỏi:

> “Luật X hiện nay còn hiệu lực không? Nếu không, văn bản nào thay thế nó? So sánh quy định về thời hạn Y giữa luật cũ và luật mới.”

Hãy thiết kế một workflow Agentic RAG để xử lý query trên.

Có thể sử dụng các bước/tool như:

```text
Search
Retrieve
Verify
Compare
Temporal reasoning
Citation
Final answer
```

Điểm quan trọng: Bạn có cho Agent tự quyết định workflow hay thiết kế một workflow cố định? Vì sao?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Thiết kế Workflow Agentic RAG:

```text
[User Query] ──> [1. Temporal & Validity Agent] ──> Status: Hết hiệu lực, Thay bởi Luật Z
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
   [2a. Retrieve Luật X (Y)]     [2b. Retrieve Luật Z (Y)]
               │                             │
               └──────────────┬──────────────┘
                              ▼
                 [3. Verify & Align Clauses]
                              ▼
                 [4. Compare / Diff Engine]
                              ▼
               [5. Citation & Final Answer]
```

  1. Bước 1 (Temporal Reasoning & Metadata Check): Gọi tool `Temporal_Reasoning_Tool(doc="Luật X", date=Today)` để tra cứu trạng thái hiệu lực $\Rightarrow$ Kết quả: *Đã hết hiệu lực, được thay thế bởi "Luật Z"*.
  2. Bước 2 (Multi-document Targeted Retrieval):
     * Gọi tool `Retrieve(doc="Luật X", topic="thời hạn Y")` $\to$ Trích xuất Điều $A$ của Luật X.
     * Gọi tool `Retrieve(doc="Luật Z", topic="thời hạn Y")` $\to$ Trích xuất Điều $B$ của Luật Z.
  3. Bước 3 (Verify & Semantic Alignment):
     * Gọi tool `Verify`: Kiểm tra xem Điều $A$ và Điều $B$ có thực sự tương ứng và cùng điều chỉnh nội dung "thời hạn Y" hay không. Nếu chưa đúng, kích hoạt loop search lại với query tinh chỉnh.
  4. Bước 4 (Compare & Diff Analysis):
     * Gọi tool `Compare(Điều A, Điều B)`: Phân tích sự thay đổi cụ thể về thời hạn (ví dụ: tăng từ 15 ngày lên 30 ngày, bổ sung điều kiện tính ngày làm việc).
  5. Bước 5 (Citation & Final Answer Generation):
     * Gọi tool `Citation`: Gắn nguồn dẫn chiếu chính xác (Tên văn bản, số hiệu, Điều, Khoản).
     * Sinh câu trả lời hoàn chỉnh gồm 3 phần: (1) Tình trạng hiệu lực Luật X, (2) Văn bản thay thế (Luật Z), (3) Bảng/đoạn so sánh thời hạn Y kèm trích dẫn.
* Điểm quan trọng: Lựa chọn Workflow tự do hay cố định:
  * Lựa chọn tối ưu: Thiết kế một Workflow có kiểm soát / Khung State Machine có nhánh linh hoạt (Constrained StateGraph như LangGraph), KHÔNG để Agent tự do hoàn toàn (Unconstrained ReAct).
  * Lý do:
    1. Tính tất định trong bài toán Pháp lý (Legal Determinism): Pháp luật là lĩnh vực rủi ro cao; việc kiểm tra hiệu lực văn bản và xác định văn bản thay thế BẮT BUỘC phải thực hiện trước khi trích xuất và so sánh.
    2. Tránh vòng lặp vô tận và trôi dạt mục tiêu (Goal Drift): Agent tự do hoàn toàn rất dễ bị lạc hướng khi đọc các văn bản luật dài, hoặc gọi tool lặp lại gây tăng token cost và độ trễ.
    3. Linh hoạt trong từng node: Trong từng bước của StateGraph (ví dụ bước Retrieve), Agent vẫn có toàn quyền tự chủ viết lại query (query rewriting) hoặc retry nếu context chưa thỏa mãn.

2. Tiêu chí chấm:
* 2.5đ: Thiết kế workflow đầy đủ, logic, kết nối chặt chẽ các công cụ (Temporal check $\to$ Multi-retrieve $\to$ Verify $\to$ Compare $\to$ Citation).
* 2.5đ: Lập luận sắc bén về việc lựa chọn Constrained StateGraph thay vì Fully Autonomous ReAct trong miền pháp luật.

---

### 16. Legal RAG

Một hệ thống tìm thấy 3 văn bản:

```text
A: Ban hành năm 2018
B: Sửa đổi A năm 2022
C: Thay thế A năm 2025
```

User hỏi:

> “Quy định tại A hiện nay có còn áp dụng không?”

Agent không được chỉ dựa vào semantic similarity.

Bạn nghĩ hệ thống cần kiểm tra những thông tin nào trước khi trả lời?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
Để xác định chính xác giá trị áp dụng của văn bản A, hệ thống bắt buộc phải kiểm tra 5 nhóm thông tin cấu trúc (metadata & legal relations):

1. Mốc thời gian truy vấn (Query Reference Time - $T_{\text{query}}$):
   * Xác định $T_{\text{query}}$ là thời điểm hiện tại hay một thời điểm cụ thể trong quá khứ (Ví dụ: Nếu vụ việc xảy ra vào năm 2023 thì vẫn áp dụng A với nội dung đã được sửa đổi bởi B).
2. Bản chất mối quan hệ pháp lý giữa các văn bản (Legal Relationship Graph):
   * Văn bản B có quan hệ "Sửa đổi, bổ sung" (Amended by) với A vào năm 2022.
   * Văn bản C có quan hệ "Thay thế hoàn toàn" (Repealed and Replaced by) đối với A vào năm 2025.
   * Khi C có hiệu lực, văn bản A (kể cả phần đã sửa đổi bởi B) chấm dứt hiệu lực thi hành.
3. Ngày có hiệu lực thi hành của văn bản mới nhất C (Effective Date of C):
   * Kiểm tra ngày C có hiệu lực so với $T_{\text{query}}$ (Lưu ý: Văn bản ban hành năm 2025 có thể có ngày hiệu lực từ 01/01/2026; nếu $T_{\text{query}}$ trước ngày có hiệu lực của C thì A vẫn đang áp dụng với nội dung sửa đổi bởi B).
4. Phạm vi áp dụng của điều khoản cụ thể (Article-level Scope & Repeal):
   * Nếu user hỏi một Điều cụ thể tại A: Kiểm tra xem Điều đó đã bị bãi bỏ từ năm 2022 bởi B hay đến năm 2025 mới hết hiệu lực theo C.
5. Điều khoản chuyển tiếp (Transitional Provisions):
   * Kiểm tra trong văn bản C có điều khoản chuyển tiếp nào cho phép tiếp tục áp dụng quy định tại A đối với các hợp đồng, thủ tục hoặc sự kiện pháp lý phát sinh trước thời điểm C có hiệu lực hay không.
6. Thứ bậc hiệu lực và Thẩm quyền ban hành (Hierarchy of Legal Norms):
   * Đảm bảo văn bản C có cơ quan ban hành có thẩm quyền tương đương hoặc cao hơn A (nguyên tắc: văn bản cấp dưới không được thay thế/bãi bỏ văn bản cấp trên).

2. Tiêu chí chấm:
* 5.0đ: Nêu và phân tích đầy đủ các thông tin cốt lõi (Mốc thời gian truy vấn, Quan hệ sửa đổi/thay thế, Ngày có hiệu lực của C, Điều khoản chuyển tiếp, Thẩm quyền/Thứ bậc văn bản). Mỗi nhóm thông tin phân tích rõ ràng đạt 1.0đ.

---

### 17. Temporal / Updating

Giả sử knowledge base được cập nhật mỗi ngày.

Ngày 1:

> “Quy định X có hiệu lực từ 01/01/2025.”

Ngày 100 xuất hiện văn bản mới:

> “Quy định X hết hiệu lực từ 01/07/2026.”

User hỏi vào ngày 18/08/2026:

> “Quy định X hiện tại thế nào?”

Bạn sẽ thiết kế metadata / retrieval / reasoning như thế nào để hệ thống không trả lại thông tin cũ?

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
Để giải quyết triệt để bài toán tri thức thay đổi theo thời gian (Temporal RAG), cần thiết kế đồng bộ ở 3 tầng:

1. Thiết kế Metadata Schema (Bi-temporal & Validity Tracking):
   * Mỗi chunk/quy định pháp luật được lưu trữ kèm các trường thời gian có cấu trúc:
     * `doc_id`, `article_id`, `content`
     * `valid_from`: `2025-01-01` (Thời điểm bắt đầu có hiệu lực)
     * `valid_to`: `2026-07-01` (Thời điểm chấm dứt hiệu lực / bãi bỏ; mặc định là `NULL` khi chưa hết hiệu lực)
     * `status`: `EXPIRED` (Được hệ thống cập nhật từ `ACTIVE` sang `EXPIRED` vào Ngày 100)
     * `superseded_by`: `Doc_ID_Mới` (Liên kết tới văn bản bãi bỏ)
     * `system_updated_at`: Ngày 100 (Transaction time trong hệ thống)
2. Thiết kế Cơ chế Truy hồi (Time-Aware Retrieval / Metadata Filtering):
   * Khi nhận câu hỏi vào ngày $T_{\text{query}} = 2026-08-18$:
     * *Bước 1 - Trích xuất thời gian:* Nhận diện từ khóa *"hiện tại"* $\Rightarrow T_{\text{query}} = 2026-08-18$.
     * *Bước 2 - Hard Filtering tại Vector DB:* Áp dụng bộ lọc thời gian nghiêm ngặt trước khi tìm kiếm vector:
       ```sql
       WHERE valid_from <= '2026-08-18' 
         AND (valid_to IS NULL OR valid_to >= '2026-08-18')
         AND status = 'ACTIVE'
       ```
     * *Bước 3 - Xử lý truy vấn đích danh quy định cũ:* Do user hỏi đích danh "Quy định X", hệ thống truy xuất cả thông tin hết hiệu lực của Quy định X và văn bản mới thay thế để cung cấp đầy đủ lịch sử.
3. Thiết kế Prompting & Suy luận Thời gian (Temporal Reasoning Prompt):
   * Tiêm mốc thời gian hệ thống vào System Prompt: `Current Reference Date: 2026-08-18`.
   * Truyền metadata hiệu lực vào context: `[Quy định X | Hiệu lực: 01/01/2025 -> 01/07/2026 | Trạng thái: HẾT HIỆU LỰC từ 01/07/2026 theo Văn bản mới Y]`.
   * Hướng dẫn LLM reasoning: So sánh `Current Date (18/08/2026) > valid_to (01/07/2026)` $\Rightarrow$ Kết luận rõ ràng Quy định X đã hết hiệu lực từ ngày 01/07/2026 và chỉ dẫn người dùng tới quy định mới thay thế.

2. Tiêu chí chấm:
* 2.0đ: Thiết kế schema metadata đầy đủ các trường thời gian (valid_from, valid_to, status, superseded_by).
* 1.5đ: Trình bày cơ chế Time-Aware Retrieval / Hard filtering theo mốc thời gian truy vấn.
* 1.5đ: Thiết kế Prompt và Temporal Reasoning rõ ràng để LLM đối chiếu ngày tháng và trả lời chính xác trạng thái hiệu lực.

---

### 18. Research Thinking

Bạn xây dựng một Agentic RAG và đạt:

```text
Baseline RAG:       72.1%
Agentic RAG:        76.8%
```

Bạn muốn viết paper và kết luận:

> “Agentic RAG improves answer quality by 4.7%.”

Bạn có đồng ý với kết luận này không?

Nếu chưa, hãy nói bạn cần thực hiện thêm những thí nghiệm nào để chứng minh Agentic RAG thực sự tốt hơn.

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
* Quan điểm: CHƯA ĐỒNG Ý.
  * Con số chênh lệch +4.7% trên một lần chạy (single run) hoặc trên một tập dữ liệu duy nhất là chưa đủ bằng chứng khoa học vững chắc để khẳng định Agentic RAG vượt trội hơn một cách có ý nghĩa.
* Các thí nghiệm và phân tích bắt buộc cần bổ sung:
  1. Kiểm định ý nghĩa thống kê (Statistical Significance Testing):
     * Chạy lại thí nghiệm qua nhiều random seeds để báo cáo kết quả dưới dạng $\text{Mean} \pm \text{Std}$.
     * Thực hiện kiểm định thống kê (như Paired t-test, Wilcoxon signed-rank test hoặc Bootstrap hypothesis test) để chứng minh sự cải thiện có $p$-value $< 0.05$ (không phải do ngẫu nhiên).
  2. Ablation Study (Nghiên cứu bóc tách thành phần):
     * Agentic RAG tích hợp nhiều module mới (Query Decomposition, Multi-hop Search, Self-Reflection, Tool Calling). Cần tắt/bật từng module để chứng minh cụ thể thành phần nào đóng góp vào 4.7% tăng trưởng.
  3. Phân tích Đánh đổi (Trade-off Analysis: Cost & Latency):
     * Đo lường Token Consumption (Agentic RAG tiêu tốn gấp bao nhiêu lần chi phí token?).
     * Đo lường Latency / Response Time (Thời gian phản hồi chậm hơn bao nhiêu giây?).
     * Đánh giá xem mức tăng 4.7% có xứng đáng với sự đánh đổi về tài nguyên tính toán và trải nghiệm người dùng hay không.
  4. Đánh giá Khả năng Tổng quát hóa (Generalizability Across Datasets & LLMs):
     * Kiểm thử trên ít nhất 2-3 tập benchmark khác nhau (Legal QA, Multi-hop QA, Fact-checking).
     * Thử nghiệm trên nhiều LLM backbones khác nhau (GPT-4o, Claude 3.5 Sonnet, Llama 3, Qwen 2.5) để chứng minh phương pháp không bị overfit vào 1 mô hình hay 1 prompt cụ thể.
  5. Phân tích Lỗi Định tính (Qualitative Error Analysis & Failure Modes):
     * Phân tích các trường hợp Baseline làm đúng nhưng Agentic RAG làm sai (do agent overthinking hoặc gọi sai tool) để hiểu rõ giới hạn của phương pháp.
  6. Đánh giá Chuyên gia (Human / Expert Evaluation):
     * Tổ chức đánh giá mù (blind review) bởi chuyên gia pháp lý trên một tập mẫu ngẫu nhiên để xác thực độ chính xác nghiệp vụ.

2. Tiêu chí chấm:
* 1.0đ: Đưa ra quan điểm khoa học rõ ràng ("Chưa đồng ý" / cần thêm bằng chứng).
* 4.0đ: Đề xuất ít nhất 4 nhóm thí nghiệm khoa học chuẩn mực (Significance test, Ablation study, Cost/Latency trade-off, Generalizability, Error analysis, Human eval). Mỗi nhóm 1.0đ.

---

### 19. System Design

Hãy thiết kế một hệ thống cho query:

> “So sánh quy định về điều kiện hưởng trợ cấp thất nghiệp theo quy định hiện hành và quy định trước đây, cho biết quy định nào đang có hiệu lực và dẫn nguồn cho từng kết luận.”

Hãy mô tả:

1. Các component chính.
2. Database / vector database / metadata cần lưu.
3. Retriever.
4. Agent / tools.
5. Cách xác định hiệu lực văn bản.
6. Cách so sánh hai phiên bản.
7. Cách kiểm chứng câu trả lời.
8. Cách tạo citation.
9. Cách đánh giá hệ thống.

Không yêu cầu code. Ưu tiên architecture và reasoning.

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:

```text
                       ┌─────────────────────────────────────────────────────────┐
                       │                   Orchestrator Agent                    │
                       └────┬─────────────────┬──────────────────┬─────────────┬─┘
                            │                 │                  │             │
                    1. Query Decomp     2. Check Status     3. Retrieve   4. Diff & Verify
                            │                 │                  │             │
                     ┌──────▼──────┐   ┌──────▼──────┐    ┌──────▼──────┐ ┌────▼────────┐
                     │ Query Router│   │ Legal KG /  │    │Hybrid Engine│ │ Diff Engine │
                     │   & Parser  │   │Temporal DB  │    │(Dense+Sparse│ │ & Fact Check│
                     └─────────────┘   └─────────────┘    └─────────────┘ └─────────────┘
```

1. Các component chính:
   * *Query Decomposition & Router:* Phân tích câu hỏi, nhận diện yêu cầu so sánh 2 mốc thời gian và xác định các thực thể pháp lý.
   * *Legal Temporal & Knowledge Graph Engine:* Quản lý quan hệ sửa đổi, thay thế và vòng đời văn bản.
   * *Multi-version Hybrid Retriever:* Tìm kiếm điều khoản tương ứng theo từng phiên bản văn bản.
   * *Clause Alignment & Structured Diff Module:* Căn chỉnh các điều kiện tương đương và trích xuất điểm khác biệt.
   * *Response Synthesizer & Fact-Checking Verifier:* Sinh câu trả lời có cấu trúc và kiểm chứng tính trung thực của từng claim.
2. Database / Vector DB / Metadata:
   * *Vector DB (Qdrant / Milvus):* Lưu dense embeddings của các chunks (cấp Điều/Khoản).
   * *Relational / Graph DB (PostgreSQL / Neo4j):* Lưu cấu trúc và quan hệ văn bản:
     * Metadata: `doc_id`, `law_name`, `article_id`, `clause_id`, `valid_from`, `valid_to`, `status (ACTIVE/EXPIRED)`, `replaced_by_doc_id`, `amended_by_doc_id`.
3. Retriever:
   * *Hybrid Search:* Kết hợp Dense Retrieval (Cosine Similarity) + Sparse Retrieval (BM25) với Reciprocal Rank Fusion (RRF).
   * *Version-Filtered Retrieval:* Tự động gắn bộ lọc metadata theo `doc_id` của Luật Việc làm 2013 (hiện hành) và Luật BHXH 2006 (quy định trước đây).
4. Agent / Tools:
   * `Tool_Get_Legal_Lineage(topic)`: Lấy chuỗi lịch sử văn bản quy định về bảo hiểm thất nghiệp.
   * `Tool_Check_Validity(doc_id, date)`: Kiểm tra trạng thái hiệu lực tại thời điểm hiện tại.
   * `Tool_Retrieve_Article(doc_id, article_no)`: Trích xuất nguyên văn điều khoản.
   * `Tool_Clause_Diff(clause_old, clause_new)`: So sánh đối chiếu nội dung chi tiết.
5. Cách xác định hiệu lực văn bản:
   * Truy vấn Legal KG tại $T_{\text{now}}$: Xác định Luật Việc làm 2013 có `status = ACTIVE` ($T_{\text{now}} \ge \text{valid\_from}$ và $\text{valid\_to} = \text{NULL}$), còn phần quy định về BHTN trong Luật BHXH 2006 có `status = EXPIRED` kể từ ngày Luật Việc làm có hiệu lực (01/01/2015).
6. Cách so sánh hai phiên bản:
   * *Alignment:* Khớp nối các điều kiện tương đương (Thời gian đóng BHTN, thời hạn nộp hồ sơ, lý do nghỉ việc, tình trạng việc làm).
   * *Structured Presentation:* Trình bày dưới dạng bảng so sánh đối chiếu 3 cột: `Tiêu chí` | `Quy định trước đây (Hết hiệu lực)` | `Quy định hiện hành (Đang có hiệu lực)`.
7. Cách kiểm chứng câu trả lời (Verification):
   * Sử dụng module *NLI / Fact-checking Verifier*: Tách câu trả lời thành từng claim độc lập, kiểm tra đối chiếu (entailment check) xem 100% các câu có được chứng minh bởi retrieved context hay không.
8. Cách tạo Citation:
   * Gắn inline citation có cấu trúc chuẩn: `[Tên văn bản, Số hiệu, Điều X, Khoản Y, Tình trạng hiệu lực]`. Đính kèm trích dẫn nguyên văn đối chiếu.
9. Cách đánh giá hệ thống:
   * *Retrieval Metrics:* Recall@k, Article Hit Rate.
   * *Temporal Validity Score:* Tỷ lệ nhận diện chính xác văn bản còn/hết hiệu lực (yêu cầu 100%).
   * *Generation Metrics:* Faithfulness (độ trung thực), Answer Relevance, Citation Precision/Recall.

2. Tiêu chí chấm:
* 5.0đ: Trình bày đầy đủ, xuất sắc 9 khía cạnh kiến trúc (mỗi khía cạnh ~0.55đ). Đánh giá cao tư duy hệ thống, phân định rành mạch giữa retrieval, temporal metadata, version diffing, fact verification và citation.

---

### 20. Attitude / Research Mindset

Bạn được giao nhiệm vụ:

> “Xây dựng benchmark để đánh giá Agentic RAG cho pháp luật Việt Nam.”

Sau 2 tuần, bạn nhận ra phương pháp hiện tại không hiệu quả và kết quả thử nghiệm không tốt hơn baseline.

Bạn sẽ làm gì?

Hãy mô tả cách bạn xử lý tình huống này, từ việc xác định vấn đề, trao đổi với team/mentor, tìm tài liệu, thiết kế thí nghiệm tiếp theo cho đến quyết định có tiếp tục hướng hiện tại hay thay đổi hướng nghiên cứu.

#### Đáp án & Tiêu chí chấm (5 điểm):

1. Đáp án chi tiết:
Quy trình xử lý vấn đề chuẩn mực của một nhà nghiên cứu (Research Mindset):

1. Bước 1: Chẩn đoán nguyên nhân gốc rễ và Phân tích lỗi định tính (Root Cause Analysis):
   * Giữ bình tĩnh, không vội vàng nản chí hay vội đập bỏ toàn bộ. Tiến hành mổ xẻ chi tiết từng ca thất bại (Error Analysis):
     * *Vấn đề nằm ở đâu?* (Do Retriever lấy sai tài liệu? Do Agent bị lặp vô tận/tool use sai? Do Prompt chưa tối ưu? Hay bản thân bộ Benchmark gán nhãn Ground Truth bị nhiễu / metric đánh giá chưa phản ánh đúng năng lực của Agent?).
   * Lập bảng thống kê phân loại các nhóm lỗi chính kèm tỷ lệ phần trăm cụ thể.
2. Bước 2: Hệ thống hóa số liệu và Trao đổi minh bạch với Mentor/Team:
   * Chủ động đặt lịch họp với Mentor. Chuẩn bị báo cáo khoa học rõ ràng gồm:
     * Tóm tắt mục tiêu và các thí nghiệm đã thực hiện trong 2 tuần.
     * Số liệu định lượng so sánh chi tiết giữa Baseline và Agent.
     * 3-5 case study thất bại tiêu biểu kèm phân tích nguyên nhân tại sao fail.
     * Các giả thuyết cá nhân và các hướng đề xuất cải tiến.
   * Lắng nghe phản hồi và góc nhìn kinh nghiệm từ Mentor để nhận diện các "điểm mù" (blind spots).
3. Bước 3: Rà soát tài liệu chuyên sâu (Literature Review & SOTA Investigation):
   * Tìm đọc các bài báo mới nhất tại các hội nghị hàng đầu (ACL, EMNLP, NeurIPS, ICLR) về Legal RAG, Temporal QA và Agentic Failure Modes.
   * Tìm hiểu cách các nhóm nghiên cứu quốc tế giải quyết các nút thắt tương tự (ví dụ: áp dụng StateGraph, Corrective RAG, Synthetic Data Verification).
4. Bước 4: Thiết kế chu kỳ thử nghiệm ngắn hạn có kiểm soát (Sprint Experimentation):
   * Đề xuất 2-3 giả thuyết cải tiến cụ thể (Actionable Hypotheses) với thời hạn rõ ràng (ví dụ trong 3-5 ngày):
     * *Giả thuyết A:* Tinh chỉnh cấu trúc StateGraph thay vì ReAct tự do.
     * *Giả thuyết B:* Bổ sung metadata lọc thời gian trước khi retrieve.
     * *Giả thuyết C:* Chuẩn hóa lại 50 mẫu benchmark chuẩn với sự tham gia của chuyên gia luật.
5. Bước 5: Ra quyết định dựa trên dữ liệu (Data-Driven Decision - Persevere or Pivot):
   * Nếu sau sprint thử nghiệm có tín hiệu cải thiện rõ ràng $\to$ Tiếp tục đào sâu và mở rộng hướng tiếp cận.
   * Nếu sau khi đã thử nghiệm các phương án tối ưu mà phương pháp vẫn bế tắc do giới hạn nền tảng $\to$ Thảo luận với Mentor để Pivot (Chuyển hướng) một cách khoa học: Biến bài học thất bại thành một đóng góp nghiên cứu (ví dụ: viết paper phân tích các thách thức và failure modes của Agentic RAG trong miền luật tiếng Việt).

2. Tiêu chí chấm:
* 5.0đ: Thể hiện trọn vẹn tư duy nghiên cứu trưởng thành, trung thực khoa học, chủ động, phương pháp luận rõ ràng (Error analysis $\to$ Transparent reporting $\to$ Literature review $\to$ Hypothesis-driven quick experiments $\to$ Data-driven decision/Pivot).

---

### Mức đánh giá

80–100 - Strong candidate

Có nền tảng tốt, hiểu RAG/Agent, quan trọng hơn là có research mindset. Có thể giao một sub-problem tương đối độc lập.

65–79 - Good candidate

Kiến thức đủ tốt, có khả năng học nhanh. Phù hợp làm thành viên nghiên cứu sau một thời gian onboarding.

50–64 - Potential

Có thể chưa mạnh về AI/RAG nhưng nếu câu 18–20 tốt thì rất đáng cân nhắc. Đây có thể là sinh viên chưa có nhiều kinh nghiệm nhưng có tư duy nghiên cứu.

<50 - Weak fit

Đặc biệt nếu yếu ở cả fundamental lẫn reasoning.