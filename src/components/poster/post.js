import Position from './position';

export default class Post {
  constructor(content, type) {
    this.id = Math.floor(performance.now());
    this.content = content;
    this.date = new Date();
    this.type = type;
  }

  getCoordinates() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async getPosition() {
    // wait for the resolved result
    let position;
    try {
      position = await this.getCoordinates();
    } catch {
      console.log('position wrong');
      throw new Error();
    }
    const { latitude, longitude } = position.coords;
    console.log(`lat ${latitude}`);
    console.log(`long ${longitude}`);
    this.position = new Position(latitude, longitude);
  }
}
