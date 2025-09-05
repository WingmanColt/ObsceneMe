using Microsoft.Extensions.Options;
using Services;
using Services.Interfaces;

namespace eCommerce.Utility.SeerviceActivation
{
    public class ActivatedService<T> where T : class
    {
        private readonly IServiceProvider _provider;
        private readonly bool _isActive;
        private T? _cachedService;

        public ActivatedService(IServiceProvider provider, bool isActive)
        {
            _provider = provider;
            _isActive = isActive;
        }

        public T? Service => _isActive
            ? _cachedService ??= _provider.GetRequiredService<T>()
            : null;

        public bool IsAvailable => _isActive;
    }


    public class ServicesContainer
    {
        public ActivatedService<IspSubCategory> SubCategory { get; }
        public ActivatedService<IspSubCategoryProductRelation> SubCategoryProductRelation { get; }

        public ActivatedService<IspCategory> Category { get; }
        public ActivatedService<IspCategoryProductRelation> CategoryProductRelation { get; }

        public ActivatedService<IspBrands> Brand { get; }
        public ActivatedService<IspBrandsProductRelation> BrandProductRelation { get; }

        public ActivatedService<IspSeries> Series { get; }
        public ActivatedService<IspSeriesProductRelation> SeriesProductRelation { get; }

        public ActivatedService<IspOccasion> Occasion { get; }
        public ActivatedService<IspOccasionProductRelation> OccasionProductRelation { get; }

        public ActivatedService<IspSubBrands> SubBrand { get; }
        public ActivatedService<IspSubBrandsProductRelation> SubBrandProductRelation { get; }

        public ActivatedService<IspVariants> Variant { get; }
        public ActivatedService<IspPreCheckout> PreCheckout { get; }

        public ServicesContainer(IServiceProvider provider, IOptions<ServiceActivationSettings> options)
        {
            var settings = options.Value;

            SubCategory = new ActivatedService<IspSubCategory>(provider, settings.SubCategory?.Active == true);
            Category = new ActivatedService<IspCategory>(provider, settings.Category?.Active == true);
            Brand = new ActivatedService<IspBrands>(provider, settings.Brand?.Active == true);
            Series = new ActivatedService<IspSeries>(provider, settings.Series?.Active == true);
            Occasion = new ActivatedService<IspOccasion>(provider, settings.Occasion?.Active == true);
            SubBrand = new ActivatedService<IspSubBrands>(provider, settings.SubBrand?.Active == true);
            Variant = new ActivatedService<IspVariants>(provider, settings.Variant?.Active == true);
            PreCheckout = new ActivatedService<IspPreCheckout>(provider, settings.PreCheckout?.Active == true);

            SubCategoryProductRelation = new ActivatedService<IspSubCategoryProductRelation>(provider, SubCategory.IsAvailable);
            CategoryProductRelation = new ActivatedService<IspCategoryProductRelation>(provider, Category.IsAvailable);
            BrandProductRelation = new ActivatedService<IspBrandsProductRelation>(provider, Brand.IsAvailable);
            SeriesProductRelation = new ActivatedService<IspSeriesProductRelation>(provider, Series.IsAvailable);
            OccasionProductRelation = new ActivatedService<IspOccasionProductRelation>(provider, Occasion.IsAvailable);
            SubBrandProductRelation = new ActivatedService<IspSubBrandsProductRelation>(provider, SubBrand.IsAvailable);
        }
    }

}
