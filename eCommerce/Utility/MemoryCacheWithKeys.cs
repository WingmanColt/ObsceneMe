namespace eCommerce.Utility
{
    using Microsoft.Extensions.Caching.Memory;
    using System.Collections.Concurrent;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.Extensions.DependencyInjection;

    public class MemoryCacheWithKeys : IDisposable
    {
        private readonly IMemoryCache _innerCache;
        private readonly ConcurrentDictionary<object, bool> _keys = new();
        private readonly object _syncLock = new();

        public MemoryCacheWithKeys(IServiceProvider serviceProvider)
        {
            // Resolve IMemoryCache from the service provider to avoid circular dependency
            _innerCache = serviceProvider.GetRequiredService<IMemoryCache>();
        }

        public bool TryGetValue(object key, out object value)
        {
            return _innerCache.TryGetValue(key, out value);
        }
        public bool TryGetValue<T>(object key, out T value)
        {
            if (_innerCache.TryGetValue(key, out object cachedValue))
            {
                value = (T)cachedValue; // Cast to T
                return true;
            }

            value = default; // Return default value if not found
            return false;
        }
        public ICacheEntry CreateEntry(object key)
        {
            // Track the key when it's added
            _keys.TryAdd(key, true);
            return _innerCache.CreateEntry(key);
        }
        public void Set(object key, object value, TimeSpan duration)
        {
            MemoryCacheEntryOptions options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = duration
            };

            // Track the key when it's set
            _keys.TryAdd(key, true);
            _innerCache.Set(key, value, options);
        }
        public async Task RemoveAsync(object key)
        {
            await Task.Run(() =>
            {
                lock (_syncLock)
                {
                    _keys.TryRemove(key, out _);
                    _innerCache.Remove(key);
                }
            });
        }
        public void Remove(object key)
        {
            lock (_syncLock)
            {
                // Ensure consistency between _keys and _innerCache
                _keys.TryRemove(key, out _);
                _innerCache.Remove(key);
            }
        }

        // Return all tracked cache keys
        public IEnumerable<object> GetAllKeys()
        {
            return _keys.Keys.ToList(); // Return a copy of the keys list
        }

        // Asynchronous version to clear cache by prefix
        public async Task ClearByPrefixAsync(string prefix)
        {
            var keysToRemove = _keys.Keys.Where(key => key.ToString().StartsWith(prefix)).ToList();

            await Task.Run(() =>
            {
                lock (_syncLock)
                {
                    foreach (var key in keysToRemove)
                    {
                        _keys.TryRemove(key, out _);
                        _innerCache.Remove(key);
                    }
                }
            });
        }

        public void Dispose() => _innerCache.Dispose();
    }
}
