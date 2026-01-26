# 🐍 Anaconda JSON Editor

**Anaconda** is a sleek, powerful, and keyboard-optimized JSON editor designed specifically for game developers who are tired of fighting with brackets and deep nesting. It turns JSON data entry from a chore into a high-speed workflow.

![Anaconda Badge](https://img.shields.io/badge/Speed-Lightning-yellow?style=for-the-badge)
![Anaconda UI](https://img.shields.io/badge/UI-Modern_Dark-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🚀 Why Anaconda? (Unique Selling Points)

Unlike generic JSON formatters, Anaconda is built as a **productivity tool**:

- **⚡ Lightning-Fast Array Entry**: The "Smart Indexer" automatically predicts the next array index and focuses the value field. You can build 100-item lists without ever touching your mouse.
- **🏗️ Recursive Auto-Nesting**: Type a path like `world.zones[0].stats.weather` into the parent path. Anaconda will automatically build every missing level (objects and arrays) for you in a single click.
- **⌨️ Keyboard-First Workflow**:
  - `Enter`: Context-aware submission (automatically switches between "Create" and "Update").
  - `Delete`: Instant node removal with a dedicated keyboard shortcut.
- **📋 Object Templating**: Define a set of "Template Fields" (e.g., `id`, `name`, `rarity`). Every time you create a new object, Anaconda automatically populates it with those fields, saving you from repetitive typing.
- **🏷️ Real-Time Type Badges**: Every key in the tree shows its type (e.g., `[string]`, `[number]`). It acts as a visual linter to ensure your game engine gets the data format it expects.
- **💾 Native File Access**: Uses the modern File System Access API. No more "Download to save"—hit Save and your local file is updated directly.

<img width="1241" height="968" alt="image" src="https://github.com/user-attachments/assets/b09d0348-6154-46b8-b77b-f72b53e804da" />

## 🛠️ Tech Stack

- **Pure Performance**: Built with Vanilla ES6+ JavaScript and CSS3. Zero dependencies, zero bloat.
- **Visuals**: Modern dark-mode interface with high-contrast tree navigation and smooth animations.

## 📖 Quick Start

1. **Open**: `index.html` in any modern browser or visit https://shotgunanaconda.github.io/anaconda-json-editor/
2. **Load**: Click "Open File" to grab your game configuration.
3. **Edit**: Use the tree to navigate and the Editor panel to modify data.
4. **Save**: Click "Save" to update your file instantly.

---

## 🤝 Contributing

Found a bug or have a "quality of life" suggestion for game configs? Open an issue or submit a PR!

## 📄 License

MIT © 2026 Anaconda JSON Editor
