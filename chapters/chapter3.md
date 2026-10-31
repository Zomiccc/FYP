# Chapter 3: Requirements Specification and Analysis

This chapter specifies what the *AI Legal Advisor and Analyzer* must do and how well it must do it, then analyses the requirements through use cases, sequence diagrams, a domain model and user-interface prototypes. All requirements describe the planned system. None of them should be read as already implemented.

The system has three portals: the **User portal** for citizens, the **Lawyer portal** and the **Admin portal**. It is built on the architecture defined in Chapter 1:

- **Presentation layer:** React / Next.js.
- **Application layer:** a Python FastAPI backend with REST APIs.
- **Data layer:** MongoDB for application data, a file store for uploaded documents, and the Qdrant vector database for legal-text embeddings.
- **AI services:** Sentence Transformers for embeddings, an open-source large language model (LLM) for grounded generation, PyMuPDF for PDF text extraction, and an OCR engine for scanned documents and images.

The legal scope is limited to **property disputes** and **family disputes** under Pakistani law.

Each requirement has a unique identifier and a priority:

- **High:** essential for the final demonstration.
- **Medium:** planned and expected.
- **Low:** delivered if time permits.

## 3.1 Functional Requirements

### 3.1.1 User Portal (Citizen)

**Table 3.1: Functional requirements of the User portal**

| ID | Requirement | Description | Priority |
|------------|----------------|------------------------------------------------------------|---|
| | **Authentication and profile** | | |
| UFR-01 | Register account | The system shall allow a citizen to register with full name, email, mobile number and password. The email address shall be verified before the account is activated. | High |
| UFR-02 | Log in and log out | The system shall authenticate users with email and password and issue a signed access token for subsequent requests. | High |
| UFR-03 | Reset password | The system shall allow a user to reset a forgotten password through a time-limited link sent by email. | Medium |
| UFR-04 | Manage profile | The system shall allow a user to view and update personal details (name, phone, city, preferred language) and change the password. | Medium |
| UFR-05 | Delete account | The system shall allow a user to request deletion of the account and personal case data, subject to the retention rules in NFR-PRV-04. | Low |
| | **AI legal assistance** | | |
| UFR-06 | Describe a legal problem | The system shall allow a user to describe a problem in free text. This starts an AI chat session linked to a new or existing case. | High |
| UFR-07 | Detect legal area and topic | The system shall classify the problem into a legal area (property or family) and a topic (e.g. tenancy and eviction, inheritance, khula, maintenance, custody), and shall let the user correct the classification. | High |
| UFR-08 | Ask follow-up questions | The system shall identify facts that are missing for the detected topic and ask the user only the follow-up questions needed to fill them, one at a time, before giving guidance. | High |
| UFR-09 | Retrieve relevant law | The system shall convert the clarified case into a query embedding (Sentence Transformers) and retrieve the top-k most relevant law sections and case references from Qdrant, filtered by legal area. | High |
| UFR-10 | Generate grounded guidance | The system shall send the open-source LLM a prompt containing only the retrieved sections, the case facts and an instruction to answer only from those sections, and shall present the answer in plain language. | High |
| UFR-11 | Cite sources | The system shall attach a citation (law or judgment title, section or paragraph, and quoted text) to every statement of the guidance and display a sources list. | High |
| UFR-12 | Verify citations | The system shall check that every citation in a generated answer refers to a retrieved source before showing the answer. An answer that fails the check shall be regenerated or withheld. | High |
| UFR-13 | Handle unsupported questions | When no verified source is sufficiently relevant, or the question is outside property and family law, the system shall say so and recommend consulting a verified lawyer instead of producing an answer. | High |
| UFR-14 | Show disclaimer | Every guidance screen shall state that the platform provides legal information and does not replace a qualified lawyer. | High |
| UFR-15 | Continue the conversation | The system shall let the user ask further questions in the same chat session, reusing the stored case facts and history. | Medium |
| | **Case management and documents** | | |
| UFR-16 | Create and manage cases | The system shall allow a user to create, rename, view and close cases. Each case stores its legal area, topic, facts, chat sessions, guidance, documents and status. | High |
| UFR-17 | Upload documents | The system shall allow a user to upload PDF, JPG and PNG files (e.g. rent agreement, notice, nikah nama, receipts) to a case. | High |
| UFR-18 | Extract document text | The system shall extract text with PyMuPDF for digital PDFs and with OCR for scanned files and images, and shall record the extraction method. | High |
| UFR-19 | Identify key clauses | The system shall identify key clauses in uploaded agreements and notices (e.g. parties, rent, term, notice period, dower amount) and show them to the user. | Medium |
| UFR-20 | Generate evidence checklist | The system shall generate a case-specific checklist of documents and evidence to prepare, and shall mark an item as available when a matching document is uploaded. | High |
| UFR-21 | Generate case summary | The system shall generate a short case summary (facts, issues, relevant law, available evidence) that can be shared with a lawyer. | Medium |
| | **Lawyer search and consultations** | | |
| UFR-22 | Search lawyers | The system shall allow a user to search verified lawyers and filter by specialisation, city, fee range, years of experience, language and rating. | High |
| UFR-23 | View public lawyer profile | The system shall display a public, professional-network-style profile for each verified lawyer: photo, headline, about section, practice areas, experience history, education and qualifications, bar enrolment details, languages, fee range, rating and reviews. | High |
| UFR-24 | Request consultation | The system shall allow a user to send a consultation request to a lawyer, stating the preferred mode (online or in person), preferred time and a message. | High |
| UFR-25 | Share case with consent | The system shall share a case with a lawyer only after the user explicitly agrees, and shall show exactly which items (summary, guidance, documents, contact details) will be shared. | High |
| UFR-26 | Revoke sharing | The system shall allow a user to stop sharing a case with a lawyer at any time. | Medium |
| UFR-27 | Message lawyer | The system shall provide in-app messaging between the user and the lawyer within an accepted consultation. | Medium |
| UFR-28 | Rate and review | The system shall allow a user to rate (1-5) and review a lawyer after a consultation is marked completed. | Low |
| | **Case tracking and notifications** | | |
| UFR-29 | Track case progress | The system shall show a timeline of each case: creation, clarification, guidance, documents, consultations and every status update, until the case is resolved or closed. | High |
| UFR-30 | Receive notifications | The system shall notify the user in-app, and optionally by email, when a lawyer responds, a consultation is scheduled or the case status changes. | Medium |

### 3.1.2 Lawyer Portal

**Table 3.2: Functional requirements of the Lawyer portal**

| ID | Requirement | Description | Priority |
|------------|-----------------|------------------------------------------------------------|----|
| LFR-01 | Register as lawyer | The system shall allow a lawyer to register with personal details, bar enrolment/licence number, issuing bar council and a copy of the licence, and shall create the account in a *pending verification* state. | High |
| LFR-02 | Log in and log out | The system shall authenticate lawyers in the same way as users, with access restricted to Lawyer-portal functions. | High |
| LFR-03 | Build public profile | The system shall allow a lawyer to create and edit a public profile: headline, about, practice areas (property, family and sub-topics), experience entries, education and qualifications, languages, city, office address, fee range and profile photo. | High |
| LFR-04 | Profile visibility | The system shall publish a lawyer's profile in the directory only after an administrator has verified the lawyer, and shall show a "Verified" badge. | High |
| LFR-05 | Manage availability | The system shall allow a lawyer to set availability for consultations and to pause new requests. | Medium |
| LFR-06 | View consultation requests | The system shall list incoming consultation requests with the case title, legal area, case summary and evidence-checklist progress shared by the user. | High |
| LFR-07 | Respond to requests | The system shall allow a lawyer to accept, decline or propose another time for a consultation request, optionally with a message. | High |
| LFR-08 | Access shared case | The system shall give a lawyer read-only access to the case items the user consented to share, for as long as sharing is active. | High |
| LFR-09 | Message user | The system shall allow a lawyer to exchange messages with the user within an accepted consultation. | Medium |
| LFR-10 | Post case updates | The system shall allow a lawyer to post status updates and notes on an accepted case; these appear on the user's case timeline. | High |
| LFR-11 | Complete consultation | The system shall allow a lawyer to mark a consultation as completed, which enables the user to leave a review. | Medium |
| LFR-12 | View dashboard | The system shall show the lawyer counts of new requests, active cases, completed consultations and average rating. | Medium |

### 3.1.3 Admin Portal

**Table 3.3: Functional requirements of the Admin portal**

| ID | Requirement | Description | Priority |
|------------|-------------------|------------------------------------------------------------|-----|
| AFR-01 | Secure admin login | The system shall allow only accounts with the administrator role to access the Admin portal. | High |
| AFR-02 | Verify lawyers | The system shall list pending lawyer registrations with submitted licence documents and allow an administrator to approve or reject each, recording the reason and the administrator's identity. | High |
| AFR-03 | Manage users and lawyers | The system shall allow an administrator to search, view, suspend, reactivate and remove user and lawyer accounts. | High |
| AFR-04 | Moderate profiles and reviews | The system shall allow an administrator to review and remove inappropriate profile content and reviews, including items reported by users. | Medium |
| AFR-05 | Manage legal sources | The system shall allow an administrator to add a legal source (statute, ordinance, rules or judgment) with metadata (title, type, year, legal area, official URL) and mark it as verified. | High |
| AFR-06 | Index legal sources | The system shall extract the text of a new source (PyMuPDF/OCR), split it into section-wise chunks with metadata, generate embeddings and store them in Qdrant. Only verified sources shall be searchable. | High |
| AFR-07 | Update or retire sources | The system shall allow an administrator to re-index an amended source or retire an outdated one so that it is no longer retrieved. | Medium |
| AFR-08 | Monitor platform activity | The system shall show a dashboard with counts of users, verified lawyers, open cases, consultations, indexed sections and guidance requests, and the rate of withheld (unsupported) answers. | Medium |
| AFR-09 | View audit log | The system shall record administrative actions (verification, suspension, source changes) in an audit log that administrators can view and filter. | Medium |

## 3.2 Non-Functional Requirements

The following targets are design goals. They will be measured during testing and evaluation and may be adjusted to the capacity of the deployment server.

**Table 3.4: Non-functional requirements**

| ID | Category | Requirement | Measure / verification |
|------------|----------|------------------------------------------------------------|----------------------|
| NFR-SEC-01 | Security | Passwords shall be stored only as salted hashes (bcrypt or Argon2). | Code review; database inspection |
| NFR-SEC-02 | Security | All client-server traffic shall use HTTPS. APIs shall require a signed access token, and every endpoint shall check the caller's role (user, lawyer, admin). | Penetration and access-control tests |
| NFR-SEC-03 | Security | Uploaded files shall be checked for type and size (e.g. at most 10 MB) and stored outside the public web root. | Upload tests with invalid files |
| NFR-SEC-04 | Security | Text from user messages and uploaded documents shall be treated as data, never as instructions to the LLM, to resist prompt injection. | Adversarial prompt tests |
| NFR-PRF-01 | Performance | Non-AI pages shall load within 2 seconds for 95% of requests under normal load. | Load testing |
| NFR-PRF-02 | Performance | Retrieval from Qdrant shall return results within 1 second. A complete guidance answer shall be produced within 30 seconds for 90% of requests, with a progress indicator shown meanwhile. | Timed test runs |
| NFR-PRF-03 | Performance | OCR of a single-page image shall complete within 15 seconds. | Timed test runs |
| NFR-REL-01 | Reliability | If the LLM, OCR or vector service fails, the system shall show a clear error and preserve the case, chat history and uploaded files without loss. | Fault-injection tests |
| NFR-REL-02 | Reliability | Long-running tasks (OCR, indexing) shall run asynchronously and be retried on failure. | Integration tests |
| NFR-REL-03 | Reliability | The deployed system shall target 99% availability during the evaluation period, with regular database backups. | Uptime monitoring |
| NFR-SCL-01 | Scalability | The frontend, backend, MongoDB and Qdrant shall run as separate components that can be scaled or replaced independently. | Architecture review |
| NFR-SCL-02 | Scalability | New legal areas shall be addable by ingesting verified sources, without changing the RAG pipeline code. | Ingestion test with a new source |
| NFR-USA-01 | Usability | A first-time user shall be able to create a case and read guidance without assistance. | Task-based usability test |
| NFR-USA-02 | Usability | The system shall achieve a System Usability Scale (SUS) score of at least 68 [29], [30]. | SUS questionnaire |
| NFR-USA-03 | Usability | Guidance shall use plain language, explain unavoidable legal terms, and the interface shall be responsive on desktop and mobile. | Expert review; device testing |
| NFR-MNT-01 | Maintainability | The code shall be version-controlled with Git, follow a layered structure (routes, services, repositories), and expose documented REST APIs (OpenAPI). | Code review |
| NFR-MNT-02 | Maintainability | Prompts, retrieval parameters (e.g. top-k) and model names shall be configurable without code changes. | Configuration review |
| NFR-PRV-01 | Data privacy | A case shall be visible only to its owner, to lawyers with active consent, and to administrators for moderation. | Access-control tests |
| NFR-PRV-02 | Data privacy | A lawyer's public profile shall not expose personal contact details until a consultation is accepted. | UI and API review |
| NFR-PRV-03 | Data privacy | Case text and documents shall not be used to train models and shall not be sent to third-party services without the user's consent. | Configuration review |
| NFR-PRV-04 | Data privacy | Deleted accounts and cases shall be removed or anonymised, except records that must be kept for audit. | Deletion tests |
| NFR-ACC-01 | Accuracy | Every statement in a guidance answer shall cite a retrieved, verified source (100% citation coverage on the test set). | Automated citation check |
| NFR-ACC-02 | Accuracy | On a test set of property and family questions, the RAG system shall score higher than a standard LLM baseline on the defined quality measures (correctness, groundedness, citation accuracy). | Comparative evaluation |
| NFR-ACC-03 | Accuracy | For out-of-scope or unsupported questions, the system shall decline instead of answering. | Test set of negative cases |
| NFR-ACC-04 | Accuracy | Document text extraction shall be checked against manually transcribed samples to measure OCR quality. | Character-level comparison on samples |

## 3.3 System Use Case Modeling

The system has three primary actors and two secondary (supporting) actors:

| Actor | Type | Role |
|------------|----------|------------------------------------------------------------|
| **User (Citizen)** | Primary | Describes legal problems, receives grounded guidance, uploads evidence, finds lawyers, requests consultations and tracks cases. |
| **Lawyer** | Primary | Maintains a public profile, handles consultation requests, accesses shared cases and posts case updates. |
| **Admin** | Primary | Verifies lawyers, manages accounts and legal sources, and monitors platform activity. |
| **AI Services** | Secondary (system) | Embedding model, Qdrant retrieval, open-source LLM and OCR that support guidance and document analysis. |
| **Email Service** | Secondary (external) | Sends verification, password-reset and notification emails. |

Mermaid has no native UML use-case notation. Figures 3.1 to 3.3 therefore use flowchart nodes in the conventional style: actors outside the system boundary, use cases as rounded nodes inside it, and dashed arrows for `<<include>>` and `<<extend>>` relationships.

**Figure 3.1: Use case diagram, User portal**

```mermaid
flowchart LR
    User["User (Citizen)"]
    AI["AI Services"]
    subgraph SYS["AI Legal Advisor and Analyzer: User Portal"]
        UC1(["UC-01 Register and Authenticate"])
        UC2(["UC-02 Create Case and Clarify Facts"])
        UC3(["UC-03 Obtain AI Legal Guidance"])
        UC4(["UC-04 Upload and Analyse Documents"])
        UC5(["UC-05 Search Lawyers and View Profile"])
        UC6(["UC-06 Request Consultation and Share Case"])
        UC7(["UC-07 Track Case Progress"])
        UCv(["Verify Citations"])
        UCck(["Generate Evidence Checklist"])
        UCrv(["Rate and Review Lawyer"])
    end
    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC4
    User --- UC5
    User --- UC6
    User --- UC7
    UC3 -. "include" .-> UCv
    UC4 -. "include" .-> UCck
    UC3 -. "include" .-> UC2
    UCrv -. "extend" .-> UC7
    UC3 --- AI
    UC4 --- AI
```

**Figure 3.2: Use case diagram, Lawyer portal**

```mermaid
flowchart LR
    Lawyer["Lawyer"]
    subgraph SYS["AI Legal Advisor and Analyzer: Lawyer Portal"]
        UC1(["UC-01 Register and Authenticate"])
        UC8(["UC-08 Manage Public Profile and Verification Request"])
        UC9(["UC-09 Handle Consultation Requests"])
        UC9b(["View Shared Case"])
        UC9c(["Post Case Status Update"])
        UC9d(["Message User"])
    end
    Lawyer --- UC1
    Lawyer --- UC8
    Lawyer --- UC9
    UC9 -. "include" .-> UC9b
    UC9c -. "extend" .-> UC9
    UC9d -. "extend" .-> UC9
```

**Figure 3.3: Use case diagram, Admin portal**

```mermaid
flowchart LR
    Admin["Admin"]
    AI["AI Services"]
    subgraph SYS["AI Legal Advisor and Analyzer: Admin Portal"]
        UC1(["UC-01 Authenticate"])
        UC10(["UC-10 Verify Lawyer Accounts"])
        UC11(["UC-11 Manage Legal Knowledge Base"])
        UC12(["UC-12 Manage Users and Monitor Activity"])
        UC11b(["Index Source into Qdrant"])
        UC12b(["Moderate Profiles and Reviews"])
        UC12c(["View Audit Log"])
    end
    Admin --- UC1
    Admin --- UC10
    Admin --- UC11
    Admin --- UC12
    UC11 -. "include" .-> UC11b
    UC12b -. "extend" .-> UC12
    UC12c -. "extend" .-> UC12
    UC11b --- AI
```

**Actor interactions.** The User drives the main journey: describe the problem, clarify facts, receive guidance, add evidence, find a lawyer, request a consultation and follow the case. The Lawyer enters the journey only when a User shares a case with consent, and can then respond, communicate and post updates that the User sees on the case timeline. The Admin is not part of individual cases. The Admin keeps the platform trustworthy by verifying lawyers, controlling which legal sources the AI may use, and moderating content.

### 3.3.1 Use Case 1: Register and Authenticate

| Field | Description |
|-------------|------------------------------------------------------------|
| **ID** | UC-01 |
| **Actors** | User, Lawyer, Admin (primary); Email Service (secondary) |
| **Description** | A person creates an account in the chosen role and logs in to the matching portal. |
| **Related requirements** | UFR-01 to UFR-04, LFR-01, LFR-02, AFR-01 |
| **Preconditions** | The person has a valid email address. For login, the account exists and is not suspended. |
| **Postconditions** | A new account is stored with a hashed password and an assigned role (lawyers in *pending verification*); on login, an access token is issued and the role's dashboard is shown. |

**Main flow**

1. The person opens the registration page and selects a role (User or Lawyer).
2. The person enters the required details; a lawyer also enters bar enrolment details and uploads the licence.
3. The system validates the input and checks that the email is not already registered.
4. The system stores the account with a hashed password and sends a verification email.
5. The person opens the verification link; the system activates the account.
6. The person logs in with email and password; the system verifies the credentials, issues an access token and opens the dashboard for the role.

**Alternative flows**

- *3a. Email already registered:* the system shows an error and offers login or password reset.
- *5a. Link expired:* the system offers to resend the verification email.
- *6a. Wrong credentials:* the system shows a generic error; after repeated failures it temporarily locks login for that account.
- *6b. Lawyer not yet verified:* the lawyer can log in and edit the profile, but the profile is not listed in the directory (LFR-04).
- *6c. Account suspended:* login is refused with a message to contact support.

### 3.3.2 Use Case 2: Create Case and Clarify Facts

| Field | Description |
|-------------|----------------------------------------------------|
| **ID** | UC-02 |
| **Actors** | User (primary); AI Services (secondary) |
| **Description** | The user describes a legal problem; the system classifies it and asks only the follow-up questions needed to complete the facts. |
| **Related requirements** | UFR-06, UFR-07, UFR-08, UFR-16 |
| **Preconditions** | The user is logged in. |
| **Postconditions** | A case exists with a legal area, topic, problem description and a set of answered follow-up questions; its status is *Clarified*. |

**Main flow**

1. The user selects "New case" and describes the problem in their own words.
2. The system creates a case and an AI chat session and stores the description.
3. The system classifies the legal area (property or family) and topic and shows them to the user.
4. The system compares the stated facts with the facts required for that topic and finds the missing ones.
5. The system asks one follow-up question; the user answers. Steps 4-5 repeat until no required fact is missing.
6. The system marks the case as *Clarified* and offers to generate guidance (UC-03).

**Alternative flows**

- *3a. Wrong classification:* the user changes the area or topic and the system recalculates the missing facts.
- *3b. Outside property and family law:* the system explains the scope limitation and suggests finding a lawyer (UC-05).
- *5a. User does not know the answer:* the user selects "Not sure"; the fact is recorded as unknown and the guidance will state the assumption.
- *5b. User uploads a document instead of answering:* UC-04 runs and extracted facts fill the missing items.

### 3.3.3 Use Case 3: Obtain AI Legal Guidance

| Field | Description |
|-------------|------------------------------------------------------------|
| **ID** | UC-03 |
| **Actors** | User (primary); AI Services (secondary) |
| **Description** | The system retrieves relevant Pakistani law and case references and generates plain-language guidance with verified citations. |
| **Related requirements** | UFR-09 to UFR-15 |
| **Preconditions** | The user is logged in and the case is *Clarified* (UC-02). The knowledge base contains verified, indexed sources. |
| **Postconditions** | A guidance record with citations is stored and linked to the case and chat session; the case status becomes *Guidance ready*. |

**Main flow**

1. The user requests guidance for the case.
2. The system builds a query from the case facts and creates its embedding with Sentence Transformers.
3. The system searches Qdrant for the top-k most similar law sections, filtered by legal area.
4. The system builds a grounded prompt (instructions, retrieved sections, case facts and question) and sends it to the open-source LLM.
5. The LLM returns a draft answer with source tags.
6. The system checks that every tag refers to a retrieved section and that every statement has a tag.
7. The system displays the plain-language answer, the sources list, the evidence checklist and the disclaimer.

**Alternative flows**

- *3a. No section above the relevance threshold:* the system states that no verified source covers the question and recommends a verified lawyer (UFR-13).
- *6a. Citation check fails:* the system regenerates once; if it fails again the answer is withheld and the user is told so.
- *4a. LLM service unavailable:* the system shows an error, keeps the case, and lets the user retry later (NFR-REL-01).
- *7a. Follow-up question:* the user asks a further question and the flow restarts from step 2 within the same session (UFR-15).

### 3.3.4 Use Case 4: Upload and Analyse Documents

| Field | Description |
|-------------|--------------------------------------------------|
| **ID** | UC-04 |
| **Actors** | User (primary); AI Services (secondary) |
| **Description** | The user uploads evidence; the system extracts text, identifies key clauses and updates the evidence checklist. |
| **Related requirements** | UFR-17 to UFR-20 |
| **Preconditions** | The user is logged in and has an open case. |
| **Postconditions** | The document, its extracted text and its clauses are stored; checklist items supported by the document are marked as available. |

**Main flow**

1. The user selects a case and uploads a PDF, JPG or PNG file.
2. The system validates type and size and saves the file in the document store.
3. The system checks whether the PDF has a text layer; if so it extracts text with PyMuPDF, otherwise it runs OCR.
4. The system identifies key clauses (e.g. parties, rent, term, notice period, dower) and links the document to the case.
5. The system updates the evidence checklist and shows the extracted clauses to the user.

**Alternative flows**

- *2a. Invalid type or size:* the upload is rejected with a reason.
- *3a. OCR text unreadable (low quality):* the system asks for a clearer image; the file is kept but marked *Low quality*.
- *4a. No recognised clauses:* the document is stored with its text and the user can label its type manually.

### 3.3.5 Use Case 5: Search Lawyers and View Public Profile

| Field | Description |
|-------------|-----------------------------------|
| **ID** | UC-05 |
| **Actors** | User (primary) |
| **Description** | The user finds verified lawyers and reads their public profiles. |
| **Related requirements** | UFR-22, UFR-23 |
| **Preconditions** | At least one lawyer has been verified (UC-10). Viewing a profile does not require a case. |
| **Postconditions** | None (read-only), unless the user continues to UC-06. |

**Main flow**

1. The user opens the lawyer directory, optionally from a guidance screen that pre-fills the legal area and city.
2. The user applies filters (specialisation, city, fee range, experience, language, rating).
3. The system returns verified lawyers that match, sorted by relevance and rating.
4. The user opens a profile; the system shows headline, about, practice areas, experience, education, bar details, languages, fees, rating and reviews.

**Alternative flows**

- *3a. No match:* the system suggests widening the filters (e.g. nearby cities or a wider fee range).

### 3.3.6 Use Case 6: Request Consultation and Share Case

| Field | Description |
|-------------|--------------------------------------------------------|
| **ID** | UC-06 |
| **Actors** | User (primary); Lawyer (secondary, notified) |
| **Description** | The user asks a verified lawyer for a consultation and shares the case after explicit consent. |
| **Related requirements** | UFR-21, UFR-24 to UFR-27, UFR-30 |
| **Preconditions** | The user is logged in, has a case and has opened a verified lawyer's profile (UC-05). |
| **Postconditions** | A consultation with status *Requested* exists; a consent record lists the items shared with the lawyer; the lawyer is notified. |

**Main flow**

1. The user selects "Request consultation" on the lawyer's profile.
2. The user selects the case, the preferred mode (online or in person), preferred time, and writes a message.
3. The system shows the consent screen listing what will be shared (case summary, guidance, documents, contact details) and lets the user untick optional items.
4. The user confirms consent.
5. The system creates the consultation and consent record, generates the case summary if needed, and notifies the lawyer.
6. The case timeline shows "Consultation requested".

**Alternative flows**

- *4a. User declines consent:* no consultation is created.
- *5a. Lawyer has paused new requests:* the system informs the user and suggests other lawyers.
- *Later. User revokes sharing:* the lawyer's access ends immediately and the timeline records the revocation (UFR-26).

### 3.3.7 Use Case 7: Track Case Progress

| Field | Description |
|-------------|------------------------------------|
| **ID** | UC-07 |
| **Actors** | User (primary) |
| **Description** | The user follows the case from creation to resolution. |
| **Related requirements** | UFR-29, UFR-30, UFR-28 |
| **Preconditions** | The user is logged in and owns the case. |
| **Postconditions** | The case may be marked *Resolved* or *Closed*; after a completed consultation the user may leave a review. |

**Main flow**

1. The user opens a case from the dashboard.
2. The system shows the case status, the timeline of events, the checklist progress and consultation details.
3. When the lawyer posts an update, the system adds it to the timeline and notifies the user.
4. When the matter is settled, the user marks the case as *Resolved*.

**Alternative flows**

- *4a. Consultation completed:* the system invites the user to rate and review the lawyer (extension, UFR-28).
- *4b. User abandons the case:* the user closes it; the data is kept until the user deletes it.

### 3.3.8 Use Case 8: Manage Public Profile and Verification Request

| Field | Description |
|-------------|--------------------------------------------|
| **ID** | UC-08 |
| **Actors** | Lawyer (primary); Admin (secondary) |
| **Description** | The lawyer builds a public profile and submits it for verification. |
| **Related requirements** | LFR-01, LFR-03 to LFR-05 |
| **Preconditions** | The lawyer is registered and logged in. |
| **Postconditions** | The profile is saved; a verification request is pending for the Admin. After approval, the profile is listed with a *Verified* badge. |

**Main flow**

1. The lawyer opens "My profile" and edits headline, about, practice areas, experience, education, languages, city, fees and photo.
2. The system validates and saves the profile, showing a preview of the public page.
3. The lawyer submits (or re-submits) the verification request with bar details and licence copy.
4. The system creates a verification request and notifies administrators.

**Alternative flows**

- *4a. Request rejected:* the lawyer sees the reason, corrects the details and re-submits.
- *1a. Verified lawyer edits bar details:* the profile returns to *pending verification* for those fields.

### 3.3.9 Use Case 9: Handle Consultation Requests and Update Case

| Field | Description |
|-------------|-------------------------------------------------------|
| **ID** | UC-09 |
| **Actors** | Lawyer (primary); User (secondary, notified) |
| **Description** | The lawyer reviews a consultation request, accepts or declines it, and posts progress on the case. |
| **Related requirements** | LFR-06 to LFR-11 |
| **Preconditions** | The lawyer is verified and logged in; a consultation request with active consent exists. |
| **Postconditions** | The consultation status changes (*Accepted*, *Declined*, *Scheduled*, *Completed*); updates appear on the user's case timeline. |

**Main flow**

1. The lawyer opens the requests list and selects a request.
2. The system shows the shared case summary, guidance, documents and checklist progress.
3. The lawyer accepts and confirms a time; the system updates the status to *Scheduled* and notifies the user.
4. During the matter, the lawyer posts status updates and messages; the system records each on the timeline.
5. After the consultation, the lawyer marks it *Completed*.

**Alternative flows**

- *3a. Decline:* the lawyer declines with an optional reason; the user is notified and the shared access ends.
- *3b. Propose another time:* the lawyer suggests a new time; the user accepts or cancels.
- *2a. Consent revoked:* the case is no longer visible and the request is closed.

### 3.3.10 Use Case 10: Verify Lawyer Accounts

| Field | Description |
|-------------|-------------------------------------------------|
| **ID** | UC-10 |
| **Actors** | Admin (primary); Lawyer (secondary, notified) |
| **Description** | The Admin checks a lawyer's submitted credentials and approves or rejects the account. |
| **Related requirements** | AFR-02, AFR-09, LFR-04 |
| **Preconditions** | The Admin is logged in; a pending verification request exists. |
| **Postconditions** | The lawyer's status is *Verified* or *Rejected*; the decision is recorded in the audit log and the lawyer is notified. |

**Main flow**

1. The Admin opens the verification queue.
2. The system shows the lawyer's details, bar enrolment information and licence document.
3. The Admin checks the details against the issuing bar council's records (outside the system) and approves.
4. The system sets the status to *Verified*, lists the profile in the directory, logs the action and notifies the lawyer.

**Alternative flows**

- *3a. Details do not match:* the Admin rejects with a reason; the lawyer is notified and may re-submit.
- *3b. More information needed:* the Admin requests clarification; the request stays pending.

### 3.3.11 Use Case 11: Manage Legal Knowledge Base

| Field | Description |
|-------------|-----------------------------------------------------|
| **ID** | UC-11 |
| **Actors** | Admin (primary); AI Services (secondary) |
| **Description** | The Admin adds, verifies, re-indexes or retires a legal source used by the AI assistant. |
| **Related requirements** | AFR-05 to AFR-07, NFR-SCL-02 |
| **Preconditions** | The Admin is logged in and holds the official text of the source. |
| **Postconditions** | The source and its section chunks are stored in MongoDB and their embeddings in Qdrant; only verified, active sources are retrievable. |

**Main flow**

1. The Admin selects "Add legal source" and uploads the official text with metadata (title, type, year, legal area, official URL).
2. The system extracts the text (PyMuPDF or OCR).
3. The system splits the text into section-wise chunks and attaches metadata to each.
4. The system creates an embedding for each chunk and upserts it into Qdrant with the chunk metadata as payload.
5. The Admin reviews a sample of chunks and marks the source as *Verified*; it becomes retrievable.

**Alternative flows**

- *3a. Section structure not detected:* the system falls back to fixed-length chunks with overlap and flags the source for manual review.
- *Later. Source amended:* the Admin uploads the new text; the system re-indexes and retires the old chunks.
- *Later. Source repealed:* the Admin retires it; its chunks are excluded from retrieval but kept for past citations.

### 3.3.12 Use Case 12: Manage Users and Monitor Activity

| Field | Description |
|-------------|--------------------------------|
| **ID** | UC-12 |
| **Actors** | Admin (primary) |
| **Description** | The Admin manages accounts, moderates content and monitors platform activity. |
| **Related requirements** | AFR-03, AFR-04, AFR-08, AFR-09 |
| **Preconditions** | The Admin is logged in. |
| **Postconditions** | Account or content changes are applied and recorded in the audit log. |

**Main flow**

1. The Admin opens the dashboard and views platform statistics.
2. The Admin searches for a user or lawyer and opens the account.
3. The Admin suspends, reactivates or removes the account, giving a reason.
4. The system applies the change, ends active sessions if suspended, and logs the action.

**Alternative flows**

- *2a. Reported content:* the Admin opens the reports queue and removes or keeps the reported profile item or review (extension).
- *1a. Audit review:* the Admin filters the audit log by date, administrator or action type (extension).

## 3.4 System Sequence Diagrams

The sequence diagrams show how the actors, the Next.js frontend, the FastAPI backend services, the AI services and the data stores interact in the main workflows. Solid arrows are requests and dashed arrows are responses.

### 3.4.1 Registration and Login

**Figure 3.4: Sequence diagram, registration and login**

```mermaid
sequenceDiagram
    autonumber
    actor P as User / Lawyer
    participant FE as Next.js Frontend
    participant API as FastAPI (Auth Service)
    participant DB as MongoDB
    participant EM as Email Service
    P->>FE: Fill registration form (role, details)
    FE->>API: POST /auth/register
    API->>DB: Check email exists
    DB-->>API: Not found
    API->>API: Hash password (bcrypt/Argon2)
    API->>DB: Insert account (status = unverified)
    API->>EM: Send verification link
    API-->>FE: 201 Created
    P->>FE: Open verification link
    FE->>API: GET /auth/verify?token=...
    API->>DB: Set status = active
    P->>FE: Enter email and password
    FE->>API: POST /auth/login
    API->>DB: Fetch account by email
    DB-->>API: Account (hash, role, status)
    alt valid credentials and active
        API-->>FE: Access token + role
        FE-->>P: Open role dashboard
    else invalid or suspended
        API-->>FE: 401 / 403 error
        FE-->>P: Show error message
    end
```

The Auth Service never stores plain passwords. It issues a signed token that carries the role, and every later request is checked against that role (NFR-SEC-02). A lawyer account is active after email verification but stays unlisted until UC-10 approves it.

### 3.4.2 Case Creation and Fact Clarification

**Figure 3.5: Sequence diagram, case creation and fact clarification**

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Next.js Frontend
    participant CS as FastAPI (Case Service)
    participant FU as Follow-up Engine
    participant LLM as Open-source LLM
    participant DB as MongoDB
    U->>FE: Describe problem
    FE->>CS: POST /cases (description)
    CS->>DB: Insert case + chat session
    CS->>FU: Classify and find missing facts
    FU->>LLM: Classify area/topic (structured output)
    LLM-->>FU: Area = property, topic = tenancy
    FU->>FU: Compare facts with topic checklist
    FU-->>CS: Missing facts list
    CS-->>FE: Case created + first follow-up question
    loop until no required fact is missing
        FE-->>U: Show question
        U->>FE: Answer
        FE->>CS: POST /cases/{id}/answers
        CS->>DB: Store question and answer
        CS->>FU: Next missing fact?
        FU-->>CS: Next question or none
    end
    CS->>DB: Update case status = Clarified
    CS-->>FE: Ready for guidance
```

The LLM classifies the problem, but the list of required facts per topic is defined by the team and stored with the system. As a result, the follow-up questions are predictable and can be tested.

### 3.4.3 AI Legal Guidance (RAG)

**Figure 3.6: Sequence diagram, AI legal guidance with retrieval and citation verification**

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Next.js Frontend
    participant RAG as FastAPI (RAG Service)
    participant EMB as Sentence Transformers
    participant QD as Qdrant
    participant LLM as Open-source LLM
    participant CC as Citation Checker
    participant DB as MongoDB
    U->>FE: Request guidance
    FE->>RAG: POST /cases/{id}/guidance
    RAG->>DB: Load case facts and history
    RAG->>EMB: Embed query
    EMB-->>RAG: Query vector
    RAG->>QD: Similarity search (top-k, filter: legal area)
    QD-->>RAG: Sections + payload (source, section, score)
    alt no section above threshold
        RAG-->>FE: "No verified source found" + lawyer suggestion
    else relevant sections found
        RAG->>LLM: Grounded prompt (rules + sections + facts)
        LLM-->>RAG: Draft answer with [S1], [S2] tags
        RAG->>CC: Verify tags against retrieved sections
        alt citations valid
            CC-->>RAG: Pass
            RAG->>DB: Save guidance + citations + checklist
            RAG-->>FE: Answer, sources, checklist, disclaimer
        else citation check fails
            CC-->>RAG: Fail
            RAG->>LLM: Regenerate once
            RAG-->>FE: Answer if it passes, otherwise withheld
        end
    end
    FE-->>U: Display result
```

This is the central workflow of the project. The LLM never queries the databases. The RAG Service retrieves the sections first and passes only those sections to the LLM, then checks the returned citations before anything is displayed. This design responds directly to the hallucination findings in [8] and [9].

### 3.4.4 Document Upload, OCR and Evidence Checklist

**Figure 3.7: Sequence diagram, document upload and analysis**

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Next.js Frontend
    participant DP as FastAPI (Document Processor)
    participant FS as File Store
    participant PDF as PyMuPDF
    participant OCR as OCR Engine
    participant LLM as Open-source LLM
    participant DB as MongoDB
    U->>FE: Upload file to case
    FE->>DP: POST /cases/{id}/documents
    DP->>DP: Validate type and size
    DP->>FS: Save file
    DP->>DB: Insert document (status = processing)
    DP-->>FE: 202 Accepted
    alt PDF with text layer
        DP->>PDF: Extract text
        PDF-->>DP: Text
    else scan or image
        DP->>OCR: Recognise text
        OCR-->>DP: Text
    end
    DP->>LLM: Extract key clauses (structured fields)
    LLM-->>DP: Clauses (parties, rent, term, notice...)
    DP->>DB: Save text and clauses, update checklist items
    DP-->>FE: Notify processing complete
    FE-->>U: Show clauses and updated checklist
```

Extraction runs asynchronously, so the user is never blocked while a large scan is processed (NFR-REL-02). Clause extraction uses the user's own document as input. It does not depend on legal retrieval and produces structured fields that the user can see and correct.

### 3.4.5 Lawyer Search, Public Profile and Consultation Request

**Figure 3.8: Sequence diagram, lawyer search and consultation request**

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Next.js Frontend
    participant LD as FastAPI (Lawyer Directory)
    participant CN as FastAPI (Consultation Service)
    participant DB as MongoDB
    actor L as Lawyer
    U->>FE: Search with filters
    FE->>LD: GET /lawyers?area=&city=&fee=&lang=&rating=
    LD->>DB: Query verified lawyers
    DB-->>LD: Matching profiles
    LD-->>FE: Results
    U->>FE: Open public profile
    FE->>LD: GET /lawyers/{id}
    LD-->>FE: Profile, experience, education, reviews
    U->>FE: Request consultation (case, mode, time, message)
    FE-->>U: Consent screen (items to share)
    U->>FE: Confirm consent
    FE->>CN: POST /consultations
    CN->>DB: Insert consultation (Requested) + consent record
    CN->>DB: Add timeline event to case
    CN-->>FE: Request sent
    CN--)L: Notification: new consultation request
```

Only lawyers with *Verified* status are returned. Contact details are released only after the lawyer accepts (NFR-PRV-02). The consent record defines exactly which case items the lawyer may read.

### 3.4.6 Lawyer Handles Consultation and Updates Case

**Figure 3.9: Sequence diagram, lawyer response and case update**

```mermaid
sequenceDiagram
    autonumber
    actor L as Lawyer
    participant FE as Next.js (Lawyer Portal)
    participant CN as FastAPI (Consultation Service)
    participant CS as FastAPI (Case Service)
    participant DB as MongoDB
    actor U as User
    L->>FE: Open request
    FE->>CN: GET /consultations/{id}
    CN->>DB: Check consent active
    DB-->>CN: Consent + shared items
    CN-->>FE: Case summary, guidance, documents
    L->>FE: Accept and confirm time
    FE->>CN: PATCH /consultations/{id} (Scheduled)
    CN->>DB: Update status
    CN--)U: Notification: consultation scheduled
    L->>FE: Post status update and note
    FE->>CS: POST /cases/{id}/updates
    CS->>DB: Insert status update (timeline)
    CS--)U: Notification: case updated
    L->>FE: Mark consultation completed
    FE->>CN: PATCH /consultations/{id} (Completed)
    CN--)U: Invitation to review lawyer
```

Every read by the lawyer is checked against the active consent record. If the user revokes consent, the next request is refused and the consultation is closed.

### 3.4.7 Admin Verifies a Lawyer

**Figure 3.10: Sequence diagram, lawyer verification**

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant FE as Next.js (Admin Portal)
    participant AS as FastAPI (Admin Service)
    participant DB as MongoDB
    participant FS as File Store
    actor L as Lawyer
    A->>FE: Open verification queue
    FE->>AS: GET /admin/verifications?status=pending
    AS->>DB: Fetch pending requests
    DB-->>AS: Requests
    AS-->>FE: List
    A->>FE: Open request
    FE->>AS: GET /admin/verifications/{id}
    AS->>FS: Fetch licence document
    AS-->>FE: Details + document
    alt approve
        A->>FE: Approve
        FE->>AS: POST /admin/verifications/{id}/approve
        AS->>DB: Lawyer status = Verified, list profile
    else reject
        A->>FE: Reject with reason
        FE->>AS: POST /admin/verifications/{id}/reject
        AS->>DB: Lawyer status = Rejected
    end
    AS->>DB: Write audit log entry
    AS--)L: Notification of decision
```

### 3.4.8 Admin Adds a Legal Source (Knowledge Base Ingestion)

**Figure 3.11: Sequence diagram, legal source ingestion**

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant FE as Next.js (Admin Portal)
    participant KB as FastAPI (Knowledge Base Builder)
    participant PDF as PyMuPDF / OCR
    participant EMB as Sentence Transformers
    participant QD as Qdrant
    participant DB as MongoDB
    A->>FE: Upload official text + metadata
    FE->>KB: POST /admin/sources
    KB->>DB: Insert source (status = processing)
    KB->>PDF: Extract text
    PDF-->>KB: Text
    KB->>KB: Split into section-wise chunks + metadata
    loop for each chunk
        KB->>EMB: Embed chunk text
        EMB-->>KB: Vector
        KB->>QD: Upsert point (vector, payload: chunk id, area, topic)
        KB->>DB: Insert chunk record
    end
    KB->>DB: Source status = awaiting review
    KB-->>FE: Ingestion complete
    A->>FE: Review sample chunks and mark verified
    FE->>KB: PATCH /admin/sources/{id} (Verified)
    KB->>DB: Source active and retrievable
```

This is the offline phase of the RAG pipeline described in Chapter 1. Each Qdrant point carries the chunk identifier in its payload, so any retrieved vector can be traced back to its source and section for citation.

## 3.5 Domain Model

The domain model identifies the main entities of the system, their key attributes, and their relationships with cardinalities. `Account` is an abstract generalisation of the three actor types: `User` (citizen), `Lawyer` and `Admin`. `Case` is the central entity of the model.

**Figure 3.12: Domain model (UML class diagram)**

```mermaid
classDiagram
    direction LR
    class Account {
        <<abstract>>
        +accountId
        +fullName
        +email
        +phone
        +passwordHash
        +role
        +status
        +createdAt
    }
    class User {
        +city
        +preferredLanguage
    }
    class Lawyer {
        +headline
        +about
        +practiceAreas
        +barEnrolmentNo
        +barCouncil
        +city
        +officeAddress
        +languages
        +feeMin
        +feeMax
        +experienceYears
        +verificationStatus
        +ratingAverage
        +acceptingRequests
    }
    class Admin {
        +adminLevel
    }
    class Experience {
        +title
        +organisation
        +startDate
        +endDate
        +description
    }
    class Qualification {
        +degree
        +institution
        +year
    }
    class VerificationRequest {
        +licenceDocument
        +submittedAt
        +decision
        +reason
        +decidedAt
    }
    class Case {
        +caseId
        +title
        +legalArea
        +topic
        +description
        +status
        +createdAt
        +updatedAt
    }
    class FollowUpQuestion {
        +requiredFact
        +question
        +answer
        +answeredAt
    }
    class ChatSession {
        +sessionId
        +startedAt
    }
    class ChatMessage {
        +sender
        +text
        +sentAt
    }
    class LegalGuidance {
        +answerText
        +modelName
        +citationCheckPassed
        +generatedAt
    }
    class Citation {
        +label
        +quotedText
        +similarityScore
    }
    class LegalSource {
        +title
        +sourceType
        +year
        +legalArea
        +officialUrl
        +status
    }
    class LegalSection {
        +sectionRef
        +heading
        +text
        +topic
        +vectorId
    }
    class LegalDocument {
        +fileName
        +fileType
        +storagePath
        +extractionMethod
        +extractedText
        +uploadedAt
    }
    class Clause {
        +clauseType
        +value
    }
    class EvidenceChecklist {
        +createdAt
    }
    class ChecklistItem {
        +description
        +required
        +available
    }
    class Consultation {
        +mode
        +requestedTime
        +scheduledTime
        +status
        +message
    }
    class ConsentRecord {
        +sharedItems
        +grantedAt
        +revokedAt
    }
    class ConsultationMessage {
        +senderRole
        +text
        +sentAt
    }
    class CaseStatusUpdate {
        +status
        +note
        +postedBy
        +postedAt
    }
    class Review {
        +rating
        +comment
        +createdAt
    }
    class Notification {
        +type
        +text
        +read
        +createdAt
    }
    class AuditLog {
        +action
        +targetType
        +targetId
        +reason
        +timestamp
    }

    Account <|-- User
    Account <|-- Lawyer
    Account <|-- Admin
    Lawyer "1" *-- "0..*" Experience : lists
    Lawyer "1" *-- "0..*" Qualification : holds
    Lawyer "1" -- "1..*" VerificationRequest : submits
    Admin "1" -- "0..*" VerificationRequest : decides
    User "1" -- "0..*" Case : opens
    Case "1" *-- "0..*" FollowUpQuestion : clarified by
    Case "1" *-- "1..*" ChatSession : discussed in
    ChatSession "1" *-- "1..*" ChatMessage : contains
    ChatMessage "1" -- "0..1" LegalGuidance : delivers
    LegalGuidance "1" *-- "1..*" Citation : supported by
    Citation "0..*" --> "1" LegalSection : quotes
    LegalSource "1" *-- "1..*" LegalSection : divided into
    Admin "1" -- "0..*" LegalSource : verifies
    Case "1" *-- "0..*" LegalDocument : has
    LegalDocument "1" *-- "0..*" Clause : contains
    Case "1" *-- "0..1" EvidenceChecklist : needs
    EvidenceChecklist "1" *-- "1..*" ChecklistItem : lists
    ChecklistItem "0..*" --> "0..1" LegalDocument : satisfied by
    Case "1" -- "0..*" Consultation : discussed in
    User "1" -- "0..*" Consultation : requests
    Lawyer "1" -- "0..*" Consultation : handles
    Consultation "1" *-- "1" ConsentRecord : governed by
    Consultation "1" *-- "0..*" ConsultationMessage : contains
    Case "1" *-- "0..*" CaseStatusUpdate : history
    Consultation "1" -- "0..1" Review : rated by
    User "1" -- "0..*" Review : writes
    Lawyer "1" -- "0..*" Review : receives
    Account "1" -- "0..*" Notification : receives
    Admin "1" -- "0..*" AuditLog : recorded in
```

**Table 3.5: Main entities and their purpose**

| Entity | Purpose | Persistence |
|---------------------|------------------------------------------------------|------------|
| Account / User / Lawyer / Admin | Identity, role and role-specific data; `Lawyer` also holds the public profile. | MongoDB |
| Experience, Qualification | LinkedIn-style profile sections of a lawyer. | MongoDB (embedded in lawyer) |
| VerificationRequest | A lawyer's submitted credentials and the Admin's decision. | MongoDB + file store |
| Case | Central record of a citizen's legal problem and its status. | MongoDB |
| FollowUpQuestion | A missing fact asked about and the user's answer. | MongoDB |
| ChatSession, ChatMessage | The conversation between the user and the AI assistant. | MongoDB |
| LegalGuidance, Citation | An AI answer and the verified references supporting each statement. | MongoDB |
| LegalSource, LegalSection | Verified statutes, rules and judgments, split into sections. | MongoDB (text, metadata) + Qdrant (embedding) |
| LegalDocument, Clause | A user's uploaded evidence and the clauses extracted from it. | File store + MongoDB |
| EvidenceChecklist, ChecklistItem | Case-specific list of documents to prepare. | MongoDB |
| Consultation, ConsentRecord, ConsultationMessage | A user-lawyer engagement, what the user agreed to share, and the messages exchanged. | MongoDB |
| CaseStatusUpdate | Timeline entries posted by the user, lawyer or system. | MongoDB |
| Review | Rating and comment after a completed consultation. | MongoDB |
| Notification, AuditLog | User alerts and a record of administrative actions. | MongoDB |

**Key cardinalities explained.**

- A **User** may open many **Cases** (1 to 0..*), but each case belongs to exactly one user.
- A **Case** is discussed in one or more **ChatSessions**. Each assistant message may deliver at most one **LegalGuidance**, and every guidance must have at least one **Citation** (1..*). This enforces the rule that no unsupported answer is stored.
- Each **Citation** quotes exactly one **LegalSection**, and a section may be cited by many answers.
- A **Consultation** links one user, one lawyer and one case, and is governed by exactly one **ConsentRecord**. Users and lawyers are thereby connected many-to-many through consultations.
- A **Consultation** can receive at most one **Review**, which prevents duplicate reviews of the same engagement.

## 3.6 User Interface Design (Prototypes)

The interfaces follow five design principles derived from the requirements:

1. **Plain language first:** labels and guidance avoid unexplained legal terms (NFR-USA-03).
2. **Proof is visible:** every guidance statement shows a source tag that opens the cited law (UFR-11).
3. **Ask, don't assume:** missing facts are requested through short questions, and the facts collected so far are always shown (UFR-08).
4. **Consent before sharing:** the user sees exactly what a lawyer will receive (UFR-25).
5. **One consistent layout:** all three portals use the same sidebar navigation, colour palette (dark teal with gold accents) and components, and are responsive (NFR-USA-03).

High-fidelity prototypes of the core screens were produced as a clickable HTML prototype. Screens marked "To be prototyped" are specified here and will be designed in the next iteration.

**Figure 3.13: Portal navigation map**

```mermaid
flowchart TD
    L["Login / Register"] --> UD["User Dashboard"]
    L --> LD["Lawyer Dashboard"]
    L --> AD["Admin Dashboard"]
    UD --> NC["New Case"] --> FQ["Follow-up Questions"] --> GD["AI Guidance + Sources"]
    GD --> DC["Documents + Checklist"]
    GD --> DIR["Lawyer Directory"] --> PP["Public Lawyer Profile"] --> CR["Consultation Request + Consent"]
    UD --> TR["Case Tracking Timeline"]
    CR --> TR
    LD --> REQ["Consultation Requests"] --> SC["Shared Case View"] --> UPD["Post Update / Message"]
    LD --> PE["Profile Editor + Verification"]
    AD --> VQ["Lawyer Verification Queue"]
    AD --> UM["User and Lawyer Management"]
    AD --> KB["Legal Knowledge Base"]
    AD --> AL["Audit Log and Reports"]
```

### 3.6.1 Authentication Screens

| Screen | Purpose and key elements | Requirements | Status |
|--------|------------------------------------------------------------|-------------|---------------|
| Sign in | Role selector (User, Lawyer, Admin), email, password, "Forgot password", link to register. A side panel explains the platform and the disclaimer. | UFR-02, LFR-02, AFR-01 | Prototyped (Figure 3.14) |
| Register | Role-specific form; lawyers also enter bar enrolment number, bar council and upload the licence. | UFR-01, LFR-01 | To be prototyped |
| Reset password | Email entry, then a new-password form from the emailed link. | UFR-03 | To be prototyped |

**Figure 3.14: Sign-in screen with role selection**

![](../design/prototype/screens/01_login.png)

### 3.6.2 User Portal

| Screen | Purpose and key elements | Requirements | Status |
|-----------------|------------------------------------------------------------|-------------|---------------------------|
| User dashboard | Summary cards (open cases, cases needing an answer, shared cases), "New case" button, recent cases table with area and status. | UFR-16, UFR-29 | Prototyped (Figure 3.15) |
| New case | Title and free-text description, optional document attachment, detected legal area and topic with "Change area". | UFR-06, UFR-07 | Prototyped (Figure 3.16) |
| AI chat / follow-up questions | Chat view with the user's messages and the assistant's numbered follow-up questions; side panel "Facts so far" with completed and missing facts. | UFR-08, UFR-15 | Prototyped (Figure 3.17) |
| AI legal guidance | Plain-language answer with inline source tags, sources table (law, section, match), disclaimer, evidence checklist with progress bar, and "Find a lawyer" call to action. | UFR-10 to UFR-14, UFR-20 | Prototyped (Figure 3.18) |
| Documents | Drag-and-drop upload, file list with extraction method (PyMuPDF/OCR) and status, extracted key clauses. | UFR-17 to UFR-19 | Prototyped (Figure 3.19) |
| Lawyer directory | Filter panel (specialisation, city, fee, experience, language, rating) and result cards with verified badge, rating and fee range. | UFR-22 | Prototyped (Figure 3.20) |
| Public lawyer profile | Professional-network-style page: photo, headline, verified badge, about, practice areas, experience timeline, education, languages, fee range, reviews and "Request consultation". | UFR-23 | Header and consent dialog prototyped (Figure 3.21); full profile body to be prototyped |
| Consultation request and consent | Form for case, mode, preferred time and message, followed by a consent dialog listing the shared items. | UFR-24, UFR-25 | Consent dialog prototyped (Figure 3.21) |
| Case tracking | Case header with status, vertical timeline of events and lawyer updates, assigned lawyer card, checklist progress, "Stop sharing". | UFR-26, UFR-29 | Prototyped (Figure 3.22) |
| Consultation messages | Message thread with the lawyer inside an accepted consultation. | UFR-27 | To be prototyped |
| Profile and settings | Personal details, password change, notification preferences, account deletion. | UFR-04, UFR-05, UFR-30 | To be prototyped |

**Figure 3.15: User dashboard**

![](../design/prototype/screens/02_dashboard.png)

**Figure 3.16: New case screen**

![](../design/prototype/screens/03_newcase.png)

**Figure 3.17: AI chat with follow-up questions**

![](../design/prototype/screens/04_followup.png)

**Figure 3.18: AI legal guidance with sources and evidence checklist**

![](../design/prototype/screens/05_guidance.png)

**Figure 3.19: Document upload and clause extraction**

![](../design/prototype/screens/06_documents.png)

**Figure 3.20: Lawyer directory with filters**

![](../design/prototype/screens/07_directory.png)

**Figure 3.21: Lawyer profile header and consent dialog before sharing a case**

![](../design/prototype/screens/08_profile.png)

**Figure 3.22: Case tracking timeline**

![](../design/prototype/screens/09_tracking.png)

### 3.6.3 Lawyer Portal

| Screen | Purpose and key elements | Requirements | Status |
|--------------|------------------------------------------------------------|-----------------|---------------|
| Lawyer dashboard | Cards for new requests, active cases, completed consultations and rating; table of new consultation requests with Accept/Decline; form to post a status update. | LFR-06, LFR-07, LFR-10, LFR-12 | Prototyped (Figure 3.23) |
| Profile editor | Sections for headline, about, practice areas, experience entries, education, languages, fees and photo, with a live preview of the public page and the verification status. | LFR-03 to LFR-05 | To be prototyped |
| Shared case view | Read-only case summary, AI guidance with sources, documents and checklist, limited to consented items. | LFR-08 | To be prototyped |
| Consultation detail | Schedule, status controls (Scheduled, Completed), message thread with the user. | LFR-07, LFR-09, LFR-11 | To be prototyped |

**Figure 3.23: Lawyer portal dashboard**

![](../design/prototype/screens/10_lawyer.png)

### 3.6.4 Admin Portal

| Screen | Purpose and key elements | Requirements | Status |
|----------------|------------------------------------------------------------|-----------|-----------------------|
| Admin dashboard | Platform statistics (users, verified lawyers, open cases, indexed sections); lawyer verification queue with Approve/Reject; knowledge-base summary per legal area. | AFR-02, AFR-05, AFR-08 | Prototyped (Figure 3.24) |
| User and lawyer management | Searchable table of accounts with role, status and actions (suspend, reactivate, remove). | AFR-03 | To be prototyped |
| Legal knowledge base | List of sources with type, year, area, status (processing, awaiting review, verified, retired); "Add source"; chunk review panel. | AFR-05 to AFR-07 | Summary prototyped (Figure 3.24); full screen to be prototyped |
| Reports and moderation | Queue of reported profile items and reviews with keep/remove actions. | AFR-04 | To be prototyped |
| Audit log | Filterable list of administrative actions by date, admin and action type. | AFR-09 | To be prototyped |

**Figure 3.24: Admin portal dashboard**

![](../design/prototype/screens/11_admin.png)

The prototypes use sample data (names, fees, statistics and example legal text) for illustration only. They reflect the planned behaviour of the system and do not represent implemented functionality.
