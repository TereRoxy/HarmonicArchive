using HarmonicArchiveBackend.Data;
using HarmonicArchiveBackend.Models;
using HarmonicArchiveBackend.Repository;

namespace HarmonicArchiveBackend.Services
{
    public class MusicSheetService
    {
        private readonly MusicSheetRepository _repository;

        public MusicSheetService(MusicSheetRepository repository)
        {
            _repository = repository;
        }

        public async Task<(List<MusicSheetDto>, int)> GetAllMusicSheetsAsync(
            string? title = null,
            string? composer = null,
            List<string>? genres = null,
            List<string>? instruments = null,
            string sortBy = "title",
            string sortOrder = "asc",
            int page = 1,
            int limit = 10)
        {
            var musicSheets = await _repository.GetAllAsync(title, composer, genres, instruments, sortBy, sortOrder, page, limit);
            var totalCount = await _repository.GetTotalCountAsync();

            // Map MusicSheet entities to MusicSheetDto
            var musicSheetDtos = musicSheets.Select(ms => new MusicSheetDto
            {
                Title = ms.Title.Name,
                Composer = ms.Composer.Name,
                Year = ms.Year,
                Key = ms.Key,
                Genres = ms.MusicSheetGenres.Select(g => g.Genre.Name).ToList(),
                Instruments = ms.MusicSheetInstruments.Select(i => i.Instrument.Name).ToList(),
                MusicFile = null, // File handling is not included in the DTO
                VideoFile = null  // File handling is not included in the DTO
            }).ToList();

            return (musicSheetDtos, totalCount);
        }

        public async Task<MusicSheetDto?> GetMusicSheetByIdAsync(int id)
        {
            var musicSheet = await _repository.GetByIdAsync(id);
            if (musicSheet == null)
            {
                return null;
            }

            // Map MusicSheet entity to MusicSheetDto
            return new MusicSheetDto
            {
                Title = musicSheet.Title.Name,
                Composer = musicSheet.Composer.Name,
                Year = musicSheet.Year,
                Key = musicSheet.Key,
                Genres = musicSheet.MusicSheetGenres.Select(g => g.Genre.Name).ToList(),
                Instruments = musicSheet.MusicSheetInstruments.Select(i => i.Instrument.Name).ToList(),
                MusicFile = null, // File handling is not included in the DTO
                VideoFile = null  // File handling is not included in the DTO
            };
        }

        public async Task AddMusicSheetFromDtoAsync(MusicSheetDto dto)
        {
            var musicSheet = new MusicSheet
            {
                Key = dto.Key,
                Year = dto.Year,
                MusicFilePath = dto.MusicFile?.FileName ?? "unknown",
                VideoFilePath = dto.VideoFile?.FileName ?? "unknown",
                Title = new Title { Name = dto.Title },
                Composer = new Composer { Name = dto.Composer },
                MusicSheetGenres = dto.Genres.Select(genre => new MusicSheetGenre
                {
                    Genre = new Genre { Name = genre }
                }).ToList(),
                MusicSheetInstruments = dto.Instruments.Select(instrument => new MusicSheetInstrument
                {
                    Instrument = new Instrument { Name = instrument }
                }).ToList()
            };

            await _repository.AddAsync(musicSheet);
        }

        public async Task UpdateMusicSheetFromDtoAsync(int id, MusicSheetDto dto)
        {
            var existingMusicSheet = await _repository.GetByIdAsync(id);
            if (existingMusicSheet == null)
            {
                throw new KeyNotFoundException("Music sheet not found.");
            }

            existingMusicSheet.Key = dto.Key;
            existingMusicSheet.Year = dto.Year;
            existingMusicSheet.MusicFilePath = dto.MusicFile?.FileName ?? existingMusicSheet.MusicFilePath;
            existingMusicSheet.VideoFilePath = dto.VideoFile?.FileName ?? existingMusicSheet.VideoFilePath;

            if (existingMusicSheet.Title == null || existingMusicSheet.Title.Name != dto.Title)
            {
                existingMusicSheet.Title = new Title { Name = dto.Title };
            }

            if (existingMusicSheet.Composer == null || existingMusicSheet.Composer.Name != dto.Composer)
            {
                existingMusicSheet.Composer = new Composer { Name = dto.Composer };
            }

            existingMusicSheet.MusicSheetGenres.Clear();
            foreach (var genre in dto.Genres)
            {
                existingMusicSheet.MusicSheetGenres.Add(new MusicSheetGenre
                {
                    Genre = new Genre { Name = genre }
                });
            }

            existingMusicSheet.MusicSheetInstruments.Clear();
            foreach (var instrument in dto.Instruments)
            {
                existingMusicSheet.MusicSheetInstruments.Add(new MusicSheetInstrument
                {
                    Instrument = new Instrument { Name = instrument }
                });
            }

            await _repository.UpdateAsync(existingMusicSheet);
        }

        public async Task DeleteMusicSheetAsync(int id)
        {
            var musicSheet = await _repository.GetByIdAsync(id);
            if (musicSheet != null)
            {
                await _repository.DeleteAsync(musicSheet);
            }
        }
    }
}
