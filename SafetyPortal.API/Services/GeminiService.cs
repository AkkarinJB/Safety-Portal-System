using System.Text;
using System.Text.Json;
using SafetyPortal.API.DTOs;

namespace SafetyPortal.API.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"];
        }

        public async Task<AiAnalysisResult> AnalyzeSafetyIssueAsync(string detail)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            var prompt = $@"
                คุณคือเจ้าหน้าที่ความปลอดภัย (Safety Officer) มืออาชีพ
                จงวิเคราะห์ปัญหา: ""{detail}""
                
                ตอบกลับเป็น JSON เท่านั้น (ไม่ต้องมี ```json ครอบ):
                {{
                    ""suggestion"": ""ข้อแนะนำการแก้ไขสั้นๆ กระชับ"",
                    ""category"": ""เลือก 1 อย่างจาก: เครื่องจักร, ไฟฟ้า, ที่สูง, ของหล่น, ยานพาหนะ, อื่นๆ"",
                    ""rank"": ""ประเมินความเสี่ยง A หรือ B หรือ C""
                }}
            ";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, jsonContent);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);
            var textResult = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            var cleanJson = textResult.Replace("```json", "").Replace("```", "").Trim();

            var result = JsonSerializer.Deserialize<AiAnalysisResult>(cleanJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result;
        }
    }
}