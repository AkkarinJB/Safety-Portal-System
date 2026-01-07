using System.Net;
using System.Text;
using System.Text.Json;
using SafetyPortal.API.DTOs;

namespace SafetyPortal.API.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string GeminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey is missing in configuration");
        }

        public async Task<AiAnalysisResult> AnalyzeSafetyIssueAsync(string detail)
        {
            if (string.IsNullOrWhiteSpace(detail))
            {
                throw new ArgumentException("Detail cannot be null or empty", nameof(detail));
            }

            var url = $"{GeminiApiUrl}?key={_apiKey}";

            var prompt = BuildAnalysisPrompt(detail);
            var requestBody = new GeminiRequestDto
            {
                Contents = new[]
                {
                    new GeminiContent
                    {
                        Parts = new[]
                        {
                            new GeminiPart { Text = prompt }
                        }
                    }
                }
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody), 
                Encoding.UTF8, 
                "application/json");

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.PostAsync(url, jsonContent);
                response.EnsureSuccessStatusCode();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"Failed to communicate with Gemini API: {ex.Message}", ex);
            }
            catch (TaskCanceledException ex)
            {
                throw new TimeoutException("Gemini API request timeout", ex);
            }

            var responseString = await response.Content.ReadAsStringAsync();
            return ParseGeminiResponse(responseString);
        }

        private static string BuildAnalysisPrompt(string detail)
        {
            return $@"
คุณคือเจ้าหน้าที่ความปลอดภัย (Safety Officer) มืออาชีพ
จงวิเคราะห์ปัญหา: ""{detail}""

ตอบกลับเป็น JSON เท่านั้น (ไม่ต้องมี ```json ครอบ):
{{
    ""suggestion"": ""ข้อแนะนำการแก้ไขสั้นๆ กระชับ"",
    ""category"": ""เลือก 1 อย่างจาก: เครื่องจักร, ไฟฟ้า, ที่สูง, ของหล่น, ยานพาหนะ, อื่นๆ"",
    ""rank"": ""ประเมินความเสี่ยง A หรือ B หรือ C""
}}";
        }

        private static AiAnalysisResult ParseGeminiResponse(string responseString)
        {
            GeminiResponseDto? responseDto;
            try
            {
                responseDto = JsonSerializer.Deserialize<GeminiResponseDto>(
                    responseString,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException("Failed to parse Gemini API response", ex);
            }

            if (responseDto == null || 
                responseDto.Candidates.Length == 0 || 
                responseDto.Candidates[0].Content.Parts.Length == 0)
            {
                throw new InvalidOperationException("Invalid response structure from Gemini API");
            }

            var textResult = responseDto.Candidates[0].Content.Parts[0].Text;

            if (string.IsNullOrWhiteSpace(textResult))
            {
                throw new InvalidOperationException("Empty response from Gemini API");
            }

            var cleanJson = textResult
                .Replace("```json", "", StringComparison.OrdinalIgnoreCase)
                .Replace("```", "")
                .Trim();

            var result = JsonSerializer.Deserialize<AiAnalysisResult>(
                cleanJson, 
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            return result ?? throw new InvalidOperationException("Failed to parse Gemini API response");
        }
    }
}