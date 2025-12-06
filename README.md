Here is the **README.md** in English, fully professional and without emojis.

````markdown
# Assistente Codigo Kid

An intelligent web interface designed to facilitate student, class, and makeup class management for **Codigo Kid**. The system operates as an interactive chatbot that communicates with a database (Google Sheets) via a Google Apps Script API.

## Features

The system offers a chat interface and a sidebar for quick management:

* [cite_start]**Smart Chatbot:** Natural language command processing for queries and registrations[cite: 1].
* [cite_start]**Deadline Management:** Quick queries to see who finishes the course this week, next month, or who is currently overdue[cite: 1].
* **Makeup Class System (v8.3):**
    * Monitors students with absences.
    * [cite_start]Dedicated **Full Screen** interface to manage makeup classes[cite: 3].
    * [cite_start]Quick buttons to "Mark as Done" (reset absences) or "Remove" a student from the list[cite: 1].
* [cite_start]**Login Lookup:** Rapid view of logins and passwords for the current class[cite: 1].
* [cite_start]**Responsive Design:** Dark Mode interface adapted for Desktops and Mobile Devices (featuring a drawer sidebar)[cite: 5].

## Technologies Used

* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+).
* [cite_start]**Backend:** Google Apps Script (communication via `fetch` API)[cite: 4].
* [cite_start]**Style:** Dark Mode theme with custom colors (#9634F9 as primary)[cite: 5].

## How to Run

Since this is a static Front-end project that connects to an external API, you can run it on any simple web server or locally.

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR-USERNAME/assistente-codigo-kid.git](https://github.com/YOUR-USERNAME/assistente-codigo-kid.git)
cd assistente-codigo-kid
````

### 2\. Configure the API

[cite_start]The API configuration file (`config.js`) is ignored by Git for security purposes[cite: 2]. You need to manually create it in the project root:

1.  Create a file named `config.js`.
2.  [cite_start]Add the `API_URL` constant with your Google Apps Script Web App link[cite: 4]:

<!-- end list -->

```javascript
// File: config.js
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
```

### 3\. Run

Simply open the `index.html` file in your preferred browser.

## Command Examples

[cite_start]Note: The chatbot interprets commands in **Portuguese**[cite: 1]. [cite_start]You can type these commands in the chat or use the quick buttons in the sidebar[cite: 3].

  * **Queries:**
      * "Quais os logins de agora?" (What are the logins now?)
      * "Quem está atrasado?" (Who is overdue?)
      * "Quem finaliza em janeiro?" (Who finishes in January?)
      * "Consultar aluno [Name]" (Check student [Name])
  * **Manual Actions (Typed):**
      * `Adicionar aluno [Name] no curso [Course] com inicio [dd/mm/yyyy]`
      * `Adicionar observação [Text] para o aluno [Name]`
      * `Atualizar data do aluno [Name] para [dd/mm/yyyy]`

## Project Structure

  * [cite_start]`index.html`: Main structure, containing the chat, sidebar, and the full-screen makeup class page[cite: 3].
  * [cite_start]`style.css`: Complete styling, including loading animations and responsiveness for tablets/mobile phones[cite: 5].
  * [cite_start]`script.js`: Chatbot logic, Regex processing, DOM manipulation, and API communication[cite: 1].
  * [cite_start]`config.js`: (Not versioned) Stores the sensitive API URL[cite: 4, 2].

-----

Developed by **Erick Bordin**.

```
```
