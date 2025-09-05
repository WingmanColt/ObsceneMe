using Core.Helpers;
using Entities.ViewModels.Products;
using HireMe.Data.Repository;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Services
{
    public interface IStoryPageService
    {
        Task<StoryPageDto> GetByProductIdAsync(int productId);
        Task<OperationResult> SaveStoryPageAsync(int productId, StoryPageDto dto);
    }

    public class StoryPageService : IStoryPageService
    {
        private readonly IRepository<StoryPage> _storyPageRepo;
        private readonly IRepository<StoryBlock> _storyBlockRepo;

        public StoryPageService(IRepository<StoryPage> storyPageRepo, IRepository<StoryBlock> storyBlockRepo)
        {
            _storyPageRepo = storyPageRepo;
            _storyBlockRepo = storyBlockRepo;
        }

        public async Task<StoryPageDto?> GetByProductIdAsync(int productId)
        {
            var storyPage = await _storyPageRepo
                .GetAll(sp => sp.ProductId == productId)
                .Include(sp => sp.Blocks)
                .FirstOrDefaultAsync();

            if (storyPage == null) return null;

            return new StoryPageDto
            {
                Template = storyPage.Template,
                Style = storyPage.Style,
                Html = storyPage.Html,
                Blocks = storyPage.Blocks.Select(b => new StoryBlockDto
                {
                    Type = b.Type,
                    Heading = b.Heading,
                    Content = string.IsNullOrEmpty(b.ContentJson) ? null :
                              JsonSerializer.Deserialize<List<string>>(b.ContentJson),
                    Image = b.Image,
                    VideoUrl = b.VideoUrl,
                    CustomHtml = b.CustomHtml
                }).ToList()
            };
        }

        public async Task<OperationResult> SaveStoryPageAsync(int productId, StoryPageDto dto)
        {
            var storyPage = await _storyPageRepo
                .GetAll(sp => sp.ProductId == productId)
                .Include(sp => sp.Blocks)
                .FirstOrDefaultAsync();

            if (storyPage == null)
            {
                storyPage = new StoryPage
                {
                    ProductId = productId,
                    Template = dto.Template,
                    Style = dto.Style,
                    Html = dto.Html
                };

                await _storyPageRepo.AddAsync(storyPage);
            }
            else
            {
                storyPage.Template = dto.Template;
                storyPage.Style = dto.Style;
                storyPage.Html = dto.Html;

                // ❗️Explicitly mark as updated
                await _storyPageRepo.UpdateAsync(storyPage);

                // Remove old blocks
                if (storyPage.Blocks.Any())
                {
                     _storyBlockRepo.DeleteRange(storyPage.Blocks.AsQueryable());
                    await _storyBlockRepo.SaveChangesAsync(); // Optional if same context
                }
            }

            // Add new blocks
            storyPage.Blocks = dto.Blocks.Select(b => new StoryBlock
            {
                Type = b.Type,
                Heading = b.Heading,
                ContentJson = b.Content == null ? null : JsonSerializer.Serialize(b.Content),
                Image = b.Image,
                VideoUrl = b.VideoUrl,
                CustomHtml = b.CustomHtml,
                StoryPage = storyPage
            }).ToList();

            try
            {
                var saveResult = await _storyPageRepo.SaveChangesAsync();
                return saveResult;
            }
            catch (Exception ex)
            {
                throw new Exception("Changes saving failure!", ex);
            }
        }

    }

}
