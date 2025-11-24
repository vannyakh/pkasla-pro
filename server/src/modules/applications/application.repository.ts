import type { FilterQuery, UpdateQuery } from 'mongoose';
import { ApplicationModel, type ApplicationDocument } from './application.model';

export class ApplicationRepository {
  create(payload: Partial<ApplicationDocument>) {
    return ApplicationModel.create(payload);
  }

  findById(id: string) {
    return ApplicationModel.findById(id)
      .populate('jobId')
      .populate('candidateId', 'firstName lastName email profile')
      .populate('reviewedBy', 'firstName lastName email')
      .lean();
  }

  findByJobId(jobId: string, filter: FilterQuery<ApplicationDocument> = {}, options?: { limit?: number; skip?: number }) {
    const query = ApplicationModel.find({ jobId, ...filter }).sort({ createdAt: -1 });
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.skip) {
      query.skip(options.skip);
    }
    
    return query
      .populate('candidateId', 'firstName lastName email profile')
      .populate('reviewedBy', 'firstName lastName email')
      .lean();
  }

  findByCandidateId(candidateId: string, filter: FilterQuery<ApplicationDocument> = {}, options?: { limit?: number; skip?: number }) {
    const query = ApplicationModel.find({ candidateId, ...filter }).sort({ createdAt: -1 });
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.skip) {
      query.skip(options.skip);
    }
    
    return query
      .populate('jobId')
      .populate('reviewedBy', 'firstName lastName email')
      .lean();
  }

  findByJobAndCandidate(jobId: string, candidateId: string) {
    return ApplicationModel.findOne({ jobId, candidateId })
      .populate('jobId')
      .populate('candidateId', 'firstName lastName email profile')
      .lean();
  }

  updateById(id: string, payload: UpdateQuery<ApplicationDocument>) {
    return ApplicationModel.findByIdAndUpdate(id, payload, { new: true })
      .populate('jobId')
      .populate('candidateId', 'firstName lastName email profile')
      .populate('reviewedBy', 'firstName lastName email')
      .lean();
  }

  deleteById(id: string) {
    return ApplicationModel.findByIdAndDelete(id);
  }

  list(filter: FilterQuery<ApplicationDocument> = {}) {
    return ApplicationModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('jobId')
      .populate('candidateId', 'firstName lastName email profile')
      .populate('reviewedBy', 'firstName lastName email')
      .lean();
  }

  count(filter: FilterQuery<ApplicationDocument> = {}) {
    return ApplicationModel.countDocuments(filter);
  }

  getApplicationStats(filter: FilterQuery<ApplicationDocument> = {}) {
    return ApplicationModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

export const applicationRepository = new ApplicationRepository();

