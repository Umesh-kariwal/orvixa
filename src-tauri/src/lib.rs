use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use std::process::Command;

#[tauri::command]
fn launch_os_process(command: String, args: Vec<String>) -> Result<String, String> {
    match Command::new(&command).args(&args).spawn() {
        Ok(_) => Ok(format!("Successfully launched {}", command)),
        Err(e) => Err(format!("Failed to launch {}: {}", command, e)),
    }
}

#[tauri::command]
fn open_system_uri(uri: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        match Command::new("cmd").args(["/C", "start", "", &uri]).spawn() {
            Ok(_) => Ok(format!("Opened URI {}", uri)),
            Err(e) => Err(format!("Failed to open URI: {}", e)),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = uri;
        Err("Unsupported OS".into())
    }
}

#[tauri::command]
fn send_system_media_key(key_name: String) -> Result<String, String> {
    let ps_code = match key_name.as_str() {
        "play_pause" => "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]179)",
        "next" => "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]176)",
        "previous" => "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]177)",
        "mute" => "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]173)",
        _ => return Err("Invalid media key".into()),
    };

    match Command::new("powershell").args(["-NoProfile", "-Command", ps_code]).spawn() {
        Ok(_) => Ok(format!("Sent system key: {}", key_name)),
        Err(e) => Err(format!("Failed to send key: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        launch_os_process,
        open_system_uri,
        send_system_media_key
    ])
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
                  let _ = window.set_focus();
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
