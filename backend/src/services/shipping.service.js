import * as shippingRepository from '../repositories/shipping.repository.js';

export function listZones() {
  return shippingRepository.findAllZones();
}
