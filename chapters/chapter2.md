# Chapter 2: Background Study

This chapter reviews the research and existing systems that inform the *AI Legal Advisor and Analyzer*. Section 2.1 surveys legal artificial intelligence, legal document analysis, information retrieval, retrieval-augmented generation (RAG) and AI-based legal advisory systems. Section 2.2 compares the most relevant studies and platforms and identifies the research gap. Section 2.3 states the research objectives that respond to that gap.

## 2.1 Literature Review

### 2.1.1 Legal Artificial Intelligence and Legal NLP

Legal artificial intelligence (Legal AI) applies computational methods to legal tasks such as judgment prediction, similar-case matching, legal question answering and document review. Zhong et al. [1] surveyed the field from both a legal and an NLP perspective. They compared embedding-based methods, which learn representations from data, with symbol-based methods, which encode legal knowledge explicitly. Their experiments on judgment prediction, similar-case matching and legal question answering showed that embedding-based methods predict well. However, these methods often lack interpretability and struggle with rare cases and very long legal documents. Both weaknesses matter for a system that must explain the law to non-experts.

A second line of work adapts pre-trained language models to legal text. Chalkidis et al. [2] introduced LEGAL-BERT and showed that further pre-training BERT on legal corpora, or pre-training it from scratch on them, outperforms an off-the-shelf BERT on domain tasks. Zheng et al. [3] reached a more nuanced conclusion with the CaseHOLD dataset, which contains more than 53,000 multiple-choice questions about case holdings. Domain pre-training helped most when the task was close to the pre-training corpus and difficult enough to need legal knowledge. To support standardised evaluation, Chalkidis et al. [4] released LexGLUE, a benchmark of seven English legal datasets on which legal-oriented models generally outperformed generic ones.

Most of this work concerns European and United States law. The closest large-scale South Asian resource is ILDC [5], a corpus of about 35,000 Indian Supreme Court cases for court judgment prediction with explanation. Its best model reached about 78% accuracy against about 94% for legal experts. The authors also reported clear differences between the reasoning of the model and that of the experts. Two lessons follow for this project: models trained on one jurisdiction do not transfer automatically to another, and outcome prediction without faithful explanation is of limited value to a citizen.

Research on Pakistani law is still small but growing. Maqsood, Ul-Hasan and Shafait [18] proposed a transformer-based architecture that predicts the outcome of Pakistani legal proceedings and extracts the passages that explain each decision. They introduced VerdictVaultPK, a dataset of rental-property case proceedings, which is directly relevant to the property-dispute domain of this project. Faisal and Yousaf [19] released LEGAL-UQA, a parallel English-Urdu question-answering dataset of 619 question-answer pairs built from the Constitution of Pakistan. They used Urdu OCR to digitise the Urdu text. These studies show that Pakistani legal NLP is feasible. They also show that the available datasets focus either on prediction for specialists or on constitutional text, not on guidance for citizens in property and family matters.

### 2.1.2 Large Language Models in Law and the Problem of Hallucination

Large language models (LLMs) have shown strong general legal ability. Katz et al. [7] reported that GPT-4, tested zero-shot on the full Uniform Bar Examination in the United States, scored about 297 points, well above the passing threshold in every jurisdiction that uses the exam. LegalBench [6], a benchmark of 162 tasks designed by legal professionals and covering six types of legal reasoning, was used to evaluate 20 open-source and commercial LLMs. It showed that performance varies considerably across types of reasoning.

General ability does not guarantee reliable answers. Ji et al. [10] describe *hallucination* as the generation of content that is unfaithful to the source or not supported by fact, and they identify it as a central problem for all natural-language generation. In law the consequences are serious. Dahl et al. [8] profiled legal hallucinations in public LLMs, including ChatGPT 4, and found that the models hallucinated at least 58% of the time on verifiable questions about United States federal court cases. They also found that the models often failed to recognise their own errors and accepted users' incorrect legal assumptions. The authors warn against unsupervised use of general-purpose LLMs for legal tasks. These findings directly support the concern raised in Chapter 1 that general chatbots can produce legal statements that cannot be checked.

### 2.1.3 Information Retrieval and Semantic Search for Legal Text

Classical retrieval matches query terms against documents using sparse methods such as TF-IDF and BM25. Ordinary users rarely describe their problems in statutory language. A tenant who writes "my landlord told me to leave in a week" uses none of the words found in the relevant rent law. Dense retrieval addresses this mismatch by encoding queries and passages as vectors and comparing their meaning. Karpukhin et al. [12] showed that a dual-encoder dense passage retriever (DPR) outperformed a strong BM25 baseline by 9 to 19 percentage points in top-20 passage retrieval accuracy on open-domain question answering. Reimers and Gurevych [13] introduced Sentence-BERT, which uses siamese and triplet networks to produce sentence embeddings that can be compared efficiently with cosine similarity. It is the basis of the open-source Sentence Transformers library selected for this project.

Dense retrieval needs an efficient nearest-neighbour index. Johnson, Douze and Jégou [14] presented FAISS, a library for billion-scale similarity search that makes large vector collections practical to search. Dedicated vector databases add storage, payload metadata and filtering on top of such indexes. Qdrant [20], the vector database selected for this project, combines approximate nearest-neighbour search based on HNSW graphs with payload indexes. A search can therefore be restricted by metadata, such as legal area or topic, while still ranking results by semantic similarity.

### 2.1.4 Retrieval-Augmented Generation

Retrieval-augmented generation combines a retriever with a generator. Lewis et al. [11] introduced RAG as a model that pairs a pre-trained sequence-to-sequence generator with a dense vector index queried by a neural retriever. On knowledge-intensive question answering it outperformed models that relied only on knowledge stored in their parameters. Gao et al. [15] surveyed later work and grouped it into Naive, Advanced and Modular RAG. They present RAG as a response to three problems of LLMs: hallucination, outdated knowledge and lack of transparency about where an answer comes from. Because a RAG system can show the passages it retrieved, its answers can be traced to sources. A standalone LLM cannot offer this property, and it is essential in law.

Two legal RAG systems are especially relevant. Louis, van Dijck and Spanakis [16] built a *retrieve-then-read* pipeline for long-form legal question answering, with a lightweight bi-encoder retriever and an instruction-tuned LLM as the reader. They released LLeQA, a dataset of 1,868 expert-annotated French-language legal questions on Belgian law. Automatic metrics were promising, but qualitative analysis showed that answers still needed improvement, which confirms that retrieval alone does not guarantee correct reasoning. Cui et al. [17] developed ChatLaw, a Chinese legal LLM that adds a knowledge-base reference module to reduce hallucination. It also uses a separate model to extract legal key words from user queries before retrieval, a step similar in purpose to the fact-clarification step proposed in this project.

RAG reduces hallucination but does not remove it. Magesh et al. [9] carried out the first pre-registered evaluation of commercial RAG-based legal research tools. They found that Lexis+ AI, Westlaw AI-Assisted Research and Ask Practical Law AI each hallucinated between 17% and 33% of the time, despite vendor claims of being "hallucination-free". The tools performed better than GPT-4 alone, but errors remained substantial. Two design consequences follow, and both are adopted in this project. First, retrieval must be paired with an explicit check that every cited source was actually retrieved and supports the statement. Second, the system must say when it has no verified source instead of producing a confident answer.

### 2.1.5 Legal Document Analysis and OCR

Citizens often hold the evidence that decides their case on paper: rent agreements, notices, nikah nama, receipts and court orders. Extracting text from such documents is the first step towards analysing them. Born-digital PDF files contain a text layer that libraries such as PyMuPDF can read directly. Scanned pages and photographs need optical character recognition (OCR). The LEGAL-UQA study [19] illustrates the practical problem in Pakistan: the official English constitution was available as text, while the Urdu version was available only as images, so the authors had to use an Urdu OCR system. Once text is available, clause-level information such as rent amount, tenancy period or notice terms can be identified and linked to the user's case. Among the systems reviewed in Section 2.2, none of the Pakistani platforms states in its public description that it performs OCR on user evidence or generates a case-specific evidence checklist.

### 2.1.6 AI-Based Legal Advisory and Legal-Technology Systems

Commercial legal AI products mostly serve professionals. Lexis+ AI and Westlaw AI-Assisted Research, both evaluated in [9], are research assistants for lawyers in the United States. In South Asia, the Supreme Court of India launched SUPACE (Supreme Court Portal for Assistance in Court's Efficiency) in April 2021 to help judges gather facts and law. It was explicitly described as a research aid that does not decide cases [27].

In Pakistan, several legal-technology platforms are listed in the Stanford CodeX TechIndex, a directory of legal-technology products. The TechIndex states that its listings are informational, may be out of date and are not endorsed by Stanford. MyCounsel combines a lawyer marketplace with AI legal-research tools [21]. QanoonAI offers a database of Pakistani judgments with tools for case briefs, petition drafting, citation verification, court-fee calculation and Urdu-language guidance [22]. PakLegalAI is described as combining an AI chatbot, case-law research, legal drafting and a directory of bar-council-verified lawyers [23]. Pakistan LawBot offers AI legal question answering, statute and case-law search and lawyer discovery [24]. These platforms show both commercial interest and user demand. Their public descriptions, however, centre on research, drafting or lawyer discovery. None of them describes a workflow that clarifies a citizen's facts, grounds every answer in cited and checked law, reads the citizen's evidence and follows the case through to resolution.

The need is considerable. The World Justice Project ranked Pakistan 130th of 143 countries in its 2025 Rule of Law Index [25]. Reporting on the Law and Justice Commission of Pakistan's statistics for July to December 2023 put the number of pending cases at about 2.26 million, with about 82% of them in the district judiciary [26]. Property and family matters are typically heard at that level. The International Bar Association has also noted that Pakistan has no statutory framework yet for the use of AI in courts [28]. This underlines the need for careful, transparent and human-supervised design.

### 2.1.7 Summary of Existing Approaches and Limitations

The literature points to five limitations that this project responds to:

1. **Jurisdiction and audience.** Most legal NLP resources and tools target United States, European, Chinese or Indian law and serve professionals. Pakistani resources [18], [19] are recent and narrow in scope.
2. **Hallucination.** General LLMs hallucinate heavily on legal questions [8], and even commercial RAG tools still make substantial errors [9].
3. **Vocabulary gap.** Citizens describe facts, not statutes. Sparse keyword search struggles with this gap, while dense semantic retrieval [12], [13] handles it better.
4. **Incomplete facts.** Systems that answer the first question they receive may answer the wrong question. Pre-retrieval query processing, as in ChatLaw [17], helps, but asking the citizen targeted follow-up questions is rarely addressed.
5. **Fragmented journey.** Understanding the law, preparing evidence, finding a trustworthy lawyer and tracking progress are handled by separate tools, if they are handled at all.

## 2.2 Comparison of Previous Studies

Table 2.1 compares the research studies most relevant to this project. Table 2.2 compares legal-assistance systems. For commercial platforms the comparison relies on their public descriptions. A feature marked "Not stated" is not mentioned in the public description, which does not prove that it is absent.

**Table 2.1: Comparison of relevant research studies**

| Study | Approach | Technologies | Key features / findings | Limitations for our context |
|---------------------------|------------------------------|---------------------------------------|----------------------------------------------------|------------------------------------------------------------|
| Zhong et al., 2020 [1] | Survey and experiments on legal AI tasks | Embedding-based and symbol-based models | Covers judgment prediction, similar-case matching and legal QA | Embedding models lack interpretability and struggle with long documents; Chinese and US focus |
| Chalkidis et al., 2020 (LEGAL-BERT) [2] | Domain-adapted pre-training | BERT pre-trained on legal corpora | Legal pre-training beats generic BERT on legal tasks | Classification models; no generation, retrieval or citizen interaction; EU/UK/US data |
| Malik et al., 2021 (ILDC) [5] | Judgment prediction with explanation | Transformer models; 35k Indian Supreme Court cases | About 78% prediction accuracy vs about 94% for experts | Predicts outcomes for specialists; model reasoning differs from experts'; Indian law |
| Lewis et al., 2020 (RAG) [11] | Retrieval-augmented generation | Dense retriever plus seq2seq generator | Beats parametric-only models on knowledge-intensive QA | General-domain (Wikipedia); no legal verification or citation check |
| Karpukhin et al., 2020 (DPR) [12] | Dense passage retrieval | Dual BERT encoders | 9 to 19 points better than BM25 at top-20 accuracy | Retrieval only; general domain |
| Louis et al., 2024 (LLeQA) [16] | Retrieve-then-read legal QA | Bi-encoder retriever plus instruction-tuned LLM | Interpretable long-form answers; 1,868 expert questions | Belgian law in French; qualitative issues remain; no case workflow |
| Cui et al., 2023 (ChatLaw) [17] | Legal LLM with knowledge-base reference module | Fine-tuned open LLM, keyword extraction, similarity retrieval | Reduces hallucination using external legal knowledge | Chinese law; no evidence handling or lawyer connection |
| Dahl et al., 2024 [8] | Empirical hallucination study | Public LLMs incl. ChatGPT 4 and Llama 2 | Hallucination in at least 58% of verifiable legal queries | Shows the risk; proposes no system |
| Magesh et al., 2025 [9] | Evaluation of commercial legal RAG tools | Lexis+ AI, Westlaw AI-AR, Ask Practical Law AI | RAG lowers but does not remove errors (17-33% hallucination) | US professional tools; motivates source verification |
| Maqsood et al., 2024 [18] | Judgment prediction and explanation | Transformer models; VerdictVaultPK dataset | Pakistani rental-property case outcomes with explanations | Outcome prediction for specialists; no guidance or evidence workflow for citizens |
| Faisal and Yousaf, 2024 (LEGAL-UQA) [19] | Bilingual legal QA dataset | English-Urdu QA pairs; Urdu OCR; mT5 fine-tuning | First Urdu legal QA dataset from Pakistan's Constitution | Constitutional law only; 619 pairs; no property/family coverage |

**Table 2.2: Comparison of legal-assistance systems**

| System | Approach | Technologies (as stated) | Features | Limitations relative to this project |
|----------------------|----------------------------------|----------------------------|-----------------------------------------------------------|------------------------------------------------------------|
| Lexis+ AI / Westlaw AI-AR [9] | RAG-based legal research for professionals | Proprietary RAG over US legal databases | Research answers with citations | US law; 17-33% hallucination in independent testing; no citizen workflow |
| SUPACE (India) [27] | AI research assistant for judges | AI-assisted fact and law extraction | Helps judges gather facts and relevant law | Internal judicial tool; not for citizens |
| MyCounsel (Pakistan) [21] | Lawyer marketplace plus AI research | Not stated | Verified lawyer search, consultation booking, AI research over case law | Fact clarification, OCR, evidence checklist and grounded case explanation not stated |
| QanoonAI (Pakistan) [22] | Judgment database plus professional tools | Not stated | Case briefs, petition drafting, citation verification, Urdu guidance | Lawyer directory, case tracking, OCR and evidence checklist not stated |
| PakLegalAI (Pakistan) [23] | Chatbot plus research plus lawyer directory | Not stated | AI chatbot, case-law research, drafting, bar-council-verified lawyers | Grounding method, fact clarification, OCR, checklist and case tracking not stated |
| Pakistan LawBot (Pakistan) [24] | AI legal Q&A with search | Not stated | Legal Q&A, statute and case-law search, lawyer discovery | Grounding method, evidence handling and case tracking not stated |
| **Proposed system** | Case-centred RAG assistant with lawyer marketplace | Next.js, FastAPI, MongoDB, Qdrant, Sentence Transformers, open-source LLM, PyMuPDF, OCR | Fact clarification, cited and checked guidance, OCR and evidence checklist, public lawyer profiles, consultations, case tracking | To be evaluated against a standard LLM baseline and with real users (Chapter 1) |

### 2.2.1 Research Gap

The comparison shows that research on legal AI has advanced language understanding [2]-[4], retrieval [11]-[13] and legal question answering [16], [17]. It has also shown that unverified generation is unreliable in law [8], [9]. Yet none of the reviewed studies or systems addresses the following combination for Pakistani citizens:

1. **Citizen-oriented, grounded guidance in Pakistani property and family law.** Answers are generated only from verified Pakistani sources, and each statement carries a citation that is checked before display.
2. **Fact clarification before answering.** The system identifies missing facts and asks targeted follow-up questions.
3. **Evidence-aware analysis.** The system reads the citizen's own documents, including scans through OCR, and produces a case-specific evidence checklist.
4. **A continuous journey.** Guidance is connected to a verified lawyer marketplace with public profiles, consent-based case sharing, consultations and progress tracking until resolution.

Existing Pakistani platforms cover parts of this journey, such as research, drafting or lawyer discovery. The gap is a single, transparent, case-centred workflow for ordinary citizens in the two areas where they most often need help.

## 2.3 Research Objective

### 2.3.1 Main Objective

The main objective of this project is to design, develop and evaluate a case-centred, AI-powered legal assistance platform. The platform will help Pakistani citizens understand property and family legal issues through answers that are grounded in verified Pakistani legal sources and transparently cited, and it will connect them with verified lawyers who can take their case forward.

### 2.3.2 Specific Objectives

1. **Build a verified legal knowledge base** of Pakistani legal sources for property and family disputes. Each source is split into section-wise chunks with metadata (source, section, legal area, topic) and indexed in the Qdrant vector database using Sentence Transformers embeddings. Candidate sources include family statutes such as the Muslim Family Laws Ordinance, 1961, the West Pakistan Family Courts Act, 1964, the Dissolution of Muslim Marriages Act, 1939 and the Guardians and Wards Act, 1890, and property statutes such as the Punjab Rented Premises Act, 2009. The final list will be confirmed and verified against official text on the Pakistan Code portal [31] during the legal source identification work package.
2. **Develop a RAG-based legal assistant** that retrieves relevant law sections, generates plain-language guidance with an open-source LLM using only those sections, attaches a citation to every statement, verifies the citations before display, and reports honestly when no verified source applies. This responds to the hallucination findings in [8] and [9].
3. **Clarify facts before advising** by detecting the legal area and topic of a case and asking only the follow-up questions needed to fill missing facts.
4. **Analyse citizens' documents and evidence** by extracting text from PDFs with PyMuPDF and from scans and images with OCR, identifying key clauses, and generating a case-specific evidence checklist.
5. **Provide a verified lawyer marketplace** with public, profile-style lawyer pages, search filters (specialisation, city, fee range, experience, language, rating), consultation requests and consent-based case sharing.
6. **Track each case until resolution** through status updates from the citizen and the assigned lawyer.
7. **Provide an administration portal** to verify lawyers, manage users, profiles and legal sources, and monitor platform activity.
8. **Evaluate the system** against a standard LLM baseline using defined answer-quality measures, and measure usability with the System Usability Scale (SUS) [29], [30].

### 2.3.3 How the Proposed System Addresses the Research Gap

| Gap identified | How the proposed system responds | Objective |
|----------------------------------------|------------------------------------------------------------|---|
| Legal AI resources and tools rarely target Pakistani citizens | Verified Pakistani property and family knowledge base; plain-language guidance | 1, 2 |
| LLMs and even RAG tools hallucinate on legal questions [8], [9] | Answers only from retrieved sections; mandatory citations; citation check; honest "no verified source" response | 2 |
| Citizens describe facts, not statutes | Dense semantic retrieval with Sentence Transformers and Qdrant [12], [13], [20] | 1, 2 |
| Questions are often incomplete | Follow-up questions targeted at missing facts | 3 |
| Evidence is held on paper and in images | PyMuPDF and OCR extraction; clause identification; evidence checklist | 4 |
| Finding a trustworthy lawyer is difficult | Admin-verified lawyers with public profiles, filters and consultations | 5, 7 |
| The journey is fragmented across tools | One case record links guidance, documents, lawyer and status timeline | 6 |

The project supports legal understanding. It does not replace a qualified lawyer, and every guidance screen will state this.
