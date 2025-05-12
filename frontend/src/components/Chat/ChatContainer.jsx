// import React, { useState, useEffect } from 'react';
// import { fetchUserChats, fetchChatById, createNewChat, sendChatMessage, markChatAsRead } from '../../services/api';
// import { initializeSocket, joinChatRoom, sendMessage, onReceiveMessage, onUserTyping, onUserStopTyping, emitTyping, emitStopTyping } from '../../services/socketService';
// import ChatList from './ChatList';
// import ChatMessages from './ChatMessages';
// import NewChatModal from './NewChatModal';
// import { Send, MessageCircle, PlusCircle } from 'lucide-react';
// import './Chat.css';

// const ChatContainer = () => {
//   const [chats, setChats] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [userTyping, setUserTyping] = useState(null);
//   const [typingTimeout, setTypingTimeout] = useState(null);

//   // Get current user from localStorage
//   const user = JSON.parse(localStorage.getItem('user'));

//   // Initialize socket connection
//   useEffect(() => {
//     if (user && user._id) {
//       const socketInstance = initializeSocket(user._id);
//       setSocket(socketInstance);

//       // Set up socket event listeners
//       onReceiveMessage((message) => {
//         if (selectedChat && message.chatId === selectedChat._id) {
//           setMessages((prevMessages) => [...prevMessages, message]);
//         }
//         // Refresh chat list to update last message
//         loadChats();
//       });

//       onUserTyping((typingUser) => {
//         setUserTyping(typingUser);
//       });

//       onUserStopTyping(() => {
//         setUserTyping(null);
//       });

//       return () => {
//         // Clean up event listeners when component unmounts
//         if (socketInstance) {
//           socketInstance.off('receive_message');
//           socketInstance.off('user_typing');
//           socketInstance.off('user_stop_typing');
//         }
//       };
//     }
//   }, [user, selectedChat]);

//   // Load user's chats
//   const loadChats = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetchUserChats();
//       setChats(response.data);
//       setError(null);
//     } catch (err) {
//       console.error('Error loading chats:', err);
//       setError('Failed to load chats. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Load chats on component mount
//   useEffect(() => {
//     loadChats();
//   }, []);

//   // Load chat messages when a chat is selected
//   const handleSelectChat = async (chat) => {
//     try {
//       setIsLoading(true);
//       setSelectedChat(chat);
      
//       // Join the chat room via socket
//       if (socket && chat._id) {
//         joinChatRoom(chat._id);
//       }
      
//       // Fetch chat details including messages
//       const response = await fetchChatById(chat._id);
//       setMessages(response.data.messages || []);
      
//       // Mark messages as read
//       await markChatAsRead(chat._id);
      
//       setError(null);
//     } catch (err) {
//       console.error('Error loading chat messages:', err);
//       setError('Failed to load messages. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle sending a new message
//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !selectedChat) return;
    
//     try {
//       // Send message to server via API
//       const response = await sendChatMessage(selectedChat._id, newMessage);
      
//       // Update local messages state
//       setMessages((prevMessages) => [...prevMessages, response.data.message]);
      
//       // Emit message via socket for real-time updates
//       sendMessage(selectedChat._id, {
//         ...response.data.message,
//         recipients: selectedChat.participants
//           .filter(p => p._id !== user._id)
//           .map(p => p._id)
//       });
      
//       // Clear input field
//       setNewMessage('');
      
//       // Stop typing indicator
//       handleStopTyping();
//     } catch (err) {
//       console.error('Error sending message:', err);
//       setError('Failed to send message. Please try again.');
//     }
//   };

//   // Handle typing indicator
//   const handleTyping = () => {
//     if (!selectedChat) return;
    
//     // Clear existing timeout
//     if (typingTimeout) clearTimeout(typingTimeout);
    
//     // Emit typing event
//     emitTyping(selectedChat._id, { id: user._id, name: user.name });
    
//     // Set timeout to stop typing after 3 seconds of inactivity
//     const timeout = setTimeout(() => {
//       handleStopTyping();
//     }, 3000);
    
//     setTypingTimeout(timeout);
//   };

//   // Handle stop typing
//   const handleStopTyping = () => {
//     if (!selectedChat) return;
    
//     emitStopTyping(selectedChat._id);
    
//     if (typingTimeout) {
//       clearTimeout(typingTimeout);
//       setTypingTimeout(null);
//     }
//   };

//   // Create a new chat
//   const handleCreateChat = async (participantIds, isGroupChat, groupName) => {
//     try {
//       const response = await createNewChat(participantIds, isGroupChat, groupName);
//       setChats((prevChats) => [response.data, ...prevChats]);
//       setIsModalOpen(false);
      
//       // Select the newly created chat
//       handleSelectChat(response.data);
//     } catch (err) {
//       console.error('Error creating chat:', err);
//       setError('Failed to create chat. Please try again.');
//     }
//   };

//   // Get chat header title
//   const getChatTitle = () => {
//     if (!selectedChat) return '';
    
//     if (selectedChat.isGroupChat) {
//       return selectedChat.groupName;
//     }
    
//     const otherParticipant = selectedChat.participants.find(p => p._id !== user?._id);
//     return otherParticipant?.name || 'Chat';
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-sidebar">
//         <div className="chat-header">
//           <h2>Messages</h2>
//           <button 
//             className="new-chat-btn"
//             onClick={() => setIsModalOpen(true)}
//           >
//             <PlusCircle size={20} />
//           </button>
//         </div>
//         <ChatList 
//           chats={chats} 
//           selectedChat={selectedChat} 
//           onSelectChat={handleSelectChat} 
//           currentUserId={user?._id}
//           isLoading={isLoading}
//         />
//       </div>
      
//       <div className="chat-main">
//         {selectedChat ? (
//           <>
//             <div className="chat-header">
//               <h3>{getChatTitle()}</h3>
//             </div>
            
//             <ChatMessages 
//               messages={messages} 
//               currentUserId={user?._id} 
//               isLoading={isLoading}
//               userTyping={userTyping}
//             />
            
//             <div className="message-input-container">
//               <input
//                 type="text"
//                 placeholder="Message..."
//                 value={newMessage}
//                 onChange={(e) => {
//                   setNewMessage(e.target.value);
//                   handleTyping();
//                 }}
//                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                 onBlur={handleStopTyping}
//               />
//               <button 
//                 onClick={handleSendMessage}
//                 disabled={!newMessage.trim()}
//                 aria-label="Send message"
//               >
//                 <Send size={20} />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="no-chat-selected">
//             <MessageCircle size={50} />
//             <p>Select a chat or start a new conversation</p>
//           </div>
//         )}
//       </div>
      
//       {isModalOpen && (
//         <NewChatModal 
//           onClose={() => setIsModalOpen(false)} 
//           onCreateChat={handleCreateChat}
//           neighborhoodId={user?.neighborhoodId}
//         />
//       )}
      
//       {error && <div className="error-message">{error}</div>}
//     </div>
//   );
// };

// export default ChatContainer;

import React, { useState, useEffect } from 'react';
import { fetchUserChats, fetchChatById, createNewChat, sendChatMessage, markChatAsRead } from '../../services/api';
import { initializeSocket, joinChatRoom, sendMessage, onReceiveMessage, onUserTyping, onUserStopTyping, emitTyping, emitStopTyping } from '../../services/socketService';
import ChatList from './ChatList';
import ChatMessages from './ChatMessages';
import NewChatModal from './NewChatModal';
import { Send, MessageCircle, PlusCircle } from 'lucide-react';
import './Chat.css';

const ChatContainer = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userTyping, setUserTyping] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Initialize socket connection
  useEffect(() => {
    if (user && user._id) {
      const socketInstance = initializeSocket(user._id);
      setSocket(socketInstance);

      // Set up socket event listeners
      onReceiveMessage((message) => {
        if (selectedChat && message.chatId === selectedChat._id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
        // Refresh chat list to update last message
        loadChats();
      });

      onUserTyping((typingUser) => {
        setUserTyping(typingUser);
      });

      onUserStopTyping(() => {
        setUserTyping(null);
      });

      return () => {
        // Clean up event listeners when component unmounts
        if (socketInstance) {
          socketInstance.off('receive_message');
          socketInstance.off('user_typing');
          socketInstance.off('user_stop_typing');
        }
      };
    }
  }, [user, selectedChat]);

  // Load user's chats
  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await fetchUserChats();
      setChats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('Failed to load chats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load chat messages when a chat is selected
  const handleSelectChat = async (chat) => {
    try {
      setIsLoading(true);
      setSelectedChat(chat);
      
      // Join the chat room via socket
      if (socket && chat._id) {
        joinChatRoom(chat._id);
      }
      
      // Fetch chat details including messages
      const response = await fetchChatById(chat._id);
      setMessages(response.data.messages || []);
      
      // Mark messages as read
      await markChatAsRead(chat._id);
      
      setError(null);
    } catch (err) {
      console.error('Error loading chat messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      // Send message to server via API
      const response = await sendChatMessage(selectedChat._id, newMessage);
      
      // Update local messages state
      setMessages((prevMessages) => [...prevMessages, response.data.message]);
      
      // Emit message via socket for real-time updates
      sendMessage(selectedChat._id, {
        ...response.data.message,
        recipients: selectedChat.participants
          .filter(p => p._id !== user._id)
          .map(p => p._id)
      });
      
      // Clear input field
      setNewMessage('');
      
      // Stop typing indicator
      handleStopTyping();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedChat) return;
    
    // Clear existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Emit typing event
    emitTyping(selectedChat._id, { id: user._id, name: user.name });
    
    // Set timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      handleStopTyping();
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  // Handle stop typing
  const handleStopTyping = () => {
    if (!selectedChat) return;
    
    emitStopTyping(selectedChat._id);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  // Create a new chat
  const handleCreateChat = async (participantIds, isGroupChat, groupName) => {
    try {
      const response = await createNewChat(participantIds, isGroupChat, groupName);
      setChats((prevChats) => [response.data, ...prevChats]);
      setIsModalOpen(false);
      
      // Select the newly created chat
      handleSelectChat(response.data);
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create chat. Please try again.');
    }
  };

  // Get chat header title
  const getChatTitle = () => {
    if (!selectedChat) return '';
    
    if (selectedChat.isGroupChat) {
      return selectedChat.groupName;
    }
    
    const otherParticipant = selectedChat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name || 'Chat';
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Messages</h2>
          <button 
            className="new-chat-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={20} />
          </button>
        </div>
        <ChatList 
          chats={chats} 
          selectedChat={selectedChat} 
          onSelectChat={handleSelectChat} 
          currentUserId={user?._id}
          isLoading={isLoading}
        />
      </div>
      
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <h3>{getChatTitle()}</h3>
            </div>
            
            <ChatMessages 
              messages={messages} 
              currentUserId={user?._id} 
              isLoading={isLoading}
              userTyping={userTyping}
            />
            
            <div className="message-input-container">
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                onBlur={handleStopTyping}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <MessageCircle size={50} />
            <p>Select a chat or start a new conversation</p>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <NewChatModal 
          onClose={() => setIsModalOpen(false)} 
          onCreateChat={handleCreateChat}
          neighborhoodId={user?.neighborhoodId}
        />
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ChatContainer;
