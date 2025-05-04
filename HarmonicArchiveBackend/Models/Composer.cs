namespace HarmonicArchiveBackend.Models
{
    public class Composer
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<MusicSheet> MusicSheets { get; set; }
    }
}
