using HarmonicArchiveBackend.Data;
using HarmonicArchiveBackend.Services;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using System.Globalization;
using System.Net.WebSockets;
using System.Text;

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
        policy.WithOrigins("http://localhost:5173", "http://192.168.100.6:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<HarmonicArchiveBackend.Services.WebSocketManager>();
builder.Services.AddSingleton<MusicSheetWorker>(); // Register as a singleton
builder.Services.AddHostedService<MusicSheetWorker>(); // Register as a hosted service
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Harmonic Archive API",
        Version = "v1"
    });

    // Enable support for file uploads
    options.OperationFilter<FileUploadOperationFilter>();
});

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
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
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
app.Run();
