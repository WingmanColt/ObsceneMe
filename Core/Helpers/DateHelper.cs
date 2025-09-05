using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Helpers
{
    public static class DateHelper
    {
        public static bool IsWithinMinutesInterval(DateTime inputDateTime, int interval)
        {
            // Calculate the time difference from now
            TimeSpan timeDifference = DateTime.Now - inputDateTime;

            // Check if the time difference is within a 2-minute interval
            return Math.Abs(timeDifference.TotalMinutes) <= interval;
        }
       public static bool IsWithinMinutesInterval(string inputDateTime, string parseString, int interval)
        {
            DateTime time = ParseDateString(inputDateTime, parseString);

            // Calculate the time difference from now
            TimeSpan timeDifference = DateTime.Now - time;

            // Check if the time difference is within a 2-minute interval
            return Math.Abs(timeDifference.TotalMinutes) <= interval;
        }

        // dd/MM/yyyy / dd MM yyyy HH:mm
        public static DateTime ParseDateString(string dateString, string parseString)
        {
            // Parse the input string in "dd/MM/yyyy" format to DateTime
            return DateTime.ParseExact(dateString, parseString, CultureInfo.InvariantCulture);
        }
    }
}
