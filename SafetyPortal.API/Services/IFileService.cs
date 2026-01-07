namespace SafetyPortal.API.Services
{
    public interface IFileService
    {
        Task<string> SaveImageAsync(IFormFile imageFile);

        Task<(byte[] fileBytes, string contentType)?> GetImageAsync(string imagePath);

        bool IsValidImage(IFormFile file);

        string GetContentType(string filePath);
    }
}

