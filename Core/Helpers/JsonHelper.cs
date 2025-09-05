using Newtonsoft.Json;

namespace Core.Helpers
{
    public static class JsonHelper
    {
        public static string? SearchForValue(this string text, string langCode, bool reversed)
        {
            // Check if the langCode is null or empty
            if (string.IsNullOrEmpty(langCode))
            {
                throw new ArgumentException("Language code cannot be null or empty.", nameof(langCode));
            }

            // Construct the file path
            var filePath = Path.Combine("wwwroot", "Translations", $"{langCode}.json");

            // Check if the file exists
            if (!File.Exists(filePath))
            {
                // Log the error or handle it as needed
                Console.WriteLine($"File not found: {filePath}");
                return null; // Or throw an exception, depending on your error handling strategy
            }

            try
            {
                // Use using statement for automatic resource disposal
                using (StreamReader r = new StreamReader(filePath))
                {
                    string json = r.ReadToEnd();
                    var items = JsonConvert.DeserializeObject<List<LanguageModel>>(json);
                    if (items == null)
                    {
                        // Handle the case where JSON deserialization returns null
                        Console.WriteLine("Failed to deserialize JSON or JSON is empty.");
                        return null;
                    }

                    // Use StringComparison.OrdinalIgnoreCase for case-insensitive comparison
                    string? res = reversed
                        ? items.FirstOrDefault(x => x.Value?.Contains(text, StringComparison.OrdinalIgnoreCase) ?? false)?.Key
                        : items.FirstOrDefault(x => x.Key?.Contains(text, StringComparison.OrdinalIgnoreCase) ?? false)?.Value;

                    return res;
                }
            }
            catch (Exception ex)
            {
                // Log exception details here
                Console.WriteLine($"An error occurred: {ex.Message}");
                return null; // Or rethrow the exception, depending on how you want to handle errors
            }
        }


    public class LanguageModel
        {
            public string? Key { get; set; }
            public string? Value { get; set; }
        }
    }
}
