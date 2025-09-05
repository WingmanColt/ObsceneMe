using Core.Helpers;
using Entities.ViewModels.Products;
using Microsoft.AspNetCore.Mvc;
using Services;

[Produces("application/json")]
[ApiController]
[Route("api/[controller]")]
public class StoryPageController : ControllerBase
{
    private readonly IStoryPageService _storyPageService;

    public StoryPageController(IStoryPageService storyPageService)
    {
        _storyPageService = storyPageService;
    }

    [HttpGet("get-story-page")]
    public async Task<ActionResult<StoryPageDto>> GetStoryPage(int productId)
    {
        try
        {
            var storyPage = await _storyPageService.GetByProductIdAsync(productId);
            if (storyPage == null)
                return NotFound($"Story page not found for productId: {productId}");

            return Ok(storyPage);
        }
        catch (Exception ex)
        {
            // TODO: Log exception here if needed
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("save-story-page/{productId}")]
    public async Task<OperationResult> SaveStoryPage(int productId, [FromBody] StoryPageDto dto)
    {
        try
        {
            if (dto == null)
                return OperationResult.FailureResult("Story data is null");

            var res = await _storyPageService.SaveStoryPageAsync(productId, dto);
            if (!res.Success)
                return OperationResult.FailureResult("Failed to save story page");

            return OperationResult.SuccessResult();
        }
        catch (Exception ex)
        {
            // TODO: Log exception here if needed
            return OperationResult.FailureResult("Internal server error");
        }
    }
}
