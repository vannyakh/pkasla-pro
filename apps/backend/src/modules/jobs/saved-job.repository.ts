import type { FilterQuery } from 'mongoose';
import { SavedJobModel, type SavedJobDocument } from './saved-job.model';

export class SavedJobRepository {
  create(payload: { userId: string; jobId: string }) {
    return SavedJobModel.create(payload);
  }

  findByUserAndJob(userId: string, jobId: string) {
    return SavedJobModel.findOne({ userId, jobId });
  }

  deleteByUserAndJob(userId: string, jobId: string) {
    return SavedJobModel.findOneAndDelete({ userId, jobId });
  }

  findByUser(userId: string, options?: { limit?: number; skip?: number }) {
    const query = SavedJobModel.find({ userId }).sort({ createdAt: -1 });
    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.skip) {
      query.skip(options.skip);
    }
    return query;
  }

  countByUser(userId: string) {
    return SavedJobModel.countDocuments({ userId });
  }

  find(filter: FilterQuery<SavedJobDocument>) {
    return SavedJobModel.find(filter);
  }

  deleteByJobId(jobId: string) {
    return SavedJobModel.deleteMany({ jobId });
  }
}

export const savedJobRepository = new SavedJobRepository();

