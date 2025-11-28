import type { FilterQuery } from 'mongoose';
import { GiftModel, type GiftDocument } from './gift.model';

export class GiftRepository {
  create(payload: Partial<GiftDocument>) {
    return GiftModel.create(payload);
  }

  findById(id: string) {
    return GiftModel.findById(id)
      .populate('guestId', 'name email phone')
      .populate('eventId', 'title date venue')
      .populate('createdBy', 'name email avatar')
      .lean();
  }

  findByGuestId(guestId: string) {
    return GiftModel.find({ guestId })
      .populate('eventId', 'title date venue')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  findByEventId(eventId: string) {
    return GiftModel.find({ eventId })
      .populate('guestId', 'name email phone')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  list(filter: FilterQuery<GiftDocument> = {}) {
    return GiftModel.find(filter)
      .populate('guestId', 'name email phone')
      .populate('eventId', 'title date venue')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  countByGuestId(guestId: string) {
    return GiftModel.countDocuments({ guestId });
  }

  countByEventId(eventId: string) {
    return GiftModel.countDocuments({ eventId });
  }

  countDocuments(filter: FilterQuery<GiftDocument> = {}) {
    return GiftModel.countDocuments(filter);
  }

  updateById(id: string, payload: Record<string, any>) {
    return GiftModel.findByIdAndUpdate(id, payload, { new: true })
      .populate('guestId', 'name email phone')
      .populate('eventId', 'title date venue')
      .populate('createdBy', 'name email avatar')
      .lean();
  }

  deleteById(id: string) {
    return GiftModel.findByIdAndDelete(id);
  }
}

export const giftRepository = new GiftRepository();

