# Assistente Codigo Kid

This project is a web-based chatbot interface designed to streamline school management for the Codigo Kid unit. It connects to a Google Sheets database via a Google Apps Script API to manage student data, deadlines, and makeup classes.

## Learning Journey

**I developed this project to solve real-world administrative challenges.**

I built this application to practice and solidify my knowledge in frontend development, specifically focusing on:
* Asynchronous JavaScript (Async/Await and Fetch API).
* DOM Manipulation and Event Handling.
* Regular Expressions (Regex) for natural language processing.
* Responsive Design (CSS Grid/Flexbox) for mobile and desktop compatibility.

Constructive feedback is highly appreciated as I continue to improve my skills.

## Technologies Used

This project was built using the following stack:

* **JavaScript (ES6+)**: Handles the chatbot logic, API communication, and UI updates.
* **HTML5**: Provides the semantic structure for the chat interface and management dashboards.
* **CSS3**: Custom styling with a dark theme, including animations and responsive layouts.
* **Google Apps Script**: Serves as the backend API to interact with Google Sheets.

## How to Run

Since this is a static frontend project, it does not require a build process. However, you must configure the API connection manually.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR-USERNAME/assistente-codigo-kid.git](https://github.com/YOUR-USERNAME/assistente-codigo-kid.git)
    cd assistente-codigo-kid
    ```

2.  **Configure the API (Crucial Step):**
    The `config.js` file is excluded from version control for security reasons. You must create it manually in the root folder.
    
    * Create a file named `config.js`.
    * Add the following code inside it (replace with your actual Google Apps Script URL):
    
    ```javascript
    const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
    ```

3.  **Run the application:**
    Simply open the `index.html` file in your preferred web browser.

## Features

* **Intelligent Chatbot:**
    * Interprets natural language commands to find student information.
    * Example commands: "Who is overdue?", "Who finishes in January?", "Check student [Name]".
* **Makeup Class Management (Full Screen):**
    * Dedicated interface to view students with absences.
    * One-click options to "Mark as Done" (reset absences) or "Remove" students.
* **Deadline Tracking:**
    * Automated queries to identify students finishing the course in the current week or month.
* **Login Retrieval:**
    * Quickly fetch login credentials for the current class.
* **Responsive Interface:**
    * Optimized for both desktop monitors and mobile devices (using a drawer sidebar menu).

## Project Structure

The project follows a simple structure separating concerns:

* `index.html`: The main structure containing the chat container, sidebar, and full-screen overlays.
* `style.css`: Contains all visual styles, including the dark color palette and loading animations.
* `script.js`: Contains the core logic, including the regex patterns for command recognition and the `fetch` functions for the API.
* `config.js`: (Local only) Stores the sensitive API endpoint.

---
*Developed by Erick Bordin as a portfolio project.*
