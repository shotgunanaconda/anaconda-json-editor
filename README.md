# 🐍 Anaconda JSON Editor

A sleek, powerful, and keyboard-optimized JSON editor designed specifically for managing game configuration files. 

![Anaconda JSON Editor](https://img.shields.io/badge/Aesthetics-Premium-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🚀 Key Features

- **Visual Tree Navigation**: Explore complex JSON structures with a clear, interactive tree view.
- **Smart Array Indexing**: When adding items to an array, Anaconda automatically calculates the next index and focuses the value field for lightning-fast entry.
- **Keyboard Optimized**:
  - `Enter`: Submit new keys or update values.
  - `Delete`: Instantly delete selected nodes (keyboard shortcut).
- **Type Safety**: Automatic type detection with visible tags (`[string]`, `[number]`, `[array]`, etc.) to prevent data corruption.
- **Template System**: Define a set of fields to automatically populate every time you create a new object.
- **Real File Access**: Uses the modern File System Access API to open and save files directly to your machine.

## 🛠️ Built With

- **HTML5 Semantic Elements**
- **Vanilla CSS3** (Custom properties, Flexbox/Grid, Animations)
- **Vanilla JavaScript** (ES6+, No dependencies)

## 📖 How to Use

1. **Open Index.html**: Simply open `index.html` in any modern browser.
2. **Load/Create**: Click "New File" to start from scratch or "Open File" to load an existing JSON configuration.
3. **Navigate**: Click on any key in the Tree View to select it.
4. **Edit**:
   - If an object/array is selected, you can add new keys or indices in the Editor panel.
   - If a simple value is selected, you can modify its type and content.
5. **Save**: Click "Save" to overwrite the original file or "Save As" to create a copy.

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
