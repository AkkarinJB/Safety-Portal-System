using System.IO;

namespace SafetyPortal.API.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };

        public FileService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveImageAsync(IFormFile imageFile)
        {
            if (!IsValidImage(imageFile))
            {
                throw new ArgumentException("Invalid image file");
            }

            var uploadsFolder = GetUploadsFolderPath();
            EnsureDirectoryExists(uploadsFolder);

            var uniqueFileName = GenerateUniqueFileName(imageFile.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using var fileStream = new FileStream(filePath, FileMode.Create);
            await imageFile.CopyToAsync(fileStream);

            return Path.Combine("uploads", uniqueFileName).Replace('\\', '/');
        }

        public async Task<(byte[] fileBytes, string contentType)?> GetImageAsync(string imagePath)
        {
            var fullPath = GetFullImagePath(imagePath);
            
            if (!File.Exists(fullPath))
            {
                return null;
            }

            // Security check: ensure path is within uploads directory
            var uploadsFolder = GetUploadsFolderPath();
            if (!fullPath.StartsWith(uploadsFolder, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var fileBytes = await File.ReadAllBytesAsync(fullPath);
            var contentType = GetContentType(fullPath);

            return (fileBytes, contentType);
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
            var extension = Path.GetExtension(filePath).ToLowerInvariant();
            return extension switch
            {
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".webp" => "image/webp",
                _ => "image/jpeg" // default
            };
        }

        #region Private Helper Methods

        private string GetUploadsFolderPath()
        {
            var webRootPath = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }
            return Path.Combine(webRootPath, "uploads");
        }

        private string GetFullImagePath(string imagePath)
        {
            var webRootPath = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            // Normalize path
            if (!imagePath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            {
                imagePath = "uploads/" + imagePath;
            }

            return Path.Combine(webRootPath, imagePath);
        }

        private static void EnsureDirectoryExists(string path)
        {
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
        }

        private static string GenerateUniqueFileName(string originalFileName)
        {
            return $"{Guid.NewGuid()}_{originalFileName}";
        }

        #endregion
    }
}

