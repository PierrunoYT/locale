use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::sync::Mutex;
use std::sync::OnceLock;

const DEFAULT_MODEL: &str = "translategemma:4b";
const SUPPORTED_MODELS: [&str; 3] = ["translategemma:4b", "translategemma:12b", "translategemma:27b"];
const MAX_TEXT_LENGTH: usize = 100_000;
const HTTP_TIMEOUT_SECS: u64 = 120;

static TRANSLATION_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

fn get_translation_lock() -> &'static Mutex<()> {
    TRANSLATION_LOCK.get_or_init(|| Mutex::new(()))
}

const VALID_LANGUAGE_CODES: &[&str] = &[
    "aa", "ab", "af", "ak", "am", "an", "ar", "as", "az", "ba", "be", "bg", "bm", "bn", "bo", "br",
    "bs", "ca", "ce", "co", "cs", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es",
    "et", "eu", "fa", "ff", "fi", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "ha", "he", "hi",
    "hr", "ht", "hu", "hy", "id", "ig", "is", "it", "ja", "jv", "ka", "ki", "kk", "kl", "km", "kn",
    "ko", "ks", "ku", "kw", "ky", "la", "lb", "lg", "ln", "lo", "lt", "lu", "lv", "mg", "mi", "mk",
    "ml", "mn", "mr", "ms", "mt", "my", "nb", "nd", "ne", "nl", "nn", "no", "nr", "nv", "ny", "oc",
    "om", "or", "os", "pa", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd",
    "se", "sg", "si", "sk", "sl", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te",
    "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "ug", "uk", "ur", "uz", "ve", "vi",
    "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zh-Hans", "zh-Hant", "zu",
];

fn get_ollama_url() -> String {
    std::env::var("OLLAMA_URL").unwrap_or_else(|_| "http://localhost:11434".to_string())
}

fn resolve_model(model: Option<String>) -> Result<String, String> {
    let requested_model = model
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_MODEL);

    if SUPPORTED_MODELS.contains(&requested_model) {
        Ok(requested_model.to_string())
    } else {
        Err(format!(
            "Unsupported model '{}'. Supported models: {}",
            requested_model,
            SUPPORTED_MODELS.join(", ")
        ))
    }
}

fn validate_language_code(code: &str) -> Result<(), String> {
    if VALID_LANGUAGE_CODES.contains(&code) {
        Ok(())
    } else {
        Err(format!("Invalid language code: {}", code))
    }
}

// Language name mapping for the prompt template (TranslateGemma supported languages)
fn get_language_name(code: &str) -> &str {
    match code {
        "en" => "English",
        "es" => "Spanish",
        "fr" => "French",
        "de" => "German",
        "it" => "Italian",
        "pt" => "Portuguese",
        "ja" => "Japanese",
        "zh" | "zh-Hans" => "Chinese",
        "zh-Hant" => "Chinese",
        "ar" => "Arabic",
        "ru" => "Russian",
        "ko" => "Korean",
        "hi" => "Hindi",
        "nl" => "Dutch",
        "aa" => "Afar",
        "ab" => "Abkhazian",
        "af" => "Afrikaans",
        "ak" => "Akan",
        "am" => "Amharic",
        "an" => "Aragonese",
        "as" => "Assamese",
        "az" => "Azerbaijani",
        "ba" => "Bashkir",
        "be" => "Belarusian",
        "bg" => "Bulgarian",
        "bm" => "Bambara",
        "bn" => "Bengali",
        "bo" => "Tibetan",
        "br" => "Breton",
        "bs" => "Bosnian",
        "ca" => "Catalan",
        "ce" => "Chechen",
        "co" => "Corsican",
        "cs" => "Czech",
        "cv" => "Chuvash",
        "cy" => "Welsh",
        "da" => "Danish",
        "dv" => "Divehi",
        "dz" => "Dzongkha",
        "ee" => "Ewe",
        "el" => "Greek",
        "eo" => "Esperanto",
        "et" => "Estonian",
        "eu" => "Basque",
        "fa" => "Persian",
        "ff" => "Fulah",
        "fi" => "Finnish",
        "fo" => "Faroese",
        "fy" => "Western Frisian",
        "ga" => "Irish",
        "gd" => "Scottish Gaelic",
        "gl" => "Galician",
        "gn" => "Guarani",
        "gu" => "Gujarati",
        "ha" => "Hausa",
        "he" => "Hebrew",
        "hr" => "Croatian",
        "ht" => "Haitian",
        "hu" => "Hungarian",
        "hy" => "Armenian",
        "id" => "Indonesian",
        "ig" => "Igbo",
        "is" => "Icelandic",
        "jv" => "Javanese",
        "ka" => "Georgian",
        "ki" => "Kikuyu",
        "kk" => "Kazakh",
        "kl" => "Kalaallisut",
        "km" => "Khmer",
        "kn" => "Kannada",
        "ks" => "Kashmiri",
        "ku" => "Kurdish",
        "kw" => "Cornish",
        "ky" => "Kyrgyz",
        "la" => "Latin",
        "lb" => "Luxembourgish",
        "lg" => "Ganda",
        "ln" => "Lingala",
        "lo" => "Lao",
        "lt" => "Lithuanian",
        "lu" => "Luba-Katanga",
        "lv" => "Latvian",
        "mg" => "Malagasy",
        "mi" => "Maori",
        "mk" => "Macedonian",
        "ml" => "Malayalam",
        "mn" => "Mongolian",
        "mr" => "Marathi",
        "ms" => "Malay",
        "mt" => "Maltese",
        "my" => "Burmese",
        "nb" => "Norwegian Bokmål",
        "nd" => "North Ndebele",
        "ne" => "Nepali",
        "nn" => "Norwegian Nynorsk",
        "no" => "Norwegian",
        "nr" => "South Ndebele",
        "nv" => "Navajo",
        "ny" => "Chichewa",
        "oc" => "Occitan",
        "om" => "Oromo",
        "or" => "Oriya",
        "os" => "Ossetian",
        "pa" => "Punjabi",
        "pl" => "Polish",
        "ps" => "Pashto",
        "qu" => "Quechua",
        "rm" => "Romansh",
        "rn" => "Rundi",
        "ro" => "Romanian",
        "rw" => "Kinyarwanda",
        "sa" => "Sanskrit",
        "sc" => "Sardinian",
        "sd" => "Sindhi",
        "se" => "Northern Sami",
        "sg" => "Sango",
        "si" => "Sinhala",
        "sk" => "Slovak",
        "sl" => "Slovenian",
        "sn" => "Shona",
        "so" => "Somali",
        "sq" => "Albanian",
        "sr" => "Serbian",
        "ss" => "Swati",
        "st" => "Southern Sotho",
        "su" => "Sundanese",
        "sv" => "Swedish",
        "sw" => "Swahili",
        "ta" => "Tamil",
        "te" => "Telugu",
        "tg" => "Tajik",
        "th" => "Thai",
        "ti" => "Tigrinya",
        "tk" => "Turkmen",
        "tl" => "Tagalog",
        "tn" => "Tswana",
        "to" => "Tonga",
        "tr" => "Turkish",
        "ts" => "Tsonga",
        "tt" => "Tatar",
        "ug" => "Uyghur",
        "uk" => "Ukrainian",
        "ur" => "Urdu",
        "uz" => "Uzbek",
        "ve" => "Venda",
        "vi" => "Vietnamese",
        "vo" => "Volapük",
        "wa" => "Walloon",
        "wo" => "Wolof",
        "xh" => "Xhosa",
        "yi" => "Yiddish",
        "yo" => "Yoruba",
        "za" => "Zhuang",
        "zu" => "Zulu",
        _ => code,
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
    model: Option<String>,
) -> Result<String, String> {
    let _lock = get_translation_lock().lock().await;

    if text.trim().is_empty() {
        return Err("Text cannot be empty".to_string());
    }

    if text.len() > MAX_TEXT_LENGTH {
        return Err(format!(
            "Text too long. Maximum length is {} characters ({} provided).",
            MAX_TEXT_LENGTH,
            text.len()
        ));
    }

    validate_language_code(&source_lang)?;
    validate_language_code(&target_lang)?;

    let selected_model = resolve_model(model)?;

    let prompt = build_translation_prompt(&source_lang, &target_lang, &text);

    let request_body = OllamaRequest {
        model: selected_model.clone(),
        messages: vec![OllamaMessage {
            role: "user".to_string(),
            content: prompt,
        }],
        stream: false,
    };

    let ollama_url = get_ollama_url();
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(HTTP_TIMEOUT_SECS))
        .build()
        .map_err(|_| "Failed to create HTTP client".to_string())?;

    let response = client
        .post(format!("{}/api/chat", ollama_url))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            #[cfg(debug_assertions)]
            return format!(
                "Failed to connect to Ollama. Please ensure Ollama is running and '{}' is installed.\nError: {}",
                selected_model, e
            );
            
            #[cfg(not(debug_assertions))]
            format!(
                "Failed to connect to Ollama. Please ensure Ollama is running and '{}' is installed.",
                selected_model
            )
        })?;

    if !response.status().is_success() {
        return Err(format!(
            "Ollama API returned error: {}. Make sure '{}' model is installed.",
            response.status(),
            selected_model
        ));
    }

    let ollama_response: OllamaResponse = response.json().await.map_err(|_| {
        "Failed to parse Ollama response".to_string()
    })?;

    Ok(ollama_response.message.content)
}

#[derive(Serialize, Deserialize, Debug)]
struct OllamaTagsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Serialize, Deserialize, Debug)]
struct OllamaPsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Serialize, Deserialize, Debug)]
struct OllamaModel {
    name: String,
}

#[tauri::command]
async fn check_ollama_status(model: Option<String>) -> Result<String, String> {
    let selected_model = resolve_model(model)?;
    let ollama_url = get_ollama_url();
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|_| "Failed to create HTTP client".to_string())?;
    
    let response = client
        .get(format!("{}/api/tags", ollama_url))
        .send()
        .await
        .map_err(|_| "Ollama is not running. Please start Ollama with: ollama serve".to_string())?;

    let tags: OllamaTagsResponse = response
        .json()
        .await
        .map_err(|_| "Failed to parse Ollama response".to_string())?;

    let model_installed = tags
        .models
        .iter()
        .any(|m| m.name.starts_with(&selected_model));

    if !model_installed {
        Err(format!(
            "{} model not found. Please install it with:\n\nollama run {}",
            selected_model, selected_model
        ))
    } else {
        let model_running = match client.get(format!("{}/api/ps", ollama_url)).send().await {
            Ok(ps_response) => match ps_response.json::<OllamaPsResponse>().await {
                Ok(ps) => ps.models.iter().any(|m| m.name.starts_with(&selected_model)),
                Err(_) => false,
            },
            Err(_) => false,
        };

        if model_running {
            Ok("running".to_string())
        } else {
            Ok("installed".to_string())
        }
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
