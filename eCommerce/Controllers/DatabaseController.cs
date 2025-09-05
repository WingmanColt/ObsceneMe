using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Services.Enums;
using Services.Interfaces;

namespace eCommerce.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : Controller
    {
        private readonly IspPages _spPages;
        private readonly IspCoupon _spCoupon;
        private readonly IspVariants _spVariants;
        private readonly IspProduct _spProduct;

        private readonly IspCategory _spCategories;
        private readonly IspCategoryProductRelation _spCategoryProductRelation;

        private readonly IspSubCategory _spSubCategories;
        private readonly IspSubCategoryProductRelation _spSubCategoryProductRelation;

        private readonly IspBrands _spBrands;
        private readonly IspBrandsProductRelation _spBrandProductRelation;

        private readonly IspOccasion _spOccasion;
        private readonly IspOccasionProductRelation _spOccasionProductRelation;

        public DatabaseController(
            IspPages spPages,
            IspVariants spVariants,
            IspProduct spProduct,
            IspCoupon spCoupon,
            IspCategory spCategories,
            IspCategoryProductRelation spCategoryProductRelation,
            IspSubCategory spSubCategories,
            IspSubCategoryProductRelation spSubCategoryProductRelation,
            IspBrands spBrands,
            IspBrandsProductRelation spBrandProductRelation,
            IspOccasion spOccasion,
            IspOccasionProductRelation spOccasionProductRelation)
        {
            _spPages = spPages;
            _spVariants = spVariants;
            _spProduct = spProduct;
            _spCoupon = spCoupon;

            _spCategories = spCategories;
            _spCategoryProductRelation = spCategoryProductRelation;

            _spSubCategories = spSubCategories;
            _spSubCategoryProductRelation = spSubCategoryProductRelation;

            _spBrands = spBrands;
            _spBrandProductRelation = spBrandProductRelation;

            _spOccasion = spOccasion;
            _spOccasionProductRelation = spOccasionProductRelation;
        }


        [Route("Home/Error")]
        public IActionResult Error()
        {
            var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();
            if (exceptionFeature != null)
            {
                // Log the exception here or access exceptionFeature.Error
                ViewBag.ErrorMessage = exceptionFeature.Error.Message;
            }

            return View();
        }
        [HttpGet]
        [Route("update")]
        public async Task<IActionResult> Refresh()
        {
            var seedTasks = new List<Task<OperationResult>>
            {
             _spPages.SeedPages(),
             //_spCoupon.SeedCoupons(),

             _spCategories.SeedCategories(false),
             _spVariants.SeedAllVariant(),
             _spBrands.SeedBrands(false),
             _spOccasion.SeedOccasions(true),
             _spSubCategories.SeedCategories(false)
        };

            await Task.WhenAll(seedTasks);

            if (seedTasks.All(task => task.Result.Success))
            {
                    return Ok("All Done!");             
            }

            return Ok("Not All Done!");
        }


        [HttpGet]
        [Route("truncate")]
        public async Task<IActionResult> Truncate()
        {
            var seedTasks = new List<Task<OperationResult>>
            {
             _spCategories.CRUD<CategoryInput>(new { }, ActionEnum.Truncate, false),
             _spCategoryProductRelation.CRUD<CategoryInput>(new { }, ActionEnum.Truncate, false),

             _spSubCategories.CRUD<SubCategoryInput>(new { }, ActionEnum.Truncate, false),
             _spSubCategoryProductRelation.CRUD<SubCategoryInput>(new { }, ActionEnum.Truncate, false),

             _spBrands.CRUD<BrandInput>(new { }, ActionEnum.Truncate, false),
             _spBrandProductRelation.CRUD<BrandInput>(new { }, ActionEnum.Truncate, false),

             _spOccasion.CRUD<OccasionInput>(new { }, ActionEnum.Truncate, false),
             _spOccasionProductRelation.CRUD<OccasionInput>(new { }, ActionEnum.Truncate, false),

             _spVariants.CRUD<VariantsInput>(new { }, ActionEnum.Truncate, VariantActionEnum.Variant, false),
             _spVariants.CRUD<VariantsInput>(new { }, ActionEnum.Truncate, VariantActionEnum.VariantItem, false),
             _spVariants.CRUD<VariantsInput>(new { }, ActionEnum.Truncate, VariantActionEnum.VariantAndVariantItemRelation, false),
             _spVariants.CRUD<VariantsInput>(new { }, ActionEnum.Truncate, VariantActionEnum.VariantProductRelation, false),

            _spProduct.Truncate()
            };

            await Task.WhenAll(seedTasks);

            if (seedTasks.All(task => task.Result.Success))
            {
                return Ok("All Done!");
            }

            return Ok("Not All Done!");
        }
    }

}
