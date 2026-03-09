import { AllExceptionsFilter } from './http-exception.filter';
import {
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ url: '/api/test', method: 'GET' }),
      }),
    } as any;
  });

  it('handles HttpException with correct status', () => {
    filter.catch(new NotFoundException('Not found'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: '/api/test',
        method: 'GET',
        message: 'Not found',
      }),
    );
  });

  it('handles BadRequestException with validation errors (array message)', () => {
    const exception = new BadRequestException({
      message: ['email must be valid', 'name is required'],
      error: 'Bad Request',
    });
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['email must be valid', 'name is required'],
      }),
    );
  });

  it('maps unknown exceptions to 500', () => {
    filter.catch(new Error('db connection failed'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('handles non-Error thrown values', () => {
    filter.catch('string error', mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500 }),
    );
  });

  it('includes timestamp in response', () => {
    filter.catch(new NotFoundException(), mockHost);

    const body = mockJson.mock.calls[0][0];
    expect(body.timestamp).toBeDefined();
    expect(new Date(body.timestamp).getTime()).not.toBeNaN();
  });
});
