namespace HarmonicArchiveBackend.Models
{
    public class MusicSheetInstrument
    {
        public int MusicSheetId { get; set; }
        public MusicSheet MusicSheet { get; set; }

        public int InstrumentId { get; set; }
        public Instrument Instrument { get; set; }
    }
}
