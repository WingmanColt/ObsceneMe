using System.Collections.Concurrent;
using Microsoft.Extensions.Configuration;

public class ErrorLoggingService : IDisposable
{
    private readonly string logFolderPath;
    private readonly ConcurrentDictionary<string, string> serviceLogFiles = new();
    private readonly object _disposeLock = new();
    private bool _disposed;

    public ErrorLoggingService(IConfiguration config)
    {
        // Initialize log folder path once
        logFolderPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ErrorLogs");
        Directory.CreateDirectory(logFolderPath); // Ensures the directory exists
    }

    public void LogException(Exception exception, string methodName, string serviceName)
    {
        if (exception == null || string.IsNullOrWhiteSpace(methodName) || string.IsNullOrWhiteSpace(serviceName))
            return; // Avoid null exceptions

        try
        {
            string logFilePath = serviceLogFiles.GetOrAdd(serviceName, _ => GetLogFilePath(serviceName));
            string logMessage = $"[{DateTime.Now:dd/MMM/yyyy HH:mm:ss}]: Error in '{methodName}' of '{serviceName}': {exception.Message}";

            // Efficient file writing with StreamWriter
            using (var stream = new FileStream(logFilePath, FileMode.Append, FileAccess.Write, FileShare.Read))
            using (var writer = new StreamWriter(stream))
            {
                writer.WriteLine(logMessage);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Logging Failed]: {ex.Message}"); // Avoid crashing due to logging failure
        }
    }

    private string GetLogFilePath(string serviceName)
    {
        string logFileName = $"{serviceName}[{DateTime.Today:dd-MMMM-yy}].txt";
        return Path.Combine(logFolderPath, logFileName);
    }
    public string checkPath()
    {
        var projectDirectory = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.FullName;
        if (projectDirectory != null)
        {
            return Path.Combine(projectDirectory, "ErrorLogs");
        }
        return null;
    }
    public void Dispose()
    {
        lock (_disposeLock)
        {
            if (!_disposed)
            {
                serviceLogFiles.Clear(); // Clear dictionary to release memory
                _disposed = true;
            }
        }
    }
}
