<div align="center">

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-black.svg">
    <img src="assets/logo.svg" alt="Evidentia Logo" width="120" height="120">
  </picture>
</p>

# Evidentia

**Legal Agentic-GraphRAG System for Vietnamese Law**

🇻🇳 [Tiếng Việt](README.md) | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 English

</div>

---

## 1. Overview

Evidentia is a specialized legal intelligence platform built on a Multi-Agent architecture integrated with a Legal Knowledge Graph and GraphRAG, specifically designed for the Vietnamese statutory and regulatory system.

When applied to legal workflows, standalone Large Language Models (LLMs) face structural constraints:
- Risk of hallucinations, resulting in erroneous legal conclusions or fabricated statutory citations.
- Inability to navigate intricate normative networks characterized by multi-level dependencies (amendments, supplements, replacements, and subordinate guiding decrees/circulars).
- Lack of verifiable grounding down to specific Articles, Clauses, and Points in valid, currently effective legal documents.

Evidentia resolves these limitations by grounding multi-agent reasoning in a curated Vietnamese legal knowledge graph, ensuring every answer is derived from verified, currently in-force statutory provisions.

## 2. Planned Capabilities & Architecture

Evidentia is engineered to support legal research, regulatory tracking, and compliance advisory workflows through the following core components:

### Multi-Agent Orchestration
- Query Analysis & Decomposition: Breaks compound legal inquiries into modular, self-contained sub-topics for targeted processing.
- Domain-Specific Retrieval Routing: Dispatches sub-queries to appropriate indexes and retrieval mechanisms based on legal subject matter.
- Synthesis & Consistency Verification: Cross-checks validity statuses, evaluates jurisdictional scope, and synthesizes arguments with verified citations.

### Legal Knowledge Graph & GraphRAG
- Ontological representation of the Vietnamese legal hierarchy (Constitution, Codes, Laws, Decrees, Circulars).
- Explicit modeling of inter-document relations: amends, supplements, supersedes, invalidates, and guides implementation.

### Hybrid Retrieval Engine
- Unified retrieval combining dense semantic embeddings, sparse lexical retrieval (BM25), and structural graph traversal to maximize both recall and precision across statutory provisions.

### Clause-Level Grounding & Attribution
- Every statement is anchored to verifiable references, detailing the enactment title, official document identifier, date, and specific Article, Clause, and Point.

### Regulatory Tracking & Document Intelligence
- Interactive legal viewer presenting document structures, relational trees, and real-time validity status indicators.

### Automated Legal Inquiries & Procedure Support
- Conversational assistance for citizens, enterprises, and legal practitioners, focusing on administrative procedures, regulatory compliance, and statutory interpretation.

## 3. Early Access Pre-Registration

The platform is currently in active development in preparation for its initial deployment phase.

Users interested in early access can pre-register their email at the official portal:

[https://evidentia.io.vn](https://evidentia.io.vn)

<p align="center">
  <img src="assets/early-access-preview.png" alt="Evidentia Early Access Preview" width="850">
</p>

## 4. Repository & Source Code Notice

The core source code of Evidentia—including backend services, knowledge graph ingestion pipelines, and multi-agent coordination workflows—is maintained within a private repository.

This public repository serves as the official project overview, architecture index, and release notice channel.

---

## Contact & Inquiries

- Official Portal: [https://evidentia.io.vn](https://evidentia.io.vn)
- Research Group: NLP & KD Lab
- Project Lead: Victor Nguyen ([VictorNguyenLPN](https://github.com/VictorNguyenLPN))
