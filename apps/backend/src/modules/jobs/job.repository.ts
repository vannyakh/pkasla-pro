import type { FilterQuery, UpdateQuery } from 'mongoose';
import { JobModel, type JobDocument } from './job.model';

export class JobRepository {
  create(payload: Partial<JobDocument>) {
    return JobModel.create(payload);
  }

  findById(id: string) {
    return JobModel.findById(id);
  }

  updateById(id: string, payload: UpdateQuery<JobDocument>) {
    return JobModel.findByIdAndUpdate(id, payload, { new: true });
  }

  deleteById(id: string) {
    return JobModel.findByIdAndDelete(id);
  }

  find(filter: FilterQuery<JobDocument>) {
    return JobModel.find(filter);
  }

  countDocuments(filter: FilterQuery<JobDocument> = {}) {
    return JobModel.countDocuments(filter);
  }
}

export const jobRepository = new JobRepository();

