import { JobModel, type JobDocument } from '@/modules/jobs/job.model';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';

export interface JobFeedItem {
  id?: string;
  title: string;
  company: string;
  description: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  location: string;
  isRemote: boolean;
  tags?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  url?: string;
  postedDate?: string;
  expiresAt?: string;
}

class JobFeedService {
  /**
   * Export jobs to JSON format
   */
  async exportToJSON(filters?: {
    status?: string;
    approvalStatus?: string;
    limit?: number;
  }): Promise<JobFeedItem[]> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.approvalStatus) {
      query.approvalStatus = filters.approvalStatus;
    }

    // Default to published and approved jobs
    if (!filters?.status) {
      query.status = 'published';
    }
    if (!filters?.approvalStatus) {
      query.approvalStatus = 'approved';
    }

    const limit = filters?.limit || 1000;
    const jobs = await JobModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return jobs.map((job) => this.mapJobToFeedItem(job));
  }

  /**
   * Export jobs to XML format
   */
  async exportToXML(filters?: {
    status?: string;
    approvalStatus?: string;
    limit?: number;
  }): Promise<string> {
    const jobs = await this.exportToJSON(filters);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<jobs>\n';

    for (const job of jobs) {
      xml += '  <job>\n';
      xml += `    <id>${this.escapeXml(job.id || '')}</id>\n`;
      xml += `    <title>${this.escapeXml(job.title)}</title>\n`;
      xml += `    <company>${this.escapeXml(job.company)}</company>\n`;
      xml += `    <description><![CDATA[${job.description}]]></description>\n`;
      xml += `    <employmentType>${job.employmentType}</employmentType>\n`;
      xml += `    <location>${this.escapeXml(job.location)}</location>\n`;
      xml += `    <isRemote>${job.isRemote}</isRemote>\n`;
      
      if (job.tags && job.tags.length > 0) {
        xml += '    <tags>\n';
        for (const tag of job.tags) {
          xml += `      <tag>${this.escapeXml(tag)}</tag>\n`;
        }
        xml += '    </tags>\n';
      }

      if (job.salaryRange) {
        xml += '    <salaryRange>\n';
        xml += `      <min>${job.salaryRange.min}</min>\n`;
        xml += `      <max>${job.salaryRange.max}</max>\n`;
        xml += `      <currency>${this.escapeXml(job.salaryRange.currency)}</currency>\n`;
        xml += '    </salaryRange>\n';
      }

      if (job.url) {
        xml += `    <url>${this.escapeXml(job.url)}</url>\n`;
      }

      if (job.postedDate) {
        xml += `    <postedDate>${job.postedDate}</postedDate>\n`;
      }

      if (job.expiresAt) {
        xml += `    <expiresAt>${job.expiresAt}</expiresAt>\n`;
      }

      xml += '  </job>\n';
    }

    xml += '</jobs>';
    return xml;
  }

  /**
   * Import jobs from JSON format
   */
  async importFromJSON(jobs: JobFeedItem[], postedBy?: string): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const jobItem of jobs) {
      try {
        const jobData: Partial<JobDocument> = {
          title: jobItem.title,
          company: jobItem.company,
          description: jobItem.description,
          employmentType: jobItem.employmentType,
          location: jobItem.location,
          isRemote: jobItem.isRemote || false,
          tags: jobItem.tags || [],
          salaryRange: jobItem.salaryRange,
          status: 'draft',
          approvalStatus: 'pending',
          postedBy: postedBy as any,
        };

        if (jobItem.expiresAt) {
          jobData.expiresAt = new Date(jobItem.expiresAt);
        }

        await JobModel.create(jobData);
        created++;
      } catch (error: any) {
        errors.push(`Failed to import job "${jobItem.title}": ${error.message}`);
      }
    }

    return { created, errors };
  }

  /**
   * Import jobs from XML format
   * Note: For production, install and use xml2js: npm install xml2js @types/xml2js
   */
  async importFromXML(xmlString: string, postedBy?: string): Promise<{ created: number; errors: string[] }> {
    // Simple regex-based XML parsing (basic implementation)
    // For production, use xml2js: const xml2js = require('xml2js');
    const jobs: JobFeedItem[] = [];
    
    try {
      // Extract all job blocks
      const jobRegex = /<job>([\s\S]*?)<\/job>/g;
      let match;

      while ((match = jobRegex.exec(xmlString)) !== null) {
        const jobContent = match[1];
        const job: JobFeedItem = {
          id: this.extractXmlTag(jobContent, 'id'),
          title: this.extractXmlTag(jobContent, 'title') || '',
          company: this.extractXmlTag(jobContent, 'company') || '',
          description: this.extractXmlTag(jobContent, 'description') || '',
          employmentType: (this.extractXmlTag(jobContent, 'employmentType') as any) || 'full_time',
          location: this.extractXmlTag(jobContent, 'location') || '',
          isRemote: this.extractXmlTag(jobContent, 'isRemote') === 'true',
          url: this.extractXmlTag(jobContent, 'url'),
          postedDate: this.extractXmlTag(jobContent, 'postedDate'),
          expiresAt: this.extractXmlTag(jobContent, 'expiresAt'),
        };

        // Parse tags
        const tagRegex = /<tag>([\s\S]*?)<\/tag>/g;
        const tags: string[] = [];
        let tagMatch;
        while ((tagMatch = tagRegex.exec(jobContent)) !== null) {
          tags.push(tagMatch[1].trim());
        }
        if (tags.length > 0) {
          job.tags = tags;
        }

        // Parse salary range
        const salaryRangeMatch = jobContent.match(/<salaryRange>([\s\S]*?)<\/salaryRange>/);
        if (salaryRangeMatch) {
          const salaryContent = salaryRangeMatch[1];
          job.salaryRange = {
            min: Number(this.extractXmlTag(salaryContent, 'min')) || 0,
            max: Number(this.extractXmlTag(salaryContent, 'max')) || 0,
            currency: this.extractXmlTag(salaryContent, 'currency') || 'USD',
          };
        }

        jobs.push(job);
      }
    } catch (error: any) {
      return { created: 0, errors: [`Failed to parse XML: ${error.message}. For better XML parsing, install xml2js package.`] };
    }

    return this.importFromJSON(jobs, postedBy);
  }

  private mapJobToFeedItem(job: any): JobFeedItem {
    return {
      id: job._id?.toString() || job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      employmentType: job.employmentType,
      location: job.location,
      isRemote: job.isRemote,
      tags: job.tags,
      salaryRange: job.salaryRange,
      postedDate: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
      expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString() : undefined,
    };
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private extractXmlTag(content: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = content.match(regex);
    if (match && match[1]) {
      // Handle CDATA sections
      const text = match[1].trim();
      if (text.startsWith('<![CDATA[') && text.endsWith(']]>')) {
        return text.slice(9, -3);
      }
      return text;
    }
    return '';
  }
}

export const jobFeedService = new JobFeedService();

