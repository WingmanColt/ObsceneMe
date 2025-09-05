namespace Core.Helpers
{
    public static class NumHelper
    {
        private static readonly Random _rng = new Random(); // Shared instance for randomness

        public static string GenerateUniqueNumbersAsString(int minValue, int maxValue, int count)
        {
            if (count > (maxValue - minValue + 1))
                throw new ArgumentException("Count cannot be greater than the range of numbers.");

            return string.Join(" ", Shuffle(Enumerable.Range(minValue, maxValue - minValue + 1)).Take(count));
        }

        public static IEnumerable<T> Shuffle<T>(IEnumerable<T> source)
        {
            T[] elements = source.ToArray();
            for (int i = elements.Length - 1; i > 0; i--)
            {
                int swapIndex = _rng.Next(i + 1);
                (elements[i], elements[swapIndex]) = (elements[swapIndex], elements[i]); // Swap elements
            }
            return elements; // Return fully shuffled array
        }
    }

}
