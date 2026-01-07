using SafetyPortal.API.DTOs;
using SafetyPortal.API.Mappers;
using SafetyPortal.API.Models;
using SafetyPortal.API.Repositories;

namespace SafetyPortal.API.Services
{
    public class SafetyReportService : ISafetyReportService
    {
        private readonly ISafetyReportRepository _repository;
        private readonly IFileService _fileService;

        public SafetyReportService(
            ISafetyReportRepository repository,
            IFileService fileService)
        {
            _repository = repository;
            _fileService = fileService;
        }

        public async Task<IEnumerable<SafetyReports>> GetAllReportsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<SafetyReports?> GetReportByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<SafetyReports> CreateReportAsync(CreateReportDto dto, IFormFile? imageBefore)
        {
            string? imageBeforeUrl = null;
            if (imageBefore != null)
            {
                if (!_fileService.IsValidImage(imageBefore))
                {
                    throw new ArgumentException("Invalid image file");
                }
                imageBeforeUrl = await _fileService.SaveImageAsync(imageBefore);
            }

            var report = SafetyReportMapper.ToEntity(dto, imageBeforeUrl);

            return await _repository.CreateAsync(report);
        }

        public async Task<bool> UpdateReportAsync(int id, UpdateReportDto dto, IFormFile? imageBefore, IFormFile? imageAfter)
        {
            var report = await _repository.GetByIdAsync(id);
            if (report == null) return false;

            string? imageBeforeUrl = null;
            if (imageBefore != null)
            {
                if (!_fileService.IsValidImage(imageBefore))
                {
                    throw new ArgumentException("Invalid image file");
                }
                imageBeforeUrl = await _fileService.SaveImageAsync(imageBefore);
            }

            string? imageAfterUrl = null;
            if (imageAfter != null)
            {
                if (!_fileService.IsValidImage(imageAfter))
                {
                    throw new ArgumentException("Invalid image file");
                }
                imageAfterUrl = await _fileService.SaveImageAsync(imageAfter);
            }

            SafetyReportMapper.UpdateEntity(
                report,
                dto,
                imageBeforeUrl,
                imageAfterUrl);

            await _repository.UpdateAsync(report);
            return true;
        }

        public async Task<bool> DeleteReportAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<(byte[] fileBytes, string contentType)?> GetImageAsync(string imagePath)
        {
            return await _fileService.GetImageAsync(imagePath);
        }
    }
}

