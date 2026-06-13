export type GradeLevel = '1st' | '2nd';
export type DocType = 'summary' | 'assignment';

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  gradeLevel: GradeLevel;
  type: DocType;
  unit: string;
  content: string[]; // Detailed visual bullet points or paragraphs for interactive reader
  createdAt: string;
  fileSize?: string;
  isCustom?: boolean;
  pdfFileUrl?: string; // Optional Base64 dataURL of a real PDF uploaded by the teacher
  pdfFileName?: string; // Optional uploaded PDF file name
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  gradeLevel: GradeLevel;
  submittedAt: string;
  answerText: string;
  grade?: string;
  feedback?: string;
}

export interface Student {
  id: string;
  name: string;
  gradeLevel: GradeLevel;
  registeredAt: string;
}

