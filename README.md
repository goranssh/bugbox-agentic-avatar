Avatar of the Chatbot
Avatar of the Chatbot is an interactive AI-powered tutoring assistant designed to help students learn coding fundamentals in an engaging and visually appealing way. It integrates OpenAI’s gpt-4o API with a modern React.js frontend, delivering clean, lesson-friendly interactions via a dynamic chat interface.

✨ Features
Real-time chat interface built with React.js.

OpenAI gpt-4o API integration for intelligent and contextual responses.

Typing indicators to show when the AI is thinking.

Syntax-aware code formatting in markdown for coding lessons.

Offline fallback mode for local development without an API key.

Clean, responsive UI styled with @chatscope/chat-ui-kit-react.

📦 Prerequisites
Before running the project, make sure you have:

Node.js v14+

npm (comes with Node)

A valid OpenAI API key (paid account required)

📚 Packages Used
react – Core frontend framework

@chatscope/chat-ui-kit-react – Chat interface components

@chatscope/chat-ui-kit-styles – Styling for chat UI components

dotenv – Securely load environment variables like the API key

🚀 Installation
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/yourusername/avatar-of-the-chatbot.git
cd avatar-of-the-chatbot
2. Install Dependencies
bash
Copy
Edit
npm install
3. Create an Environment File
Since your OpenAI API key is sensitive, store it securely using a .env file.

bash
Copy
Edit
touch .env
Inside .env:

ini
Copy
Edit
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
⚠ Never commit your .env file to a public repository.

▶ Running the Application
Once dependencies are installed and your API key is configured:

bash
Copy
Edit
npm run dev
This starts the development server at http://localhost:5173/ where you can chat with the AI.

🔍 How It Works
Frontend – Built with React.js and styled using @chatscope/chat-ui-kit-react.

API Integration – Messages are sent to the OpenAI gpt-4o API and responses are displayed in the chat interface.

Typing Indicators – Shows when the AI is generating a response.

System Prompt Control – A predefined system message sets tone and ensures proper markdown formatting for code.

Error Handling – Handles network issues, invalid keys, and API failures with a fallback "offline mode."

⚠ Security Notes
Do not expose your API key in code or commits.

Keep the .env file private.

Use the provided DEBUG flag to control console output during development.

🛠 Future Improvements
User authentication for controlled access

Custom themes and animations for enhanced UI

Save/load chat history from local storage

Educator dashboard with analytics on student interactions

📜 License
This project is licensed under the MIT License.
