using brevo_csharp.Api;
using Data;
using eCommerce.Configuration;
using eCommerce.Middlewares;
using eCommerce.Utility;
using eCommerce.Utility.HostedService;
using eCommerce.Utility.SeerviceActivation;
using HireMe.Data.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Models;
using Payments.PayPal;
using Services;
using Services.Interfaces;
using System.Reflection;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
var certPath = Path.Combine(builder.Environment.ContentRootPath, "certs", "obscene.me.pfx");

builder.WebHost.ConfigureKestrel(options =>
{
    options.Configure(builder.Configuration.GetSection("Kestrel"));
});

bool isDebug = System.Diagnostics.Debugger.IsAttached;

// Determine the environment based on whether the debugger is attached
var environment = isDebug ? "Development" : "Production";

// Load appropriate appsettings.json file based on the environment
builder.Configuration.AddJsonFile($"appsettings.{environment}.json", optional: true, reloadOnChange: true);



//var connectionString = builder.Configuration.GetConnectionString(isDebug ? "DevelopmentConnection" : "ProductionConnection");

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentity<User, IdentityRole>()
    .AddDefaultTokenProviders()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.SignIn.RequireConfirmedEmail = false;
    options.Password.RequiredLength = 5;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredUniqueChars = 0;
    options.Lockout.DefaultLockoutTimeSpan = new TimeSpan(1, 0, 0);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters =
"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
});



builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})

.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Authentication:Schemes:Bearer:ValidIssuer"],
        ValidAudiences = builder.Configuration.GetSection("Authentication:Schemes:Bearer:ValidAudiences").Get<string[]>(),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["Authentication:SecurityKey"]
        ))
    };
})
.AddCookie("Authentication", options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.None;
    options.ExpireTimeSpan = TimeSpan.FromDays(30);
    options.LoginPath = "/Account/Login"; // Customize the login path if needed
});


builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin",
        builder => builder.WithOrigins("https://obscene.me", "https://localhost:45312", "http://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials());
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

builder.Services.AddMemoryCache();
builder.Services.AddSingleton<MemoryCacheWithKeys>();

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();



// Stripe
//StripeConfiguration.ApiKey = builder.Configuration["Stripe-Demo:SecretKey"];

builder.Services.Configure<StripeOptions>(options =>
{
    options.PublishableKey = builder.Configuration["Stripe-Live:PubKey"];
    options.SecretKey = builder.Configuration["Stripe-Live:SecretKey"];
    options.Domain = builder.Configuration["WebUrls:userUrl"];
});

// Service Activation
builder.Services.Configure<ServiceActivationSettings>(builder.Configuration.GetSection("ServiceActivation"));
builder.Services.AddScoped<ServicesContainer>();
builder.Services.AddSingleton<ErrorLoggingService>();

// Repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

var serviceAssembly = Assembly.GetAssembly(typeof(IspCategory)); // Adjust if needed
ServiceRegistration.RegisterServices(builder.Services, builder.Configuration, serviceAssembly);

builder.Services.AddTransient<ISendInBlueService, SendInBlueService>();
builder.Services.AddTransient<ICartItemService, CartItemService>();
builder.Services.AddTransient<JwtHandler>();
builder.Services.AddTransient<InMemoryVerificationService>();

builder.Services.AddScoped<IProductExtensionService, ProductExtensionService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAffiliateService, AffiliateService>();
builder.Services.AddScoped<IBundleService, BundleService>();
builder.Services.AddScoped<IStoryPageService, StoryPageService>();



//builder.Services.AddHostedService<MarketStatusUpdateService>();
builder.Services.AddHostedService<ClearMemoryCache>();
//builder.Services.AddHostedService<EmailService>();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "eCommerceKeys")))
    .SetApplicationName("eCommerce");
try
{
    var apiInstance2 = new AccountApi();
    string apiKey = "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";
    apiInstance2.Configuration.ApiKey.Add("api-key", apiKey);

    var accountInfo = apiInstance2.GetAccount();

    Console.WriteLine($"Account Email: {accountInfo.Email}"); // supp.gstore@gmail.com 
    Console.WriteLine($"Plan Type: {accountInfo.Plan.FirstOrDefault()?.Type}"); // Badass6615 log with google
}
catch (Exception ex)
{
    Console.WriteLine(ex.InnerException);
}

builder.Services.AddHttpClient<PaypalClient>("Paypal", conf =>
{
    conf.BaseAddress = new Uri(builder.Configuration["PayPal-Live:Url"]);
});



// Zip compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "application/octet-stream" });
});

var app = builder.Build();

// Error Logging Service Middleware
app.UseErrorHandlingMiddleware();

// Zip compression
app.UseResponseCompression();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();

}
else
{
    app.UseExceptionHandler("/Database/Error");

    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}


app.UseHttpsRedirection();
app.UseStaticFiles(); // Default serves from wwwroot

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.WebRootPath, "assets")),
    RequestPath = "/assets" 
});

app.UseCookiePolicy(new CookiePolicyOptions
{
    MinimumSameSitePolicy = SameSiteMode.None,
    Secure = CookieSecurePolicy.Always
});


app.Use(async (context, next) =>
{
    try
    {
        var path = context.Request.Path;
        if (path.HasValue && (
            path.Value.EndsWith(".js", StringComparison.OrdinalIgnoreCase) ||
            path.Value.EndsWith(".css", StringComparison.OrdinalIgnoreCase) ||
            path.Value.EndsWith(".scss", StringComparison.OrdinalIgnoreCase)))
        {
            context.Response.Headers.Append("Expires", DateTime.UtcNow.AddDays(30).ToString("R"));
        }

        Console.WriteLine($"Incoming request: {context.Request.Method} {context.Request.Path}");

        await next();
    }
    catch (Exception ex)
    {
        // Ensure folder exists
        var logDir = Path.Combine(Directory.GetCurrentDirectory(), "APIErrorLogs");
        Directory.CreateDirectory(logDir);

        // Log file with date
        var logPath = Path.Combine(logDir, $"error-{DateTime.UtcNow:yyyy-MM-dd}.log");

        // Format log message
        var logMessage = $@"
        [{DateTime.UtcNow:u}]
        Request: {context.Request.Method} {context.Request.Path}
        Query: {context.Request.QueryString}
        Error: {ex}
        ------------------------------------------------------------
        ";

        // Write to log file
        await File.AppendAllTextAsync(logPath, logMessage);

        // Respond to client
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync("An unexpected server error occurred.");
    }
});


app.UseRouting();

app.UseCors("AllowOrigin"); // Apply the CORS policy


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.MapFallbackToFile("index.html");

app.Run();
