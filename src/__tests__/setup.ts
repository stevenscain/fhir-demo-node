import { logger } from '../utils/logger';

beforeAll(() => {
  logger.silent = true;
});

afterAll(() => {
  logger.silent = false;
});