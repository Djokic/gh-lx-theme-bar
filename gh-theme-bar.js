// theme-action-bar.js
(function() {
  // Check if the browser supports custom elements
  if (!("customElements" in window)) {
    console.error("Custom Elements not supported");
    return;
  }

  class ThemeActionBar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({
        mode: "open"
      });
      this.expanded = false;
      this.colorSchemes = [];
      this.buyUrl = "";
      this.themeName = "";
    }

    static get observedAttributes() {
      return ["color-schemes", "buy-url", "theme-name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "color-schemes" && newValue) {
        try {
          this.colorSchemes = JSON.parse(newValue.replace(/'/g, '"'));
        } catch (e) {
          console.error("Invalid color-schemes format:", e);
        }
      } else if (name === "buy-url") {
        this.buyUrl = newValue;
      } else if (name === "theme-name") {
        this.themeName = newValue;
      }

      this.render();
    }

    connectedCallback() {
      this.render();
      this.addEventListeners();
    }

    addEventListeners() {
      const bar = this.shadowRoot.querySelector(".action-bar");
      const hitArea = this.shadowRoot.querySelector(".hit-area");
      if (!bar || !hitArea) return;

      hitArea.addEventListener("mouseenter", () => {
        this.expanded = true;
        this.updateBarState();
      });

      bar.addEventListener("mouseleave", () => {
        this.expanded = false;
        this.updateBarState();
      });
    }

    updateBarState() {
      const bar = this.shadowRoot.querySelector(".action-bar");
      const content = this.shadowRoot.querySelector(
        ".action-bar-content"
      );
      if (!bar || !content) return;

      if (this.expanded) {
        bar.classList.add("expanded");
        content.classList.add("visible");
      } else {
        bar.classList.remove("expanded");
        content.classList.remove("visible");
      }
    }

    setColorScheme(scheme) {
      const url = new URL(window.location.href);
      url.searchParams.set("color-scheme", scheme);
      window.location.href = url.toString();
    }

    render() {
      const styles = `
        :host {
          --transition-speed: 0.3s;
          --bar-height: 3rem;
          --bar-min-height: 1rem;
          --bar-min-width: 2rem;
          --bar-border-color: rgba(255, 255, 255, 0.1);
          --bar-border-radius: 2rem;
          --bar-background: rgba(33, 33, 33, 0.92);
          --bar-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          --text-color: rgba(255, 255, 255, 0.9);
          --subtle-text-color: rgba(255, 255, 255, 0.6);
          --scheme-circle-size: 1.5rem;
          --scheme-gap: 0.5rem;
          --section-gap: 0.5rem;
        }
        
        .hit-area {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 5rem;
          height: 3rem;
          z-index: 9999;
        }
        
        .action-bar {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          height: var(--bar-min-height);
          width: var(--bar-min-width);
          border: 1px solid var(--bar-border-color);
          background-color: var(--bar-background);
          border-radius: var(--bar-border-radius);
          box-shadow: var(--bar-box-shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-speed) ease;
          backdrop-filter: blur(10px);
          opacity: 0.5;
          overflow: hidden;
          z-index: 10000;
        }
        
        .action-bar.expanded {
          height: var(--bar-height);
          width: auto;
          min-width: 20rem;
          opacity: 1;
        }
        
        .action-bar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0 .5rem;
          opacity: 0;
          transition: opacity var(--transition-speed) ease;
        }
        
        .action-bar-content.visible {
          opacity: 1;
        }
        
        .left-section, .center-section, .right-section {
          display: flex;
          align-items: center;
        }
        
        .left-section {
          margin-right: var(--section-gap);
        }
        
        .center-section {
          margin-right: var(--section-gap);
        }
        
        .color-schemes {
          display: flex;
          align-items: center;
          gap: var(--scheme-gap);
          flex:1;
        }
        
        .scheme-item {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .scheme-circle {
          width: var(--scheme-circle-size);
          height: var(--scheme-circle-size);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.4);
          transition: transform 0.2s ease;
        }
        
        .scheme-item:hover .scheme-circle {
          transform: scale(1.1);
        }
        
        .action-link {
          color: var(--text-color);
          text-decoration: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          border-radius: 2rem;
          transition: background-color 0.2s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }
        
        .action-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .buy-link {
          flex: 1;
          background-color: rgba(255, 255, 255, 0.9);
          color: rgba(0, 0, 0, 0.8);
          font-weight: 600;
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .buy-link:hover {
          background-color: rgba(255, 255, 255, 1);
        }
        
        .arrow {
          display: inline-block;
          transition: transform 0.2s ease;
        }
        
        .buy-link:hover .arrow {
          transform: translateX(2px);
        }
      `;

      // Create HTML for the color schemes
      let colorSchemesHTML = "";
      if (this.colorSchemes && this.colorSchemes.length) {
        colorSchemesHTML = this.colorSchemes
          .map(
            ([name, color]) => `
          <div class="scheme-item" data-scheme="${name}" data-umami-event="${this.themeName}-theme-bar-color-scheme-${name}">
            <div class="scheme-circle" style="background-color: ${color};"></div>
          </div>
        `
          )
          .join("");
      }

      const templateHTML = `
        <style>${styles}</style>
        <div class="hit-area"></div>
        <div class="action-bar">
          <div class="action-bar-content">
            <div class="left-section">
              <div class="color-schemes">
                ${colorSchemesHTML}
              </div>
            </div>
            <div class="center-section">
              <a href="https://luxethemes.com/" target="_blank" class="action-link" data-umami-event="${this.themeName}-theme-bar-see-all">See All Themes</a>
            </div>
            <div class="right-section">
              <a href="${this.buyUrl}" target="_blank" class="action-link buy-link" data-umami-event="${this.themeName}-theme-bar-buy">
                Buy ${this.themeName}
                <span class="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      `;

      // Clear previous content
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = templateHTML;

        // Add event listeners to scheme items
        const schemeItems =
          this.shadowRoot.querySelectorAll(".scheme-item");
        schemeItems.forEach((item) => {
          const schemeName = item.getAttribute("data-scheme");
          if (schemeName) {
            item.addEventListener("click", () =>
              this.setColorScheme(schemeName)
            );
          }
        });
      }
    }
  }

  // Register the custom element
  // Wrap in try-catch to handle potential errors
  try {
    if (!customElements.get("theme-action-bar")) {
      customElements.define("theme-action-bar", ThemeActionBar);
    }
  } catch (error) {
    console.error(
      "Failed to register theme-action-bar custom element:",
      error
    );
  }
})();
