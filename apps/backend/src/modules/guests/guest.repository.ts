import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { DeleteResult } from 'mongoose';
import { GuestModel, type GuestDocument } from './guest.model';

export class GuestRepository {
  create(payload: Partial<GuestDocument>) {
    return GuestModel.create(payload);
  }

  findById(id: string) {
    return GuestModel.findById(id)
      .populate('eventId', 'title date venue hostId')
      .populate('userId', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .lean();
  }

  findByEventId(eventId: string) {
    return GuestModel.find({ eventId })
      .populate('userId', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  findByUserId(userId: string, eventId?: string) {
    const filter: FilterQuery<GuestDocument> = { userId };
    if (eventId) {
      filter.eventId = eventId;
    }
    return GuestModel.find(filter)
      .populate('eventId', 'title date venue hostId')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  findByEventIdAndEmail(eventId: string, email: string) {
    return GuestModel.findOne({ eventId, email }).lean();
  }

  findByEventIdAndPhone(eventId: string, phone: string) {
    return GuestModel.findOne({ eventId, phone }).lean();
  }

  findByInviteToken(token: string) {
    return GuestModel.findOne({ inviteToken: token })
      .populate('eventId', 'title description eventType date venue googleMapLink coverImage hostId')
      .populate('userId', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .lean();
  }

  updateById(id: string, payload: UpdateQuery<GuestDocument>) {
    return GuestModel.findByIdAndUpdate(id, payload, { new: true })
      .populate('eventId', 'title date venue hostId')
      .populate('userId', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .lean();
  }

  deleteById(id: string) {
    return GuestModel.findByIdAndDelete(id);
  }

  deleteByEventId(eventId: string): Promise<DeleteResult> {
    return GuestModel.deleteMany({ eventId });
  }

  list(filter: FilterQuery<GuestDocument> = {}) {
    return GuestModel.find(filter)
      .populate('eventId', 'title date venue hostId')
      .populate('userId', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  listPaginated(
    filter: FilterQuery<GuestDocument> = {},
    page: number = 1,
    pageSize: number = 10,
    sort?: Record<string, 1 | -1>
  ) {
    const skip = (page - 1) * pageSize;
    const query = GuestModel.find(filter)
      .populate('eventId', 'title date venue hostId')
      .populate('userId', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    if (sort) {
      query.sort(sort);
    }
    return query
      .skip(skip)
      .limit(pageSize)
      .lean();
  }

  countDocuments(filter: FilterQuery<GuestDocument> = {}) {
    return GuestModel.countDocuments(filter);
  }

  countByEventId(eventId: string) {
    return GuestModel.countDocuments({ eventId });
  }

  countByEventIdAndStatus(eventId: string, status: string) {
    return GuestModel.countDocuments({ eventId, status });
  }
}

export const guestRepository = new GuestRepository();

