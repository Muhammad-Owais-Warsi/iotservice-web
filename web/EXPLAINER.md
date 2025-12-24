# 🎓 Junior Developer Guide: IoT Service Implementation

Welcome to the team! This guide explains the core logic behind the ticketing system and the premium UI overhaul. We'll break it down into three main pillars: **Authentication**, **Premium UI**, and **Performance Optimization**.

---

## 1. 🔐 The Authentication Flow (The "Token" Fix)

### The Problem
The frontend was using a "mock" login. It generated a fake token that didn't come from the server. When the frontend tried to talk to protected routes (like creating a ticket), the backend rejected it with "Invalid token".

### The Fix
We connected the `Login.jsx` to the actual backend API.
- **Login**: `fetch('/api/auth/login')` sends credentials and receives a **JWT (JSON Web Token)**.
- **Storage**: We save this JWT in `localStorage`.
- **Authorization**: Every request to the backend now includes this token in the header:
  ```js
  headers: { Authorization: `Bearer ${token}` }
  ```

---

## 2. 🎨 Premium UI & Design Systems

To create a "Wow" factor, we moved away from generic styles to a **Design System** approach.

### Typography
We used **Outfit** for headings (modern, industrial) and **Inter** for body text (highly readable). We imported these via Google Fonts in `index.css`.

### Design Tokens
Instead of hardcoding colors, we use CSS variables (tokens) in `index.css`:
```css
--color-brand-primary: #2563eb;
--color-bg-deep: #ffffff;
```
This makes the app maintainable and consistent. We also used **Glassmorphism** (`backdrop-filter: blur`) for a premium "clean" feel.

---

## 3. 🚀 React Performance Optimization

We used two main hooks to make the app faster:

### `useCallback`
**Why?** In React, every time a component re-renders, all functions inside it are recreated. This can slow down the app if these functions are passed to child components.
**How?** `useCallback` "memoizes" (caches) the function so it's only recreated if its dependencies change.

### `useMemo`
**Why?** Calculating filtered lists (like our ticket search) can be heavy.
**How?** `useMemo` caches the *result* of a calculation. If the search query or the ticket list hasn't changed, React just reuses the old result instead of calculating it again.

---

## 4. 📂 Handling File Uploads (Multipart Data)

JSON isn't good for sending images. We used `FormData`:
1. **Frontend**: Append text fields and file objects to a `FormData` instance.
2. **Backend**: Use `multer` middleware to parse the incoming data and save photos to the disk.
3. **Storage**: The backend returns a URL (e.g., `/uploads/tickets/...`) which we store in the database.

---

### Pro Tip for Junior Devs:
Always check the **Network Tab** in your browser's Developer Tools. If a request fails, it will show you exactly what the server said (400 Bad Request, 401 Unauthorized, etc.). This is your best friend when debugging tokens!
