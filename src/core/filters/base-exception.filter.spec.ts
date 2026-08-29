import { ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';
import { BaseException } from '@sisques-labs/nestjs-kit';

import { BaseExceptionFilter } from './base-exception.filter';

class FakeResponse {
  statusCode?: number;
  body?: unknown;

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(body: unknown): this {
    this.body = body;
    return this;
  }
}

function fakeHost(response: FakeResponse): ArgumentsHost {
  return {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
}

describe('BaseExceptionFilter', () => {
  it('maps an unrecognized error to 500 internal_error', () => {
    const filter = new BaseExceptionFilter();
    const response = new FakeResponse();

    filter.catch(new Error('boom'), fakeHost(response));

    expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({
      error: { message: 'boom', type: 'internal_error' },
    });
  });

  it("keeps a framework HttpException's own status — an unmatched route stays 404, not 500", () => {
    const filter = new BaseExceptionFilter();
    const response = new FakeResponse();

    filter.catch(new NotFoundException('Cannot GET /nope'), fakeHost(response));

    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      error: { message: 'Cannot GET /nope', type: 'invalid_request_error' },
    });
  });

  it('defaults an unrecognized BaseException to 400', () => {
    const filter = new BaseExceptionFilter();
    const response = new FakeResponse();

    filter.catch(new BaseException('bad input'), fakeHost(response));

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });
});
