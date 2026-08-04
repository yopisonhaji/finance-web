use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct SidecarState(Mutex<Option<CommandChild>>);

impl Drop for SidecarState {
  fn drop(&mut self) {
    if let Ok(mut child) = self.0.lock() {
      if let Some(c) = child.take() {
        let _ = c.kill();
      }
    }
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      let resource_dir = app.path().resource_dir().expect("failed to get resource dir");
      let dist_client_dir = resource_dir.join("dist-client");
      let start_js_path = dist_client_dir.join("start.js");
      
      let sidecar_command = app.shell().sidecar("node")
        .expect("failed to create `node` binary command")
        .args([start_js_path.to_string_lossy().to_string()])
        .current_dir(dist_client_dir);
        
      let (_receiver, child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
      app.manage(SidecarState(Mutex::new(Some(child))));
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
