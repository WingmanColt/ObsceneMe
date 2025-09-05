
namespace Services
{
    using Entities.ViewModels.Accounts;
    using System;
    using System.Collections.Generic;

    public class InMemoryVerificationService
    {
        // Store verification codes in memory with their timestamps
        private static readonly Dictionary<string, (string Code, DateTime CreatedOn)> verificationCodes = new Dictionary<string, (string, DateTime)>();

        // Validate the verification code
        public bool ValidateVerificationCodeAsync(int timeBuffer, VerificationRequest req)
        {
            if (req == null || timeBuffer <= 0)
                return false;

            // Check if the verification code exists in the memory store
            if (verificationCodes.ContainsKey(req.Email))
            {
                var verificationEntity = verificationCodes[req.Email];

                // Compare the code and timestamp to validate
                if (verificationEntity.Code == AddSpacesBetweenDigits(req.Code))
                {
                    // Parse the created timestamp and compare it with the time buffer
                    var timeElapsed = DateTime.UtcNow - verificationEntity.CreatedOn;

                    // Check if the code is still within the valid time buffer
                    if (timeElapsed.TotalMinutes <= timeBuffer)
                    {
                        // The verification code is valid
                        return true;
                    }
                    else
                    {
                        // The verification code has expired
                        return false;
                    }
                }
            }

            // Code not found or invalid
            return false;
        }

        // Store the verification code in memory (this is called when sending the code)
        public void StoreVerificationCode(string email, string code)
        {
            verificationCodes[email] = (code, DateTime.UtcNow);
        }
        public static string AddSpacesBetweenDigits(string input)
        {
            return string.Join(" ", input.ToCharArray());
        }

    }

}
