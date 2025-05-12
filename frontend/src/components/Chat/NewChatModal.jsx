// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { X, Users, Search } from 'lucide-react';

// const NewChatModal = ({ onClose, onCreateChat, neighborhoodId }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [isGroupChat, setIsGroupChat] = useState(false);
//   const [groupName, setGroupName] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   // Get current user from localStorage
//   const currentUser = JSON.parse(localStorage.getItem('user'));

//   // Fetch users from the same neighborhood
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setIsLoading(true);
//         const token = localStorage.getItem('token');
        
//         const response = await axios.get(
//           `http://localhost:8000/api/users?neighborhoodId=${neighborhoodId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` }
//           }
//         );
        
//         // Filter out current user from the users array in the response
//         const filteredUsers = response.data.users.filter(user => 
//           user._id !== currentUser._id
//         );
        
//         setUsers(filteredUsers);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         setError('Failed to load users. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (neighborhoodId) {
//       fetchUsers();
//     }
//   }, [neighborhoodId, currentUser._id]);

//   // Toggle user selection
//   const toggleUserSelection = (userId) => {
//     setSelectedUsers(prev => {
//       if (prev.includes(userId)) {
//         return prev.filter(id => id !== userId);
//       } else {
//         return [...prev, userId];
//       }
//     });
//   };

//   // Filter users based on search query
//   const filteredUsers = users.filter(user => 
//     user.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (selectedUsers.length === 0) {
//       setError('Please select at least one user');
//       return;
//     }
    
//     if (isGroupChat && !groupName.trim()) {
//       setError('Please enter a group name');
//       return;
//     }
    
//     onCreateChat(selectedUsers, isGroupChat, groupName);
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h2>New Message</h2>
//           <button className="close-btn" onClick={onClose} aria-label="Close modal">
//             <X size={20} />
//           </button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label className="flex items-center gap-2">
//               <input 
//                 type="checkbox" 
//                 checked={isGroupChat}
//                 onChange={() => setIsGroupChat(!isGroupChat)}
//               />
//               <Users size={16} />
//               Create Group Chat
//             </label>
//           </div>
          
//           {isGroupChat && (
//             <div className="form-group">
//               <label>Group Name:</label>
//               <input 
//                 type="text" 
//                 value={groupName}
//                 onChange={(e) => setGroupName(e.target.value)}
//                 placeholder="Enter group name"
//               />
//             </div>
//           )}
          
//           <div className="form-group">
//             <label>To:</label>
//             <div className="search-input-container" style={{ position: 'relative', marginBottom: '10px' }}>
//               <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8e8e8e' }} />
//               <input 
//                 type="text"
//                 placeholder="Search users..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 style={{ paddingLeft: '32px' }}
//               />
//             </div>
            
//             {isLoading ? (
//               <p>Loading users...</p>
//             ) : error ? (
//               <p className="error">{error}</p>
//             ) : (
//               <div className="user-list">
//                 {filteredUsers.length === 0 ? (
//                   <p>No users found in your neighborhood</p>
//                 ) : (
//                   filteredUsers.map(user => (
//                     <div key={user._id} className="user-item">
//                       <label>
//                         <input 
//                           type="checkbox"
//                           checked={selectedUsers.includes(user._id)}
//                           onChange={() => toggleUserSelection(user._id)}
//                         />
//                         <img 
//                           src={`http://localhost:8000/api/users/profile/picture/${user._id}`}
//                           alt={user.name}
//                           className="user-avatar"
//                           onError={(e) => {
//                             e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
//                           }}
//                         />
//                         <span>{user.name}</span>
//                       </label>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>
          
//           <div className="modal-footer">
//             <button type="button" onClick={onClose}>Cancel</button>
//             <button 
//               type="submit" 
//               disabled={selectedUsers.length === 0 || (isGroupChat && !groupName.trim())}
//             >
//               Start Chat
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default NewChatModal;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Users, Search } from 'lucide-react';

const NewChatModal = ({ onClose, onCreateChat, neighborhoodId }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Fetch users from the same neighborhood
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `http://localhost:8000/api/users?neighborhoodId=${neighborhoodId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Filter out current user from the users array in the response
        const filteredUsers = response.data.users.filter(user => 
          user._id !== currentUser._id
        );
        
        setUsers(filteredUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (neighborhoodId) {
      fetchUsers();
    }
  }, [neighborhoodId, currentUser._id]);

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    
    if (isGroupChat && !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    onCreateChat(selectedUsers, isGroupChat, groupName);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>New Message</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={isGroupChat}
                onChange={() => setIsGroupChat(!isGroupChat)}
              />
              <Users size={16} style={{ marginLeft: '8px', marginRight: '8px' }} />
              Create Group Chat
            </label>
          </div>
          
          {isGroupChat && (
            <div className="form-group">
              <label>Group Name:</label>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>To:</label>
            <div className="search-input-container">
              <Search size={16} />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : (
              <div className="user-list">
                {filteredUsers.length === 0 ? (
                  <p style={{ padding: '15px', textAlign: 'center' }}>No users found in your neighborhood</p>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user._id} className="user-item">
                      <label>
                        <input 
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                        <img 
                          src={`http://localhost:8000/api/users/profile/picture/${user._id}`}
                          alt={user.name}
                          className="user-avatar"
                          onError={(e) => {
                            e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
                          }}
                        />
                        <span>{user.name}</span>
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              disabled={selectedUsers.length === 0 || (isGroupChat && !groupName.trim())}
            >
              Start Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;
