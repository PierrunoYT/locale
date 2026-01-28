use serde::{Deserialize, Serialize};

// Language name mapping for the prompt template
fn get_language_name(code: &str) -> &str {
    match code {
        "en" => "English",
        "es" => "Spanish",
        "fr" => "French",
        "de" => "German",
        "it" => "Italian",
        "pt" => "Portuguese",
        "ja" => "Japanese",
        "zh" => "Chinese",
        "zh-Hans" => "Chinese",
        "ar" => "Arabic",
        "ru" => "Russian",
        "ko" => "Korean",
        "hi" => "Hindi",
        "nl" => "Dutch",
        _ => code, // Fallback to the code itself
    }
}

// Build the TranslateGemma prompt template
fn build_translation_prompt(source_lang: &str, target_lang: &str, text: &str) -> String {
    let source_name = get_language_name(source_lang);
    let target_name = get_language_name(target_lang);
    
    format!(
        "You are a professional {} ({}) to {} ({}) translator. Your goal is to accurately convey the meaning and nuances of the original {} text while adhering to {} grammar, vocabulary, and cultural sensitivities.\n\nProduce only the {} translation, without any additional explanations or commentary. Please translate the following {} text into {}:\n\n\n{}",
        source_name, source_lang, target_name, target_lang, source_name, target_name, target_name, source_name, target_name, text
    )
}

#[derive(Serialize, Deserialize, Debug)]
struct OllamaMessage {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct OllamaRequest {
    model: String,
    messages: Vec<OllamaMessage>,
    stream: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct OllamaResponse {
    message: OllamaMessage,
}

#[tauri::command]
async fn translate_text(
    source_lang: String,
    target_lang: String,
    text: String,
) -> Result<String, String> {
    if text.trim().is_empty() {
        return Err("Text cannot be empty".to_string());
    }

    // Build the prompt using TranslateGemma's required format
    let prompt = build_translation_prompt(&source_lang, &target_lang, &text);

    // Create the request to Ollama API
    let request_body = OllamaRequest {
        model: "translategemma:12b".to_string(),
        messages: vec![OllamaMessage {
            role: "user".to_string(),
            content: prompt,
        }],
        stream: false,
    };

    // Send request to Ollama
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:11434/api/chat")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            format!(
                "Failed to connect to Ollama. Please ensure Ollama is running and TranslateGemma 12B is installed.\nError: {}",
                e
            )
        })?;

    if !response.status().is_success() {
        return Err(format!(
            "Ollama API returned error: {}. Make sure 'translategemma:12b' model is installed.",
            response.status()
        ));
    }

    let ollama_response: OllamaResponse = response.json().await.map_err(|e| {
        format!("Failed to parse Ollama response: {}", e)
    })?;

    Ok(ollama_response.message.content)
}

#[tauri::command]
async fn check_ollama_status() -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await;

    match response {
        Ok(_) => Ok("Ollama is running".to_string()),
        Err(_) => Err("Ollama is not running. Please start Ollama first.".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![translate_text, check_ollama_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
