// src/lib/types.ts

export interface TestCase {
  groupTitle: string
  caseTitle:  string
  input:      string
  output:     string
  score:      number
  visibility: 'public' | 'hidden'
}

export interface ToolboxConfig {
  categories: string[]
}

export interface Problem {
  id:           string
  title:        string
  description:  string
  inputFormat:  string
  outputFormat: string
  examples:     { input: string; output: string; explanation?: string }[]
  cases:        TestCase[]
  toolboxConfig?: ToolboxConfig
  createdAt?:   number
  order?:       number
}

export interface Submission {
  id?:         string
  userId:      string
  userName:    string
  problemId:   string
  score:       number
  maxScore:    number
  passedCount: number
  totalCount:  number
  blocklyXml:  string
  generatedJs: string
  submittedAt: number
  caseResults: CaseResult[]
}

export interface CaseResult {
  caseTitle:   string
  groupTitle:  string
  passed:      boolean
  score:       number
  maxScore:    number
  actualOutput: string
  expectedOutput: string
  error?:      string
  visibility:  'public' | 'hidden'
}

export interface UserProblemStat {
  userId:      string
  problemId:   string
  bestScore:   number
  maxScore:    number
  attempts:    number
  solvedAt?:   number
  lastSubmitAt: number
}

export interface LeaderboardEntry {
  userId:      string
  userName:    string
  userPhoto?:  string
  totalScore:  number
  solvedCount: number
  lastSolvedAt: number
  submissionCount: number
}

export interface User {
  uid:         string
  displayName: string
  email:       string
  photoURL?:   string
  isAdmin?:    boolean
  createdAt?:  number
}
