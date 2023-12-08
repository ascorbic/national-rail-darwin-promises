const axios = require('axios');

const requestBuilder = require('./requestBuilder');
const Parsers = require('./parsers');

class Darwin {
  constructor(apiKey, options = {}) {
    this.key = apiKey || process.env.DARWIN_TOKEN;
    this.baseUrl = 'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx';

    if (options && options.baseUrl) {
      this.baseUrl = options.baseUrl;
    }
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  static get(url) {
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((response) => {
          if (response.status > 300) {
            reject(response);
          } else {
            resolve(response.data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  post(xml) {
    const xmlWithToken = xml.replace('$$TOKEN$$', this.key);
    return new Promise((resolve, reject) => {
      axios
        .post(this.baseUrl, xmlWithToken, {
          headers: {
            'Content-Type': 'text/xml',
          },
        })
        .then((response) => {
          if (response.status > 300) {
            reject(response);
          } else {
            resolve(response.data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getDepartureBoard(station, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getDepartureBoardRequest(station, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseDepartureBoardResponse(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getDepartureBoardWithDetails(station, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getDepartureBoardWithDetails(station, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseDepartureBoardWithDetailsResponse(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getArrivalsBoard(station, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getArrivalsBoard(station, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseArrivalsBoardResponse(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getArrivalsBoardWithDetails(station, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getArrivalsBoardWithDetails(station, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseArrivalsBoardWithDetails(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getArrivalsDepartureBoard(station, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getArrivalsDepartureBoard(station, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseArrivalsDepartureBoard(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getArrivalsDepartureBoardWithDetails(station, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getArrivalsDepartureBoardWithDetails(station, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseArrivalsDepartureBoardWithDetails(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getServiceDetails(serviceId) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getServiceDetails(serviceId);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseServiceDetails(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getNextDeparture(station, destination, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getNextDeparture(station, destination, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseNextDepartureResponse(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getNextDepartureWithDetails(station, destination, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getNextDepartureWithDetails(station, destination, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseNextDepartureWithDetailsResponse(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getArrival(station, destination, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getArrival(station, destination, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseArrivalsBoardResponse(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getFastestDeparture(station, destination, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getFastestDeparture(station, destination, options);
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseFastestDeparture(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getFastestDepartureWithDetails(station, destination, options = {}) {
    return new Promise((resolve, reject) => {
      const requestXML = requestBuilder.getFastestDepartureWithDetails(
        station,
        destination,
        options,
      );
      this.post(requestXML)
        .then((result) => {
          resolve(Parsers.parseFastestDepartureWithDetails(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static getStationDetails(stationName) {
    return new Promise((resolve, reject) => {
      const url = `http://ojp.nationalrail.co.uk/find/stationsDLRLU/${encodeURIComponent(
        stationName,
      )}`;
      this.get(url)
        .then((body) => {
          const results = JSON.parse(body);
          const output = results.map((result) => ({
            code: result[0],
            name: result[1],
            longitude: result[8],
            latitude: result[7],
            postcode: result[9],
            operator: result[10],
          }));
          resolve(output);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = Darwin;
