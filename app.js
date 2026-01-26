// JSON Editor Application
class JSONEditor {
    constructor() {
        this.jsonData = null;
        this.currentFileName = null;
        this.fileHandle = null; // Store the file handle for real saving
        this.selectedPath = null;
        this.templateFields = []; // Array of field names to auto-create

        this.initializeElements();
        this.attachEventListeners();
        this.updateStatus('Ready - Create or open a JSON file to begin');
        console.log('[JSON-EDITOR] Initialized');
    }

    static init() {
        window.editor = new JSONEditor();
    }

    initializeElements() {
        // Buttons
        this.newFileBtn = document.getElementById('newFileBtn');
        this.openFileBtn = document.getElementById('openFileBtn');
        this.saveFileBtn = document.getElementById('saveFileBtn');
        this.saveAsFileBtn = document.getElementById('saveAsFileBtn');
        this.createKeyBtn = document.getElementById('createKeyBtn');
        this.updateValueBtn = document.getElementById('updateValueBtn');
        this.deleteKeyBtn = document.getElementById('deleteKeyBtn');

        if (!this.deleteKeyBtn) {
            console.error('[JSON-EDITOR] Critical Error: deleteKeyBtn not found in DOM');
        }
        this.expandAllBtn = document.getElementById('expandAllBtn');
        this.collapseAllBtn = document.getElementById('collapseAllBtn');
        this.addTemplateBtn = document.getElementById('addTemplateBtn');

        // Inputs
        this.parentPathInput = document.getElementById('parentPathInput');
        this.keyInput = document.getElementById('keyInput');
        this.keyLabel = document.getElementById('keyLabel');
        this.valueInput = document.getElementById('valueInput');
        this.valueType = document.getElementById('valueType');
        this.fileInput = document.getElementById('fileInput'); // Fallback
        this.templateFieldInput = document.getElementById('templateFieldInput');

        // Display elements
        this.treeView = document.getElementById('treeView');
        this.currentValue = document.getElementById('currentValue');
        this.statusText = document.getElementById('statusText');
        this.fileNameDisplay = document.getElementById('fileNameDisplay');
        this.templateFieldsList = document.getElementById('templateFieldsList');
        this.applyTemplateCheckbox = document.getElementById('applyTemplateCheckbox');
    }

    attachEventListeners() {
        this.newFileBtn.addEventListener('click', () => this.createNewFile());
        this.openFileBtn.addEventListener('click', () => this.openFile());
        this.saveFileBtn.addEventListener('click', () => this.saveFile());
        this.saveAsFileBtn.addEventListener('click', () => this.saveAsFile());
        this.createKeyBtn.addEventListener('click', () => this.createKey());
        this.updateValueBtn.addEventListener('click', () => this.updateValue());
        this.deleteKeyBtn.addEventListener('click', () => this.deleteKey());
        this.expandAllBtn.addEventListener('click', () => this.expandAll());
        this.collapseAllBtn.addEventListener('click', () => this.collapseAll());
        this.addTemplateBtn.addEventListener('click', () => this.addTemplateField());

        this.fileInput.addEventListener('change', (e) => this.handleFileSelectFallback(e));
        this.valueType.addEventListener('change', () => this.handleValueTypeChange());

        // Allow Enter key to add template fields
        this.templateFieldInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTemplateField();
            }
        });

        // Allow Enter key to create/update keys
        const handleSubmit = (e) => {
            if (e.key === 'Enter') {
                if (this.createKeyBtn.style.display !== 'none' && this.keyInput.value.trim() !== '') {
                    this.createKey();
                } else if (this.updateValueBtn.style.display !== 'none') {
                    this.updateValue();
                }
            }
        };

        this.keyInput.addEventListener('keypress', handleSubmit);
        this.valueInput.addEventListener('keypress', handleSubmit);

        // Global Delete key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                if (!this.deleteKeyBtn.disabled) {
                    this.deleteKey();
                }
            }
        });

        // Dynamic button visibility when typing
        const updateVisibility = () => this.updateButtonVisibility();
        this.parentPathInput.addEventListener('input', updateVisibility);
        this.keyInput.addEventListener('input', updateVisibility);
        this.valueInput.addEventListener('input', updateVisibility);
    }

    updateButtonVisibility() {
        const path = this.parentPathInput.value.trim();
        const key = this.keyInput.value.trim();
        const value = this.getValueByPath(path);

        const isExisting = value !== undefined;
        const isComplex = typeof value === 'object' && value !== null;

        if (key) {
            // If typing a new key, we are in "Create" mode
            this.createKeyBtn.style.display = 'inline-flex';
            this.updateValueBtn.style.display = 'none';
        } else if (path) {
            // Typing/Selecting just a path
            if (isExisting) {
                if (isComplex) {
                    // It's an object, allow both creating children and updating itself
                    this.createKeyBtn.style.display = 'inline-flex';
                    this.updateValueBtn.style.display = 'inline-flex';
                } else {
                    // It's a leaf node, primary action is update
                    this.createKeyBtn.style.display = 'none';
                    this.updateValueBtn.style.display = 'inline-flex';
                }
            } else {
                // Path doesn't exist yet, must be creating
                this.createKeyBtn.style.display = 'inline-flex';
                this.updateValueBtn.style.display = 'none';
            }
        }
    }

    createNewFile() {
        this.jsonData = {};
        this.currentFileName = 'untitled.json';
        this.fileHandle = null;
        this.selectedPath = null;

        this.enableEditing();
        this.renderTree();
        this.updateStatus('New file created');
        this.fileNameDisplay.textContent = this.currentFileName;
    }

    async openFile() {
        // Try to use File System Access API
        if ('showOpenFilePicker' in window) {
            try {
                const [handle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                this.fileHandle = handle;
                const file = await handle.getFile();
                const text = await file.text();
                this.processFileData(text, file.name);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error opening file:', err);
                    this.updateStatus('Error opening file', true);
                }
            }
        } else {
            // Fallback for older browsers
            this.fileInput.click();
        }
    }

    handleFileSelectFallback(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.processFileData(e.target.result, file.name);
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    processFileData(text, fileName) {
        try {
            this.jsonData = JSON.parse(text);
            this.currentFileName = fileName;
            this.selectedPath = null;

            this.enableEditing();
            this.renderTree();
            this.updateStatus(`Opened: ${fileName}`);
            this.fileNameDisplay.textContent = fileName;
        } catch (error) {
            this.updateStatus(`Error: Invalid JSON file - ${error.message}`, true);
            alert('Invalid JSON file. Please select a valid JSON file.');
        }
    }

    async saveFile() {
        if (!this.jsonData) return;

        if (this.fileHandle) {
            try {
                const writable = await this.fileHandle.createWritable();
                await writable.write(JSON.stringify(this.jsonData, null, 2));
                await writable.close();
                this.updateStatus(`Saved: ${this.currentFileName}`);
            } catch (err) {
                console.error('Error saving file:', err);
                this.updateStatus('Error saving file', true);
                // If permission denied or other error, try Save As
                this.saveAsFile();
            }
        } else {
            this.saveAsFile();
        }
    }

    async saveAsFile() {
        if (!this.jsonData) return;

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: this.currentFileName || 'data.json',
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                this.fileHandle = handle;
                this.currentFileName = handle.name;
                this.fileNameDisplay.textContent = this.currentFileName;

                const writable = await handle.createWritable();
                await writable.write(JSON.stringify(this.jsonData, null, 2));
                await writable.close();
                this.updateStatus(`Saved: ${this.currentFileName}`);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error saving file:', err);
                    this.updateStatus('Error saving file', true);
                }
            }
        } else {
            // Fallback: Download
            const jsonString = JSON.stringify(this.jsonData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = this.currentFileName || 'data.json';
            a.click();

            URL.revokeObjectURL(url);
            this.updateStatus(`Downloaded: ${this.currentFileName}`);
        }
    }

    enableEditing() {
        this.saveFileBtn.disabled = false;
        this.saveAsFileBtn.disabled = false;
        this.parentPathInput.disabled = false;
        this.keyInput.disabled = false;
        this.valueInput.disabled = false;
        this.valueType.disabled = false;
        this.createKeyBtn.disabled = false;
        this.templateFieldInput.disabled = false;
        this.addTemplateBtn.disabled = false;
        this.applyTemplateCheckbox.disabled = false;
    }

    renderTree() {
        this.treeView.innerHTML = '';

        if (!this.jsonData || Object.keys(this.jsonData).length === 0) {
            this.treeView.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📋</span>
                    <p>Empty JSON object</p>
                    <p class="empty-hint">Use the editor to add keys and values</p>
                </div>
            `;
            return;
        }

        const rootNode = this.createTreeNode(this.jsonData, '', true);
        this.treeView.appendChild(rootNode);
    }

    createTreeNode(obj, path, isRoot = false) {
        const container = document.createElement('div');
        container.className = 'tree-node';

        if (typeof obj !== 'object' || obj === null) return container;

        const entries = Array.isArray(obj)
            ? Array.from(obj, (v, i) => [i, v])
            : Object.entries(obj);

        for (const [key, value] of entries) {
            const isArray = Array.isArray(obj);
            const currentPath = isArray ? `${path}[${key}]` : (path ? `${path}.${key}` : key);

            const item = document.createElement('div');
            item.className = 'tree-item';
            item.dataset.path = currentPath;

            const isComplex = typeof value === 'object' && value !== null;
            const hasChildren = isComplex && (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0);

            let content = '';
            if (hasChildren) {
                content += `<span class="tree-toggle">▼</span>`;
            } else {
                content += `<span class="tree-toggle" style="opacity: 0;">▼</span>`;
            }

            const type = this.getValueType(value);
            const displayKey = isArray ? `[${key}]` : key;

            content += `<span class="tree-key">${displayKey}</span>`;
            content += `<span class="tree-type" style="color: var(--text-muted); font-size: 0.75rem; margin-left: 6px;">[${type}]</span>`;

            if (!isComplex) {
                const valueClass = this.getValueClass(value);
                const displayValue = this.formatValueForDisplay(value);
                content += `<span class="tree-value ${valueClass}">: ${displayValue}</span>`;
            } else {
                const count = Array.isArray(value) ? value.length : Object.keys(value).length;
                const label = type === 'array' ? `[${count}]` : `{${count}}`;
                content += `<span class="tree-value ${type}">: ${label}</span>`;
            }

            item.innerHTML = content;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectAsParent(currentPath);
            });

            container.appendChild(item);

            if (hasChildren) {
                const childNode = this.createTreeNode(value, currentPath);
                childNode.dataset.parent = currentPath;
                container.appendChild(childNode);

                const toggle = item.querySelector('.tree-toggle');
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleNode(childNode, toggle);
                });
            }
        }

        return container;
    }

    toggleNode(node, toggle) {
        if (node.style.display === 'none') {
            node.style.display = 'block';
            toggle.classList.remove('collapsed');
        } else {
            node.style.display = 'none';
            toggle.classList.add('collapsed');
        }
    }

    expandAll() {
        const allNodes = this.treeView.querySelectorAll('.tree-node[data-parent]');
        const allToggles = this.treeView.querySelectorAll('.tree-toggle');

        allNodes.forEach(node => node.style.display = 'block');
        allToggles.forEach(toggle => toggle.classList.remove('collapsed'));

        this.updateStatus('Expanded all nodes');
    }

    collapseAll() {
        const allNodes = this.treeView.querySelectorAll('.tree-node[data-parent]');
        const allToggles = this.treeView.querySelectorAll('.tree-toggle');

        allNodes.forEach(node => node.style.display = 'none');
        allToggles.forEach(toggle => toggle.classList.add('collapsed'));

        this.updateStatus('Collapsed all nodes');
    }

    selectAsParent(path) {
        const previousSelected = this.treeView.querySelectorAll('.tree-item.selected');
        previousSelected.forEach(el => el.classList.remove('selected'));

        const selected = this.treeView.querySelector(`[data-path="${path}"]`);
        if (selected) {
            selected.classList.add('selected');
        }

        this.selectedPath = path;
        const value = this.getValueByPath(path);

        this.parentPathInput.value = path;

        if (Array.isArray(value)) {
            this.keyLabel.textContent = 'Array Index';
            this.keyInput.value = value.length;
            this.keyInput.placeholder = `Next index: ${value.length}`;
        } else {
            this.keyLabel.textContent = 'New Key Name';
            this.keyInput.value = '';
            this.keyInput.placeholder = 'e.g., penetrator, splitShot';
        }

        if (typeof value !== 'object' || value === null) {
            // Leaf node
            this.valueInput.value = value === null ? '' : value.toString();
            this.valueType.value = this.getValueType(value);
        } else {
            // Object/Array
            this.valueInput.value = '';
            this.valueType.value = 'string'; // Default for new children
        }

        this.updateButtonVisibility();
        this.handleValueTypeChange();

        this.updateValueBtn.disabled = false;
        this.deleteKeyBtn.disabled = false;
        this.displayCurrentValue(value);

        // If an array index was auto-filled, focus the value input for immediate typing
        if (Array.isArray(value)) {
            this.valueInput.focus();
        }
    }

    createKey() {
        const parentPath = this.parentPathInput.value.trim();
        const keyName = this.keyInput.value.trim();

        if (!keyName) {
            alert('Please enter a key name');
            return;
        }

        const fullPath = parentPath ? `${parentPath}.${keyName}` : keyName;
        const type = this.valueType.value;
        const shouldApplyTemplate = this.applyTemplateCheckbox.checked;
        let value;

        if (type === 'object') {
            value = {};
            if (shouldApplyTemplate) {
                this.templateFields.forEach(fieldName => {
                    value[fieldName] = '';
                });
            }
        } else if (type === 'array') {
            value = [];
        } else if (type === 'string' && this.valueInput.value.trim() === '') {
            value = {};
            if (shouldApplyTemplate) {
                this.templateFields.forEach(fieldName => {
                    value[fieldName] = '';
                });
            }
        } else {
            value = this.processInputValue(this.valueInput.value, type);
        }

        this.setValueByPath(fullPath, value);
        this.updateStatus(`✨ Created "${keyName}"`);

        this.renderTree();
        this.keyInput.value = '';
        this.valueInput.value = '';
        this.keyInput.focus();

        // If parent is an array, stay on the parent to allow adding more items
        const parentValue = this.getValueByPath(parentPath);
        const shouldSelectParent = Array.isArray(parentValue);

        if (shouldSelectParent) {
            setTimeout(() => {
                this.selectAsParent(parentPath);
                this.valueInput.focus(); // Focus specifically for rapid array filling
            }, 100);
        } else {
            // Automatically select the newly created key/object
            setTimeout(() => this.selectAsParent(fullPath), 100);
        }
    }

    updateValue() {
        const path = this.parentPathInput.value.trim();
        if (!path) return;

        const type = this.valueType.value;
        const value = this.processInputValue(this.valueInput.value, type);

        this.setValueByPath(path, value);
        this.renderTree();
        this.updateStatus(`✏️ Updated ${path}`);

        setTimeout(() => this.selectAsParent(path), 100);
    }

    processInputValue(val, type) {
        let value = val;

        // Strip accidental quotes if user typed them
        if (type === 'string' && value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
        }

        switch (type) {
            case 'number':
                value = parseFloat(value);
                return isNaN(value) ? 0 : value;
            case 'boolean':
                return value.toLowerCase() === 'true';
            case 'null':
                return null;
            case 'string':
            default:
                return value;
        }
    }

    deleteKey() {
        const path = this.parentPathInput.value.trim();
        if (!path) {
            console.warn('[JSON-EDITOR] Clicked delete with no path selected');
            this.updateStatus('Nothing selected to delete', true);
            return;
        }

        if (!confirm(`Are you sure you want to delete "${path}"?`)) return;

        console.log(`[JSON-EDITOR] Deleting path: ${path}`);
        const success = this.deleteByPath(path);

        if (success) {
            // Success: clear selection and re-render
            this.selectedPath = null;
            this.parentPathInput.value = '';
            this.keyInput.value = '';
            this.valueInput.value = '';
            this.renderTree();
            this.updateButtonVisibility();
            this.currentValue.innerHTML = '<div class="empty-state-small"><p>No key selected</p></div>';
            this.updateStatus(`🗑️ Deleted: ${path}`);
            console.log(`[JSON-EDITOR] Deleted: ${path}`);
        } else {
            this.updateStatus(`Failed to delete: ${path}`, true);
            console.error(`[JSON-EDITOR] Failed deletion: ${path}`);
        }
    }

    addTemplateField() {
        const fieldName = this.templateFieldInput.value.trim();
        if (!fieldName || this.templateFields.includes(fieldName)) return;

        this.templateFields.push(fieldName);
        this.renderTemplateFields();
        this.templateFieldInput.value = '';
        this.templateFieldInput.focus();
    }

    removeTemplateField(fieldName) {
        this.templateFields = this.templateFields.filter(f => f !== fieldName);
        this.renderTemplateFields();
    }

    renderTemplateFields() {
        if (this.templateFields.length === 0) {
            this.templateFieldsList.innerHTML = '<div class="empty-state-small"><p>No template fields</p></div>';
            return;
        }
        this.templateFieldsList.innerHTML = '';
        this.templateFields.forEach(fieldName => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.innerHTML = `<span class="template-item-name">${fieldName}</span>`;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'template-item-remove';
            removeBtn.textContent = '✕';
            removeBtn.onclick = () => this.removeTemplateField(fieldName);
            item.appendChild(removeBtn);
            this.templateFieldsList.appendChild(item);
        });
    }

    parsePath(path) {
        if (!path) return [];
        return path.split(/[.\[\]]+/).filter(p => p !== '');
    }

    getValueByPath(path) {
        if (!path) return this.jsonData;
        const parts = this.parsePath(path);
        let current = this.jsonData;
        for (const part of parts) {
            if (current === undefined || current === null) return undefined;
            current = current[part];
        }
        return current;
    }

    setValueByPath(path, value) {
        const parts = this.parsePath(path);
        const key = parts.pop();
        let current = this.jsonData;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const nextPart = i + 1 < parts.length ? parts[i + 1] : key;
            const isNextNumeric = !isNaN(nextPart) && !isNaN(parseFloat(nextPart));

            // If the path doesn't exist or is a primitive, convert to object or array
            if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
                current[part] = isNextNumeric ? [] : {};
            }
            current = current[part];
        }

        // Final assignment. If the parent is an array and the key is numeric, 
        // ensure it's treated as a number
        if (Array.isArray(current) && !isNaN(key)) {
            current[parseInt(key)] = value;
        } else {
            current[key] = value;
        }
    }

    deleteByPath(path) {
        if (!path) return false;
        const parts = this.parsePath(path);
        const keyToDelete = parts.pop();
        let current = this.jsonData;

        // Traverse to the parent of the key we want to delete
        for (const part of parts) {
            if (current === null || typeof current !== 'object') return false;

            // Handle array or object traversal
            if (Array.isArray(current)) {
                const idx = parseInt(part);
                if (isNaN(idx)) return false;
                current = current[idx];
            } else {
                if (!(part in current)) return false;
                current = current[part];
            }
        }

        if (current === null || typeof current !== 'object') return false;

        if (Array.isArray(current)) {
            const index = parseInt(keyToDelete);
            if (!isNaN(index) && index >= 0 && index < current.length) {
                current.splice(index, 1);
                return true;
            }
        } else if (keyToDelete in current) {
            delete current[keyToDelete];
            return true;
        }

        return false;
    }


    displayCurrentValue(value) {
        if (value === undefined) {
            this.currentValue.innerHTML = '<div class="empty-state-small"><p>Key does not exist</p></div>';
        } else if (typeof value === 'object' && value !== null) {
            this.currentValue.innerHTML = `<pre>${JSON.stringify(value, null, 2)}</pre>`;
        } else {
            const valueClass = this.getValueClass(value);
            this.currentValue.innerHTML = `<div class="tree-value ${valueClass}">${this.formatValueForDisplay(value)}</div>`;
        }
    }

    getValueClass(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        return typeof value;
    }

    getValueType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') return 'object';
        return typeof value;
    }

    formatValueForDisplay(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`; // Quotes only for display
        return value.toString();
    }

    handleValueTypeChange() {
        const type = this.valueType.value;
        if (type === 'object' || type === 'array') {
            this.valueInput.value = '';
            this.valueInput.disabled = true;
            this.valueInput.placeholder = type === 'object' ? 'Will create object' : 'Will create empty array';
        } else {
            this.valueInput.disabled = false;
            this.valueInput.placeholder = 'Enter value';
        }
    }

    updateStatus(message, isError = false) {
        this.statusText.textContent = message;
        this.statusText.style.color = isError ? 'var(--danger)' : 'var(--text-secondary)';
    }
}

document.addEventListener('DOMContentLoaded', () => JSONEditor.init());
