const xmldoc = require('xmldoc');

const SERVICE_STRING_FIELDS = new Set([
  'sta',
  'eta',
  'std',
  'etd',
  'platform',
  'operator',
  'operatorCode',
  'serviceType',
  'cancelReason',
  'delayReason',
  'serviceID',
  'length',
  'rsid',
  'crs',
  'locationName',
  'generatedAt',
]);

const SERVICE_BOOLEAN_FIELDS = new Set([
  'isCircularRoute',
  'isCancelled',
  'filterLocationCancelled',
  'detachFront',
  'isReverseFormation',
  'futureCancellation',
  'futureDelay',
]);

const SERVICE_ARRAY_FIELDS = new Set([
  'origin',
  'destination',
  'currentOrigins',
  'currentDestinations',
]);

class Parsers {
  static parseArrivalsBoardResponse(soapResponse) {
    return this.getTrainServicesBoard(soapResponse, 'GetArrivalBoardResponse');
  }

  static parseArrivalsBoardWithDetails(soapResponse) {
    return this.getTrainServicesBoard(soapResponse, 'GetArrBoardWithDetailsResponse');
  }

  static parseArrivalsDepartureBoard(soapResponse) {
    return this.getTrainServicesBoard(soapResponse, 'GetArrivalDepartureBoardResponse');
  }

  static parseArrivalsDepartureBoardWithDetails(soapResponse) {
    return this.getTrainServicesBoard(soapResponse, 'GetArrDepBoardWithDetailsResponse');
  }

  static parseServiceDetails(soapResponse) {
    const serviceXml = this.extractResponseObject(
      soapResponse,
      'GetServiceDetailsResponse',
    ).childNamed('GetServiceDetailsResult');
    const service = this.parseStandardService(serviceXml);

    return { serviceDetails: service };
  }

  static parseDepartureBoardResponse(soapResponse) {
    return this.getTrainServicesBoard(soapResponse, 'GetDepartureBoardResponse');
  }

  static parseDepartureBoardWithDetailsResponse(soapResponse) {
    return this.getTrainServicesBoard(soapResponse, 'GetDepBoardWithDetailsResponse');
  }

  static parseNextDepartureResponse(response) {
    const board = this.getDepartureBoardDestination(response, 'GetNextDeparturesResponse');
    const trains = [];

    try {
      board.eachChild((service) => {
        trains.push(this.parseStandardService(service));
      });
    } catch (e) {
      console.error(e);
    }

    return { trainServices: trains };
  }

  static parseNextDepartureWithDetailsResponse(response) {
    const board = this.getDepartureBoardDestination(
      response,
      'GetNextDeparturesWithDetailsResponse',
    );
    const trains = [];

    try {
      board.eachChild((service) => {
        trains.push(this.parseStandardService(service));
      });
    } catch (e) {
      console.error(e);
    }

    return { trainServices: trains };
  }

  static parseFastestDeparture(response) {
    const board = this.getDepartureBoardDestination(response, 'GetFastestDeparturesResponse');
    const trains = [];

    try {
      board.eachChild((service) => {
        trains.push(this.parseStandardService(service));
      });
    } catch (e) {
      console.error(e);
    }
    return { trainServices: trains };
  }

  static parseFastestDepartureWithDetails(response) {
    const board = this.getDepartureBoardDestination(
      response,
      'GetFastestDeparturesWithDetailsResponse',
    );
    const trains = [];
    try {
      board.eachChild((service) => {
        const train = this.parseStandardService(service);
        service.eachChild((element) => {
          if (element.name === 'lt7:subsequentCallingPoints') {
            const subsequentCallingPoints = element.childNamed('lt7:callingPointList');
            train.subsequentCallingPoints = this.parseCallingPointList(subsequentCallingPoints);
          }
        });
        trains.push(train);
      });
    } catch (e) {
      console.error(e);
    }

    return { trainServices: trains };
  }

  static getTrainServicesBoard(response, responseType) {
    const boardElement = this.extractResponseObject(response, responseType).childNamed(
      'GetStationBoardResult',
    );
    const board = {};
    boardElement.eachChild((element) => {
      const name = element.name.split(':')[1];
      switch (name) {
        case 'generatedAt':
        case 'locationName':
        case 'crs':
          board[name] = element.val;
          break;
        case 'platformAvailable':
          board.platformAvailable = element.val === 'true';
          break;
        case 'nrccMessages':
          board.nrccMessages = element.childrenNamed('lt:message').map((message) => message.val);
          break;
        case 'trainServices':
          try {
            board.trainServices = [];
            element.eachChild((service) => {
              board.trainServices.push(this.parseStandardService(service));
            });
          } catch (e) {
            console.error(e);
          }
          break;
        default:
          console.log('unknown board element', element.name);
          break;
      }
    });
    return board;
  }

  static parseFormation(formation) {
    const train = {};
    formation.eachChild((element) => {
      const name = element.name.split(':')[1];

      switch (name) {
        case 'coaches':
          train.coaches = element.childrenNamed('lt7:coach').map((coach) => {
            const coachData = {};
            coachData.number = coach.attr.number;
            coach.eachChild((el) => {
              switch (el.name) {
                case 'lt7:toilet':
                  coachData.toilet = el.val;
                  break;
                case 'lt7:coachClass':
                  coachData.class = el.val;
                  break;
                case 'lt7:loading':
                  coachData.loading = el.val;
                  break;
                default:
                  console.log('unknown coach element', el.name);
                  break;
              }
            });
            return coachData;
          });
          break;
        case 'avgLoading':
          train.avgLoading = element.val;
          break;
        default:
          console.log('unknown formation element', element.name);
          break;
      }
    });
    return train;
  }

  static parseStandardService(service) {
    const train = {};
    service.eachChild((element) => {
      const name = element.name.split(':')[1];
      if (SERVICE_STRING_FIELDS.has(name)) {
        train[name] = element.val;
      } else if (SERVICE_BOOLEAN_FIELDS.has(name)) {
        train[name] = element.val === 'true';
      } else if (SERVICE_ARRAY_FIELDS.has(name)) {
        train[name] = element.childrenNamed('lt4:location').map((loc) => this.parseLocation(loc));
      } else if (name === 'formation') {
        train[name] = this.parseFormation(element);
      } else if (name === 'previousCallingPoints' || name === 'subsequentCallingPoints') {
        const callingPoints = element.childNamed('lt7:callingPointList');
        train[name] = this.parseCallingPointList(callingPoints);
      } else {
        console.log('unknown standard service element', element.name);
      }
    });
    return train;
  }

  static parseCallingPointList(soapCallingPointList) {
    const callingPoints = [];
    soapCallingPointList.eachChild((child) => {
      const callingPoint = {};
      child.eachChild((element) => {
        switch (element.name) {
          case 'lt7:length':
            callingPoint.length = element.val;
            break;
          case 'lt7:crs':
            callingPoint.crs = element.val;
            break;
          case 'lt7:locationName':
            callingPoint.locationName = element.val;
            break;
          case 'lt7:st':
            callingPoint.st = element.val;
            break;
          case 'lt7:et':
            callingPoint.et = element.val;
            break;
          default:
            break;
        }
      });
      callingPoints.push(callingPoint);
    });
    return callingPoints;
  }

  static extractResponseObject(soapMessage, response) {
    const parsed = new xmldoc.XmlDocument(soapMessage);
    return parsed.childNamed('soap:Body').childNamed(response);
  }

  static parseLocation(location) {
    return {
      name: location.childNamed('lt4:locationName').val,
      crs: location.childNamed('lt4:crs').val,
      via: location.childNamed('lt4:via') ? location.childNamed('lt4:via').val : null,
    };
  }

  static getDepartureBoardDestination(response, responseType) {
    const board = this.extractResponseObject(response, responseType)
      .childNamed('DeparturesBoard')
      .childNamed('lt7:departures')
      .childNamed('lt7:destination');

    return board;
  }
}

module.exports = Parsers;
