const Composer = require('./Composer');
const Genre = require('./Genre');
const Instrument = require('./Instrument');
const MusicSheet = require('./MusicSheet');
const MusicSheetGenre = require('./MusicSheetGenre');
const MusicSheetInstrument = require('./MusicSheetInstrument');
const Title = require('./Title');

// MusicSheet belongs to Title
MusicSheet.belongsTo(Title, { foreignKey: 'titleId' });
Title.hasMany(MusicSheet, { foreignKey: 'titleId' });

// MusicSheet belongs to Composer
MusicSheet.belongsTo(Composer, { foreignKey: 'composerId' });
Composer.hasMany(MusicSheet, { foreignKey: 'composerId' });

// Many-to-Many between MusicSheet and Genre
MusicSheet.belongsToMany(Genre, { through: MusicSheetGenre, foreignKey: 'musicSheetId' });
Genre.belongsToMany(MusicSheet, { through: MusicSheetGenre, foreignKey: 'genreId' });

// Many-to-Many between MusicSheet and Instrument
MusicSheet.belongsToMany(Instrument, { through: MusicSheetInstrument, foreignKey: 'musicSheetId' });
Instrument.belongsToMany(MusicSheet, { through: MusicSheetInstrument, foreignKey: 'instrumentId' });

module.exports = {
  Composer,
  Genre,
  Instrument,
  MusicSheet,
  MusicSheetGenre,
  MusicSheetInstrument,
  Title
};