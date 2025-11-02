import React, { useState, useEffect } from "react";
import "../index.css"
import { useNavigate } from "react-router-dom";
import {
  createPost,
  fetchPosts,
  likePost,
  addComment,
} from "../services/api.js";
import PostConfirmationModal from "./PostConfirmationModal.jsx";
import ForSaleFree from "./ForSaleFree/ForSaleFree.jsx";
import Notifications from "./Notifications.jsx";
import ProfileMenu from "./Profile Management/ProfileMenu.jsx";
import Map from "./Map/Map.jsx";
import ChatContainer from "./Chat/ChatContainer.jsx";
import ChatApp from "./Chatbot.jsx"; // ✅ Gemini Chat import
import axios from "axios";
import { Send, MessageCircle } from "lucide-react";
import "./Dashboard.css";
import { formatTimeAgo } from "../utils/dateUtils.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentView, setCurrentView] = useState("home");
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingPost, setPendingPost] = useState(null);
  const [user, setUser] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (parsedUser.neighborhoodId) {
          const fetchNeighborhoodDetails = async () => {
            try {
              const response = await axios.get(
                `http://localhost:8000/api/neighborhoods/${parsedUser.neighborhoodId}`,
                { headers: { Authorization: `Bearer ${storedToken}` } }
              );
              setNeighborhood(response.data);
            } catch (error) {
              console.error("Error fetching neighborhood:", error);
              setNeighborhood(null);
            }
          };

          fetchNeighborhoodDetails();
        }
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (currentView === "home") {
      const loadPosts = async () => {
        try {
          setIsLoading(true);
          const response = await fetchPosts();
          const postsData = Array.isArray(response.data) ? response.data : [];
          setPosts(postsData);
          setAllPosts(postsData);
          setFilteredPosts(postsData);
          setError(null);
        } catch (error) {
          console.error("Error fetching posts:", error);
          setAllPosts([]);
          setFilteredPosts([]);
          setError("Failed to fetch posts. Please try logging in again.");
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadPosts();
    }
  }, [currentView, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPosts(allPosts);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = allPosts.filter(
        (post) =>
          post.title?.toLowerCase().includes(lowercaseSearch) ||
          post.content?.toLowerCase().includes(lowercaseSearch) ||
          post.category?.toLowerCase().includes(lowercaseSearch) ||
          post.createdBy?.name?.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, allPosts]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const postData = new FormData();
    postData.append("title", formData.get("title"));
    postData.append("content", formData.get("content"));
    postData.append("category", formData.get("category"));

    const imageFile = formData.get("image");
    const imageUrl = formData.get("imageUrl");

    if (imageFile && imageFile.size > 0) {
      postData.append("image", imageFile);
    } else if (imageUrl) {
      postData.append("imageUrl", imageUrl);
    }

    setPendingPost(Object.fromEntries(postData));
    setIsModalOpen(true);
  };

  const confirmPost = async () => {
    if (!pendingPost) return;
    try {
      const response = await createPost(pendingPost);
      if (currentView === "home") {
        setAllPosts((prev) => [response.data, ...prev]);
        setFilteredPosts((prev) => [response.data, ...prev]);
      }
      setCurrentView("home");
      setIsModalOpen(false);
      setPendingPost(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to like posts");
        navigate("/login");
        return;
      }
      const response = await likePost(postId);
      if (response && response.data) {
        const updatePosts = (posts) =>
          posts.map((post) => (post._id === postId ? response.data : post));
        setAllPosts((prev) => updatePosts(prev));
        setFilteredPosts((prev) => updatePosts(prev));
      }
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Failed to like/unlike post.");
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const response = await addComment(postId, commentText);
      if (response && response.data) {
        const updatePosts = (posts) =>
          posts.map((post) => (post._id === postId ? response.data : post));
        setAllPosts((prev) => updatePosts(prev));
        setFilteredPosts((prev) => updatePosts(prev));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderSidebarButtons = () => {
    const buttons = [
      {
        view: "home",
        label: "Home",
        onClick: () => {
          setCurrentView("home");
          setShowMap(false);
        },
      },
      {
        view: "map",
        label: "Map",
        onClick: () => {
          setCurrentView("map");
          setShowMap(true);
        },
      },
      {
        view: "notifications",
        label: "Notifications",
        onClick: () => {
          setCurrentView("notifications");
          setShowMap(false);
        },
      },
      {
        view: "chats",
        label: "Chats",
        onClick: () => {
          setCurrentView("chats");
          setShowMap(false);
        },
      },
      {
        view: "forsalefree",
        label: "For Sale & Free",
        onClick: () => {
          setCurrentView("forsalefree");
          setShowMap(false);
        },
      },
      {
        view: "post",
        label: "Post",
        onClick: () => {
          setCurrentView("post");
          setShowMap(false);
        },
      },
      {
        view: "gemini",
        label: "Gemini Chat",
        onClick: () => {
          setCurrentView("gemini");
          setShowMap(false);
        },
      }, // ✅ New Gemini view
    ];

    return buttons.map((button) => (
      <button
        key={button.view}
        onClick={button.onClick}
        className={currentView === button.view ? "active" : ""}
      >
        {button.label}
      </button>
    ));
  };

  const renderContent = () => {
    switch (currentView) {
      case "map":
        return showMap && <Map />;
      case "home":
        return (
          <div className="home-content">
            <h2>Neighborhood Updates</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search posts..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isLoading ? (
              <p>Loading posts...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : filteredPosts.length === 0 ? (
              <p>No posts available</p>
            ) : (
              filteredPosts
                .filter((post) => post && post._id)
                .map((post) => <PostCard key={post._id} post={post} />)
            )}
          </div>
        );
      case "forsalefree":
        return <ForSaleFree />;
      case "notifications":
        return <Notifications userId={user?._id} />;
      case "chats":
        return (
          <div className="chats-content">
            <h2>Neighborhood Chats</h2>
            <ChatContainer />
          </div>
        );
      case "gemini":
        return (
          <div className="gemini-chat-container">
            <h2>Gemini AI Assistant</h2>
            <ChatApp /> {/* ✅ ChatApp integrated */}
          </div>
        );
      case "post":
        return (
          <div className="post-content">
            <h2>Create a New Post</h2>
            <form onSubmit={handleCreatePost}>
              <input
                type="text"
                placeholder="Post Title"
                name="title"
                required
              />
              <textarea
                placeholder="What's happening?"
                name="content"
                required
              />
              <select name="category" required>
                <option value="">Select Category</option>
                <option value="Events">Events</option>
                <option value="Announcements">Announcements</option>
                <option value="News">News</option>
                <option value="ForSaleFree">For Sale & Free</option>
                <option value="LostAndFound">Lost and Found</option>
                <option value="Services">Services</option>
              </select>
              <div className="image-input-group">
                <label>Add Image:</label>
                <input type="file" name="image" accept="image/*" />
                <div className="separator">OR</div>
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  name="imageUrl"
                />
              </div>
              <button type="submit">Post</button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        {renderSidebarButtons()}
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <ProfileMenu user={user} />
        </div>
        {renderContent()}
      </div>

      <PostConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmPost}
        postDetails={pendingPost || {}}
      />
    </div>
  );
};

export default Dashboard;
