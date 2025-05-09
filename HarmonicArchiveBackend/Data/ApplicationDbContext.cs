using HarmonicArchiveBackend.Models;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<MusicSheet> MusicSheets { get; set; }
    public DbSet<Title> Titles { get; set; }
    public DbSet<Composer> Composers { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Instrument> Instruments { get; set; }
    public DbSet<MusicSheetGenre> MusicSheetGenres { get; set; }
    public DbSet<MusicSheetInstrument> MusicSheetInstruments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure many-to-many relationships
        modelBuilder.Entity<MusicSheetGenre>()
            .HasKey(msg => new { msg.MusicSheetId, msg.GenreId });

        modelBuilder.Entity<MusicSheetInstrument>()
            .HasKey(msi => new { msi.MusicSheetId, msi.InstrumentId });

        modelBuilder.Entity<Title>()
        .Property(t => t.Name)
        .HasMaxLength(255); // Limit the length to 255 characters

        base.OnModelCreating(modelBuilder);
    }
}