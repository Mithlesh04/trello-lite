# Trello Lite

A lightweight, browser-based task management application inspired by Trello. Built with vanilla HTML, CSS, and JavaScript.

![Trello Lite](https://via.placeholder.com/800x400?text=Trello+Lite)

## Features

### Boards
- Create new boards to organize your projects
- Edit board names
- Delete boards (with confirmation)
- View all boards in a responsive grid layout

### Lists
- Create lists within boards to categorize tasks
- Edit list names (via menu or double-click)
- Delete lists (with confirmation)
- Organize multiple lists side by side

### Cards
- Create cards within lists for individual tasks
- Add titles and optional descriptions to cards
- Edit card details
- Delete cards (with confirmation)
- **Drag and drop** cards between lists or reorder within the same list

### Data Persistence
- All data is automatically saved to your browser's localStorage
- Your boards, lists, and cards persist across browser sessions
- No server or database required

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Adaptive layout for different screen sizes
- Touch-friendly interface

## Getting Started

### Option 1: Open Directly in Browser
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start creating boards!

### Option 2: Using a Local Server
For the best experience, you can serve the files using a local web server:

**Using Python 3:**
```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

**Using Node.js (with http-server):**
```bash
npx http-server -p 8000
```
Then open http://localhost:8000 in your browser.

**Using VS Code Live Server:**
1. Install the "Live Server" extension
2. Right-click on `index.html` and select "Open with Live Server"

## Usage

### Creating a Board
1. Click the "+ Create Board" button in the header
2. Enter a name for your board
3. Click "Save" or press Enter

### Creating a List
1. Open a board by clicking on it
2. Click the "+ Add List" button on the right
3. Enter a name for your list
4. Click "Save" or press Enter

### Creating a Card
1. Inside a list, click "+ Add a card"
2. Enter a title for your card
3. Optionally add a description
4. Click "Save"

### Editing Items
- **Boards:** Click "Edit" button in the board detail view
- **Lists:** Click the "⋯" menu and select "Edit", or double-click the list title
- **Cards:** Hover over a card and click the "Edit" button

### Deleting Items
- **Boards:** Click "Delete" button in the board detail view
- **Lists:** Click the "⋯" menu and select "Delete"
- **Cards:** Hover over a card and click the "Delete" button

All deletions require confirmation.

### Drag and Drop
- Click and hold a card to start dragging
- Move the card to another position within the same list or to a different list
- Release to drop the card in its new position

## File Structure

```
trello-lite/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # Application logic and functionality
└── README.md       # This file
```

## Browser Support

Trello Lite works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Data Storage

Your data is stored in the browser's localStorage. This means:
- Data persists across browser sessions
- Data is specific to each browser/device
- Clearing browser data will remove your boards
- Data is not synced across devices

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close modal/dropdown | `Escape` |
| Submit form | `Enter` |

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).
