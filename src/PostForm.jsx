import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPost, updatePost, getPostByID } from "./services/api";

function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUpdate, setIsUpdate] = useState(false)
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "",
    content: "",
    status: "Publish",
  });

  const [alert, setAlert] = useState({ type: "", message: "", visible: false });

  useEffect(() => {
    setIsUpdate(!formData.id)
  }, [formData.id]);

  function showAlert(type, message) {
    setAlert({ type, message, visible: true });
    setTimeout(() => setAlert({ type: "", message: "", visible: false }), 3000);
  }

  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        try {
          const res = await getPostByID(id);
          if (res.data) setFormData(res.data);
        } catch (err) {
          console.error(err);
          showAlert("error", "Failed to load post");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  async function handleSubmit(e, status) {
    e.preventDefault();

    const payload = { ...formData, status };

    if (!formData.id && (!formData.title || !formData.category || !formData.content)) {
        showAlert("error", "Please fill all required fields");
        return;
    }

    if (formData.title !== "" && (formData.title.length < 20 || formData.title.length > 200)) {
        showAlert("error", "Title minimum 20 characters and maximum 200 characters");
        return;
    }

    if (formData.category !== "" && (formData.category.length < 3 || formData.category.length > 100)) {
        showAlert("error", "Category minimum 3 characters and maximum 100 characters");
        return;
    }

    if (formData.content !== "" && formData.content.length < 200) {
        showAlert("error", "Content minimum 200 characters");
        return;
    }

    setLoading(true);

    try {
      let res;
      if (formData.id) {
        res = await updatePost(formData.id, payload);
      } else {
        res = await createPost(payload);
      }

      if (res.status_code === 200) {
        showAlert("success", res.message);
        navigate("/");
      } else {
        showAlert("error", res.message);
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to submit post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5 p-5 bg-white rounded">
      <h2>{formData.id ? "Edit Post" : "Add New Post"}</h2>

      {/* Alert */}
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

      <form>
        <div className="mb-2">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required={!isUpdate}
          />
        </div>

        <div className="mb-2">
          <label>Category</label>
          <input
            type="text"
            className="form-control"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required={!isUpdate}
          />
        </div>

        <div className="mb-2">
          <label>Content</label>
          <textarea
            className="form-control"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            required={!isUpdate}
          />
        </div>

        <div className="mb-3">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={(e) => handleSubmit(e, "Publish")}
            disabled={loading}
          >
            {loading ? "Saving..." : "Publish"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleSubmit(e, "Draft")}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save as Draft"}
          </button>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default PostForm;
