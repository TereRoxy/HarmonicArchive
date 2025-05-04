using HarmonicArchiveBackend.Data;
using HarmonicArchiveBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace HarmonicArchiveBackend.Services
{
    public class MusicSheetWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MusicSheetWorker> _logger;
        private readonly WebSocketManager _webSocketManager;
        private bool _isRunning = false;

        public MusicSheetWorker(IServiceProvider serviceProvider, ILogger<MusicSheetWorker> logger, WebSocketManager webSocketManager)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _webSocketManager = webSocketManager;
        }

        public void ToggleWorker(bool isRunning)
        {
            _isRunning = isRunning;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                if (_isRunning)
                {
                    try
                    {
                        using (var scope = _serviceProvider.CreateScope())
                        {
                            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                            // Generate a new music sheet
                            var newMusicSheet = new MusicSheet
                            {
                                Title = new Title { Name = $"Generated Title {Guid.NewGuid()}" },
                                Composer = new Composer { Name = $"Generated Composer {Guid.NewGuid()}" },
                                Year = DateTime.Now.Year,
                                Key = "C Major",
                                MusicSheetGenres = new List<MusicSheetGenre>
                                {
                                    new MusicSheetGenre { Genre = new Genre { Name = "Generated Genre" } }
                                },
                                MusicSheetInstruments = new List<MusicSheetInstrument>
                                {
                                    new MusicSheetInstrument { Instrument = new Instrument { Name = "Generated Instrument" } }
                                }
                            };

                            // Save to the database
                            dbContext.MusicSheets.Add(newMusicSheet);
                            await dbContext.SaveChangesAsync(stoppingToken);

                            // Send the new music sheet to connected WebSocket clients
                            var musicSheetJson = JsonSerializer.Serialize(newMusicSheet, new JsonSerializerOptions { ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles });
                            await _webSocketManager.BroadcastMessageAsync(musicSheetJson);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred while generating music sheets.");
                    }
                }

                // Wait for 5 seconds before generating the next music sheet
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
}