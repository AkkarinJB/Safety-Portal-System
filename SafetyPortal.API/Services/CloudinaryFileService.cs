using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.Net;

namespace SafetyPortal.API.Services
{
    public class CloudinaryFileService : IFileService
    {
        private readonly Cloudinary _cloudinary;
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };

        public CloudinaryFileService(IConfiguration configuration)
        {
            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];

            if (string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
            {
                throw new InvalidOperationException("Cloudinary configuration is missing. Please set Cloudinary:CloudName, Cloudinary:ApiKey, and Cloudinary:ApiSecret in appsettings.json");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> SaveImageAsync(IFormFile imageFile)
        {
            if (!IsValidImage(imageFile))
            {
                throw new ArgumentException("Invalid image file");
            }

            using var stream = imageFile.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(imageFile.FileName, stream),
                Folder = "safety-portal",
                PublicId = Guid.NewGuid().ToString(),
                Overwrite = false,
                Transformation = new Transformation()
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode != HttpStatusCode.OK)
            {
                throw new Exception($"Failed to upload image: {uploadResult.Error?.Message}");
            }

            return uploadResult.SecureUrl.ToString();
        }

        public async Task<(byte[] fileBytes, string contentType)?> GetImageAsync(string imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
            {
                return null;
            }

            // ถ้าเป็น Cloudinary URL หรือ HTTP URL อื่นๆ ให้ download
            if (imagePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                imagePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    using var httpClient = new HttpClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    var imageBytes = await httpClient.GetByteArrayAsync(imagePath);
                    
                    // หา content type จาก URL
                    var contentType = GetContentType(imagePath);
                    
                    return (imageBytes, contentType);
                }
                catch (Exception ex)
                {
                    // Log error if needed
                    Console.WriteLine($"Error downloading image from URL: {ex.Message}");
                    return null;
                }
            }

            // ถ้าเป็น public ID ของ Cloudinary
            try
            {
                var getResourceParams = new GetResourceParams(imagePath);
                var result = await _cloudinary.GetResourceAsync(getResourceParams);

                if (result.StatusCode != HttpStatusCode.OK)
                {
                    return null;
                }

                using var httpClient = new HttpClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);
                var imageBytes = await httpClient.GetByteArrayAsync(result.SecureUrl);
                var contentType = GetContentType(result.SecureUrl);

                return (imageBytes, contentType);
            }
            catch
            {
                return null;
            }
        }

        public bool IsValidImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > MaxFileSize)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                return false;

            if (!AllowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            return true;
        }

        public string GetContentType(string filePath)
        {
            // สำหรับ Cloudinary URL หรือ HTTP URL
            if (filePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                filePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var uri = new Uri(filePath);
                    var extension = Path.GetExtension(uri.AbsolutePath).ToLowerInvariant();
                    return extension switch
                    {
                        ".png" => "image/png",
                        ".gif" => "image/gif",
                        ".jpg" or ".jpeg" => "image/jpeg",
                        ".webp" => "image/webp",
                        _ => "image/jpeg"
                    };
                }
                catch
                {
                    return "image/jpeg";
                }
            }

            // สำหรับ local file path
            var ext = Path.GetExtension(filePath).ToLowerInvariant();
            return ext switch
            {
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };
        }
    }
}

