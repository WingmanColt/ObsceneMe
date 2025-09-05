namespace eCommerce.Utility
{
    public static class TokenUtility
    {
        public static string GenerateToken()
        {
            byte[] time = BitConverter.GetBytes(DateTime.UtcNow.ToBinary());
            byte[] key = Guid.NewGuid().ToByteArray();
            string token = Convert.ToBase64String(time.Concat(key).ToArray());

            return token;
        }
        public static bool ValidateToken(int time, string token)
        {
            if (String.IsNullOrEmpty(token))
                return false;

            if (IsBase64(token) is null)
                return false;

            //byte[] tokenByteArray = Convert.FromBase64String(token);      
            DateTime when = DateTime.FromBinary(BitConverter.ToInt64(IsBase64(token), 0));
            if (when < DateTime.UtcNow.AddMinutes(-time))
            {
                return false;
            }
            return true;
        }

        private static byte[] IsBase64(this string base64String)
        {
            if (string.IsNullOrEmpty(base64String) || base64String.Length % 4 != 0
               || base64String.Contains(" ") || base64String.Contains("\t") || base64String.Contains("\r") || base64String.Contains("\n"))
                return null;

            try
            {
                //Convert.FromBase64String(base64String);
                byte[] tokenByteArray = Convert.FromBase64String(base64String);
                return tokenByteArray;
            }
            catch (Exception exception)
            {
                // Handle the exception
            }
            return null;
        }

    }
}
