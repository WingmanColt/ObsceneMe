using System.Reflection;

public static class ServiceRegistration
{
    public static void RegisterServices(IServiceCollection services, IConfiguration configuration, Assembly serviceAssembly)
    {
        // Load service activation settings from appsettings.json
        var serviceActivation = configuration.GetSection("ServiceActivation")
            .Get<Dictionary<string, ServiceConfig>>() ?? new();

        // Identify all disabled services
        var disabledServices = serviceActivation
            .Where(kvp => !kvp.Value.Active) // Get disabled services
            .Select(kvp => kvp.Key) // Extract service names (e.g., "Category")
            .ToHashSet(StringComparer.OrdinalIgnoreCase); // Store them in a case-insensitive set

        foreach (var type in serviceAssembly.GetTypes()
            .Where(t => t.IsInterface && t.Name.StartsWith("Isp"))) // Filtering interfaces with 'Isp' prefix
        {
            var expectedImplementationName = "s" + type.Name.Substring(2);
            var implementationType = serviceAssembly.GetTypes()
                .FirstOrDefault(t => t.Name == expectedImplementationName);

            if (implementationType != null)
            {
                // Extract core service name (e.g., "Category" from "IspCategory")
                var serviceName = type.Name.Substring(3);

                // Skip registration if the service or any related service is disabled
                if (disabledServices.Any(ds => serviceName.StartsWith(ds, StringComparison.OrdinalIgnoreCase)))
                {
                    Console.WriteLine($"Skipped (Disabled due to {serviceName} being inactive): {type.Name}");
                    continue;
                }

                // Get the lifetime setting (default to "Scoped" if not found or invalid)
                var lifetime = serviceActivation.TryGetValue(serviceName, out var config) && !string.IsNullOrEmpty(config.Lifetime)
                    ? config.Lifetime
                    : "Scoped"; // Default to Scoped if not configured or invalid

                // Register based on lifetime
                switch (lifetime.ToLowerInvariant())
                {
                    case "transient":
                        services.AddTransient(type, implementationType);
                        Console.WriteLine($"Registered (Transient): {type.Name} -> {implementationType.Name}");
                        break;

                    case "singleton":
                        services.AddSingleton(type, implementationType);
                        Console.WriteLine($"Registered (Singleton): {type.Name} -> {implementationType.Name}");
                        break;

                    case "scoped":
                    default:
                        services.AddScoped(type, implementationType);
                        Console.WriteLine($"Registered (Scoped): {type.Name} -> {implementationType.Name}");
                        break;
                }
            }
            else
            {
                Console.WriteLine($"Implementation not found for interface {type.Name}. Expected: {expectedImplementationName}");
            }
        }
    }
}

// Service configuration model
public class ServiceConfig
{
    public bool Active { get; set; }
    public string Lifetime { get; set; } = "Scoped"; // Default lifetime is Scoped
}
