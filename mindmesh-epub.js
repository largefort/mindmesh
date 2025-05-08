const mindmeshEPUB = {
  book: null,
  rendition: null,
  currentLocation: null,
  currentKey: null,

  loadBook(source) {
    document.getElementById("reader").innerHTML = "";
    this.book = ePub(source);
    this.rendition = this.book.renderTo("reader", {
      width: "100%",
      height: 500
    });

    this.rendition.display();

    this.rendition.on("relocated", (location) => {
      this.currentLocation = location;
      if (this.currentKey) {
        localStorage.setItem(this.currentKey + "-bookmark", location.start.cfi);
      }
    });

    this.book.ready.then(() => {
      this.currentKey = typeof source === "string" ? source : "local-book";
      const savedCFI = localStorage.getItem(this.currentKey + "-bookmark");
      if (savedCFI) {
        this.rendition.display(savedCFI);
      } else {
        this.rendition.display();
      }
    });
  },

  nextPage() {
    if (this.rendition) {
      this.rendition.next();
    }
  },

  prevPage() {
    if (this.rendition) {
      this.rendition.prev();
    }
  },

  readAloud() {
    if (!this.rendition) return;
    const iframe = document.querySelector("#reader iframe");
    const contentDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    const text = contentDoc?.body?.innerText;
    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'is-IS';
      speechSynthesis.speak(utterance);
    }
  },

  stopReading() {
    speechSynthesis.cancel();
  },

  addToPrivateLibrary(key, name) {
    const entry = document.createElement("li");
    const button = document.createElement("button");
    button.innerText = name;
    button.onclick = () => {
      const base64 = localStorage.getItem(key);
      if (base64) this.loadBook(base64);
    }
    entry.appendChild(button);
    document.getElementById("privateLibrary").appendChild(entry);
  },

  loadPrivateLibrary() {
    for (let key in localStorage) {
      if (key.startsWith("userbook-")) {
        this.addToPrivateLibrary(key, key.replace("userbook-", ""));
      }
    }
  },

  toggleTheme(theme) {
    if (this.rendition) {
      this.rendition.themes.select(theme);
    }
  },

  enableThemes() {
    if (this.rendition) {
      this.rendition.themes.register("dark", {
        body: {
          background: "#111",
          color: "#eee"
        }
      });
      this.rendition.themes.register("light", {
        body: {
          background: "#fff",
          color: "#000"
        }
      });
    }
  }
};
