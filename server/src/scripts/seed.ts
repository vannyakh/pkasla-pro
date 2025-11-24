import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../utils/logger';
import { UserModel } from '../modules/users/user.model';
import { JobModel } from '../modules/jobs/job.model';
import { hashPassword } from '../utils/password';

const DEFAULT_PASSWORD = 'Password123!';

const userSeeds = [
  {
    firstName: 'Alice',
    lastName: 'Admin',
    email: 'admin@somborkjobs.dev',
    role: 'admin',
  },
  {
    firstName: 'Ravi',
    lastName: 'Recruiter',
    email: 'recruiter@somborkjobs.dev',
    role: 'recruiter',
    profile: {
      title: 'Talent Partner',
      company: 'Acme Corp',
    },
  },
  {
    firstName: 'Carmen',
    lastName: 'Candidate',
    email: 'candidate@somborkjobs.dev',
    role: 'candidate',
    profile: {
      title: 'Frontend Engineer',
      location: 'Berlin, Germany',
    },
  },
] as const;

const jobSeeds = [
  {
    title: 'Senior Backend Engineer',
    company: 'Acme Corp',
    description:
      'Lead backend initiatives using Node.js, TypeScript, and MongoDB. Collaborate with cross-functional teams to ship high-quality features. You will architect scalable systems and mentor junior developers.',
    employmentType: 'full_time',
    location: 'Remote',
    isRemote: true,
    tags: ['node', 'typescript', 'mongodb', 'backend'],
    salaryRange: { min: 90000, max: 120000, currency: 'USD' },
    status: 'published',
    approvalStatus: 'approved',
  },
  {
    title: 'Product Designer',
    company: 'Designify',
    description:
      'Work closely with PMs and engineers to craft delightful user experiences for our SaaS platform. You will conduct user research, create wireframes, and design beautiful interfaces.',
    employmentType: 'contract',
    location: 'London, UK',
    isRemote: false,
    tags: ['figma', 'ux', 'ui', 'design'],
    salaryRange: { min: 450, max: 600, currency: 'GBP/day' },
    status: 'published',
    approvalStatus: 'approved',
  },
  {
    title: 'Junior DevOps Engineer',
    company: 'CloudLoop',
    description:
      'Assist in building CI/CD pipelines, managing infrastructure as code, and monitoring production workloads. Great opportunity for recent graduates or career switchers.',
    employmentType: 'full_time',
    location: 'Austin, TX',
    isRemote: true,
    tags: ['aws', 'terraform', 'ci/cd', 'devops'],
    salaryRange: { min: 65000, max: 85000, currency: 'USD' },
    status: 'draft',
    approvalStatus: 'pending',
  },
  {
    title: 'Frontend Developer',
    company: 'Zebra Technologies',
    description:
      'Build modern web applications using React, Next.js, and TypeScript. Work on cutting-edge features that impact millions of users worldwide.',
    employmentType: 'full_time',
    location: 'San Francisco, CA',
    isRemote: false,
    tags: ['react', 'nextjs', 'typescript', 'frontend'],
    salaryRange: { min: 110000, max: 150000, currency: 'USD' },
    status: 'published',
    approvalStatus: 'approved',
  },
  {
    title: 'Data Scientist',
    company: 'Analytics Pro',
    description:
      'Apply machine learning and statistical methods to solve complex business problems. Work with large datasets and build predictive models.',
    employmentType: 'full_time',
    location: 'New York, NY',
    isRemote: true,
    tags: ['python', 'machine-learning', 'data-science', 'sql'],
    salaryRange: { min: 130000, max: 180000, currency: 'USD' },
    status: 'published',
    approvalStatus: 'approved',
  },
  {
    title: 'Marketing Manager',
    company: 'BrandBoost',
    description:
      'Develop and execute marketing strategies to grow our brand presence. Manage campaigns across digital channels and analyze performance metrics.',
    employmentType: 'full_time',
    location: 'Chicago, IL',
    isRemote: false,
    tags: ['marketing', 'digital-marketing', 'strategy'],
    salaryRange: { min: 70000, max: 95000, currency: 'USD' },
    status: 'published',
    approvalStatus: 'approved',
  },
  {
    title: 'Software Engineer Intern',
    company: 'TechStart Inc',
    description:
      'Summer internship opportunity for students to gain hands-on experience in software development. Work on real projects with mentorship from senior engineers.',
    employmentType: 'internship',
    location: 'Seattle, WA',
    isRemote: false,
    tags: ['internship', 'software-engineering', 'learning'],
    salaryRange: { min: 25, max: 35, currency: 'USD/hour' },
    status: 'published',
    approvalStatus: 'approved',
  },
  {
    title: 'Mobile App Developer',
    company: 'AppVenture',
    description:
      'Develop native iOS and Android applications using Swift, Kotlin, and React Native. Create smooth user experiences and optimize app performance.',
    employmentType: 'contract',
    location: 'Remote',
    isRemote: true,
    tags: ['ios', 'android', 'react-native', 'mobile'],
    salaryRange: { min: 80000, max: 110000, currency: 'USD' },
    status: 'published',
    approvalStatus: 'approved',
  },
] as const;

const seedUsers = async () => {
  logger.info('Seeding users...');
  await UserModel.deleteMany({});
  const password = await hashPassword(DEFAULT_PASSWORD);

  const payload = userSeeds.map((user) => ({
    ...user,
    password,
  }));

  const created = await UserModel.insertMany(payload);
  logger.info(`Created ${created.length} users`);
};

const seedJobs = async () => {
  logger.info('Seeding jobs...');
  await JobModel.deleteMany({});
  
  // Get the recruiter user to link jobs
  const recruiter = await UserModel.findOne({ email: 'recruiter@somborkjobs.dev' });
  const recruiterId = recruiter?._id;

  // Add postedBy and approvedBy for published jobs
  const jobsWithUsers = jobSeeds.map((job) => {
    const jobData: any = { ...job };
    
    if (recruiterId) {
      jobData.postedBy = recruiterId;
      
      // Auto-approve published jobs
      if (job.status === 'published' && job.approvalStatus === 'approved') {
        jobData.approvedBy = recruiterId;
        jobData.approvedAt = new Date();
      }
    }
    
    return jobData;
  });

  await JobModel.insertMany(jobsWithUsers);
  logger.info(`Created ${jobSeeds.length} jobs`);
};

const run = async () => {
  try {
    await connectDatabase();
    await seedUsers();
    await seedJobs();
    logger.info(`Seed completed. Default password for seeded users: ${DEFAULT_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Seed failed');
    process.exit(1);
  } finally {
    await disconnectDatabase().catch((err) =>
      logger.error({ err }, 'Failed to close database connection'),
    );
  }
};

void run();

