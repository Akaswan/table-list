import Plugin from './main';
import { App, PluginSettingTab, Setting } from 'obsidian';

export class TableListSettingsTab extends PluginSettingTab {
  plugin: Plugin;

  constructor(app: App, plugin: Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Max Dates to Show')
      .setDesc('Set the maximum number of dates to display in the table.')
      .addText((text) =>
        text
          .setPlaceholder("")
          .setValue(this.plugin.settings.maxDates.toString())
          .onChange(async (value) => {
            this.plugin.settings.maxDates = value;
            await this.plugin.saveSettings();
          })
      );
  }
}