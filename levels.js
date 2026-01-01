window.LEVELS = {
  level_1: {
    displayName: "Level 1: The Beach",
    start: {
      lat: 31.5085,
      lng: 34.4538,
      heading: 210
    },

    base: {
      lat: 31.5085,
      lng: 34.4538,
    },
    targetLocations: [
      { lat: 31.5195, lng: 34.4698, emoji: "☢️", size: "small" },
      { lat: 31.5195, lng: 34.4618, emoji: "☢️", size: "medium" },
      { lat: 31.5195, lng: 34.4548, emoji: "☢️", size: "big" },
      //{ lat: 31.5300, lng: 34.4700 },
    ],
    radarLocations: [
      {
        lat: 31.6195,
        lng: 34.4598,
        size: "big",

        rocketSpeed: 14000,
        rocketFreq: 0.9,
        smartRocketsEvery: 0,
        smartRocketSpeedFactor: 0.5
      },
      {
        lat: 31.6195,
        lng: 34.4598,
        size: "small",

        rocketSpeed: 14000,
        rocketFreq: 0.9,
        smartRocketsEvery: 0,
        smartRocketSpeedFactor: 0.5
      },
      {
        lat: 31.6195,
        lng: 34.4598,
        size: "medium",

        rocketSpeed: 14000,
        rocketFreq: 0.9,
        smartRocketsEvery: 0,
        smartRocketSpeedFactor: 0.5
      },
    ],
    limits: {
      maxBombs: 10,
      maxStealth: 2
    }
  },

  level_2: {
    displayName: "Level 2: Inland Fields",
    start: {
      lat: 31.5085,
      lng: 34.4538,
      heading: 0
    },

    targetCount: 3,
    targetLocations: [
      { lat: 31.5085, lng: 34.4538 },
      
			// { lat: 31.5085, lng: 34.9531 },
      //{ lat: 31.5300, lng: 34.4700 },
    ],
    radarLocations: [
      {
        lat: 31.6200,
        lng: 34.6400,
        size: "big",

        rocketSpeed: 30000,
        rocketFreq: 0.5,
        smartRocketsEvery: 5,
        smartRocketSpeedFactor: 0.6
      },
    ],
    limits: {
      maxBombs: 3,
      maxStealth: 2
    }
  },
  level_3: {
    displayName: "Level 3: The City",
    start: {
      lat: 37.60813,
      lng: -122.38023,
      heading: 90
    },
    night: true,
    targetCount: 2,
    targetLocations: [
      { lat: 37.60813, lng: -122.38093, emoji: "🏛️", size: "large" },
      { lat: 37.60813, lng: -122.31023, emoji: "🏙️", size: "large" },
      
      // { lat: 31.5085, lng: 34.9531 },
      //{ lat: 31.5300, lng: 34.4700 },
    ],
    radarLocations: [
      {
        lat: 31.6200,
        lng: 34.5400,
        size: "big",

        rocketSpeed: 20000,
        rocketFreq: 0.7,
        smartRocketsEvery: 3,
        smartRocketSpeedFactor: 0.7
      },
      {
        lat: 31.6000,
        lng: 34.6000,
        size: "medium",

        rocketSpeed: 25000,
        rocketFreq: 0.6,
        smartRocketsEvery: 4,
        smartRocketSpeedFactor: 0.6
      },
    ],
    limits: {
      maxBombs: 4,
      maxStealth: 3
    }
  },
};