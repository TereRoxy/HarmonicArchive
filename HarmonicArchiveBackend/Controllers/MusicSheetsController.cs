using HarmonicArchiveBackend.Data;
using HarmonicArchiveBackend.Models;
using HarmonicArchiveBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class MusicSheetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly MusicSheetWorker _worker;

    public MusicSheetsController(ApplicationDbContext context, MusicSheetWorker worker)
    {
        _context = context;
        _worker = worker;
    }

    [HttpPost("toggle-worker")]
    public IActionResult ToggleWorker([FromQuery] bool isRunning)
    {
        _worker.ToggleWorker(isRunning);
        return Ok(new { Message = $"Worker is now {(isRunning ? "running" : "stopped")}." });
    }

    [HttpGet]
    public async Task<IActionResult> GetMusicSheets(
        [FromQuery] string? title,
        [FromQuery] string? composer,
        [FromQuery] string? genres,
        [FromQuery] string? instruments,
        [FromQuery] string? _sort = "title",
        [FromQuery] string? _order = "asc",
        [FromQuery] int _page = 1, // Default to page 1
        [FromQuery] int _limit = 10 // Default to 10 items per page
    )
    {
        // Start with the base query
        var query = _context.MusicSheets
            .Include(ms => ms.Title)
            .Include(ms => ms.Composer)
            .Include(ms => ms.MusicSheetGenres)
                .ThenInclude(msg => msg.Genre)
            .Include(ms => ms.MusicSheetInstruments)
                .ThenInclude(msi => msi.Instrument)
            .AsQueryable();

        // Apply filtering
        if (!string.IsNullOrEmpty(title))
        {
            query = query.Where(ms => ms.Title.Name.Contains(title));
        }

        if (!string.IsNullOrEmpty(composer))
        {
            query = query.Where(ms => ms.Composer.Name.Contains(composer));
        }

        if (!string.IsNullOrEmpty(genres))
        {
            var genreList = genres.Split(',').Select(g => g.Trim()).ToList();
            query = query.Where(ms => ms.MusicSheetGenres.Any(msg => genreList.Contains(msg.Genre.Name)));
        }

        if (!string.IsNullOrEmpty(instruments))
        {
            var instrumentList = instruments.Split(',').Select(i => i.Trim()).ToList();
            query = query.Where(ms => ms.MusicSheetInstruments.Any(msi => instrumentList.Contains(msi.Instrument.Name)));
        }

        // Apply sorting
        if (!string.IsNullOrEmpty(_sort))
        {
            query = _sort.ToLower() switch
            {
                "title" => _order.ToLower() == "desc"
                    ? query.OrderByDescending(ms => ms.Title.Name)
                    : query.OrderBy(ms => ms.Title.Name),
                "composer" => _order.ToLower() == "desc"
                    ? query.OrderByDescending(ms => ms.Composer.Name)
                    : query.OrderBy(ms => ms.Composer.Name),
                "year" => _order.ToLower() == "desc"
                    ? query.OrderByDescending(ms => ms.Year)
                    : query.OrderBy(ms => ms.Year),
                _ => query.OrderBy(ms => ms.Title.Name) // Default sorting by title
            };
        }

        // Apply pagination
        var totalItems = await query.CountAsync(); // Total number of items
        var musicSheets = await query
            .Skip((_page - 1) * _limit) // Skip items for previous pages
            .Take(_limit) // Take only the items for the current page
            .ToListAsync();

        // Return paginated response
        return Ok(new
        {
            TotalItems = totalItems,
            Page = _page,
            Limit = _limit,
            Data = musicSheets
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateMusicSheet([FromBody] MusicSheetDto musicSheetDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); // Return validation errors
        }

        // Check or create Title
        var title = await _context.Titles.FirstOrDefaultAsync(t => t.Name == musicSheetDto.Title)
                    ?? new Title { Name = musicSheetDto.Title };

        // Check or create Composer
        var composer = await _context.Composers.FirstOrDefaultAsync(c => c.Name == musicSheetDto.Composer)
                       ?? new Composer { Name = musicSheetDto.Composer };

        string musicFilePath = null;
        if (musicSheetDto.MusicFile != null)
        {
            var musicFileName = Guid.NewGuid() + Path.GetExtension(musicSheetDto.MusicFile.FileName);
            var musicFileSavePath = Path.Combine("uploads/music", musicFileName);
            Directory.CreateDirectory(Path.GetDirectoryName(musicFileSavePath));
            using (var stream = new FileStream(musicFileSavePath, FileMode.Create))
            {
                await musicSheetDto.MusicFile.CopyToAsync(stream);
            }
            musicFilePath = musicFileSavePath;
        }
        // Create MusicSheet
        var musicSheet = new MusicSheet
        {
            Title = title,
            Composer = composer,
            Key = musicSheetDto.Key,
            Year = musicSheetDto.Year,
            MusicFilePath = musicFilePath,
            MusicSheetGenres = new List<MusicSheetGenre>(),
            MusicSheetInstruments = new List<MusicSheetInstrument>()
        };

        // Check or create Genres
        foreach (var genreName in musicSheetDto.Genres)
        {
            var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName)
                        ?? new Genre { Name = genreName };

            musicSheet.MusicSheetGenres.Add(new MusicSheetGenre { Genre = genre });
        }

        // Check or create Instruments
        foreach (var instrumentName in musicSheetDto.Instruments)
        {
            var instrument = await _context.Instruments.FirstOrDefaultAsync(i => i.Name == instrumentName)
                             ?? new Instrument { Name = instrumentName };

            musicSheet.MusicSheetInstruments.Add(new MusicSheetInstrument { Instrument = instrument });
        }

        _context.MusicSheets.Add(musicSheet);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMusicSheets), new { id = musicSheet.Id }, musicSheet);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadMusicSheet([FromForm] MusicSheetUploadDto uploadDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string musicFilePath = null;
            string videoFilePath = null; // Define this to avoid errors

            if (uploadDto.MusicFile != null)
            {
                var musicFileName = Guid.NewGuid() + Path.GetExtension(uploadDto.MusicFile.FileName);
                var musicFileSavePath = Path.Combine("uploads/music", musicFileName);
                Directory.CreateDirectory(Path.GetDirectoryName(musicFileSavePath));
                using (var stream = new FileStream(musicFileSavePath, FileMode.Create))
                {
                    await uploadDto.MusicFile.CopyToAsync(stream);
                }
                musicFilePath = musicFileSavePath;
            }

            // Video file logic can be added here if needed

            var title = await _context.Titles.FirstOrDefaultAsync(t => t.Name == uploadDto.Title)
                        ?? new Title { Name = uploadDto.Title };

            var composer = await _context.Composers.FirstOrDefaultAsync(c => c.Name == uploadDto.Composer)
                           ?? new Composer { Name = uploadDto.Composer };

            var musicSheet = new MusicSheet
            {
                Title = title,
                Composer = composer,
                Key = uploadDto.Key,
                Year = uploadDto.Year,
                MusicFilePath = musicFilePath,
                VideoFilePath = videoFilePath,
                MusicSheetGenres = new List<MusicSheetGenre>(),
                MusicSheetInstruments = new List<MusicSheetInstrument>()
            };

            foreach (var genreName in uploadDto.Genres)
            {
                var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName)
                            ?? new Genre { Name = genreName };

                musicSheet.MusicSheetGenres.Add(new MusicSheetGenre { Genre = genre });
            }

            foreach (var instrumentName in uploadDto.Instruments)
            {
                var instrument = await _context.Instruments.FirstOrDefaultAsync(i => i.Name == instrumentName)
                                 ?? new Instrument { Name = instrumentName };

                musicSheet.MusicSheetInstruments.Add(new MusicSheetInstrument { Instrument = instrument });
            }

            _context.MusicSheets.Add(musicSheet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMusicSheets), new { id = musicSheet.Id }, musicSheet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMusicSheet(int id)
    {
        // Find the music sheet by ID
        var musicSheet = await _context.MusicSheets
            .Include(ms => ms.MusicSheetGenres)
            .Include(ms => ms.MusicSheetInstruments)
            .FirstOrDefaultAsync(ms => ms.Id == id);

        if (musicSheet == null)
        {
            return NotFound(new { Message = "Music sheet not found." });
        }

        // Remove related genres and instruments
        _context.MusicSheetGenres.RemoveRange(musicSheet.MusicSheetGenres);
        _context.MusicSheetInstruments.RemoveRange(musicSheet.MusicSheetInstruments);

        // Remove the music sheet
        _context.MusicSheets.Remove(musicSheet);
        await _context.SaveChangesAsync();

        // Delete associated files
        if (!string.IsNullOrEmpty(musicSheet.MusicFilePath) && System.IO.File.Exists(musicSheet.MusicFilePath))
        {
            System.IO.File.Delete(musicSheet.MusicFilePath);
        }

        if (!string.IsNullOrEmpty(musicSheet.VideoFilePath) && System.IO.File.Exists(musicSheet.VideoFilePath))
        {
            System.IO.File.Delete(musicSheet.VideoFilePath);
        }

        return Ok(new { Message = "Music sheet deleted successfully." });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMusicSheetById(int id)
    {
        // Find the music sheet by ID
        var musicSheet = await _context.MusicSheets
            .Include(ms => ms.Title)
            .Include(ms => ms.Composer)
            .Include(ms => ms.MusicSheetGenres)
                .ThenInclude(msg => msg.Genre)
            .Include(ms => ms.MusicSheetInstruments)
                .ThenInclude(msi => msi.Instrument)
            .FirstOrDefaultAsync(ms => ms.Id == id);

        if (musicSheet == null)
        {
            return NotFound(new { Message = "Music sheet not found." });
        }

        return Ok(musicSheet);
    }

    [HttpPost("upload-resumable")]
    public async Task<IActionResult> UploadResumableChunk(
        IFormFile chunk,
        [FromForm] string uploadId,
        [FromForm] int chunkIndex,
        [FromForm] int totalChunks,
        [FromForm] string fileName)
    {
        var uploadDir = Path.Combine("uploads", "temp", uploadId);
        try
        {
            Directory.CreateDirectory(uploadDir);

            var chunkFilePath = Path.Combine(uploadDir, $"{chunkIndex}.chunk");
            using (var stream = new FileStream(chunkFilePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
            {
                await chunk.CopyToAsync(stream);
            }

            var uploadedChunks = Directory.GetFiles(uploadDir, "*.chunk").Length;
            if (uploadedChunks == totalChunks)
            {
                var finalFilePath = Path.Combine("uploads/videos", fileName);
                Directory.CreateDirectory(Path.GetDirectoryName(finalFilePath));

                using (var finalStream = new FileStream(finalFilePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
                {
                    for (int i = 0; i < totalChunks; i++)
                    {
                        var chunkPath = Path.Combine(uploadDir, $"{i}.chunk");
                        using (var chunkStream = new FileStream(chunkPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true))
                        {
                            await chunkStream.CopyToAsync(finalStream);
                        }
                    }
                }

                Directory.Delete(uploadDir, true);

                return Ok(new { Message = "File upload completed.", FilePath = finalFilePath });
            }

            return Ok(new { Message = "Chunk uploaded successfully.", UploadedChunks = uploadedChunks });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateMusicSheetMetadata(int id, [FromBody] MusicSheetDto musicSheetDto)
    {
        // Find the music sheet by ID
        var musicSheet = await _context.MusicSheets
            .Include(ms => ms.Title)
            .Include(ms => ms.Composer)
            .Include(ms => ms.MusicSheetGenres)
                .ThenInclude(msg => msg.Genre)
            .Include(ms => ms.MusicSheetInstruments)
                .ThenInclude(msi => msi.Instrument)
            .FirstOrDefaultAsync(ms => ms.Id == id);

        if (musicSheet == null)
        {
            return NotFound(new { Message = "Music sheet not found." });
        }

        // Update title if provided
        if (!string.IsNullOrEmpty(musicSheetDto.Title))
        {
            var title = await _context.Titles.FirstOrDefaultAsync(t => t.Name == musicSheetDto.Title)
                        ?? new Title { Name = musicSheetDto.Title };
            musicSheet.Title = title;
        }

        // Update composer if provided
        if (!string.IsNullOrEmpty(musicSheetDto.Composer))
        {
            var composer = await _context.Composers.FirstOrDefaultAsync(c => c.Name == musicSheetDto.Composer)
                        ?? new Composer { Name = musicSheetDto.Composer };
            musicSheet.Composer = composer;
        }

        // Update year if provided
        if (musicSheetDto.Year > 0)
        {
            musicSheet.Year = musicSheetDto.Year;
        }

        // Update key if provided
        if (!string.IsNullOrEmpty(musicSheetDto.Key))
        {
            musicSheet.Key = musicSheetDto.Key;
        }

        // Update genres if provided
        if (musicSheetDto.Genres != null && musicSheetDto.Genres.Any())
        {
            // Remove existing genres
            _context.MusicSheetGenres.RemoveRange(musicSheet.MusicSheetGenres);

            // Add new genres
            foreach (var genreName in musicSheetDto.Genres)
            {
                var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName)
                            ?? new Genre { Name = genreName };

                musicSheet.MusicSheetGenres.Add(new MusicSheetGenre { Genre = genre });
            }
        }

        // Update instruments if provided
        if (musicSheetDto.Instruments != null && musicSheetDto.Instruments.Any())
        {
            // Remove existing instruments
            _context.MusicSheetInstruments.RemoveRange(musicSheet.MusicSheetInstruments);

            // Add new instruments
            foreach (var instrumentName in musicSheetDto.Instruments)
            {
                var instrument = await _context.Instruments.FirstOrDefaultAsync(i => i.Name == instrumentName)
                                ?? new Instrument { Name = instrumentName };

                musicSheet.MusicSheetInstruments.Add(new MusicSheetInstrument { Instrument = instrument });
            }
        }

        // Save changes to the database
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Music sheet metadata updated successfully.", MusicSheet = musicSheet });
    }
}