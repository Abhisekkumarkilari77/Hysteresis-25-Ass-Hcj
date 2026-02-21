
(function () {
  'use strict';

  
  const STORAGE_KEYS = {
    messages: 'chatSimulator.messages',
    settings: 'chatSimulator.settings',
    botReplies: 'chatSimulator.botReplies',
  };

  
  const DEFAULT_USERNAME = 'You';
  const DEFAULT_THEME = 'light';

  const DEFAULT_BOT_REPLIES = [
    'Hi! This chat runs completely offline in your browser.',
    'Every message you send is stored safely in Local Storage.',
    'Try toggling the theme in the top-right corner.',
    'You can clear the conversation using the trash icon.',
    'Tip: Click your name above to edit your display name.',
  ];

  
  const Storage = {
    load(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch (err) {
        console.warn('Local Storage load failed for key', key, err);
        return fallback;
      }
    },

    save(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn('Local Storage save failed for key', key, err);
      }
    },

    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn('Local Storage remove failed for key', key, err);
      }
    },
  };

  
  function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const normalizedHour = hours % 12 || 12;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${normalizedHour}:${paddedMinutes} ${ampm}`;
  }

  function dayKey(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  function readableDayLabel(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dk = dayKey(date);
    const todayKey = dayKey(today);
    const yKey = dayKey(yesterday);

    if (dk === todayKey) return 'Today';
    if (dk === yKey) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  
  const ChatApp = {
    state: {
      messages: [],
      settings: {
        username: DEFAULT_USERNAME,
        theme: DEFAULT_THEME,
      },
      botReplies: [],
      botIndex: 0,
      isBotTyping: false,
    },

    elements: {},

    init() {
      this.cacheElements();
      this.bindEvents();
      this.loadState();
      this.applyTheme(this.state.settings.theme);
      this.renderAll();
      this.maybeShowWelcomeSystemMessage();
    },

    cacheElements() {
      this.elements.messagesContainer = document.getElementById('messages');
      this.elements.emptyState = document.getElementById('empty-state');
      this.elements.typingIndicator = document.getElementById('typing-indicator');

      this.elements.form = document.getElementById('message-form');
      this.elements.input = document.getElementById('message-input');
      this.elements.sendButton = document.getElementById('send-button');

      this.elements.themeToggle = document.getElementById('theme-toggle');
      this.elements.clearChat = document.getElementById('clear-chat');

      this.elements.usernameDisplay = document.getElementById('username-display');
      this.elements.usernameText = document.getElementById('username-text');
      this.elements.usernameInput = document.getElementById('username-input');

      this.elements.messageTemplate = document.getElementById('message-template');
      this.elements.systemMessageTemplate = document.getElementById(
        'system-message-template',
      );
      this.elements.dateSeparatorTemplate = document.getElementById(
        'date-separator-template',
      );
    },

    bindEvents() {
      this.elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handleSubmitMessage();
      });
      this.elements.themeToggle.addEventListener('click', () => {
        const nextTheme =
          this.state.settings.theme === 'dark' ? 'light' : 'dark';
        this.updateSettings({ theme: nextTheme });
        this.applyTheme(nextTheme);
      });
      this.elements.clearChat.addEventListener('click', () => {
        const confirmed = window.confirm(
          'Clear the entire chat history from this browser?',
        );
        if (!confirmed) return;
        this.clearMessages();
      });
      this.elements.usernameDisplay.addEventListener('click', () => {
        this.startEditingUsername();
      });

      this.elements.usernameInput.addEventListener('blur', () => {
        this.finishEditingUsername();
      });

      this.elements.usernameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.finishEditingUsername();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          this.cancelEditingUsername();
        }
      });
    },

    loadState() {
      const storedMessages = Storage.load(STORAGE_KEYS.messages, []);
      const storedSettings = Storage.load(STORAGE_KEYS.settings, null);
      const storedBotReplies = Storage.load(
        STORAGE_KEYS.botReplies,
        DEFAULT_BOT_REPLIES,
      );

      this.state.messages = Array.isArray(storedMessages) ? storedMessages : [];
      this.state.settings = Object.assign(
        {},
        {
          username: DEFAULT_USERNAME,
          theme: DEFAULT_THEME,
        },
        storedSettings || {},
      );
      this.state.botReplies = Array.isArray(storedBotReplies)
        ? storedBotReplies
        : DEFAULT_BOT_REPLIES.slice();

      Storage.save(STORAGE_KEYS.botReplies, this.state.botReplies);
    },

    persistMessages() {
      Storage.save(STORAGE_KEYS.messages, this.state.messages);
    },

    updateSettings(partial) {
      this.state.settings = Object.assign({}, this.state.settings, partial);
      Storage.save(STORAGE_KEYS.settings, this.state.settings);
      this.renderSettings();
    },

    applyTheme(theme) {
      document.body.setAttribute('data-theme', theme);
    },

    
    renderSettings() {
      const { username } = this.state.settings;
      this.elements.usernameText.textContent = username || DEFAULT_USERNAME;
    },

    renderAll() {
      this.renderSettings();
      this.renderMessages();
    },

    renderMessages() {
      const container = this.elements.messagesContainer;
      container.innerHTML = '';

      const { messages } = this.state;

      if (!messages.length) {
        this.elements.emptyState.classList.remove('hidden');
        return;
      }

      this.elements.emptyState.classList.add('hidden');

      let lastDayKey = null;

      messages.forEach((message) => {
        const createdDate = new Date(message.createdAt);
        const key = dayKey(createdDate);

        if (key !== lastDayKey) {
          const dateElem = this.createDateSeparatorElement(createdDate);
          container.appendChild(dateElem);
          lastDayKey = key;
        }

        if (message.type === 'system') {
          const systemElem = this.createSystemMessageElement(message);
          container.appendChild(systemElem);
        } else {
          const msgElem = this.createMessageElement(message);
          container.appendChild(msgElem);
        }
      });

      this.scrollToBottom();
    },

    createMessageElement(message) {
      const { username } = this.state.settings;
      const template = this.elements.messageTemplate;
      const node = template.content.firstElementChild.cloneNode(true);

      const bubble = node.querySelector('.message-bubble');
      const textEl = node.querySelector('.message-text');
      const timeEl = node.querySelector('.message-time');
      const senderEl = node.querySelector('.message-sender');
      const deleteBtn = node.querySelector('.message-delete');

      node.dataset.id = message.id;

      if (message.type === 'user') {
        node.classList.add('message-user');
        senderEl.textContent = username || DEFAULT_USERNAME;
      } else {
        node.classList.add('message-bot');
        senderEl.textContent = 'Bot';
      }

      textEl.textContent = message.text;

      const date = new Date(message.createdAt);
      timeEl.textContent = formatTime(date);

      deleteBtn.addEventListener('click', () => {
        this.deleteMessageById(message.id);
      });
      bubble.classList.add('message-enter');
      bubble.addEventListener(
        'animationend',
        () => {
          bubble.classList.remove('message-enter');
        },
        { once: true },
      );

      return node;
    },

    createSystemMessageElement(message) {
      const template = this.elements.systemMessageTemplate;
      const node = template.content.firstElementChild.cloneNode(true);
      const textEl = node.querySelector('.message-system-text');
      textEl.textContent = message.text;
      return node;
    },

    createDateSeparatorElement(date) {
      const template = this.elements.dateSeparatorTemplate;
      const node = template.content.firstElementChild.cloneNode(true);
      const label = node.querySelector('.date-separator-label');
      label.textContent = readableDayLabel(date);
      return node;
    },

    scrollToBottom() {
      const container = this.elements.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },

    
    handleSubmitMessage() {
      const raw = this.elements.input.value;
      const text = raw.trim();
      if (!text) {
        return;
      }

      this.elements.input.value = '';
      this.elements.input.focus();

      const now = new Date().toISOString();
      const message = {
        id: generateId(),
        text,
        type: 'user',
        createdAt: now,
      };

      this.state.messages.push(message);
      this.persistMessages();
      this.appendRenderedMessage(message);

      this.maybeTriggerBotReply();
    },

    appendRenderedMessage(message) {
      const container = this.elements.messagesContainer;

      if (!this.state.messages.length) {
        this.renderMessages();
        return;
      }
      this.renderMessages();
    },

    deleteMessageById(id) {
      const idx = this.state.messages.findIndex((m) => m.id === id);
      if (idx === -1) return;
      this.state.messages.splice(idx, 1);
      this.persistMessages();
      this.renderMessages();
    },

    clearMessages() {
      this.state.messages = [];
      this.persistMessages();
      this.renderMessages();
    },

    
    maybeTriggerBotReply() {
      if (!this.state.botReplies.length || this.state.isBotTyping) return;

      this.state.isBotTyping = true;
      this.showTypingIndicator(true);

      const delay = 600 + Math.random() * 700;
      window.setTimeout(() => {
        const replyText =
          this.state.botReplies[this.state.botIndex % this.state.botReplies.length];
        this.state.botIndex += 1;

        const reply = {
          id: generateId(),
          text: replyText,
          type: 'bot',
          createdAt: new Date().toISOString(),
        };

        this.state.messages.push(reply);
        this.persistMessages();
        this.renderMessages();

        this.state.isBotTyping = false;
        this.showTypingIndicator(false);
      }, delay);
    },

    showTypingIndicator(visible) {
      if (!this.elements.typingIndicator) return;
      if (visible) {
        this.elements.typingIndicator.classList.add('active');
      } else {
        this.elements.typingIndicator.classList.remove('active');
      }
    },

    
    startEditingUsername() {
      const { username } = this.state.settings;
      this.elements.usernameInput.value = username || DEFAULT_USERNAME;
      this.elements.usernameDisplay.classList.add('hidden');
      this.elements.usernameInput.style.display = 'inline-block';
      this.elements.usernameInput.focus();
      this.elements.usernameInput.select();
    },

    finishEditingUsername() {
      const raw = this.elements.usernameInput.value;
      const trimmed = raw.trim();
      const next = trimmed || DEFAULT_USERNAME;
      this.updateSettings({ username: next });
      this.elements.usernameInput.style.display = 'none';
      this.elements.usernameDisplay.classList.remove('hidden');
    },

    cancelEditingUsername() {
      this.elements.usernameInput.style.display = 'none';
      this.elements.usernameDisplay.classList.remove('hidden');
    },

    
    maybeShowWelcomeSystemMessage() {
      if (this.state.messages.length > 0) {
        this.renderMessages();
        return;
      }

      const now = new Date().toISOString();
      const systemMessage = {
        id: generateId(),
        text: 'Welcome to your local chat simulator. Everything you see here is stored only in this browser.',
        type: 'system',
        createdAt: now,
      };

      this.state.messages.push(systemMessage);
      this.persistMessages();
      this.renderMessages();
    },
  };

  
  function generateId() {
    return (
      'm_' +
      Date.now().toString(36) +
      '_' +
      Math.random().toString(36).slice(2, 8)
    );
  }

  document.addEventListener('DOMContentLoaded', () => {
    ChatApp.init();
  });
})();

