namespace HarmonicArchiveBackend.Models
{
    public class Instrument
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<MusicSheetInstrument> MusicSheetInstruments { get; set; }
    }
}
