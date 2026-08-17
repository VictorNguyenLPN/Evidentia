# Agentic-RAG Cho **Luật Việt Nam**

Đây là một đề tài khóa luận **rõ ràng, khả thi và có giá trị thực tiễn cao** nếu thu hẹp mục tiêu thành hệ thống tra cứu văn bản pháp luật Việt Nam theo **thời điểm hiệu lực, phiên bản văn bản, và tóm tắt thay đổi có dẫn nguồn** thay vì cố giải toàn bộ “legal reasoning” tổng quát. Nền tảng khoa học của đề tài khá vững ở ba mảng: legal IR/QA và RAG cho luật, mô hình agentic cho truy hồi-lập kế hoạch-lặp cải tiến, và nghiên cứu về tri thức thay đổi theo thời gian; nhưng khoảng trống vẫn còn rõ ở chỗ **ít hệ thống nào xử lý đồng thời tính hiệu lực, tính thời điểm, so sánh phiên bản, và kiểm chứng nguồn trong bối cảnh luật Việt Nam** [1] [2] [3] [4].

## Phát Biểu Bài Toán

Bài toán Computer Science phù hợp nhất là **time-aware legal retrieval and update summarization**: từ một truy vấn người dùng và một mốc thời gian, hệ thống phải tìm đúng văn bản/quy định liên quan, xác định hiệu lực tại thời điểm đó, liên kết các phiên bản trước-sau, trích xuất phần thay đổi, rồi sinh câu trả lời có dẫn chứng điều/khoản và nguồn văn bản [3] [5] [6] [7].

**Input** nên gồm 4 loại: câu hỏi tự nhiên, bộ lọc miền pháp lý, mốc thời gian truy vấn, và tùy chọn văn bản/phiên bản cần so sánh.
**Output** nên gồm 5 trường bắt buộc: văn bản được truy xuất, trạng thái hiệu lực, đoạn thay đổi trọng yếu, tóm tắt thay đổi ngắn, và bằng chứng nguồn có thể kiểm tra được [8] [6] [9] [10].

Ý nghĩa khoa học nằm ở việc retrieval pháp lý không chỉ là “semantic similarity”. Trong luật, tài liệu đúng còn phụ thuộc vào **đúng thẩm quyền, đúng thời kỳ, đúng quan hệ sửa đổi/bãi bỏ, đúng điều kiện áp dụng**, nên bài toán cần kết hợp NLP, IR, temporal reasoning, và symbolic metadata thay vì chỉ vector search thuần túy [11] [12] [10].

Ý nghĩa thực tiễn rất mạnh vì giới làm pháp chế, thuế, nhân sự, ngân hàng và người dân đều phải xử lý lượng văn bản lớn, thường xuyên thay đổi, khó tra cứu và dễ áp dụng nhầm phiên bản cũ [13] [4].

## Khoảng Trống Nghiên Cứu

Văn liệu hiện nay cho thấy legal NLP đã phát triển mạnh ở retrieval, QA, summarization, NER và compliance checking, nhưng phần lớn nghiên cứu xử lý **một tác vụ riêng lẻ** hơn là một pipeline cập nhật luật đầu-cuối [14] [15] [16].

Bảng dưới đây tóm tắt các khoảng trống trực tiếp liên quan đến đề tài.

| Evidence Strength | Claim |
|---|---|
| Evidence strength: Strong (9/10) | **Legal RAG hiện nay chưa giải quyết đầy đủ tính thời điểm và hiệu lực nguồn**; nhiều hệ thống vẫn có thể trích dẫn sai, dùng nguồn hết hiệu lực, hoặc lẫn thẩm quyền/jurisdiction [11] [5] [6]|
| Evidence strength: Strong (8/10) | **Thiếu benchmark và phương pháp đánh giá chuẩn** cho legal RAG, nhất là factuality, groundedness và temporal validity, vì BLEU/ROUGE không đủ phản ánh độ đúng pháp lý [1] [17] [5]|
| Evidence strength: Strong (8/10) | **Nguồn lực tiếng Việt và dữ liệu pháp lý gán nhãn còn thiếu**, dù đã có tiến triển ở retrieval, QA và NER; đây là rào cản chính cho hệ thống luật Việt Nam [15] [18] [19] [20]|

**Figure 1:** Main research gaps for Vietnamese legal Agentic-RAG

Khoảng trống quan trọng nhất là temporal validity. Nghiên cứu về RAG thời gian cho thấy semantic matching thường lấy nhầm tài liệu cũ hoặc không phù hợp với ràng buộc thời gian trong câu hỏi, trong khi benchmark hiện tại vẫn thiên về kiến thức tĩnh [3].

Khoảng trống thứ hai là legal hallucination chưa được giải quyết chỉ bằng RAG. Đánh giá trên công cụ nghiên cứu pháp lý thương mại cho thấy hallucination giảm nhưng không biến mất; tỉ lệ vẫn ở mức 17–33%, nên đề tài của bạn cần lớp xác minh hiệu lực và provenance thay vì chỉ “retrieve rồi generate” [11] [8].

## Tổng Quan Tài Liệu

Nghiên cứu gần với bài toán Việt Nam nhất hiện nay nằm ở **retrieval luật Việt Nam**. Một bộ dữ liệu retrieval tiếng Việt đã được xây từ website pháp luật chính thức và truy vấn tư vấn pháp lý, gồm 8,586 văn bản, 117,545 điều khoản và 5,922 truy vấn; nhưng trong quá trình chuẩn hóa, các phiên bản cũ bị loại bỏ để remap về điều khoản mới, nghĩa là bài toán **theo dõi biến động phiên bản** chưa được giữ lại như một nhiệm vụ trung tâm [21].

Một hướng khác ở Việt Nam đã xây tập lớn 300,000 văn bản quy phạm và dùng ontology để cải thiện retrieval lao động Việt Nam; công trình này cho thấy metadata như loại văn bản, số hiệu, cơ quan ban hành, ngày ban hành và ngày hiệu lực là tín hiệu rất giá trị cho truy hồi pháp lý [22].

Ở tầng tri thức cấu trúc, linked data/ontology cho luật Việt Nam đã được đề xuất trên khoảng 325,000 văn bản, với mục tiêu hỗ trợ legal search, QA và document similarity; điều này ủng hộ mạnh cho việc dùng **graph metadata về sửa đổi, thay thế, bãi bỏ, dẫn chiếu** như một lớp bổ trợ cho Agentic-RAG [4].

| Hướng nghiên cứu | Điểm mạnh | Điểm yếu với đề tài của bạn |
|---|---|---|
| Retrieval/QA pháp lý Việt Nam | Có dữ liệu thực và baseline retrieval [21] [22]| Chưa mô hình hóa version history, hiệu lực, diff |
| Legal RAG | Giảm hallucination, tăng groundedness [1] [23]| Chưa đảm bảo temporal validity, doctrinal correctness |
| Agentic RAG | Lặp truy hồi, query reformulation, feedback [24] [25] [26]| Tăng độ trễ, chi phí, phối hợp phức tạp [19] [26]|
| KG/ontology pháp lý | Bắt quan hệ pháp lý và metadata tốt [12] [4]| Xây dựng và cập nhật tốn công [19] [27]|

**Figure 2:** Relevant literature streams for the thesis topic

Về agentic architecture, nhiều nghiên cứu ngoài luật cho thấy mô hình nhiều agent có lợi khi truy vấn đòi hỏi phân rã tác vụ, truy hồi lặp, rerank và đánh giá lại câu trả lời [24] [28] [29]. Trong luật, LQ-RAG và Chatlaw đều dùng vòng phản hồi hoặc đa vai trò để cải thiện độ liên quan, groundedness và độ chính xác [25] [30].

Nhưng evidence cũng khá nhất quán rằng agentic RAG đánh đổi bằng **độ phức tạp điều phối, token cost và latency**. Đây là lý do nên giới hạn agent ở các vai trò thật cần thiết: query analyzer, retriever/router, temporal validator, diff/summarizer, và verifier [2] [19] [26] [31].

## Câu Hỏi Nghiên Cứu Và Đề Xuất Phương Pháp

Một bộ research questions gọn và mạnh cho khóa luận là:

1. **RQ1:** Metadata thời gian và hiệu lực có cải thiện retrieval pháp lý Việt Nam so với BM25 và dense retrieval chuẩn không? [5] [9]

2. **RQ2:** Agentic-RAG có cải thiện độ đúng của trả lời cập nhật luật so với vanilla RAG không, đặc biệt ở truy vấn nhiều bước như “văn bản nào sửa điều X và hiện còn hiệu lực không”? [25] [32]

3. **RQ3:** Thêm lớp ontology/knowledge graph hoặc rule-based validator có giảm hallucination và citation lỗi không? [33] [34] [6]

4. **RQ4:** Cách trình bày “diff + summary + provenance” nào hữu ích nhất cho người dùng pháp chế/nghiên cứu? [14] [35] [36]

| | Retrieval | Generation | Evaluation | Knowledge graph | Human validation |
|---|---|---|---|---|---|
| Temporal validity | GAP | GAP | GAP | GAP | GAP |
| Version linking | GAP | GAP | GAP | GAP | GAP |
| Vietnamese datasets | GAP | GAP | GAP | GAP | GAP |
| Legal grounding | GAP | GAP | GAP | GAP | GAP |
| Agent orchestration | GAP | GAP | GAP | GAP | GAP |

Khoảng trống nổi bật nhất là ô giao giữa **temporal validity** và **evaluation**: nhiều benchmark RAG đo answer quality nhưng không đo nguồn có còn hợp lệ tại thời điểm hỏi hay không [5]. Khoảng trống thứ hai là **version linking** trong luật Việt Nam: dữ liệu retrieval hiện có đã loại phiên bản cũ để đơn giản hóa bài toán, nên chưa hỗ trợ đánh giá diff hay chain sửa đổi-bãi bỏ thực sự [21]. Khoảng trống thứ ba là **human validation** cho legal RAG tiếng Việt, dù nhiều nghiên cứu đều nhấn mạnh expert review là cần thiết trong miền rủi ro cao [14] [11] [25].

## Dataset, Baseline Và Đánh Giá

Dataset tốt nhất cho khóa luận nên là **dataset tự xây cho Luật Việt Nam**, vì chưa có benchmark công khai nào bám đúng bài toán “tra cứu + hiệu lực + so sánh + cập nhật”. Bạn có thể tận dụng hạ tầng crawl/normalize đã được chứng minh khả thi trên văn bản luật Việt Nam và mở rộng sang lưu **tất cả phiên bản** thay vì chỉ giữ bản mới nhất [21] [22].

Nên thiết kế dataset thành 4 tập con:

- **Retrieval set:** query → relevant articles/documents [21] [37].  
- **Temporal validity set:** query + time → valid governing document/version [3] [5].  
- **Version-diff set:** old version/new version → changed clauses + change type [38] [39].  
- **Update summarization set:** pair/set of amended texts → summary with citations [40] [41].

| Thành phần | Đề xuất |
|---|---|
| Nguồn dữ liệu | Cổng pháp luật chính thức, văn bản quy phạm, metadata hiệu lực, văn bản sửa đổi/bãi bỏ [21] [4]|
| Annotation | Luật sư/giảng viên luật xác nhận relevance, hiệu lực, diff, summary [21] [19]|
| Baseline retrieval | TF-IDF, BM25, SBERT/InstructorEmbedding, Attentive CNN [22] [21]|
| Baseline QA/RAG | Vanilla RAG, hybrid RAG, fine-tuned legal RAG [1] [25] [9]|
| Baseline agentic | LQ-RAG-style feedback loop, document selection agent [25] [9]|

**Figure 3:** Proposed datasets and baselines for evaluation

Về metric, retrieval nên dùng Recall@k, NDCG@k, MRR vì đây là chuẩn lặp lại nhiều nhất trong legal retrieval và legal RAG [21] [37]. Generation không nên chỉ dùng BLEU/ROUGE vì chúng bỏ sót tính factual/legal correctness; cần thêm faithfulness, answer relevance, context relevance, citation accuracy, và human expert scoring [1] [17] [42] [35].

Điểm mới nên là metric thời gian. Bạn có thể chuyển ý tưởng RAS/RAR/TMR sang pháp luật Việt Nam để đo **nguồn trích dẫn có còn hiệu lực tại thời điểm hỏi hay không**, tách biệt với chuyện answer text nghe có vẻ đúng [5].

## Thiết Kế Hệ Thống Và Kế Hoạch Thực Nghiệm

Một kiến trúc khóa luận đủ mạnh nhưng vẫn khả thi là 5 agent:

| Agent | Vai trò chính | Ghi chú |
|---|---|---|
| Query Agent | Chuẩn hóa truy vấn, nhận diện mốc thời gian/miền luật | query reformulation khi mơ hồ [24] [25]|
| Retrieval Agent | Hybrid retrieval theo văn bản + điều khoản + metadata | BM25 + dense + rerank [25] [9]|
| Temporal Agent | Lọc theo hiệu lực, ngày ban hành, quan hệ sửa đổi/bãi bỏ | lớp then chốt của đề tài [6] [3]|
| Diff Agent | Căn chỉnh phiên bản và tóm tắt thay đổi | structure-aware diff [39] [38]|
| Verification Agent | Kiểm groundedness, citation, jurisdiction, safety template | hậu kiểm trước khi trả lời [8] [6]|

**Figure 4:** Five-agent architecture for Vietnamese legal updates

Quy trình thực nghiệm nên theo 4 pha.

**Pha 1:** crawl và chuẩn hóa corpus, giữ version history và metadata thời gian [22] [43].
**Pha 2:** xây benchmark với chuyên gia luật cho retrieval, hiệu lực, diff, summarization [21] [19] [36].
**Pha 3:** huấn luyện và so sánh baseline với ablation từng lớp temporal/KG/agent feedback [44] [26] [9].
**Pha 4:** đánh giá người dùng mục tiêu như pháp chế doanh nghiệp hoặc sinh viên luật về usefulness, trust, latency, explainability [14] [45].

Khả thi nhất cho khóa luận là giới hạn domain vào **một nhánh luật có cập nhật thường xuyên**, như lao động, thuế hoặc đất đai. Cách thu hẹp theo domain đã được ủng hộ trong nghiên cứu Việt Nam vì giảm nhiễu phân phối và giúp reasoning kiểm chứng được hơn [19] [22].

Kết luận ngắn gọn: đề tài nên được phát biểu thành **Agentic-RAG có nhận thức thời gian và hiệu lực cho tra cứu, so sánh phiên bản, và tóm tắt cập nhật văn bản pháp luật Việt Nam**. Dịch chuyển quan trọng nhất của văn liệu là từ legal QA tĩnh sang **retrieval có kiểm chứng nguồn, thời gian và quy trình agentic** [1] [2] [6]. Câu hỏi mở lớn nhất vẫn là làm sao đánh giá được **độ đúng pháp lý theo thời điểm** một cách tự động nhưng vẫn sát với đánh giá của chuyên gia luật [1] [5] [36].
 
## References
 
`1.` Hindi M, Mohammed L, Maaz O, Alwarafy A. Enhancing the Precision and Interpretability of Retrieval-Augmented Generation (RAG) in Legal Technology: A Survey. *IEEE Access.* 2025;13:46171-46189. doi:10.1109/access.2025.3550145
 
`2.` Sapkota R, Roumeliotis KI, Karkee M. AI Agents vs. Agentic AI: A Conceptual Taxonomy, Applications and Challenges. *Inf. Fusion.* 2025;126:103599. doi:10.1016/j.inffus.2025.103599
 
`3.` Chen Z, Min E, Zhao X, et al. A Question Answering Dataset for Temporal-Sensitive Retrieval-Augmented Generation. *Scientific Data.* 2025;12. doi:10.1038/s41597-025-06098-y
 
`4.` Ngo H, Nguyen HD, Le-Khac N. Ontology Knowledge Map Approach Towards Building Linked Data for Vietnamese Legal Applications. *Vietnam. J. Comput. Sci..* 2024;11:323-342. doi:10.1142/s2196888824500015
 
`5.` Kim B, Choi H, Yoo N, Yang J. Program-Verifiable Evaluation for Temporal QA: Metrics for Evidence Validity. *IEEE Access.* 2026;14:56652-56664. doi:10.1109/access.2026.3679691
 
`6.` Akremi A. Ontology-Driven Legal Rule Auditor for Secure, Trustworthy, and Governed RAG Systems. *Computers.* 2026. doi:10.3390/computers15080471
 
`7.` Akbar KA, Uddin MN, Khan L, et al. Retrieval Augmented Generation-Based Large Language Models for Bridging Transportation Cybersecurity Legal Knowledge Gaps. *Transportation Research Record.* 2025;2680:454 - 472. doi:10.1177/03611981251372471
 
`8.` Kumar P, Dhir V. Enhancing Legal Question Answering with Evidence-Grounded RAG, Multi-Model Evaluation, and Safe-Template Repair. *International Journal of Drug Delivery Technology.* 2026. doi:10.25258/ijddt.16.59s.125
 
`9.` Ali Ș, Oprea S, Bâra A. Engineering Trustworthy Retrieval-Augmented Generation for EU Electricity Market Regulation. *Electronics.* 2026. doi:10.3390/electronics15040749
 
`10.` Alkasem H, Almuzaini H. Optimizing Regulatory Compliance Checking With Ai: A Methodological Exploration. *International Journal on Artificial Intelligence Tools.* 2026. doi:10.1142/s0218213026500053
 
`11.` Magesh V, Surani F, Dahl M, Suzgun M, Manning CD, Ho DE. Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools. *ArXiv.* 2024;abs/2405.20362. doi:10.48550/arxiv.2405.20362
 
`12.` Peng B, Zhu Y, Liu Y, et al. Graph Retrieval-Augmented Generation: A Survey. *ACM Transactions on Information Systems.* 2024;44:1 - 52. doi:10.1145/3777378
 
`13.` Martinez-Gil J. A Survey on Legal Question Answering Systems. *ArXiv.* 2021;abs/2110.07333. doi:10.1016/j.cosrev.2023.100552
 
`14.` Siino M, Falco M, Croce D, Rosso P. Exploring LLMs Applications in Law: A Literature Review on Current Legal NLP Approaches. *IEEE Access.* 2025;13:18253-18276. doi:10.1109/access.2025.3533217
 
`15.` Ariai F, Demartini G. Natural Language Processing for the Legal Domain: A Survey of Tasks, Datasets, Models, and Challenges. *ACM Computing Surveys.* 2024;58:1 - 37. doi:10.1145/3777009
 
`16.` Rahman MM,  N, Rahman MM, Rahman MM, Sd M. Natural language processing in legal document analysis software: A systematic review of current approaches, challenges, and opportunities. *International Journal of Innovative Research and Scientific Studies.* 2025. doi:10.53894/ijirss.v8i3.7702
 
`17.` Lyu Y, Li Z, Niu S, et al. CRUD-RAG: A Comprehensive Chinese Benchmark for Retrieval-Augmented Generation of Large Language Models. *ACM Transactions on Information Systems.* 2024;43:1 - 32. doi:10.1145/3701228
 
`18.` Le H, Luu N, Nguyen T, Dao T, Dinh S. Optimizing Answer Generator in Vietnamese Legal Question Answering Systems Using Language Models. *ACM Transactions on Asian and Low-Resource Language Information Processing.* 2025;24:1 - 17. doi:10.1145/3732938
 
`19.` Tran QL, Nguyen H. Enhancing Small Language Models via Evolutionary Data Generation and Context-Aware DPO for Low-Resource Legal Question Answering. *IEEE Access.* 2026;14:113150-113173. doi:10.1109/access.2026.3715578
 
`20.` La D, Tran T, Du N, Dang N, Phung T, Tran V. PAP_NER: A large-scale vietnamese administrative named entity recognition corpus and hybrid deep learning architecture. *PLOS One.* 2026;21. doi:10.1371/journal.pone.0353166
 
`21.` Thanh NH, Phi MV, Ngo X, Tran V, Nguyen L, Tu M. Attentive deep neural networks for legal document retrieval. *Artificial Intelligence and Law.* 2022;32:57 - 86. doi:10.1007/s10506-022-09341-8
 
`22.` Pham V, Le HH, Ngo TP, Nguyen BT, Nguyen D, Nguyen HD. Enhancing legal research through knowledge-infused information retrieval for Vietnamese labor law. *IAES International Journal of Artificial Intelligence (IJ-AI).* 2024. doi:10.11591/ijai.v13.i4.pp3962-3973
 
`23.` Gupta S, Agrawal V, Negi Y, Karunanithi S, Balakrishnan A. Reducing Hallucinations in Legal AI: A Retrieval Augmented Generation-Based Model for Accurate Legal Guidance. *IEEE Access.* 2026;14:44451-44463. doi:10.1109/access.2026.3675624
 
`24.` Deng L, Hu H, Lu K, He P. LLM-augmented multi-agent cooperative framework for medical case retrieval in cardiology. *Journal of King Saud University Computer and Information Sciences.* 2025;37. doi:10.1007/s44443-025-00311-z
 
`25.` Wahidur RSM, Kim S, Choi H, Bhatti DS, Lee H. Legal Query RAG. *IEEE Access.* 2025;13:36978-36994. doi:10.1109/access.2025.3542125
 
`26.` Zhang C, Wang Y, Xu D, et al. TeaRAG: A Token-Efficient Agentic Retrieval-Augmented Generation Framework. *ACM Transactions on Information Systems.* 2025. doi:10.1145/3818621
 
`27.` Peng C, Xia F, Naseriparsa M, Osborne F. Knowledge Graphs: Opportunities and Challenges. *Artificial Intelligence Review.* 2023. doi:10.1007/s10462-023-10465-9
 
`28.` Liang C, Cui Y, Shi R, et al. GeoAgentic-RAG: A Multi-Agent framework for autonomous geospatial reasoning and visual insight generation with LLM. *International Journal of Applied Earth Observation and Geoinformation.* 2026. doi:10.1016/j.jag.2026.105195
 
`29.` Aljohani B, Aljuhani A. Pioneering agentic retrieval-augmented generation in software quality: a novel framework for code smell detection via dynamic retrieval. *PeerJ Comput. Sci..* 2026;12:e3642. doi:10.7717/peerj-cs.3642
 
`30.` Cui J, Li Z, Yan Y, Chen B, Yuan L. Chatlaw: A Multi-Agent Legal Assistant based on a Role-Aligned Mixture-of-Experts Architecture. *Fundamental Research.* 2023. doi:10.1016/j.fmre.2026.03.026
 
`31.` Neha F, Bhati D, Shukla DK. Retrieval-Augmented Generation (RAG) in Healthcare: A Comprehensive Review. *AI.* 2025. doi:10.3390/ai6090226
 
`32.` K SS, M K, D KK, R R, D H. A Retrieval-Augmented Multi-Agent Platform for Enterprise Intelligence. *International Journal of Drug Delivery Technology.* 2026. doi:10.25258/ijddt.16.55s.1
 
`33.` Turaga VSP, Pahi T, Tjoa S, Siami‐Namini S, Namin AS. CO2 (Co-Compliance Officer): An LLM-Based Ontology-Driven Methodology for Generating Knowledge Graphs and AI Compliance Checking. *IEEE Access.* 2025;13:210576-210606. doi:10.1109/access.2025.3639228
 
`34.` B B,  K, A JP,  N, S V, T S. Neuro-Symbolic Legal Guardian: A Hybrid RAG and Knowledge-Graph Framework for Reducing Hallucination in Legal Question Answering. *International Journal of Drug Delivery Technology.* 2026. doi:10.25258/ijddt.16.41s.137
 
`35.` Singhal K, Azizi S, Tu T, et al. Large language models encode clinical knowledge. *Nature.* 2022;620:172 - 180. doi:10.1038/s41586-023-06291-2
 
`36.` Delgado FA, Barocas S, Levy K. An Uncommon Task: Participatory Design in Legal AI. *Proceedings of the ACM on Human-Computer Interaction.* 2022;6:1 - 23. doi:10.1145/3512898
 
`37.` Sriram S, Vijayaraj N, Krishna RG, Bhanu VS, Choudhary G, Murugan T. A Reusable Prompting Framework for Applying Large Language Models to Legal Tasks. *IEEE Access.* 2026;14:3108-3129. doi:10.1109/access.2026.3650941
 
`38.` Kuznetsov I, Buchmann J, Eichler M, Gurevych I. Revise and Resubmit: An Intertextual Model of Text-based Collaboration in Peer Review. *Computational Linguistics.* 2022;48:949-986. doi:10.1162/coli_a_00455
 
`39.` Cuculovic M, Fondement F, Devanne M, Weber J, Hassenforder M. Semantics to the rescue of document‐based XML diff: A JATS case study. *Software: Practice and Experience.* 2022;52:1496 - 1516. doi:10.1002/spe.3074
 
`40.` Moro G, Piscaglia N, Ragazzi L, Italiani P. Multi-language transfer learning for low-resource legal case summarization. *Artificial Intelligence and Law.* 2023. doi:10.1007/s10506-023-09373-8
 
`41.` Masih S, Hassan M, Fahad L, Hassan B. Transformer-Based Abstractive Summarization of Legal Texts in Low-Resource Languages. *Electronics.* 2025. doi:10.3390/electronics14122320
 
`42.` Zhao P, Zhang H, Yu Q, et al. Retrieval-Augmented Generation for AI-Generated Content: A Survey. *ArXiv.* 2024;abs/2402.19473. doi:10.48550/arxiv.2402.19473
 
`43.` Brown MA, Gruen A, Maldoff G, Messing S, Sanderson Z, Zimmer M. Web scraping for research: Legal, ethical, institutional, and scientific considerations. *Big Data & Society.* 2024;12. doi:10.1177/20539517251381686
 
`44.` Siriwardhana S, Weerasekera R, Wen E, Kaluarachchi T, Rana R, Nanayakkara S. Improving the Domain Adaptation of Retrieval Augmented Generation (RAG) Models for Open Domain Question Answering. *Transactions of the Association for Computational Linguistics.* 2022;11:1-17. doi:10.1162/tacl_a_00530
 
`45.` Knott M, Krebs M, Kerscher A. Large language models in healthcare quality management: a European perspective on process automation and compliance. *Frontiers in Digital Health.* 2026;8. doi:10.3389/fdgth.2026.1761641
 
