import React, { useState } from 'react';
import './App.css';
import './Chat.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import bugboxLogo from './assets/bugbox-logo.png';
import bexAvatar from './assets/bex-avatar.png'; // Avatar image
import { filterMessage } from './contentFilter';
import { generateSystemMessage } from './tutorConfig';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEBUG = true;
const OPENAI_MODEL = 'gpt-4o';

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      message: 'Hello! I am BEX, your Bugbox Tutor 🤓. How can I help you today?',
      sentTime: 'just now',
      sender: 'ChatGPT',
      direction: 'incoming',
      avatar: bexAvatar
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Onboarding state
  const [showModal, setShowModal] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentLesson, setStudentLesson] = useState('');

  const resetStudentInfo = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset your name, age, and lesson?\nThis will restart the conversation setup.'
    );
    if (confirmed) {
      debugLog('[resetStudentInfo] Student info reset confirmed.');
      setStudentName('');
      setStudentAge('');
      setStudentLesson('');
      setMessages([
        {
          message: 'Hello! I am BEX, your Bugbox Tutor 🤓. How can I help you today?',
          sentTime: 'just now',
          sender: 'ChatGPT',
          direction: 'incoming',
          avatar: bexAvatar
        },
      ]);
      setShowModal(true);
    }
  };

  const handleSend = async (message) => {
    if (!message || message.trim() === '') {
      console.warn('[handleSend] Empty message skipped.');
      return;
    }

    const result = filterMessage(message);
    if (!result.allowed) {
      setMessages(prev => [...prev, {
        message: result.reason,
        direction: 'incoming',
        sender: 'ChatGPT',
        avatar: bexAvatar,
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      return;
    }

    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
      position: 'right',
      avatar: '👤',
      sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, newMessage];
    debugLog('[handleSend] New user message:', newMessage);
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    if (!API_KEY || API_KEY === 'fake-key') {
      debugLog('[processMessageToChatGPT] No valid API key provided.');
      setMessages([
        ...chatMessages,
        {
          message: '(No connection available) Running in offline mode.',
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'left',
          avatar: bexAvatar,
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
      return;
    }

    const apiMessages = chatMessages.map((msg) => {
      const role = msg.sender === 'ChatGPT' ? 'assistant' : 'user';
      return { role, content: msg.message };
    });

    const systemMessage = generateSystemMessage(studentName, Number(studentAge), studentLesson);

    const apiRequestBody = {
      model: OPENAI_MODEL,
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const replyContent = data.choices?.[0]?.message?.content;
      if (!replyContent) {
        throw new Error("Missing message content from OpenAI.");
      }

      setMessages([
        ...chatMessages,
        {
          message: replyContent,
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'left',
          avatar: bexAvatar,
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error('[processMessageToChatGPT Error]', error);
      setMessages([
        ...chatMessages,
        {
          message: `Sorry, I encountered an error. ${error.message}`,
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'left',
          avatar: bexAvatar,
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div id="bugbox-popup-root">
      <div className="bugbox-popup">
        <div className="App">
          {/* Logo */}
          <div className="bugbox-logo-container">
            <img src={bugboxLogo} alt="BugBox Logo" className="bugbox-logo" />
          </div>

          {/* Reset chat */}
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={resetStudentInfo} style={{ backgroundColor: 'var(--bugbox-secondary)' }}>
              Reset Student Info
            </button>
          </div>

          {/* Onboarding Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Welcome to Bugbox AI!</h2>
                <p>Let's get started. Please tell me a bit about yourself.</p>
                <label>Name:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value.trimStart())}
                  placeholder="e.g. Sam"
                  autoFocus
                />
                <label>Age:</label>
                <input
                  type="number"
                  min="0"
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  placeholder="e.g. 9"
                />
                <label>Lesson (optional):</label>
                <input
                  type="text"
                  value={studentLesson}
                  onChange={(e) => setStudentLesson(e.target.value.trimStart())}
                  placeholder="e.g. Variables in Python"
                />
                <button onClick={() => setShowModal(false)}>Start Chat</button>
              </div>
            </div>
          )}

          {/* Chat */}
          <div style={{ position: 'relative', height: '800px', width: '700px' }}>
            <MainContainer>
              <ChatContainer>
                <MessageList
                  scrollBehavior="smooth"
                  typingIndicator={isTyping ? <TypingIndicator content="BEX is typing..." /> : null}
                >
                  {messages.map((msg, i) => (
                    <Message
                      key={i}
                      model={{
                        ...msg,
                        position: 'single',
                      }}
                    >
                      {msg.sender === 'ChatGPT' && (
                        <div className={`chat-avatar ${isTyping && i === messages.length - 1 ? 'blinking' : ''}`}>
                          <img src={bexAvatar} alt="BEX Avatar" />
                          {isTyping && i === messages.length - 1 && <div className="talking-mouth"></div>}
                        </div>
                      )}
                      <Message.CustomContent>
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                          {msg.message}
                        </ReactMarkdown>
                      </Message.CustomContent>
                    </Message>
                  ))}
                </MessageList>

                <MessageInput
                  placeholder="Type your message here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e)}
                  onSend={handleSend}
                  attachButton={false}
                />
              </ChatContainer>
            </MainContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

