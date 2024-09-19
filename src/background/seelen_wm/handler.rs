use windows::Win32::{
    Foundation::{HWND, RECT},
    UI::WindowsAndMessaging::{
        SWP_ASYNCWINDOWPOS, SWP_NOACTIVATE, SWP_NOCOPYBITS, SWP_NOSENDCHANGING,
    },
};

use crate::windows_api::WindowsApi;
use seelen_core::rect::Rect;

#[tauri::command(async)]
pub fn set_window_position(hwnd: isize, rect: Rect) -> Result<(), String> {
    let hwnd = HWND(hwnd as _);

    if !WindowsApi::is_window(hwnd) || WindowsApi::is_iconic(hwnd) {
        return Ok(());
    }

    WindowsApi::unmaximize_window(hwnd)?;
    let shadow = WindowsApi::shadow_rect(hwnd)?;
    WindowsApi::set_position(
        hwnd,
        None,
        &RECT {
            top: rect.top + shadow.top,
            left: rect.left + shadow.left,
            right: rect.right + shadow.right,
            bottom: rect.bottom + shadow.bottom,
        },
        SWP_NOACTIVATE | SWP_NOCOPYBITS | SWP_ASYNCWINDOWPOS | SWP_NOSENDCHANGING,
    )?;
    Ok(())
}

#[tauri::command(async)]
pub fn request_focus(hwnd: isize) -> Result<(), String> {
    let hwnd = HWND(hwnd as _);
    log::trace!(
        "Requesting focus on {:?} - {} , {:?}",
        hwnd,
        WindowsApi::get_window_text(hwnd),
        WindowsApi::exe(hwnd)?,
    );

    if !WindowsApi::is_window(hwnd) {
        return Ok(());
    }

    WindowsApi::force_set_foreground(hwnd)?;
    Ok(())
}
