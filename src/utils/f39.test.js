import { expect } from 'chai';
import { fromRawF39, toRawF39 } from './f39';

describe('f39', () => {
  describe('fromRawF39', () => {
    it('should convert 100000000 to "1"', () => {
      expect(fromRawF39(100000000)).to.be.equal('1');
    });

    it('should convert 0 to "0"', () => {
      expect(fromRawF39(0)).to.be.equal('0');
    });
  });

  describe('toRawF39', () => {
    it('should convert 1 to 100000000', () => {
      expect(toRawF39(1)).to.be.equal(100000000);
    });

    it('should convert 0 to 0', () => {
      expect(toRawF39(0)).to.be.equal(0);
    });
  });
});
