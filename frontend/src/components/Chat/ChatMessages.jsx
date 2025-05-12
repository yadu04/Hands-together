// import React, { useEffect, useRef } from 'react';
// import { formatTimeAgo } from '../../utils/dateUtils';
// import { MessageCircle } from 'lucide-react';

// const ChatMessages = ({ messages, currentUserId, isLoading, userTyping }) => {
//   const messagesEndRef = useRef(null);

//   // Scroll to bottom of messages when new messages are added
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   // Helper function to get profile picture URL
//   const getProfilePicUrl = (userId) => {
//     return userId 
//       ? `http://localhost:8000/api/users/profile/picture/${userId}` 
//       : 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
//   };

//   if (isLoading) {
//     return <div className="loading-messages">Loading messages...</div>;
//   }

//   return (
//     <div className="chat-messages">
//       {messages.length === 0 ? (
//         <div className="no-messages">
//           <MessageCircle size={50} />
//           <p>No messages yet. Start the conversation!</p>
//         </div>
//       ) : (
//         <>
//           {messages.map((message, index) => {
//             const isCurrentUser = message.sender === currentUserId || message.sender?._id === currentUserId;
            
//             return (
//               <div 
//                 key={message._id || index} 
//                 className={`message ${isCurrentUser ? 'sent' : 'received'}`}
//               >
//                 {!isCurrentUser && (
//                   <img 
//                     src={getProfilePicUrl(message.sender?._id || message.sender)} 
//                     alt="Profile" 
//                     className="message-avatar"
//                     onError={(e) => {
//                       e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
//                     }}
//                   />
//                 )}
//                 <div className="message-content">
//                   <div className="message-bubble">
//                     <p>{message.content}</p>
//                   </div>
//                   <span className="message-time">
//                     {formatTimeAgo(message.timestamp || message.createdAt)}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}
          
//           {userTyping && (
//             <div className="typing-indicator">
//               <p>{userTyping.name} is typing...</p>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </>
//       )}
//     </div>
//   );
// };

// export default ChatMessages;


import React, { useEffect, useRef } from 'react';
import { formatTimeAgo } from '../../utils/dateUtils';
import { MessageCircle } from 'lucide-react';

const ChatMessages = ({ messages, currentUserId, isLoading, userTyping }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to get profile picture URL
  const getProfilePicUrl = (userId) => {
    return userId 
      ? `http://localhost:8000/api/users/profile/picture/${userId}` 
      : 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
  };

  if (isLoading) {
    return <div className="loading-messages">Loading messages...</div>;
  }

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="no-messages">
          <MessageCircle size={50} />
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const isCurrentUser = message.sender === currentUserId || message.sender?._id === currentUserId;
            
            return (
              <div 
                key={message._id || index} 
                className={`message ${isCurrentUser ? 'sent' : 'received'}`}
              >
                {!isCurrentUser && (
                  <img 
                    src={getProfilePicUrl(message.sender?._id || message.sender)} 
                    alt="Profile" 
                    className="message-avatar"
                    onError={(e) => {
                      e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
                    }}
                  />
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.content}</p>
                  </div>
                  <span className="message-time">
                    {formatTimeAgo(message.timestamp || message.createdAt)}
                  </span>
                </div>
                {isCurrentUser && (
                  <img 
                    src={getProfilePicUrl(currentUserId)} 
                    alt="Profile" 
                    className="message-avatar"
                    onError={(e) => {
                      e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
                    }}
                  />
                )}
              </div>
            );
          })}
          
          {userTyping && (
            <div className="typing-indicator">
              <p>{userTyping.name} is typing...</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatMessages;