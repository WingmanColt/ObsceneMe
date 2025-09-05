using System.ComponentModel.DataAnnotations;

namespace Entities.Enums
{
    public enum ImageType : int
    {
        Thumb = 0,
        Main = 1,
        About = 2,
        Usage = 3,
        Composition = 4,
        Characteristic = 5
    }
    public enum CRUD : int
    {
        None = 0,
        Create = 1,
        Update = 2,
        Delete = 3
    }
    public enum ActionEnum : int
    {
        None = 0,

        [Display(Name = "Create")]
        Create = 1,

        [Display(Name = "Update")]
        Update = 2,

        [Display(Name = "Delete")]
        Delete = 3,

        [Display(Name = "UpdatePromotion")]
        UpdatePromotion = 4,

        [Display(Name = "RefreshDate")]
        RefreshDate = 5,

        [Display(Name = "UpdateUser")]
        UpdateUser = 6,

        [Display(Name = "UpdateProductsCount")]
        UpdateProductsCount = 7,

        [Display(Name = " UpdateSubCategoriesCount")]
        UpdateSubCategoriesCount = 8,

        [Display(Name = "Select")]
        Select = 9,

        [Display(Name = "GetById")]
        GetById = 10,

        [Display(Name = "AddRating")]
        AddRating = 11,

        [Display(Name = "Truncate")]
        Truncate = 12,

        [Display(Name = "GetAll")]
        GetAll = 13,

        [Display(Name = "CreateUpdate")]
        CreateUpdate = 14,

        [Display(Name = "UpdateIsPayed")]
        UpdateIsPayed = 15,

        [Display(Name = "UpdateStatus")]
        UpdateStatus = 16,

        [Display(Name = "UpdateCountOnRelations")]
        UpdateCountOnRelations = 17,

        [Display(Name = "UpdateRelations")]
        UpdateRelations = 18,

        [Display(Name = "UpdateMarketStatus")]
        UpdateMarketStatus = 19,
    }

    public enum GetActionEnum : int
    {
        None = 0,

        [Display(Name = "GetAllFiltering")]
        GetAllFiltering = 1,

        [Display(Name = "GetAllBy")]
        GetAllBy = 2,

        [Display(Name = "GetAll")]
        GetAll = 3,

        [Display(Name = "GetSpecialProduct")]
        GetSpecialProduct = 4,

        [Display(Name = "GetProductsCountById")]
        GetProductsCountById = 5,

        [Display(Name = "GetAllByCategoryId")]
        GetAllByCategoryId = 6,

        [Display(Name = "GetByCode")]
        GetByCode = 7,

        [Display(Name = "GetAllShort")]
        GetAllShort = 8,

        [Display(Name = "GetRelatedProducts")]
        GetRelatedProducts = 9,

        [Display(Name = "GetProductsByFavourite")]
        GetProductsByFavourite = 10,

        [Display(Name = "GetByUserId")]
        GetByUserId = 11,

        [Display(Name = "GetById")]
        GetById = 12

    }
}
