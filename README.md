# 🚀 CodeLens AI

> **Next-Generation Interactive Code Execution Visualizer, AST Semantic Explainer & Multilingual Debugger**

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/dinesh2505034/codelens-ai.git)
[![Node Version](https://img.shields.io/badge/Node-v18%2B-green.svg)](https://nodejs.org)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-yellow.svg)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 📖 Overview
**CodeLens AI** is a developer and computer science education platform that transforms static source code into an interactive, line-by-line execution visualizer. It monitors variable memory allocations, intercepts interactive standard input (`stdin`), executes code natively via Python's `sys.settrace`, and provides plain-English pedagogical explanations alongside a 7-point dynamic error diagnostic engine.

---

## ✨ Key Features

1. **⚡ Native Python Tracing Engine (`sys.settrace`)**:
   - Zero-lag variable synchronization via pending frame buffers.
   - Arbitrary-precision integer support (`BigInt` stringification) for factorials like `122!` without floating-point truncation.
2. **⌨️ In-Terminal Interactive Input (`stdin`)**:
   - Live stream pause for `input("...")` with inline terminal submit box and prompt streaming.
3. **🔍 7-Point Dynamic Error Diagnostic Engine**:
   - Analyzes runtime state (e.g. `ValueError` on invalid literal `'d'` for `int(input())`), explaining expected values, actual input, failed operations, why conversion failed, Python exception, how to fix, and corrected examples.
4. **📷 Multimodal OCR Code Scanner**:
   - Extract and auto-indent code from textbook photos and screenshots.
5. **🎨 Adaptive Dark & Light Themes**:
   - Clean slate/blue Light Theme and deep charcoal/neon cyan Dark Theme with custom waiting state illustrations.

---

## 🏗️ Architecture

```
+-------------------------------------------------------------------------+
|                         CodeLens AI Client (React)                      |
|  +------------------+  +-------------------+  +----------------------+  |
|  |  CodeEditor.jsx  |  | OutputTerminal.jsx|  | VisualStateMemory.jsx|  |
|  +------------------+  +-------------------+  +----------------------+  |
|  +-------------------------------------------------------------------+  |
|  |           StepExplanationCard.jsx (7-Point Error Diagnostics)     |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     | JSON RPC / REST API
+------------------------------------v------------------------------------+
|                         Express Backend Server (Node.js)                |
|  +-----------------------+  +----------------------+  +--------------+  |
|  | universalTraceEngine  |  | omniCodeAI Analyzer  |  | ocrService   |  |
|  +-----------+-----------+  +----------------------+  +--------------+  |
+--------------|----------------------------------------------------------+
               | Subprocess IPC
+--------------v----------------------------------------------------------+
|                  Python Runtime Engine (pythonTracer.py)                |
|       - sys.settrace() post-execution state synchronizer                |
|       - builtins.input interactive stdin interceptor                    |
|       - Arbitrary precision integer stringifier                         |
+-------------------------------------------------------------------------+
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/dinesh2505034/codelens-ai.git
cd codelens-ai
npm install
```

### 2. Build & Launch
```bash
npm run build
node server/index.js
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

---

## 📄 PDF Documentation
A PDF version of the complete system documentation is available in the repository root:
* [CodeLens_AI_Documentation.pdf](./CodeLens_AI_Documentation.pdf)

---

## 👨‍💻 Author & License
* **Author**: Dinesh .P
* **License**: MIT
