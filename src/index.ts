// Now assume the calling code will be getting lots of different data from different services about each point (sunrise times just being one).
//
// Bonus points:
// Install and use ramda, implement some functional programming
// Use ES6/7 array features
// Use async / await
// Handle errors properly
// Additional functionality
// Unit tests

import fetch from "node-fetch";

type Point = Array<string | number>;
type Points = Array<Point>;
type Response = {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_en: string;
  };
  status: string;
};
type Responses = Array<Response>;

// Generate a list of 100 random lat / long points around the world
export const generatePoint = () => {
  const randomPoint = Math.random() * (180 - -180) + -180;
  return randomPoint.toFixed(3) || 0 * 1;
};

export const generateLatLongPoint = (): Point => [
  generatePoint(),
  generatePoint()
];

export const generateLatLongPoints = (quantity: number): Points => {
  const points = [];

  for (let i = 0; i < quantity; i += 1) {
    points.push(generateLatLongPoint());
  }

  return points;
};

// Using https://sunrise-sunset.org/api, fetch the sunrise / sunset times
export const fetchSunriseSunsetTime = async (
  point: Point
): Promise<Response> => {
  try {
    const [lat, lng] = point;
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    // console.error(error.message);
    return null;
  }
};

// Run 5 requests in parrallel, run next 5 after 5 second break if they've all finished
export const fetchSunriseSunsetTimes = async (
  points: Points
): Promise<Responses> => {
  const queue = [];

  for (let i = 0; i < points.length; i++) {
    queue.push(fetchSunriseSunsetTime(points[i]));
  }

  return Promise.all(queue);
};

const sortSunriseSunsetTimes = (a: Response, b: Response): number => {
  if (!a || !b) {
    return;
  }

  const aSunrise = new Date(a.results.sunrise);
  const bSunrise = new Date(b.results.sunrise);

  if (aSunrise > bSunrise) {
    return 1;
  } else if (aSunrise < bSunrise) {
    return -1;
  } else {
    return 0;
  }
};

// Find earliest sunrise and list the day length for this time
export const getEarliestSunriseDayLength = async (batchSize: number) => {
  const points = generateLatLongPoints(batchSize);
  const times = await fetchSunriseSunsetTimes(points);

  let sortedTimes = [...times].sort(sortSunriseSunsetTimes);

  const [earliestSunrise] = sortedTimes;

  if (earliestSunrise === null) {
    console.error(
      "There was an error retrieving the data from the API. Please try again"
    );
    return;
  }

  const day = new Date(0);

  day.setUTCSeconds(parseInt(earliestSunrise.results.sunrise, 10) * 10);

  const [lat, lng] = points[0];

  const hours = day.getHours();
  const minutes = day.getMinutes();
  const seconds = day.getSeconds();

  console.log("The location with the earliest sunrise is...");
  console.log(`latitude: ${lat}, longitude: ${lng}`);
  console.log(`Day length is...`);
  console.log(`Hours: ${hours}`);
  console.log(`Minutes: ${minutes}`);
  console.log(`Seconds: ${seconds}`);
};

getEarliestSunriseDayLength(100);
