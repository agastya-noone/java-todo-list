# TaskFlow - Modern Java To-Do List Application

A full-stack, enterprise-grade To-Do List web application built for a college Java assignment. Powered by a robust **Java Spring Boot** REST backend with **Spring Data JPA & Hibernate**, persistent database storage (H2 zero-setup default with seamless MySQL support), and a modern, responsive dark-themed dashboard frontend.

---

## 🚀 Technologies Used

### Backend
- **Java 17+** (JDK 17 / JDK 21 / JDK 26)
- **Spring Boot 3.3.4**
- **Spring Web** (RESTful APIs, Global Exception Handling, Input Validation)
- **Spring Data JPA** & **Hibernate** (ORM and Object-Relational Mapping)
- **Apache Maven 3.9.9** & **Maven Wrapper (`mvnw` / `mvnw.cmd`)**
- **JUnit 5** & **Spring Boot Test**

### Database
- **H2 Database (Default)**: File-based persistence (`./data/tododb`). Tasks persist on disk across restarts with zero database setup required.
- **MySQL (Supported)**: Pre-configured profile (`application-mysql.properties`) for instant connection to local MySQL instances.

### Frontend
- **HTML5** & **CSS3** (Responsive design, modern dark theme with subtle indigo/purple accents, CSS Grid & Flexbox, smooth transitions)
- **Vanilla JavaScript (ES6+)**
- **Fetch API** for asynchronous REST communication with the Spring Boot backend
- **Google Fonts** (`Plus Jakarta Sans`)

---

## 📋 Features

1. **Add New Tasks**: Create tasks with title, description, priority, and due date.
2. **View All Tasks**: Chronological and customized viewing of all tasks.
3. **Edit Existing Tasks**: Update title, description, priority, due date, and completion status.
4. **Delete Tasks**: Remove tasks with interactive confirmation to prevent accidental deletion.
5. **Mark Tasks as Completed**: One-click checkbox completion with strike-through visualization.
6. **Mark Tasks as Pending**: Easily revert completed tasks back to pending status.
7. **Priority Assignment**: Color-coded badges for **High** (Crimson), **Medium** (Amber), and **Low** (Cyan).
8. **Task Descriptions**: Detailed multi-line notes and task details.
9. **Task Due Dates**: Relative date badges (e.g. *Due Today*, *Overdue*, *Due in X days*).
10. **Status Filtering**: Filter seamlessly between **All**, **Completed**, and **Pending** tasks.
11. **Live Search**: Instant keyword search across task titles and descriptions.
12. **Statistics Dashboard**: Real-time KPI metrics calculated from database records:
    - Total Tasks
    - Completed Tasks
    - Pending Tasks
    - Completion Percentage Rate

---

## 📁 Project Folder Structure

```
java-todo-list/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── todolist/
│   │   │           ├── TodoApplication.java          # Spring Boot Main Entry Point
│   │   │           ├── config/
│   │   │           │   └── WebConfig.java            # CORS and Web MVC Configuration
│   │   │           ├── controller/
│   │   │           │   └── TaskController.java       # REST API Endpoints
│   │   │           ├── exception/
│   │   │           │   ├── GlobalExceptionHandler.java # Standardized Error Responses
│   │   │           │   └── ResourceNotFoundException.java # 404 Exception
│   │   │           ├── model/
│   │   │           │   ├── Priority.java             # Priority Enum (LOW, MEDIUM, HIGH)
│   │   │           │   └── Task.java                 # JPA Entity Definition
│   │   │           ├── repository/
│   │   │           │   └── TaskRepository.java       # Spring Data JPA Repository
│   │   │           └── service/
│   │   │               ├── TaskService.java          # Business Logic Interface
│   │   │               └── impl/
│   │   │                   └── TaskServiceImpl.java  # Service Implementation
│   │   └── resources/
│   │       ├── application.properties               # Default H2 Persistence Configuration
│   │       ├── application-mysql.properties         # Optional MySQL Profile
│   │       └── static/                              # Embedded Frontend Files
│   │           ├── css/
│   │           │   └── styles.css                   # Custom Dark Theme Styles
│   │           ├── js/
│   │           │   └── app.js                       # Frontend REST API Client
│   │           └── index.html                       # Dashboard User Interface
│   └── test/
│       └── java/
│           └── com/
│               └── todolist/
│                   └── TaskServiceTest.java         # Automated Integration Tests
├── .gitignore
├── mvnw                                             # Maven Wrapper Script (Unix/macOS)
├── mvnw.cmd                                         # Maven Wrapper Script (Windows)
├── pom.xml                                          # Maven Project Dependencies
└── README.md                                        # Documentation
```

---

## 🛠️ Installation & Prerequisites

- **Java JDK 17 or higher** installed on your system.
  - Verify with: `java -version`
- **Git** installed.
  - Verify with: `git --version`
- *(Optional)* **MySQL Server 8.0+** if you wish to run on MySQL instead of H2.

No manual Maven installation is required; the included Maven Wrapper (`mvnw` / `mvnw.cmd`) handles the build automatically!

---

## 🏃 How to Run the Application

### 1. Clone the Repository
```bash
git clone https://github.com/agastya-noone/java-todo-list.git
cd java-todo-list
```

### 2. Run with Default H2 Database (Recommended - Zero Setup)
The default configuration uses file-based H2 database (`./data/tododb`). All tasks are saved directly to disk and persist even after stopping the server.

**On Windows (Command Prompt or PowerShell):**
```powershell
.\mvnw.cmd spring-boot:run
```

**On macOS / Linux:**
```bash
./mvnw spring-boot:run
```

### 3. Run with MySQL (Optional)
If you prefer running with MySQL:
1. Ensure your MySQL server is running on port 3306.
2. Update the credentials in `src/main/resources/application-mysql.properties` if needed.
3. Start the application with the `mysql` profile:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

## 🌐 How to Access the Frontend

Once the Spring Boot application starts, the frontend is served directly by the embedded web server:

- **Web Dashboard**: Open your browser and navigate to:
  ```
  http://localhost:8080/
  ```

- **H2 Database Console** (to inspect database tables directly):
  ```
  http://localhost:8080/h2-console
  ```
  - **JDBC URL**: `jdbc:h2:file:./data/tododb`
  - **User Name**: `sa`
  - **Password**: *(leave blank)*

---

## 📡 REST API Documentation

Base URL: `http://localhost:8080/api/tasks`

| HTTP Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Retrieve all tasks (supports `?completed=true/false`, `?search=keyword`, `?priority=HIGH/MEDIUM/LOW`) | None | `200 OK` |
| **GET** | `/api/tasks/{id}` | Retrieve a specific task by its ID | None | `200 OK` / `404 Not Found` |
| **GET** | `/api/tasks/stats` | Retrieve real-time database statistics (total, completed, pending, rate) | None | `200 OK` |
| **POST** | `/api/tasks` | Create a new task with validation | JSON (see below) | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/tasks/{id}` | Update an existing task | JSON (see below) | `200 OK` / `404 Not Found` |
| **PATCH** | `/api/tasks/{id}/complete` | Mark a task as completed or pending | `{"completed": true}` (optional) | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/tasks/{id}` | Delete a task permanently | None | `200 OK` / `404 Not Found` |

### Sample Request Payloads

#### Create Task (`POST /api/tasks`):
```json
{
  "title": "Complete Java Assignment",
  "description": "Implement Spring Boot backend with Hibernate and REST APIs",
  "priority": "HIGH",
  "dueDate": "2026-11-05"
}
```

#### Update Task (`PUT /api/tasks/{id}`):
```json
{
  "title": "Review Java Assignment Submission",
  "description": "Double check all unit tests and GitHub repository",
  "priority": "MEDIUM",
  "dueDate": "2026-11-06",
  "completed": false
}
```

#### Toggle Complete (`PATCH /api/tasks/{id}/complete`):
```json
{
  "completed": true
}
```

---

## 🧪 Automated Testing

Automated integration tests are provided in `src/test/java/com/todolist/TaskServiceTest.java`.

To execute all tests:
```bash
./mvnw test
```

### Verified Test Cases:
- `testCreateTask`: Creates a task and asserts ID generation and database persistence.
- `testGetAllTasks`: Retrieves all stored tasks and confirms ordering.
- `testUpdateTask`: Updates task properties and validates modified fields.
- `testToggleCompleteTask`: Toggles completion status between completed and pending.
- `testDeleteTask`: Deletes a task and verifies `ResourceNotFoundException`.
- `testFilterTasks`: Filters tasks by status (`completed`, `pending`) and keyword search.
- `testTaskStatistics`: Validates statistical KPI calculations from live database records.

---

## 👤 Author
- **GitHub**: [agastya-noone](https://github.com/agastya-noone)
- **Repository**: [java-todo-list](https://github.com/agastya-noone/java-todo-list)
