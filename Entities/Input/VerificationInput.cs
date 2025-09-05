using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Input
{
    public class VerificationInput
    {
        public int Id { get; set; }

        public string Code { get; set; }
        public string Email { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }
    }
}
