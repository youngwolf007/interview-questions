import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './style.css';
import { sendMessage, getChatHistory, getCurrentSessionId, generateUUID } from './services';
import chatBg from './img/chat_bg.png';
import botSvg from './img/bot.svg';
import botChatSvg from './img/botchat.svg';
import chatClipartSvg from './img/chat-clipart.svg';
import minimizeSvg from './img/minimize.svg';
import maximizeSvg from './img/maximize.svg';
import closeSvg from './img/close.svg';
import suggestionSvg from './img/suggestion.svg';
import sendIconSvg from './img/send_icon.svg';

const VDIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your VDI Assistant. I can help you troubleshoot VDI issues. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(getCurrentSessionId());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount if session exists
  useEffect(() => {
    const loadChatHistory = async () => {
      if (sessionId) {
        try {
          const historyData = await getChatHistory(sessionId, 50);
          if (historyData && historyData.history && historyData.history.length > 0) {
            const loadedMessages = historyData.history.map((msg, index) => ({
              id: generateUUID(),
              text: msg.content,
              sender: msg.role === 'user' ? 'user' : 'bot',
              timestamp: new Date()
            }));
            setMessages(loadedMessages);
            setShowLanding(false);
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    };
    loadChatHistory();
  }, []);

  // Initialize session ID if not exists
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = generateUUID();
      localStorage.setItem('session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const addMessage = (text, sender, metadata = null) => {
    const newMessage = {
      id: generateUUID(),
      text,
      sender,
      timestamp: new Date(),
      metadata // Store response_type, phase, options, etc.
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };



  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Hide landing page when sending first message
    setShowLanding(false);
    
    addMessage(inputValue, 'user');
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Call backend chat endpoint - all decision making is done in backend
      const response = await sendMessage(sessionId, userInput);
      
      // Backend returns new format: { response_type, response, intent, phase, slot_asking, options, collected_slots }
      const botResponse = response?.response || "I apologize, but I'm having trouble responding right now. Please try again.";
      
      addMessage(botResponse, 'bot', response);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage("I'm sorry, I'm having trouble connecting to the server. Please check your connection and try again.", 'bot', {
        response_type: 'error',
        phase: 'complete'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOptionClick = (option, messageId) => {
    // Hide landing if still showing
    setShowLanding(false);
    
    // Track that this option has been selected for this message
    setSelectedOptions(prev => [...prev, { messageId, option }]);
    
    // Add the selected option as user message
    addMessage(option, 'user');
    setIsLoading(true);

    // Send the option as a message to backend
    sendMessage(sessionId, option)
      .then(response => {
        const botResponse = response?.response || "I apologize, but I'm having trouble responding right now. Please try again.";
        addMessage(botResponse, 'bot', response);
      })
      .catch(error => {
        console.error('Error sending option:', error);
        addMessage("I'm sorry, I'm having trouble connecting to the server.", 'bot', {
          response_type: 'error',
          phase: 'complete'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleMinimize = () => {
    setIsChatOpen(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleFAQClick = (question) => {
    setInputValue(question);
    setShowLanding(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render options/buttons based on response type
  const ResponseOptions = ({ metadata, messageId }) => {
    if (!metadata || !metadata.options || metadata.options.length === 0) {
      return null;
    }

    const isConfirmation = metadata.response_type === 'confirmation_request';

    if (!isConfirmation && metadata.response_type !== 'followup_question') {
      return null;
    }

    // Check if any option from this message has been selected
    const hasOptionBeenSelected = metadata.options.some(option => 
      selectedOptions.some(selected => selected.messageId === messageId && selected.option === option)
    );

    if (hasOptionBeenSelected) {
      return null; // Hide only the options, not the message content
    }

    return (
      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {metadata.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option, messageId)}
            className="static-options-btn"
            style={{
              backgroundColor: isConfirmation && option.toLowerCase() === 'yes' ? '#28a745' : 
                               isConfirmation && option.toLowerCase() === 'no' ? '#dc3545' : '#e6f1ff',
              color: isConfirmation ? 'white' : '#0073CB',
              border: isConfirmation ? 'none' : (option.toLowerCase() === 'yes' ? '1px solid #28a745' : option.toLowerCase() === 'no' ? '1px solid #dc3545' : '1px solid #bddaff'),
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {isConfirmation && option.toLowerCase() === 'yes' && '✓ '}
            {isConfirmation && option.toLowerCase() === 'no' && '✗ '}
            {option}
          </button>
        ))}
      </div>
    );
  };



  // Custom renderer for markdown components
  const MarkdownContent = ({ content }) => {
    const components = {
      // Custom link component
      a: ({ href, children }) => (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#0077DB', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {children}
        </a>
      ),
      // Custom heading component
      h1: ({ children }) => (
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>
          {children}
        </h3>
      ),
      // Custom paragraph component
      p: ({ children }) => (
        <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
          {children}
        </p>
      ),
      // Custom list components
      li: ({ children }) => (
        <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
          {children}
        </li>
      ),
      ol: ({ children }) => (
        <ol style={{ marginBottom: '12px', paddingLeft: '20px' }}>
          {children}
        </ol>
      ),
      ul: ({ children }) => (
        <ul style={{ marginBottom: '12px', paddingLeft: '20px' }}>
          {children}
        </ul>
      ),
      // Custom bold component
      strong: ({ children }) => (
        <strong style={{ fontWeight: 'bold', color: '#034598' }}>
          {children}
        </strong>
      ),
      // Custom blockquote for warnings/notes
      blockquote: ({ children }) => (
        <blockquote style={{ 
          borderLeft: '4px solid #0077DB', 
          paddingLeft: '12px', 
          margin: '12px 0', 
          backgroundColor: '#F7FBFF',
          padding: '10px 12px',
          borderRadius: '4px'
        }}>
          {children}
        </blockquote>
      ),
      // Custom code component
      code: ({ children, className }) => {
        if (className === 'language-plaintext') {
          return (
            <pre style={{ 
              backgroundColor: '#f4f4f4', 
              padding: '12px', 
              borderRadius: '4px', 
              overflowX: 'auto',
              marginBottom: '12px'
            }}>
              <code>{children}</code>
            </pre>
          );
        }
        return (
          <code style={{ 
            backgroundColor: '#f4f4f4', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontFamily: 'Consolas, monospace'
          }}>
            {children}
          </code>
        );
      }
    };

    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    );
  };

  const FAQQuestions = [
    "Can't connect to VDI due to workspace issue",
    "VDI session frequently disconnecting",
    "VDI powered off error",
    "SSL certificate error"
  ];

  return (
    <div className="chat">
      {/* Background Image */}
      <img src={chatBg} alt="Background Image" className="background-image" />
      
      {/* Floating Chat Button */}
      <button 
        className={`chat-button ${isChatOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
      >
        <img src={botSvg} alt="Bot" className="pulse" />
      </button>

      {/* Chat Popup */}
      <div className={`chat-popup d-flex flex-column ${isChatOpen ? '' : 'hidden'} ${isMaximized ? 'maxsize-popup' : ''}`}>
        {/* Chat Header */}
        <div className="chat-header">
          <div id="title" className="chat-title">
            <div className="d-flex align-items-center">
              <img src={botChatSvg} alt="Bot" width="45px" />
            </div>
            <div className="d-flex align-items-center gap-3">
              <button className="minimize-btn" onClick={handleMaximize}>
                <img src={isMaximized ? minimizeSvg : maximizeSvg} width="20" alt="" />
              </button>
              <button className="close-btn" onClick={handleCloseChat}>
                <img src={closeSvg} width="20" alt="" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="chat-body-bx">
          <div className="chat-body">
            {/* Landing Screen */}
            <div className={showLanding ? 'landing-body' : 'hidden'} id="front-page">
              <img className="landing-image" src={chatClipartSvg} alt="Landing" />
              <div className="content-section">
                <h2>Welcome! to Smart VDI Buddy</h2>
                <h6 className="px-3 mt-2 mb-3">
                  Hi there, 👋 Nice to meet you.
                  <br />
                  I'd love to help you troubleshoot VDI issues😊...
                </h6>
                <div className="faq-badges">
                  {FAQQuestions.map((question, index) => (
                    <div 
                      key={index} 
                      className="badge"
                      onClick={() => handleFAQClick(question)}
                    >
                      {question}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Screen */}
            <div id="chat-screen" className={`chat-box ${!showLanding ? '' : 'hidden'}`}>
              <div id="chat-box">
                <div className="date-time-chat">
                  <span id="current-date">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {messages.map((message) => (
                  <div key={message.id} className={`message-wrapper-${message.sender}`}>
                    <div className={`message ${message.sender}`}>
                      <div className="message-action">
                        <MarkdownContent content={message.text} />
                        {/* Show options for followup questions and confirmation requests */}
                        {message.sender === 'bot' && message.metadata && (
                          <ResponseOptions metadata={message.metadata} messageId={message.id} />
                        )}
                      </div>
                    </div>
                    <div className={`timestamp ${message.sender === 'user' ? 'user-time' : 'bot-time'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isLoading && (
                  <div className="message-wrapper-bot">
                    <div className="message bot">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="landing-input close-slide">
          <div className="bottom-inputs">
            <input 
              ref={inputRef}
              type="text" 
              id="landing-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your VDI issue..."
            />
            <div className="d-flex">
              <button className="badge ai-btn me-3">
                <img src={suggestionSvg} alt="suggestion" />
              </button>
              <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                <img src={sendIconSvg} alt="send" width="26" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VDIChatbot;
