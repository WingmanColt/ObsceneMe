using Entities.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }


        public DbSet<AffiliateUser> AffiliateUser { get; set; }
        public DbSet<AffiliatedOrder> AffiliatedOrder { get; set; }

        public DbSet<Category> Category { get; set; }
        public DbSet<CategoryProductRelation> CategoryProductRelation { get; set; }

        public DbSet<SubCategory> SubCategory { get; set; }
        public DbSet<SubCategoryProductRelation> SubCategoryProductRelation { get; set; }

        public DbSet<Occasion> Occasion { get; set; }
        public DbSet<OccasionProductRelation> OccasionProductRelation { get; set; }

        public DbSet<Bundle> Bundle { get; set; }
        public DbSet<BundleItem> BundleItems { get; set; }

        public DbSet<Brands> Brands { get; set; }
        public DbSet<BrandProductRelation> BrandProductRelation { get; set; }

        public DbSet<SubBrands> SubBrands { get; set; }
        public DbSet<SubBrandProductRelation> SubBrandProductRelation { get; set; }

        public DbSet<Series> Series { get; set; }
        public DbSet<SeriesProductRelation> SeriesProductRelation { get; set; }


        public DbSet<Product> Product { get; set; }
        public DbSet<Order> Order { get; set; }
        public DbSet<Checkout> Checkout { get; set; }
        public DbSet<PreCheckout> PreCheckout { get; set; }


        // Variants System
        public DbSet<Variants> Variants { get; set; }
        public DbSet<VariantItem> VariantItem { get; set; }
        public DbSet<VariantAndVariantItemRelation> VariantAndVariantItemRelation { get; set; }
        public DbSet<VariantProductRelation> VariantProductRelation { get; set; }

        public DbSet<Images> Image { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<Verification> Verifications { get; set; }

        public DbSet<Review> Reviews { get; set; }
        public DbSet<Pages> Pages { get; set; }

        public DbSet<StoryPage> StoryPages { get; set; }
        public DbSet<StoryBlock> StoryBlocks { get; set; }


        //  public DbSet<Favourites> Favourites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<StoryPage>()
                .Property(p => p.Html)
                .HasColumnType("nvarchar(max)");

            modelBuilder.Entity<StoryPage>()
                .HasMany(p => p.Blocks)
                .WithOne(b => b.StoryPage)
                .HasForeignKey(b => b.StoryPageId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}