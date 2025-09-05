using Entities.Enums;
using Entities.ViewModels.Products;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace eCommerce.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class BundleController : ControllerBase
    {
        private readonly IBundleService _spBundleService;
        public BundleController(IBundleService spBundleService)
        {
            _spBundleService = spBundleService;
        }



    }
}
