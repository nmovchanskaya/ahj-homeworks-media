export default class Position {
  constructor(lat, long) {
    this.lat = lat;
    this.long = long;
  }

  static coordsPattern = /([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)/;

  static checkCoords(text) {
    let latitude;
    let longitude;

    const match = text.match(Position.coordsPattern);
    if (match) {
      latitude = match[1];
      longitude = match[2];

      return new Position(latitude, longitude);
    }

    throw new Error('Wrong format coordinates. It must be: number, number');
  }
}
