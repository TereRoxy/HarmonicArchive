using HarmonicArchiveBackend.Data;
using HarmonicArchiveBackend.Repository;
using HarmonicArchiveBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using System.Globalization;
using System.Net.WebSockets;
using System.Text;
using WebSocketManager = HarmonicArchiveBackend.Services.WebSocketManager;

// Force invariant culture for the entire app
CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAuthentication("MyCookieAuth")
    .AddCookie("MyCookieAuth", options =>
    {
        options.LoginPath = "/api/users/login";
        options.LogoutPath = "/api/users/logout";
        options.Cookie.Name = "MyAuthCookie";
    });


// Register DbContext with scoped lifetime (default for AddDbContext)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.EnableSensitiveDataLogging();
});

// Register WebSocketManager as a singleton
builder.Services.AddSingleton<WebSocketManager>();

// Register MusicSheetWorker as a singleton and hosted service
builder.Services.AddSingleton<MusicSheetWorker>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<MusicSheetWorker>());

// Register repository and service with scoped lifetime
builder.Services.AddScoped<MusicSheetRepository>();
builder.Services.AddScoped<MusicSheetService>();

// Register controllers
builder.Services.AddControllers();

// Configure Swagger with file upload support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HarmonicArchiveBackend", Version = "v1" });

    // Add support for file uploads
    c.OperationFilter<SwaggerFileOperationFilter>();

    // Ensure multipart/form-data is supported
    c.MapType<IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });
});



// Configure form options for large file uploads
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10L * 1024 * 1024 * 1024; // 10 GB
});


var app = builder.Build();


app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        if (exception != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(exception, "Unhandled exception occurred.");
        }

        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("An unhandled exception occurred.");
    });
});

// Serve static files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles/Music")),
    RequestPath = "/UploadedFiles/Music"
});

app.UseCors("AllowSpecificOrigins");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Harmonic Archive API v1");
    });
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseWebSockets();
app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        var webSocketManager = context.RequestServices.GetRequiredService<HarmonicArchiveBackend.Services.WebSocketManager>();
        webSocketManager.AddSocket(webSocket);

        while (webSocket.State == WebSocketState.Open)
        {
            await Task.Delay(1000); // Keep the connection alive
        }
    }
});

//Seed the database with 20 music sheets at startup
//using (var scope = app.Services.CreateScope())
//{
//    var serviceProvider = scope.ServiceProvider;
//    var musicSheetService = serviceProvider.GetRequiredService<MusicSheetService>();

//    // Generate 20 fake music sheets
//    var fakeMusicSheets = MusicSheetGenerator.GenerateMusicSheets(10000);

//    foreach (var musicSheet in fakeMusicSheets)
//    {
//        await musicSheetService.AddMusicSheetFromDtoWithoutDuplicateCheckAsync(musicSheet);
//    }
//}


app.Run();
