using Entities.Enums;
using Entities.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.ViewModels
{
    public class SeriesVW
    {
            public int Id { get; set; }
            public string BrandShortName { get; set; }

            public string Title { get; set; }
            public string Icon { get; set; }
            public string ShortName { get; set; }

            public int ProductsCount { get; set; }

            [NotMapped]
            public IEnumerable<SubBrands> SubBrands { get; set; }
        }

    public class BrandSeriesVW
    {
        public int Id { get; set; }
        public string BrandShortName { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int ProductsCount { get; set; }
    }
}
