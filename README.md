# Outly - Leave Time Calculator

Outly is a sleek, beautifully designed Chrome Extension built to help employees easily calculate their exact exit time based on their daily work hours, break times, and selected leave types. 

Whether you are taking a Half Day, Short Leave, or working a Full Day, Outly handles the math and presents your leaving time in a modern, highly polished interface.

## ✨ Features

- **Leave Type Selection**: Quickly switch between Full Day, Half Day, and Short Leave calculations.
- **Custom Time Inputs**: Enter custom hours and minutes when taking a Short Leave.
- **Interactive Dashboard**: View a beautiful circular progress indicator showing how much time you've worked and how much is left.
- **Dual-Theme Support**: Flawless, high-contrast Light and Dark modes with a manual toggle switch.
- **Employee Profile**: Save your Employee ID, Name, and Code during initial setup.
- **Minimalist Aesthetic**: Features elegant typography, crisp borders, and refined animations for a premium user experience.

## 🚀 Getting Started

Since this project is built entirely using vanilla web technologies, there's no build step required to run the UI prototype!

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Mananpatel08/outly-chrome-extension.git
   ```
2. Navigate to the project directory:
   ```bash
   cd outly-chrome-extension
   ```
3. Open `index.html` in your favorite web browser to view the interactive UI prototype.

### Installing as a Chrome Extension
*(Note: A `manifest.json` will be required to load this directly into Chrome as a fully functional extension.)*

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click on **Load unpacked**.
4. Select the project directory.
5. The Outly extension will now be available in your toolbar!

## 🛠️ Tech Stack

- **HTML5**: Semantic structure for the extension popup.
- **Vanilla CSS3**: Custom CSS variables for powerful Light/Dark theme switching, responsive flexbox layouts, and custom SVG animations—all without relying on heavy CSS frameworks.
- **Vanilla JavaScript**: State-driven UI updates manipulating DOM elements for a fast, app-like experience.

## 🎨 UI / UX Design

Outly focuses on a highly polished, modern aesthetic:
- **Typography**: System default sans-serif for high legibility, paired with elegant serif fonts for prominent metrics and titles.
- **Dark Mode**: Stealthy true-dark (`#121212`) background with a vibrant neon Cyan-to-Blue gradient progress arc.
- **High Contrast**: Active elements (like the date picker and segmented controls) use solid inverted colors to stand out clearly.
