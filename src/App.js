import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, deletePost } from "./services/api";

function App() {
  const LIMIT = 10;
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Publish");
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const initialLoadRef = useRef(false);

  function showAlert(type, message) {
    setAlert({ type, message, visible: true });
    setTimeout(() => setAlert({ type: "", message: "", visible: false }), 3000);
  }

  async function loadData(currentOffset) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getPosts(LIMIT, currentOffset);
      const newPosts = res.data || [];
      const newTotal = res.total || 0;
      setPosts((prev) => [...prev, ...newPosts]);
      setTotal(newTotal);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialLoadRef.current) {
      loadData(offset);
      initialLoadRef.current = true;
    }
  }, []);

  async function handleTrash(post) {
    if (!window.confirm("Are you sure to trash this post?")) return;
    setLoading(true);
    try {
      const res = await deletePost(post.id);
      if (res.status_code === 200) {
        showAlert("success", res.message);
        setTimeout(() => window.location.reload(), 3000);
      } else {
        showAlert("error", res.message);
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to delete post");
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts
    .filter((p) => p && p.status)
    .filter((p) =>
      activeTab === "Trashed"
        ? p.status === "Trashed"
        : p.status.toLowerCase() === activeTab.toLowerCase()
    );

  return (
    <div className="container mt-5 p-5 bg-white rounded">
      <h2>All Posts</h2>

      {alert.visible && (
        <div
          className={`alert ${
            alert.type === "success" ? "alert-success" : "alert-danger"
          }`}
          role="alert"
        >
          {alert.message}
        </div>
      )}

      <div className="mb-3">
        <button
          className="btn btn-success"
          onClick={() => navigate("/posts/new")}
        >
          + Add New Post
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mt-3">
        {["Publish", "Draft", "Trashed"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${
                activeTab.toLowerCase() === tab.toLowerCase() ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <table className="table table-bordered mt-3">
        <thead>
          <tr className="table-primary">
            <th>Title</th>
            <th>Category</th>
            <th>Content</th>
            <th width="150px">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.category}</td>
                <td>{post.content}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-1"
                    onClick={() => navigate(`/posts/${post.id}/edit`)}
                  >
                    ✏
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleTrash(post)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No data...
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {posts.length < total && (
        <div className="text-center mt-3">
          <button
            className="btn btn-primary"
            onClick={() => {
              const newOffset = offset + LIMIT;
              setOffset(newOffset);
              loadData(newOffset);
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
