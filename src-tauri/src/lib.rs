use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      tauri_plugin_global_shortcut::Builder::new()
        .with_handler(|app, shortcut, event| {
          if event.state() == ShortcutState::Pressed {
            if shortcut.matches(Modifiers::ALT, Code::Space) {
              if let Some(window) = app.get_webview_window("main") {
                let is_visible = window.is_visible().unwrap_or(false);
                if is_visible {
                  let _ = window.hide();
                } else {
                  let _ = window.show();
                  let _ = window.focus();
                }
              }
            }
          }
        })
        .build(),
    )
    .setup(|app| {
      // Register Alt+Space system-wide shortcut on startup
      let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Space);
      let _ = app.global_shortcut().register(shortcut);

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
