using Microsoft.AspNetCore.Mvc;

namespace eCommerce.Controllers
{
    [Route("sitemap.xml")]
    public class SitemapController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            var pages = new List<string>
        {
            "https://obscene.me/",
            "https://obscene.me/shop/product/the-devil",
            "https://obscene.me/shop",
            "https://obscene.me/pages/privacy",
            "https://obscene.me/pages/returns-warranty",
            "https://obscene.me/pages/faq",
            "https://obscene.me/pages/reviews",
            "https://obscene.me/pages/contact",
            "https://obscene.me/pages/register-affiliate-account",
            "https://obscene.me/shop/checkout"
            // load dynamic URLs from DB here
        };

            var sitemap = new System.Text.StringBuilder();
            sitemap.AppendLine(@"<?xml version=""1.0"" encoding=""UTF-8""?>");
            sitemap.AppendLine(@"<urlset xmlns=""http://www.sitemaps.org/schemas/sitemap/0.9"">");

            foreach (var page in pages)
            {
                sitemap.AppendLine("<url>");
                sitemap.AppendLine($"  <loc>{page}</loc>");
                sitemap.AppendLine($"  <lastmod>{DateTime.UtcNow:yyyy-MM-dd}</lastmod>");
                sitemap.AppendLine("  <priority>0.8</priority>");
                sitemap.AppendLine("</url>");
            }

            sitemap.AppendLine("</urlset>");

            return Content(sitemap.ToString(), "application/xml");
        }
    }

}
