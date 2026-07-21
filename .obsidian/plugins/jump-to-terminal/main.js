var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => OpenInTerminalPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_child_process = require("child_process");
var import_path = require("path");
var TERMINALS_MAC = {
  terminal: { label: "Terminal (built-in)", command: "open -a Terminal {dir}" },
  iterm: { label: "iTerm2", command: "open -a iTerm {dir}" },
  warp: { label: "Warp", command: "open -a Warp {dir}" },
  alacritty: { label: "Alacritty", command: "open -a Alacritty {dir}" },
  kitty: { label: "kitty", command: "kitty --directory={dir}" },
  custom: { label: "Custom\u2026", command: "" }
};
var TERMINALS_LINUX = {
  gnome: { label: "GNOME Terminal", command: "gnome-terminal --working-directory={dir}" },
  konsole: { label: "Konsole (KDE)", command: "konsole --workdir {dir}" },
  xfce: { label: "Xfce Terminal", command: "xfce4-terminal --working-directory={dir}" },
  alacritty: { label: "Alacritty", command: "alacritty --working-directory {dir}" },
  kitty: { label: "kitty", command: "kitty --directory={dir}" },
  xterm: { label: "xterm", command: `xterm -e "cd {dir} && exec bash"` },
  custom: { label: "Custom\u2026", command: "" }
};
var TERMINALS_WIN = {
  wt: { label: "Windows Terminal", command: "start wt -d {dir}" },
  cmd: { label: "Command Prompt", command: `start cmd /K "cd /d {dir}"` },
  pwsh: { label: "PowerShell", command: `start pwsh -NoExit -Command "Set-Location '{dir}'"` },
  powershell: { label: "PowerShell (legacy)", command: `start powershell -NoExit -Command "Set-Location '{dir}'"` },
  custom: { label: "Custom\u2026", command: "" }
};
var DEFAULT_SETTINGS = {
  macTerminal: "terminal",
  linuxTerminal: "gnome",
  winTerminal: "wt",
  customMac: "",
  customLinux: "",
  customWin: ""
};
var OpenInTerminalPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new OpenInTerminalSettingTab(this.app, this));
    this.addCommand({
      id: "open-terminal-here",
      name: "Open terminal here",
      callback: () => {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new import_obsidian.Notice("Open in Terminal: No active file.");
          return;
        }
        this.openTerminalAtFile(file);
      }
    });
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        menu.addItem((item) => {
          item.setTitle("Open terminal here").setIcon("terminal").onClick(() => this.openTerminalAtFile(file));
        });
      })
    );
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return;
        menu.addItem((item) => {
          item.setTitle("Open terminal here").setIcon("terminal").onClick(() => this.openTerminalAtFile(file));
        });
      })
    );
  }
  onunload() {
  }
  // ── Core ────────────────────────────────────────────────────────────────
  openTerminalAtFile(file) {
    const dir = this.resolveDirectory(file);
    if (!dir) {
      new import_obsidian.Notice("Open in Terminal: Could not resolve file path. Is this a local vault?");
      return;
    }
    const command = this.buildCommand(dir);
    if (!command) {
      new import_obsidian.Notice("Open in Terminal: No terminal configured. Check plugin settings.");
      return;
    }
    this.launch(command);
  }
  resolveDirectory(file) {
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof import_obsidian.FileSystemAdapter)) return null;
    const basePath = adapter.getBasePath();
    return (0, import_path.dirname)(`${basePath}/${file.path}`);
  }
  buildCommand(dir) {
    var _a, _b, _c, _d, _e, _f;
    const platform = process.platform;
    let template;
    if (platform === "darwin") {
      const key = this.settings.macTerminal;
      template = key === "custom" ? this.settings.customMac : (_b = (_a = TERMINALS_MAC[key]) == null ? void 0 : _a.command) != null ? _b : "";
    } else if (platform === "linux") {
      const key = this.settings.linuxTerminal;
      template = key === "custom" ? this.settings.customLinux : (_d = (_c = TERMINALS_LINUX[key]) == null ? void 0 : _c.command) != null ? _d : "";
    } else if (platform === "win32") {
      const key = this.settings.winTerminal;
      template = key === "custom" ? this.settings.customWin : (_f = (_e = TERMINALS_WIN[key]) == null ? void 0 : _e.command) != null ? _f : "";
    } else {
      return null;
    }
    if (!template) return null;
    const escapedDir = platform === "win32" ? dir.replace(/\//g, "\\") : `"${dir.replace(/"/g, '\\"')}"`;
    return template.replace(/\{dir\}/g, escapedDir);
  }
  launch(command) {
    const options = process.platform === "win32" ? { shell: true } : { shell: "/bin/sh" };
    (0, import_child_process.exec)(command, options, (error) => {
      if (error) {
        console.error("Open in Terminal error:", error);
        new import_obsidian.Notice(`Open in Terminal: Failed to launch.
${error.message}`);
      }
    });
  }
  // ── Settings ────────────────────────────────────────────────────────────
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var OpenInTerminalSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    this.renderPlatformSection(
      containerEl,
      "macOS",
      TERMINALS_MAC,
      "macTerminal",
      "customMac"
    );
    this.renderPlatformSection(
      containerEl,
      "Linux",
      TERMINALS_LINUX,
      "linuxTerminal",
      "customLinux"
    );
    this.renderPlatformSection(
      containerEl,
      "Windows",
      TERMINALS_WIN,
      "winTerminal",
      "customWin"
    );
    containerEl.createEl("p", {
      text: "Use {dir} as a placeholder for the directory path in custom commands.",
      cls: "setting-item-description"
    });
  }
  renderPlatformSection(container, label, terminals, selectionKey, customKey) {
    new import_obsidian.Setting(container).setName(label).setHeading();
    new import_obsidian.Setting(container).setName("Terminal app").setDesc(`Terminal to open on ${label}.`).addDropdown((drop) => {
      Object.entries(terminals).forEach(([key, cfg]) => {
        drop.addOption(key, cfg.label);
      });
      drop.setValue(this.plugin.settings[selectionKey]);
      drop.onChange(async (val) => {
        this.plugin.settings[selectionKey] = val;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    if (this.plugin.settings[selectionKey] === "custom") {
      new import_obsidian.Setting(container).setName("Custom command").setDesc(`Example: myterm --workdir={dir}`).addText(
        (text) => text.setPlaceholder("myterm --workdir={dir}").setValue(this.plugin.settings[customKey]).onChange(async (val) => {
          this.plugin.settings[customKey] = val;
          await this.plugin.saveSettings();
        })
      );
    }
  }
};

/* nosourcemap */