
# Study Progress Tracker

A full-stack web application designed to help learners organize their learning goals, manage topics, track study sessions, and monitor their learning progress. The application also provides a Mentor module that allows mentors to monitor assigned learners and manage study-related settings.

## Project Overview

The Study Progress Tracker provides separate experiences for Learners and Mentors.

Learners can create learning goals, organize topics, define topic prerequisites, record study sessions, and monitor their progress.

Mentors can view their assigned learners, monitor their learning activities, and configure study-related settings.

## Features

### Learner Module

- User registration and login.
- Learner dashboard.
- Create and manage learning goals.
- Add and manage topics under goals.
- Set prerequisites between topics.
- Track topic completion and learning progress.
- Record study sessions.
- View study history and progress information.

### Mentor Module

- Mentor dashboard.
- View assigned learners.
- Monitor learner goals and progress.
- View learner study activities.
- Configure mentor settings.
- Set minimum and maximum study session durations.
- Configure the maximum number of prerequisites allowed.

### Authentication and Access Control

- Separate Learner and Mentor access.
- Authenticated access to protected features.
- Role-based permissions for mentor-specific functionality.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

### Backend
- Python
- Django
- Django REST Framework
- REST APIs

### Database
- PostgreSQL

### Tools
- Visual Studio Code
- Git
- GitHub
- Postman

## Application Architecture

The application follows a frontend-backend architecture.

1. The React frontend provides the user interface.
2. Axios sends HTTP requests to the Django REST Framework APIs.
3. Django processes requests and applies application logic.
4. PostgreSQL stores application data.
5. API responses are returned to the frontend and displayed to users.

## How It Works

### Learner Workflow

1. Register and log in as a learner.
2. Access the learner dashboard.
3. Create learning goals.
4. Add topics to the goals.
5. Define prerequisites between topics.
6. Track learning progress.
7. Record study sessions.
8. Review study history and progress.

### Mentor Workflow

1. Log in using a mentor account.
2. Access the mentor dashboard.
3. View assigned learners.
4. Monitor learner goals and progress.
5. Review learner study activities.
6. Configure mentor settings.

## Project Structure

The project is organized into separate frontend and backend folders.

```text
study-progress-tracker/
│
├── backend/
│   ├── manage.py
│   ├── core/
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following before running the application:

- Python
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Jaimitha13/study-progress-tracker.git
```

Navigate to the project folder:

```bash
cd study-progress-tracker
```

### 2. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the PostgreSQL database connection in the Django settings according to your local database configuration.

Run database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend server will run at:

```text
http://127.0.0.1:8000/
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open the local frontend address displayed in the terminal.

## API Architecture

The backend uses Django REST Framework to provide REST APIs for frontend communication.

The API functionality covers:

- User authentication.
- Goals management.
- Topics management.
- Topic prerequisites.
- Study sessions.
- Study history and progress.
- Mentor dashboard.
- Assigned learner information.
- Mentor settings.

The frontend communicates with these APIs using Axios.

## Testing

Backend automated tests can be executed using Django's test framework.

Navigate to the backend folder and run:

```bash
python manage.py test
```

The application should be tested for important functionality, including:

- User registration and authentication.
- Goal creation and management.
- Topic creation and management.
- Topic prerequisite validation.
- Study session validation.
- Learner access permissions.
- Mentor-only access permissions.
- Mentor settings.
- Progress tracking.
- API response validation.

## Demo Video

Watch the Study Progress Tracker project demonstration:

[Click here to watch the Demo Video](https://drive.google.com/file/d/15WaDZsxhNQB5_lk4HKH3bVsY8HORGEQ6/view)

## Source Code

GitHub Repository:

https://github.com/Jaimitha13/study-progress-tracker

## Author

**Jaimitha LK**

GitHub: [Jaimitha13](https://github.com/Jaimitha13)
