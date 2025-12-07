import type { FilterQuery } from 'mongoose';
import { AgendaItemModel, type AgendaItemDocument } from './agenda.model';

export class AgendaRepository {
  create(payload: Partial<AgendaItemDocument>) {
    return AgendaItemModel.create(payload);
  }

  findById(id: string) {
    return AgendaItemModel.findById(id)
      .populate('eventId', 'title date venue hostId')
      .populate('createdBy', 'name email avatar')
      .lean();
  }

  findByEventId(eventId: string) {
    return AgendaItemModel.find({ eventId })
      .populate('createdBy', 'name email avatar')
      .sort({ date: 1, time: 1 }) // Sort by date then time
      .lean();
  }

  updateById(id: string, payload: Partial<AgendaItemDocument>) {
    return AgendaItemModel.findByIdAndUpdate(id, { $set: payload }, { new: true })
      .populate('eventId', 'title date venue hostId')
      .populate('createdBy', 'name email avatar')
      .lean();
  }

  deleteById(id: string) {
    return AgendaItemModel.findByIdAndDelete(id);
  }

  deleteByEventId(eventId: string) {
    return AgendaItemModel.deleteMany({ eventId });
  }

  list(filter: FilterQuery<AgendaItemDocument> = {}) {
    return AgendaItemModel.find(filter)
      .populate('eventId', 'title date venue hostId')
      .populate('createdBy', 'name email avatar')
      .sort({ date: 1, time: 1 })
      .lean();
  }

  countDocuments(filter: FilterQuery<AgendaItemDocument> = {}) {
    return AgendaItemModel.countDocuments(filter);
  }
}

export const agendaRepository = new AgendaRepository();

