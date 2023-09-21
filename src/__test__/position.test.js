import Position from '../components/poster/position';

test('test 2 number', () => {
  const res = Position.checkCoords('123.45, 123.67');
  expect(res).toEqual({ lat: '123.45', long: '123.67' });
});

test('test 2 numbers without space', () => {
  const res = Position.checkCoords('123.45,-123.67');
  expect(res).toEqual({ lat: '123.45', long: '-123.67' });
});

test('test 2 numbers inside brackets', () => {
  const res = Position.checkCoords('[123.45, 123.67]');
  expect(res).toEqual({ lat: '123.45', long: '123.67' });
});

test('test other symbols', () => {
  try {
    const res = Position.checkCoords('123.45ab, 123.67');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});
