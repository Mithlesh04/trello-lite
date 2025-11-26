// Trello Lite - Main JavaScript File

// ==================== Data Management ====================

const STORAGE_KEY = 'trello-lite-data';

// Initialize data structure
function getInitialData() {
    return {
        boards: [],
        nextBoardId: 1,
        nextListId: 1,
        nextCardId: 1
    };
}

// Validate data structure
function isValidData(data) {
    return data &&
           typeof data === 'object' &&
           Array.isArray(data.boards) &&
           typeof data.nextBoardId === 'number' &&
           typeof data.nextListId === 'number' &&
           typeof data.nextCardId === 'number';
}

// Safely parse integer, returns null if invalid
function safeParseInt(value) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

// Load data from localStorage
function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (isValidData(parsed)) {
                return parsed;
            }
            console.warn('Invalid data structure in localStorage, using default');
        }
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
    }
    return getInitialData();
}

// Save data to localStorage
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

// Application State
let appData = loadData();
let currentBoardId = null;
let editingBoardId = null;
let editingListId = null;
let editingCardId = null;
let currentListIdForCard = null;
let confirmCallback = null;

// ==================== DOM Elements ====================

const elements = {
    // Views
    boardsView: document.getElementById('boards-view'),
    boardDetailView: document.getElementById('board-detail-view'),
    boardsContainer: document.getElementById('boards-container'),
    listsContainer: document.getElementById('lists-container'),
    boardTitle: document.getElementById('board-title'),
    
    // Buttons
    createBoardBtn: document.getElementById('create-board-btn'),
    backToBoardsBtn: document.getElementById('back-to-boards-btn'),
    editBoardBtn: document.getElementById('edit-board-btn'),
    deleteBoardBtn: document.getElementById('delete-board-btn'),
    addListBtn: document.getElementById('add-list-btn'),
    saveBoardBtn: document.getElementById('save-board-btn'),
    saveListBtn: document.getElementById('save-list-btn'),
    saveCardBtn: document.getElementById('save-card-btn'),
    confirmActionBtn: document.getElementById('confirm-action-btn'),
    
    // Modals
    boardModal: document.getElementById('board-modal'),
    listModal: document.getElementById('list-modal'),
    cardModal: document.getElementById('card-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    
    // Modal titles
    boardModalTitle: document.getElementById('board-modal-title'),
    listModalTitle: document.getElementById('list-modal-title'),
    cardModalTitle: document.getElementById('card-modal-title'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    
    // Inputs
    boardNameInput: document.getElementById('board-name-input'),
    listNameInput: document.getElementById('list-name-input'),
    cardTitleInput: document.getElementById('card-title-input'),
    cardDescriptionInput: document.getElementById('card-description-input')
};

// ==================== Utility Functions ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateId(type) {
    switch (type) {
        case 'board':
            return appData.nextBoardId++;
        case 'list':
            return appData.nextListId++;
        case 'card':
            return appData.nextCardId++;
        default:
            return Date.now();
    }
}

function findBoard(boardId) {
    return appData.boards.find(b => b.id === boardId);
}

function findList(board, listId) {
    return board.lists.find(l => l.id === listId);
}

function findCard(list, cardId) {
    return list.cards.find(c => c.id === cardId);
}

// ==================== Modal Functions ====================

function openModal(modal) {
    modal.classList.remove('hidden');
    const input = modal.querySelector('input');
    if (input) {
        setTimeout(() => input.focus(), 100);
    }
}

function closeModal(modal) {
    modal.classList.add('hidden');
    // Reset inputs
    const inputs = modal.querySelectorAll('input, textarea');
    inputs.forEach(input => input.value = '');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        closeModal(modal);
    });
}

function showConfirmDialog(title, message, callback) {
    elements.confirmModalTitle.textContent = title;
    elements.confirmModalMessage.textContent = message;
    confirmCallback = callback;
    openModal(elements.confirmModal);
}

// ==================== Board Functions ====================

function createBoard(name) {
    const board = {
        id: generateId('board'),
        name: name.trim(),
        lists: [],
        createdAt: new Date().toISOString()
    };
    appData.boards.push(board);
    saveData(appData);
    renderBoards();
    return board;
}

function updateBoard(boardId, name) {
    const board = findBoard(boardId);
    if (board) {
        board.name = name.trim();
        saveData(appData);
        renderBoards();
        if (currentBoardId === boardId) {
            elements.boardTitle.textContent = board.name;
        }
    }
}

function deleteBoard(boardId) {
    const index = appData.boards.findIndex(b => b.id === boardId);
    if (index !== -1) {
        appData.boards.splice(index, 1);
        saveData(appData);
        if (currentBoardId === boardId) {
            currentBoardId = null;
            showBoardsView();
        }
        renderBoards();
    }
}

function renderBoards() {
    const container = elements.boardsContainer;
    
    if (appData.boards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No boards yet. Create your first board to get started!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appData.boards.map(board => `
        <div class="board-card" data-board-id="${board.id}">
            <h3>${escapeHtml(board.name)}</h3>
            <div class="board-card-info">${board.lists.length} list${board.lists.length !== 1 ? 's' : ''}</div>
        </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.board-card').forEach(card => {
        card.addEventListener('click', () => {
            const boardId = safeParseInt(card.dataset.boardId);
            if (boardId !== null) {
                openBoard(boardId);
            }
        });
    });
}

function openBoard(boardId) {
    const board = findBoard(boardId);
    if (!board) return;
    
    currentBoardId = boardId;
    elements.boardTitle.textContent = board.name;
    
    elements.boardsView.classList.add('hidden');
    elements.boardDetailView.classList.remove('hidden');
    
    renderLists();
}

function showBoardsView() {
    elements.boardDetailView.classList.add('hidden');
    elements.boardsView.classList.remove('hidden');
    currentBoardId = null;
    renderBoards();
}

// ==================== List Functions ====================

function createList(boardId, name) {
    const board = findBoard(boardId);
    if (!board) return null;
    
    const list = {
        id: generateId('list'),
        name: name.trim(),
        cards: [],
        createdAt: new Date().toISOString()
    };
    board.lists.push(list);
    saveData(appData);
    renderLists();
    return list;
}

function updateList(boardId, listId, name) {
    const board = findBoard(boardId);
    if (!board) return;
    
    const list = findList(board, listId);
    if (list) {
        list.name = name.trim();
        saveData(appData);
        renderLists();
    }
}

function deleteList(boardId, listId) {
    const board = findBoard(boardId);
    if (!board) return;
    
    const index = board.lists.findIndex(l => l.id === listId);
    if (index !== -1) {
        board.lists.splice(index, 1);
        saveData(appData);
        renderLists();
    }
}

function renderLists() {
    const board = findBoard(currentBoardId);
    if (!board) return;
    
    const container = elements.listsContainer;
    
    container.innerHTML = board.lists.map(list => `
        <div class="list" data-list-id="${list.id}">
            <div class="list-header">
                <span class="list-title" contenteditable="false" data-list-id="${list.id}">${escapeHtml(list.name)}</span>
                <div class="list-menu">
                    <button class="list-menu-btn" data-list-id="${list.id}">⋯</button>
                    <div class="list-dropdown hidden" data-list-id="${list.id}">
                        <button class="edit-list-btn" data-list-id="${list.id}">Edit</button>
                        <button class="delete-list-btn delete-btn" data-list-id="${list.id}">Delete</button>
                    </div>
                </div>
            </div>
            <div class="cards-container" data-list-id="${list.id}">
                ${renderCards(list)}
            </div>
            <button class="add-card-btn" data-list-id="${list.id}">+ Add a card</button>
        </div>
    `).join('');
    
    // Add event listeners
    setupListEventListeners();
    setupDragAndDrop();
}

function setupListEventListeners() {
    // List menu buttons
    document.querySelectorAll('.list-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const listId = safeParseInt(btn.dataset.listId);
            if (listId !== null) {
                toggleListDropdown(listId);
            }
        });
    });
    
    // Edit list buttons
    document.querySelectorAll('.edit-list-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const listId = safeParseInt(btn.dataset.listId);
            if (listId !== null) {
                startEditList(listId);
            }
        });
    });
    
    // Delete list buttons
    document.querySelectorAll('.delete-list-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const listId = safeParseInt(btn.dataset.listId);
            if (listId === null) return;
            const board = findBoard(currentBoardId);
            const list = findList(board, listId);
            if (list) {
                showConfirmDialog(
                    'Delete List',
                    `Are you sure you want to delete "${list.name}" and all its cards?`,
                    () => deleteList(currentBoardId, listId)
                );
            }
            closeAllDropdowns();
        });
    });
    
    // Add card buttons
    document.querySelectorAll('.add-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const listId = safeParseInt(btn.dataset.listId);
            if (listId !== null) {
                openCardModal(listId);
            }
        });
    });
    
    // List title editing
    document.querySelectorAll('.list-title').forEach(title => {
        title.addEventListener('dblclick', () => {
            const listId = safeParseInt(title.dataset.listId);
            if (listId !== null) {
                startInlineEditList(title, listId);
            }
        });
    });
    
    // Card edit and delete buttons
    document.querySelectorAll('.edit-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cardId = safeParseInt(btn.dataset.cardId);
            const listId = safeParseInt(btn.dataset.listId);
            if (cardId !== null && listId !== null) {
                openCardModal(listId, cardId);
            }
        });
    });
    
    document.querySelectorAll('.delete-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cardId = safeParseInt(btn.dataset.cardId);
            const listId = safeParseInt(btn.dataset.listId);
            if (cardId === null || listId === null) return;
            const board = findBoard(currentBoardId);
            const list = findList(board, listId);
            const card = findCard(list, cardId);
            if (card) {
                showConfirmDialog(
                    'Delete Card',
                    `Are you sure you want to delete "${card.title}"?`,
                    () => deleteCard(currentBoardId, listId, cardId)
                );
            }
        });
    });
}

function toggleListDropdown(listId) {
    const dropdown = document.querySelector(`.list-dropdown[data-list-id="${listId}"]`);
    const isHidden = dropdown.classList.contains('hidden');
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    if (isHidden) {
        dropdown.classList.remove('hidden');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.list-dropdown').forEach(dropdown => {
        dropdown.classList.add('hidden');
    });
}

function startEditList(listId) {
    const board = findBoard(currentBoardId);
    const list = findList(board, listId);
    if (!list) return;
    
    editingListId = listId;
    elements.listModalTitle.textContent = 'Edit List';
    elements.listNameInput.value = list.name;
    openModal(elements.listModal);
    closeAllDropdowns();
}

function startInlineEditList(titleElement, listId) {
    const board = findBoard(currentBoardId);
    const list = findList(board, listId);
    if (!list) return;
    
    titleElement.contentEditable = 'true';
    titleElement.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(titleElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    const saveEdit = () => {
        titleElement.contentEditable = 'false';
        const newName = titleElement.textContent.trim();
        if (newName && newName !== list.name) {
            updateList(currentBoardId, listId, newName);
        } else {
            titleElement.textContent = list.name;
        }
    };
    
    titleElement.addEventListener('blur', saveEdit, { once: true });
    titleElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            titleElement.blur();
        } else if (e.key === 'Escape') {
            titleElement.textContent = list.name;
            titleElement.blur();
        }
    });
}

// ==================== Card Functions ====================

function createCard(boardId, listId, title, description) {
    const board = findBoard(boardId);
    if (!board) return null;
    
    const list = findList(board, listId);
    if (!list) return null;
    
    const card = {
        id: generateId('card'),
        title: title.trim(),
        description: description ? description.trim() : '',
        createdAt: new Date().toISOString()
    };
    list.cards.push(card);
    saveData(appData);
    renderLists();
    return card;
}

function updateCard(boardId, listId, cardId, title, description) {
    const board = findBoard(boardId);
    if (!board) return;
    
    const list = findList(board, listId);
    if (!list) return;
    
    const card = findCard(list, cardId);
    if (card) {
        card.title = title.trim();
        card.description = description ? description.trim() : '';
        saveData(appData);
        renderLists();
    }
}

function deleteCard(boardId, listId, cardId) {
    const board = findBoard(boardId);
    if (!board) return;
    
    const list = findList(board, listId);
    if (!list) return;
    
    const index = list.cards.findIndex(c => c.id === cardId);
    if (index !== -1) {
        list.cards.splice(index, 1);
        saveData(appData);
        renderLists();
    }
}

function renderCards(list) {
    if (list.cards.length === 0) {
        return '';
    }
    
    return list.cards.map(card => `
        <div class="card" draggable="true" data-card-id="${card.id}" data-list-id="${list.id}">
            <div class="card-title">${escapeHtml(card.title)}</div>
            ${card.description ? `<div class="card-description">${escapeHtml(card.description)}</div>` : ''}
            <div class="card-actions">
                <button class="card-action-btn edit-card-btn" data-card-id="${card.id}" data-list-id="${list.id}">Edit</button>
                <button class="card-action-btn delete delete-card-btn" data-card-id="${card.id}" data-list-id="${list.id}">Delete</button>
            </div>
        </div>
    `).join('');
}

function openCardModal(listId, cardId = null) {
    currentListIdForCard = listId;
    editingCardId = cardId;
    
    if (cardId) {
        const board = findBoard(currentBoardId);
        const list = findList(board, listId);
        const card = findCard(list, cardId);
        if (card) {
            elements.cardModalTitle.textContent = 'Edit Card';
            elements.cardTitleInput.value = card.title;
            elements.cardDescriptionInput.value = card.description || '';
        }
    } else {
        elements.cardModalTitle.textContent = 'Add Card';
        elements.cardTitleInput.value = '';
        elements.cardDescriptionInput.value = '';
    }
    
    openModal(elements.cardModal);
}

// ==================== Drag and Drop ====================

let draggedCard = null;
let draggedCardData = null;

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    const containers = document.querySelectorAll('.cards-container');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    const cardId = safeParseInt(this.dataset.cardId);
    const sourceListId = safeParseInt(this.dataset.listId);
    if (cardId === null || sourceListId === null) return;
    
    draggedCard = this;
    draggedCardData = {
        cardId: cardId,
        sourceListId: sourceListId
    };
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.cardId);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedCard = null;
    draggedCardData = null;
    
    // Remove all placeholders
    document.querySelectorAll('.drop-placeholder').forEach(placeholder => {
        placeholder.remove();
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const container = this;
    const afterElement = getDragAfterElement(container, e.clientY);
    const placeholder = container.querySelector('.drop-placeholder');
    
    if (!placeholder) {
        const newPlaceholder = document.createElement('div');
        newPlaceholder.className = 'drop-placeholder';
        if (afterElement) {
            container.insertBefore(newPlaceholder, afterElement);
        } else {
            container.appendChild(newPlaceholder);
        }
    } else {
        if (afterElement) {
            container.insertBefore(placeholder, afterElement);
        } else {
            container.appendChild(placeholder);
        }
    }
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    // Only remove class if leaving the container entirely
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
        const placeholder = this.querySelector('.drop-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const placeholder = this.querySelector('.drop-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    if (!draggedCardData) return;
    
    const targetListId = safeParseInt(this.dataset.listId);
    if (targetListId === null) return;
    
    const afterElement = getDragAfterElement(this, e.clientY);
    const beforeCardId = afterElement ? safeParseInt(afterElement.dataset.cardId) : null;
    
    moveCard(
        draggedCardData.sourceListId,
        targetListId,
        draggedCardData.cardId,
        beforeCardId
    );
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function moveCard(sourceListId, targetListId, cardId, beforeCardId) {
    const board = findBoard(currentBoardId);
    if (!board) return;
    
    const sourceList = findList(board, sourceListId);
    const targetList = findList(board, targetListId);
    if (!sourceList || !targetList) return;
    
    // Find and remove card from source list
    const cardIndex = sourceList.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;
    
    const [card] = sourceList.cards.splice(cardIndex, 1);
    
    // Find insert position in target list
    let insertIndex = targetList.cards.length;
    if (beforeCardId) {
        const beforeIndex = targetList.cards.findIndex(c => c.id === beforeCardId);
        if (beforeIndex !== -1) {
            insertIndex = beforeIndex;
        }
    }
    
    // Insert card at new position
    targetList.cards.splice(insertIndex, 0, card);
    
    saveData(appData);
    renderLists();
}

// ==================== Event Listeners ====================

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.list-menu')) {
        closeAllDropdowns();
    }
});

// Modal close buttons
document.querySelectorAll('.modal-close, .modal .btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        if (modalId) {
            closeModal(document.getElementById(modalId));
        }
    });
});

// Close modal on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
        closeAllDropdowns();
    }
});

// Create Board Button
elements.createBoardBtn.addEventListener('click', () => {
    editingBoardId = null;
    elements.boardModalTitle.textContent = 'Create Board';
    elements.boardNameInput.value = '';
    openModal(elements.boardModal);
});

// Save Board Button
elements.saveBoardBtn.addEventListener('click', () => {
    const name = elements.boardNameInput.value.trim();
    if (!name) {
        elements.boardNameInput.focus();
        return;
    }
    
    if (editingBoardId) {
        updateBoard(editingBoardId, name);
    } else {
        createBoard(name);
    }
    closeModal(elements.boardModal);
});

// Board Name Input - Enter key
elements.boardNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        elements.saveBoardBtn.click();
    }
});

// Back to Boards Button
elements.backToBoardsBtn.addEventListener('click', showBoardsView);

// Edit Board Button
elements.editBoardBtn.addEventListener('click', () => {
    const board = findBoard(currentBoardId);
    if (board) {
        editingBoardId = currentBoardId;
        elements.boardModalTitle.textContent = 'Edit Board';
        elements.boardNameInput.value = board.name;
        openModal(elements.boardModal);
    }
});

// Delete Board Button
elements.deleteBoardBtn.addEventListener('click', () => {
    const board = findBoard(currentBoardId);
    if (board) {
        showConfirmDialog(
            'Delete Board',
            `Are you sure you want to delete "${board.name}" and all its lists and cards?`,
            () => deleteBoard(currentBoardId)
        );
    }
});

// Add List Button
elements.addListBtn.addEventListener('click', () => {
    editingListId = null;
    elements.listModalTitle.textContent = 'Add List';
    elements.listNameInput.value = '';
    openModal(elements.listModal);
});

// Save List Button
elements.saveListBtn.addEventListener('click', () => {
    const name = elements.listNameInput.value.trim();
    if (!name) {
        elements.listNameInput.focus();
        return;
    }
    
    if (editingListId) {
        updateList(currentBoardId, editingListId, name);
    } else {
        createList(currentBoardId, name);
    }
    editingListId = null;
    closeModal(elements.listModal);
});

// List Name Input - Enter key
elements.listNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        elements.saveListBtn.click();
    }
});

// Save Card Button
elements.saveCardBtn.addEventListener('click', () => {
    const title = elements.cardTitleInput.value.trim();
    const description = elements.cardDescriptionInput.value.trim();
    
    if (!title) {
        elements.cardTitleInput.focus();
        return;
    }
    
    if (editingCardId) {
        updateCard(currentBoardId, currentListIdForCard, editingCardId, title, description);
    } else {
        createCard(currentBoardId, currentListIdForCard, title, description);
    }
    
    editingCardId = null;
    currentListIdForCard = null;
    closeModal(elements.cardModal);
});

// Card Title Input - Enter key (only if no description)
elements.cardTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.cardDescriptionInput.focus();
    }
});

// Confirm Action Button
elements.confirmActionBtn.addEventListener('click', () => {
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
    closeModal(elements.confirmModal);
});

// ==================== Initialize Application ====================

function init() {
    renderBoards();
}

// Start the application
init();
