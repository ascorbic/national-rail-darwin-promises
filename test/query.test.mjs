// @ts-check
/* eslint-disable */
import { describe, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import Parsers from '../parsers.js';
function loadFixture(name) {
  return fs.readFile(`./test/fixtures/${name}.xml`);
}
describe('Darwin', (it) => {
  it('should return a list of departures', async () => {
    const response = await loadFixture('getDepartureBoard');
    const data = Parsers.parseDepartureBoardResponse(response);
    expect(data.locationName).toBe('London Bridge');
    expect(data.crs).toBe('LBG');
    expect(data.trainServices.length).toBeGreaterThan(0);
  });

  it('should parse different formation type', async () => {
    const response = await loadFixture('getDepartureBoard');
    const data = Parsers.parseDepartureBoardResponse(response);
    expect(data.trainServices[1].length).toBe('8');
    expect(data.trainServices[1].formation.coaches[0].loading).toBe('100');
    const service = data.trainServices.find(
      (s) => s.serviceID === '2721337LNDNBDC_',
    );
    expect(service.length).toBe('6');
    expect(service.formation).toBeDefined();
    expect(service.formation.coaches).not.toBeDefined();
    expect(service.formation.avgLoading).toBe('13');
  });

  it('should return a list of arrivals', async () => {
    const response = await loadFixture('getArrivalsBoard');
    const data = Parsers.parseArrivalsBoardResponse(response);
    expect(data.trainServices.length).toBeGreaterThan(0);
  });

  it('should return a list of arrivals and departures', async () => {
    const response = await loadFixture('getArrivalsDepartureBoard');
    const data = Parsers.parseArrivalsDepartureBoard(response);
    expect(data.trainServices.length).toBeGreaterThan(0);
  });

  it('should return a list of arrivals and departures with details', async () => {
    const response = await loadFixture('getArrivalsDepartureBoardWithDetails');
    const data = Parsers.parseArrivalsDepartureBoardWithDetails(response);
    expect(data.trainServices.length).toBeGreaterThan(0);
    expect(data.trainServices[0].previousCallingPoints.length).toBeGreaterThan(
      0,
    );
  });

  it('should return a list of arrivals with details', async () => {
    const response = await loadFixture('getArrivalsBoardWithDetails');
    const data = Parsers.parseArrivalsBoardWithDetails(response);
    expect(data.trainServices.length).toBeGreaterThan(0);
    expect(data.trainServices[0].previousCallingPoints.length).toBeGreaterThan(
      0,
    );
  });

  it('should return a list of departures with details', async () => {
    const response = await loadFixture('getDepartureBoardWithDetails');
    const data = Parsers.parseDepartureBoardWithDetailsResponse(response);
    expect(data.trainServices.length).toBeGreaterThan(0);
    expect(
      data.trainServices[0].subsequentCallingPoints.length,
    ).toBeGreaterThan(0);
  });

  it('should return the fastest departure', async () => {
    const response = await loadFixture('getFastestDeparture');
    const data = Parsers.parseFastestDeparture(response);
    expect(data.trainServices.length).toBe(1);
  });

  it('should return the fastest departure with details', async () => {
    const response = await loadFixture('getFastestDepartureWithDetails');
    const data = Parsers.parseFastestDepartureWithDetails(response);
    expect(data.trainServices.length).toBe(1);
    expect(
      data.trainServices[0].subsequentCallingPoints.length,
    ).toBeGreaterThan(0);
  });

  it('should return the next departure', async () => {
    const response = await loadFixture('getNextDeparture');
    const data = Parsers.parseNextDepartureResponse(response);
    expect(data.trainServices.length).toBe(1);
  });

  it('should return the next departure with details', async () => {
    const response = await loadFixture('getNextDepartureWithDetails');
    const data = Parsers.parseNextDepartureWithDetailsResponse(response);
    expect(data.trainServices.length).toBe(1);
    expect(
      data.trainServices[0].subsequentCallingPoints.length,
    ).toBeGreaterThan(0);
  });

  it('should return service details', async () => {
    const response = await loadFixture('getServiceDetails');
    const data = Parsers.parseServiceDetails(response);
    console.log(data);
    expect(data.serviceDetails.previousCallingPoints.length).toBeGreaterThan(0);
  });
});
