[README.md](https://github.com/user-attachments/files/25596063/README.md)
# Live Character Counter ✦

A real-time character counter built with React that demonstrates core React concepts — `useState`, `onChange` event handling, and conditional rendering.

---

## 🖥️ What It Does

- Type in a textarea and see the character count update live
- Set a character limit (presets or custom)
- Get visual warnings as you approach or exceed the limit
- Save text snapshots and restore them later

---

## ⚛️ React Concepts Used

| Concept | How |
|---|---|
| `useState` | Stores text, limit, snapshots, and UI states |
| `onChange` | Fires on every keystroke to update character count |
| Conditional Rendering | Shows warnings, disables Save button when limit exceeded |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/live-character-counter.git
cd live-character-counter

# Install dependencies
npm install

# Start the app
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 File Structure

```
src/
├── LiveCharacterCounter.jsx   # Main component
└── main.jsx                   # Entry point
```

---

## 🛠️ Built With

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool
- Google Fonts — Bebas Neue, DM Mono

---

## 📄 License

MIT
