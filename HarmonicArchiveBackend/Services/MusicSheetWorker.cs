using System.Net.WebSockets;
using System.Text;
using HarmonicArchiveBackend.Services;
using WebSocketManager = HarmonicArchiveBackend.Services.WebSocketManager;

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
        _logger.LogInformation($"Worker is now {(isRunning ? "running" : "stopped")}.");
    }

    public async Task HandleWebSocketConnection(WebSocket webSocket)
    {
        try
        {
            _webSocketManager.AddSocket(webSocket);
            _logger.LogInformation("WebSocket connection established.");

            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult result;

            while (webSocket.State == WebSocketState.Open)
            {
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _logger.LogInformation("WebSocket connection closed.");
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                    _webSocketManager.RemoveSocket(webSocket);
                }
                else if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    _logger.LogInformation($"Received message: {message}");
                    await _webSocketManager.BroadcastMessageAsync($"Echo: {message}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in WebSocket connection.");
        }
        finally
        {
            _webSocketManager.RemoveSocket(webSocket);
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                if (_isRunning)
                {
                    _logger.LogInformation("Worker is running...");
                    // Perform background tasks here
                }

                await Task.Delay(1000, stoppingToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred in the background worker.");
            throw; // Re-throw to let the host handle it
        }
    }

}
