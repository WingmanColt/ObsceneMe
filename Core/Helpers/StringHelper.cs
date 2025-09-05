namespace Core.Helpers
{
    using System;
    using System.Collections;
    using System.Linq;

    public static class StringHelper
    {
        private static readonly char[] DefaultDelimiters = new char[] { ' ', ',', '.', '-', '\n', '\t', '/', '@', '_', '=', ')', '(', '*', '&', '^', '%', '$', '#', '!', '`', '~', '+' };

        public static string GetUntilOrEmpty(this string text, string stopAt)
        {
            if (!string.IsNullOrWhiteSpace(text))
            {
                int charLocation = text.IndexOf(stopAt, StringComparison.Ordinal);

                if (charLocation > 0)
                {
                    return text.Substring(0, charLocation);
                }
            }

            return string.Empty;
        }

        public static string GetUntil(this string text, int length)
        {
            if (!string.IsNullOrWhiteSpace(text) && length > 0)
            {
                return text.Substring(0, length);
            }

            return string.Empty;
        }

        public static string GetFirstWord(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;

            int index = text.IndexOf(' ');

            if (index > -1)
            {
                return text.Substring(0, index).Trim();
            }
            else
            {
                return text.Trim(); // Return the entire text if no space is found
            }
        }

        public static string LastWord(this string stringValue)
        {
            return LastWord(stringValue, DefaultDelimiters);
        }

        public static string LastWord(this string stringValue, char[] delimiters)
        {
            if (string.IsNullOrWhiteSpace(stringValue))
                return null;

            int index = stringValue.LastIndexOfAny(delimiters);

            if (index > -1)
                return stringValue.Substring(index + 1); // Start after the delimiter
            else
                return null;
        }

        public static bool ContainsAny(this string haystack, IList needles)
        {
            if (haystack == null || needles == null) return false;

            foreach (string needle in needles)
            {
                if (haystack.Contains(needle))
                    return true;
            }

            return false;
        }

        public static bool ContainsAny2(string[] haystack, params string[] needles)
        {
            if (haystack == null || needles == null) return false;

            foreach (string needle in needles)
            {
                if (haystack.Contains(needle))
                    return true;
            }

            return false;
        }

        public static string[] SplitAndTrim(this string text, char separator)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return Array.Empty<string>();
            }

            return text.Split(separator).Select(t => t.Trim()).ToArray();
        }

        public static string Filter(this string str)
        {
            if (string.IsNullOrWhiteSpace(str)) return string.Empty;

            int index = str.IndexOf('@');
            if (index >= 0)
                str = str.Substring(0, index);

            return str;
        }

        public static string GetAfter(this string str, char separator, bool includeSymbolInString)
        {
            if (string.IsNullOrWhiteSpace(str)) return string.Empty;

            int index = str.LastIndexOf(separator);

            if (index >= 0)
                str = str.Substring(includeSymbolInString ? index : index + 1).Trim('=');

            return str;
        }

        public static (string, string) GetFirstTwoWords(string inputString)
        {
            if (string.IsNullOrWhiteSpace(inputString))
            {
                return (string.Empty, string.Empty);
            }

            // Split the input string into words
            string[] words = inputString.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            // Take the first two words
            string firstWord = words.Length > 0 ? words[0] : string.Empty;
            string secondWord = words.Length > 1 ? words[1] : string.Empty;

            return (firstWord, secondWord);
        }
    }
}


