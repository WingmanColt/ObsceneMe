using Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Input
{
    public class CouponInput
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Code { get; set; }
        public string SpecificUser { get; set; }

        public double Discount { get; set; }
        public CouponState CouponState { get; set; }

        public string CreatedOn { get; set; }
        public int ExpiredOn { get; set; } // Add days
    }
}
