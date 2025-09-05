using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Entities.Enums
{

    public enum SearchType : int
    {
        Product = 0,
        Category = 1,
        Page = 2
    }
    public enum CommissionStatus : int
    {
        Pending = 0,
        Approved = 1,
        Paid = 2
    }
    public enum CouponState
    {
        None = 0,
        Used = 1,
        Infinity = 2,
        UntilExpiration = 3
    }
    public enum PaymentCondition : int
    {
        None = 0,
        Waiting = 1,
        Recall = 2,
        Discount = 3,
        Success = 4
    }
    public enum ApproveType : int
    {
        None = 0,
        Waiting = 1,
        Rejected = 2,
        Success = 3
    }
    public enum BundleType : int
    {
        QuantityBreak = 0,
        GroupedItems = 1,
        OptionalSelection = 2
    }
    public enum Status : int
    {
        Available = 0,
        Sold = 1,
        Unavailable = 2,
        Archived = 3
    }
    public enum ItemType : int
    {
        Normal = 0,
        Bundle = 1,
        Digital = 2
    }
    public enum MarketStatus : int
    {
        None = 0,
        New = 1,
        Sale = 2,
        PreOrder = 3,
        Sold = 4,
        Low = 5
    }
    public enum Gender : int
    {
        None = 0,
        Unisex = 1,
        Men = 2,
        Women = 3,
        Kids = 4
    }

    public enum PremiumPackage : int
    {
        None = 0,
        Bronze = 1,
        Silver = 2,
        Gold = 3
    }

    public enum AdStatus : int
    {
        None = 0,
        Sponsored = 1
    }

    public enum Roles : int
    {
        [Display(Name = "Потребител", Description = "#177dff", ShortName = "User")]
        User = 0,
        [Display(Name = "Продавач", Description = "#16b92b", ShortName = "Vendor")]
        Vendor = 1,
        [Display(Name = "Модератор", Description = "#16b92b", ShortName = "Moderator")]
        Moderator = 2,
        [Display(Name = "Администратор", Description = "#c72d2d", ShortName = "Admin")]
        Admin = 3
    }
    public static class EnumExtensions
    {
        public static string? GetDisplayName(this Enum enu)
        {
            var attr = GetDisplayAttribute(enu);
            return attr != null ? attr.Name : enu.ToString();
        }
        public static string? GetDescription(this Enum enu)
        {
            var attr = GetDisplayAttribute(enu);
            return attr != null ? attr.Description : enu.ToString();
        }

        public static string? GetShortName(this Enum enu)
        {
            var attr = GetDisplayAttribute(enu);
            return attr != null ? attr.ShortName : enu.ToString();
        }
        private static DisplayAttribute GetDisplayAttribute(object value)
        {
            Type type = value.GetType();
            if (!type.IsEnum)
            {
                throw new ArgumentException(string.Format("Type {0} is not an enum", type));
            }

            // Get the enum field.
            var field = type.GetField(value.ToString());
            return field == null ? null : field.GetCustomAttribute<DisplayAttribute>();
        }
    }
}
