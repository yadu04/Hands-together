// import React from 'react';
// import { formatTimeAgo } from '../../utils/dateUtils';
// import { MessageCircle } from 'lucide-react';

// const ChatList = ({ chats, selectedChat, onSelectChat, currentUserId, isLoading }) => {
//   // Helper function to get chat name
//   const getChatName = (chat) => {
//     if (chat.isGroupChat && chat.groupName) {
//       return chat.groupName;
//     }
    
//     // For direct chats, show the other participant's name
//     const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
//     return otherParticipant ? otherParticipant.name : 'Unknown User';
//   };

//   // Helper function to get the last message preview
//   const getLastMessagePreview = (chat) => {
//     if (!chat.messages || chat.messages.length === 0) {
//       return 'No messages yet';
//     }
    
//     const lastMessage = chat.messages[chat.messages.length - 1];
//     const isSender = lastMessage.sender === currentUserId;
    
//     // Truncate message if too long
//     const content = lastMessage.content.length > 30 
//       ? `${lastMessage.content.substring(0, 30)}...` 
//       : lastMessage.content;
    
//     return isSender ? `You: ${content}` : content;
//   };

//   // Helper function to get profile picture URL
//   const getProfilePicUrl = (chat) => {
//     if (chat.isGroupChat) {
//       // Use a default group icon
//       return 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
//     }
    
//     // For direct chats, show the other participant's profile picture
//     const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
//     return otherParticipant && otherParticipant.profilePicture
//       ? `http://localhost:8000/api/users/profile/picture/${otherParticipant._id}`
//       : 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
//   };

//   if (isLoading) {
//     return (
//       <div className="chat-list">
//         <div className="loading-messages">Loading chats...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="chat-list">
//       {chats.length === 0 ? (
//         <div className="no-chats">
//           <MessageCircle size={50} />
//           <p>No conversations yet</p>
//           <p>Start messaging with friends in your neighborhood</p>
//         </div>
//       ) : (
//         chats.map((chat) => (
//           <div 
//             key={chat._id} 
//             className={`chat-list-item ${selectedChat && selectedChat._id === chat._id ? 'selected' : ''} ${chat.unreadCount > 0 ? 'unread' : ''}`}
//             onClick={() => onSelectChat(chat)}
//           >
//             <img 
//               src={getProfilePicUrl(chat)} 
//               alt={getChatName(chat)}
//               className="chat-avatar"
//               onError={(e) => {
//                 e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
//               }}
//             />
//             <div className="chat-info">
//               <div className="chat-header">
//                 <h4>{getChatName(chat)}</h4>
//                 {chat.lastMessage && (
//                   <span className="chat-time">{formatTimeAgo(chat.lastMessage)}</span>
//                 )}
//               </div>
//               <p className="chat-preview">{getLastMessagePreview(chat)}</p>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default ChatList;


import React from 'react';
import { formatTimeAgo } from '../../utils/dateUtils';
import { MessageCircle } from 'lucide-react';

const ChatList = ({ chats, selectedChat, onSelectChat, currentUserId, isLoading }) => {
  // Helper function to get chat name
  const getChatName = (chat) => {
    if (chat.isGroupChat && chat.groupName) {
      return chat.groupName;
    }
    
    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
    return otherParticipant ? otherParticipant.name : 'Unknown User';
  };

  // Helper function to get the last message preview
  const getLastMessagePreview = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    const isSender = lastMessage.sender === currentUserId;
    
    // Truncate message if too long
    const content = lastMessage.content.length > 30 
      ? `${lastMessage.content.substring(0, 30)}...` 
      : lastMessage.content;
    
    return isSender ? `You: ${content}` : content;
  };

  // Helper function to get profile picture URL
  const getProfilePicUrl = (chat) => {
    if (chat.isGroupChat) {
      // Use a default group icon
      return 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
    }
    
    // For direct chats, show the other participant's profile picture
    const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
    return otherParticipant && otherParticipant.profilePicture
      ? `http://localhost:8000/api/users/profile/picture/${otherParticipant._id}`
      : 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
  };

  if (isLoading) {
    return (
      <div className="chat-list">
        <div className="loading-messages">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {chats.length === 0 ? (
        <div className="no-chats">
          <MessageCircle size={40} />
          <p>No conversations yet</p>
          <p>Start messaging with friends in your neighborhood</p>
        </div>
      ) : (
        chats.map((chat) => (
          <div 
            key={chat._id} 
            className={`chat-list-item ${selectedChat && selectedChat._id === chat._id ? 'selected' : ''} ${chat.unreadCount > 0 ? 'unread' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <img 
              src={getProfilePicUrl(chat)} 
              alt={getChatName(chat)}
              className="chat-avatar"
              onError={(e) => {
                e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
              }}
            />
            <div className="chat-info">
              <div className="chat-header">
                <h4>{getChatName(chat)}</h4>
                {chat.lastMessage && (
                  <span className="chat-time">{formatTimeAgo(chat.lastMessage)}</span>
                )}
              </div>
              <p className="chat-preview">{getLastMessagePreview(chat)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;