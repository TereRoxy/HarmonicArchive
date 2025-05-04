using HarmonicArchiveBackend.Models;

public class MusicSheet
{
    public int Id { get; set; }
    public string Key { get; set; }
    public int Year { get; set; }

    // Relationships
    public int TitleId { get; set; }
    public Title Title { get; set; }

    public int ComposerId { get; set; }
    public Composer Composer { get; set; }

    public ICollection<MusicSheetGenre> MusicSheetGenres { get; set; }
    public ICollection<MusicSheetInstrument> MusicSheetInstruments { get; set; }

    public string MusicFilePath { get; set; } // Path to the PDF/image file
    public string VideoFilePath { get; set; } // Path to the video file
}