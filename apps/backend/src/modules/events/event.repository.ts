import type { FilterQuery, UpdateQuery } from 'mongoose';
import { EventModel, type EventDocument, type EventType } from './event.model';

export class EventRepository {
  create(payload: Partial<EventDocument>) {
    return EventModel.create(payload);
  }

  findById(id: string) {
    return EventModel.findById(id).populate('hostId', 'name email avatar').lean();
  }

  findByHostId(hostId: string) {
    return EventModel.find({ hostId }).sort({ createdAt: -1 }).lean();
  }

  findByEventType(eventType: EventType) {
    return EventModel.find({ eventType })
      .populate('hostId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  findByEventTypePaginated(
    eventType: EventType,
    page: number = 1,
    pageSize: number = 10,
    sort?: Record<string, 1 | -1>
  ) {
    const skip = (page - 1) * pageSize;
    const query = EventModel.find({ eventType }).populate('hostId', 'name email avatar');
    if (sort) {
      query.sort(sort);
    }
    return query
      .skip(skip)
      .limit(pageSize)
      .lean();
  }

  updateById(id: string, payload: UpdateQuery<EventDocument>) {
    return EventModel.findByIdAndUpdate(id, payload, { new: true })
      .populate('hostId', 'name email avatar')
      .lean();
  }

  deleteById(id: string) {
    return EventModel.findByIdAndDelete(id);
  }

  list(filter: FilterQuery<EventDocument> = {}) {
    return EventModel.find(filter)
      .populate('hostId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  listPaginated(
    filter: FilterQuery<EventDocument> = {},
    page: number = 1,
    pageSize: number = 10,
    sort?: Record<string, 1 | -1>
  ) {
    const skip = (page - 1) * pageSize;
    const query = EventModel.find(filter).populate('hostId', 'name email avatar');
    if (sort) {
      query.sort(sort);
    }
    return query
      .skip(skip)
      .limit(pageSize)
      .lean();
  }

  countDocuments(filter: FilterQuery<EventDocument> = {}) {
    return EventModel.countDocuments(filter);
  }

  incrementGuestCount(eventId: string, increment: number = 1) {
    return EventModel.findByIdAndUpdate(
      eventId,
      { $inc: { guestCount: increment } },
      { new: true }
    ).lean();
  }

  findByQRCodeToken(token: string) {
    return EventModel.findOne({ qrCodeToken: token })
      .populate('hostId', 'name email avatar')
      .lean();
  }
}

export const eventRepository = new EventRepository();

