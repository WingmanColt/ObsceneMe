using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.ViewModels.Affiliate
{
    public class Performance
    {
        public DateTime Date { get; set; }         // The date of orders (grouped by day)
        public decimal TotalRevenue { get; set; }  // Sum of total cost/revenue for that date
        public int OrderCount { get; set; }        // Number of orders on that date
    }
}
