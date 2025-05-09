using HarmonicArchiveBackend.Data;
using HarmonicArchiveBackend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using WebSocketManager = HarmonicArchiveBackend.Services.WebSocketManager;

[ApiController]
[Route("api/[controller]")]
public class MusicSheetsController : ControllerBase
{
    private readonly MusicSheetService _service;
    private readonly WebSocketManager _worker;

    public MusicSheetsController(MusicSheetService service, WebSocketManager worker)
    {
        _service = service;
        _worker = worker;
    }

    [HttpGet]
    public async Task<IActionResult> GetMusicSheets(
        [FromQuery] string? title,
        [FromQuery] string? composer,
        [FromQuery] string? genres,
        [FromQuery] string? instruments,
        [FromQuery] string? _sort = "title",
        [FromQuery] string? _order = "asc",
        [FromQuery] int _page = 1,
        [FromQuery] int _limit = 10)
    {
        var genreList = genres?.Split(',').Select(g => g.Trim()).ToList();
        var instrumentList = instruments?.Split(',').Select(i => i.Trim()).ToList();

        var (musicSheets, totalCount) = await _service.GetAllMusicSheetsAsync(
            title, composer, genreList, instrumentList, _sort, _order, _page, _limit);

        return Ok(new
        {
            Data = musicSheets,
            TotalCount = totalCount,
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMusicSheetById(int id)
    {
        var musicSheet = await _service.GetMusicSheetByIdAsync(id);
        if (musicSheet == null)
        {
            return NotFound(new { Message = "Music sheet not found." });
        }
        return Ok(musicSheet);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMusicSheet([FromBody] MusicSheetDto musicSheet)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _service.AddMusicSheetFromDtoAsync(musicSheet);
        return Ok(new { Message = "Music Sheet created successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMusicSheet(int id, [FromBody] MusicSheetDto musicSheetDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _service.UpdateMusicSheetFromDtoAsync(id, musicSheetDto);
            return Ok(new { Message = "Music sheet updated successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMusicSheet(int id)
    {
        await _service.DeleteMusicSheetAsync(id);
        return NoContent();
    }

    [HttpPost("toggle-worker")]
    public IActionResult ToggleWorker([FromQuery] bool isRunning)
    {
        // Assuming the worker is already implemented
        return Ok(new { Message = $"Worker is now {(isRunning ? "running" : "stopped")}." });
    }

    [HttpGet("ws")]
    public async Task GetWebSocket()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            _worker.AddSocket(webSocket); // Add the WebSocket to the worker's WebSocketManager

            var buffer = new byte[1024 * 4];
            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    // Keep the connection alive by receiving messages
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    // If the client closes the connection, break the loop
                    if (result.CloseStatus.HasValue)
                    {
                        break;
                    }
                }
            }
            finally
            {
                _worker.RemoveSocket(webSocket); // Remove the WebSocket when the connection is closed
            }
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }

    [HttpPut("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadMusicSheetFiles(IFormFile file)
    {
        if (!_service.ValidateFileType(file))
        {
            return BadRequest(new { Message = "Invalid file type. Only images, PDFs, and videos are allowed." });
        }

        // Proceed with file upload logic
        var path = await _service.UploadMusicSheetFileAsync(file);
        return Ok(new { FilePath = path });
    }
}
