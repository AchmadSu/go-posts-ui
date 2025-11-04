const API_BASE = "http://localhost:8080";

export async function getPosts(limit = 10, offset = 0) {
  const res = await fetch(`${API_BASE}/articles/${limit}/${offset}`);
  return res.json();
}

export async function getPostByID(id) {
  const res = await fetch(`${API_BASE}/article/${id}`);
  return res.json();
}

export async function createPost(data) {
  const res = await fetch(`${API_BASE}/article`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  return {
    status_code: res.status,
    message: json.message || (res.ok ? "Success" : "Failed"),
    data: json.data || null,
  };
}


export async function updatePost(id, data) {
  const res = await fetch(`${API_BASE}/article/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();

  return {
    status_code: res.status,
    message: json.message || (res.ok ? "Success" : "Failed"),
    data: json.data || null,
  };
}

export async function deletePost(id) {
  const res = await fetch(`${API_BASE}/article/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      {"status": "trashed"}
    ),
  });
  const json = await res.json();

  return {
    status_code: res.status,
    message: json.message || (res.ok ? "Success" : "Failed"),
    data: json.data || null,
  };
}
